// JavaScript code for the TI SensorTag Demo app.

/**
 * Object that holds application data and functions.
 */
var app = {};

/**
 * for input buttons/write characteristics
 */
app.device = null;

/**
 * Data that is plotted on the canvas.
 */
app.dataPoints = [];

/**
 * smoothie.js data
 *
 */

var lineAX = new TimeSeries();
var lineAY = new TimeSeries();
var lineAZ = new TimeSeries();

var lineGX = new TimeSeries();
var lineGY = new TimeSeries();
var lineGZ = new TimeSeries();

app.AX = -1.00;
app.AY = -1.00;
app.AZ = -1.00;

app.GX = 0.00;
app.GY = 0.00;
app.GZ = 0.00;

var smoothieAcc;
var smoothieGyro;

app.coin = 'monk';


/**
 * Timeout (ms) after which a message is shown if the SensorTag wasn't found.
 */
app.CONNECT_TIMEOUT = 3000;

/**
 * Object that holds SensorTag UUIDs.
 */
app.curie = {};

/** 
 * UUIDs for movement services and characteristics. These must match the
 * UUIDs specified in the arduino sketch.
 */
app.curie.IMU_SERVICE = '917649a0-d98e-11e5-9eec-0002a5d5c51b';

app.curie.IMU_ACC = '917649a1-d98e-11e5-9eec-0002a5d5c51b';
app.curie.IMU_AXDESCRIPTOR = '00002902-0000-1000-8000-00805f9b34fb';

app.curie.IMU_GYRO = '917649a2-d98e-11e5-9eec-0002a5d5c51b';
app.curie.IMU_GXDESCRIPTOR = '00002902-0000-1000-8000-00805f9b34fb';


app.curie.APP_INPUTCHARACTERISTIC = '917649a7-d98e-11e5-9eec-0002a5d5c51b';



/**
 * Initialise the application.
 */
app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(app.onDeviceReady) },
		false);

	// Called when HTML page has been loaded.
	$(document).ready( function()
	{
		// Adjust canvas size when browser resizes
		$(window).resize(app.respondCanvas);

		// Adjust the canvas size when the document has loaded.
		app.respondCanvas();
                      
        // set up smoothie canvas
        app.setUpSmoothie();
                      
	});
};

/**
 * Adjust the canvas dimensions based on its container's dimensions.
 */
app.respondCanvas = function()
{
	var canvas = $('#canvas')
	var container = $(canvas).parent()
	canvas.attr('width', $(container).width() ) // Max width
	// Not used: canvas.attr('height', $(container).height() ) // Max height
};

/**
 * This function allows us to customize our smoothie charts. If you use the
 * builder at http://smoothiecharts.org/builder/ to customize your chart,
 * you can paste the JavaScript from the bottom of that page into the code
 * below.
 */


app.setUpSmoothie = function()
{

    smoothieAcc = new SmoothieChart(
    {
        maxValue:2.05,minValue:-2.05,
        grid: { strokeStyle:'rgb(125, 0, 0)', fillStyle:'rgb(60, 0, 0)',
        lineWidth: 1, millisPerLine: 250, verticalSections: 6, },
        labels: { fillStyle:'rgb(60, 0, 0)' }
    });
    
    smoothieGyro = new SmoothieChart(
    
    {
        maxValue:300.00,minValue:-300.00,
        grid: { strokeStyle:'rgb(125, 0, 0)', fillStyle:'rgb(60, 0, 0)',
        lineWidth: 1, millisPerLine: 250, verticalSections: 6, },
        labels: { fillStyle:'rgb(60, 0, 0)' }
    });
    
    smoothieAcc.streamTo(document.getElementById("canvasAcc"),1000);
    smoothieGyro.streamTo(document.getElementById("canvasGyro"),1000);
    
    setInterval( function()
    {
                
      lineAX.append( new Date().getTime(), app.getAx() );
      lineAY.append( new Date().getTime(), app.getAy() );
      lineAZ.append( new Date().getTime(), app.getAz() );
       
      lineGX.append( new Date().getTime(), app.getGx() );
      lineGY.append( new Date().getTime(), app.getGy() );
      lineGZ.append( new Date().getTime(), app.getGz() );
                
                
    }, 1000);
    
    smoothieAcc.addTimeSeries(lineAX,  { strokeStyle:'rgb(0, 255, 0)', lineWidth:3 });
    smoothieAcc.addTimeSeries(lineAY,  { strokeStyle:'rgb(255, 0, 0)', lineWidth:3 });
    smoothieAcc.addTimeSeries(lineAZ,  { strokeStyle:'rgb(0, 0, 255)', lineWidth:3 });
    smoothieGyro.addTimeSeries(lineGX,  { strokeStyle:'rgb(0, 255, 0)', lineWidth:3 });
    smoothieGyro.addTimeSeries(lineGY,  { strokeStyle:'rgb(255, 0, 0)', lineWidth:3 });
    smoothieGyro.addTimeSeries(lineGZ,  { strokeStyle:'rgb(0, 0, 255)', lineWidth:3 });
    
    
    
};

app.onDeviceReady = function()
{
	app.showInfo('Activate the SensorTag and tap Start.');
};

app.showInfo = function(info)
{
	document.getElementById('info').innerHTML = info;
};

app.onStartButton = function()
{
	app.onStopButton();
	app.startScan();
	app.showInfo('Status: Scanning...');
	app.startConnectTimer();
};

app.onStopButton = function()
{
	// Stop any ongoing scan and close devices.
	app.stopConnectTimer();
	evothings.easyble.stopScan();
	evothings.easyble.closeConnectedDevices();
	app.showInfo('Status: Stopped.');
};

app.startConnectTimer = function()
{
	// If connection is not made within the timeout
	// period, an error message is shown.
	app.connectTimer = setTimeout(
		function()
		{
			app.showInfo('Status: Scanning... ' +
				'Please press the activate button on the tag.');
		},
		app.CONNECT_TIMEOUT)
}

app.stopConnectTimer = function()
{
	clearTimeout(app.connectTimer);
}

app.startScan = function()
{
	evothings.easyble.startScan(
		function(device)
		{
			// Connect if we have found a sensor tag.
			if (app.deviceIsArduino101(device))
			{
				app.showInfo('Status: Device found: ' + device.name + '.');
                // set up the app.device variable to access device for writing input button results to Arduino/Genuino101
                app.device = device;
				evothings.easyble.stopScan();
				app.connectToDevice(device);
				app.stopConnectTimer();
			}
		},
		function(errorCode)
		{
			app.showInfo('Error: startScan: ' + errorCode + '.');
		});
};

app.deviceIsArduino101 = function(device)
{
	console.log('device name: ' + device.name);
	return (device != null) &&
		(device.name != null) &&
		(device.name.indexOf('imu') > -1 ||
			device.name.indexOf('imu') > -1);
};

/**
 * Read services for a device.
 */
app.connectToDevice = function(device)
{
	app.showInfo('Connecting...');
	device.connect(
		function(device)
		{
			app.showInfo('Status: Connected - reading services...');
			app.readServices(device);
		},
		function(errorCode)
		{
			app.showInfo('Error: Connection failed: ' + errorCode + '.');
			evothings.ble.reset();
			// This can cause an infinite loop...
			//app.connectToDevice(device);
		});
};

// Some getters and setters to properly work with imu data

app.setAx = function( value )
{
  app.Ax = value;
};

app.getAx = function()
{
   return app.Ax;
};

app.setAy = function( value )
{
    app.Ay = value;
};

app.getAy = function()
{
    return app.Ay;
};

app.setAz = function( value )
{
    app.Az = value;
};

app.getAz = function()
{
    return app.Az;
};

app.setGx = function( value )
{
    app.Gx = value;
};

app.getGx = function()
{
    return app.Gx;
};

app.setGy = function( value )
{
    app.Gy = value;
};

app.getGy = function()
{
    return app.Gy;
};

app.setGz = function( value )
{
    app.Gz = value;
};

app.getGz = function()
{
    return app.Gz;
};




app.readServices = function(device)
{
	device.readServices(
		[
		app.curie.IMU_SERVICE // Movement service UUID.
		],
		// Function that monitors accelerometer data.
		app.startIMUNotification,
		function(errorCode)
		{
			console.log('Error: Failed to read services: ' + errorCode + '.');
		});
};



/**
 * Read accelerometer data.
 */
app.startIMUNotification = function(device)
{
	app.showInfo('Status: Starting IMU notification...');

	

	// Set accelerometer notifications to ON.
	device.writeDescriptor(
		app.curie.IMU_ACC,
		app.curie.IMU_AXDESCRIPTOR, // Notification descriptor.
		new Uint8Array([1,0]),
		function()
		{
			console.log('Status: writeDescriptor ok.');
		},
		function(errorCode)
		{
			// This error will happen on iOS, since this descriptor is not
			// listed when requesting descriptors. On iOS you are not allowed
			// to use the configuration descriptor explicitly. It should be
			// safe to ignore this error.
			console.log('Error: writeDescriptor: ' + errorCode + '.');
		});
    
    
    

    // Set gyroscope notifications to ON.
    device.writeDescriptor(
        app.curie.IMU_GYRO,
        app.curie.IMU_GXDESCRIPTOR, // Notification descriptor.
        new Uint8Array([1,0]),
        function()
        {
            console.log('Status: writeDescriptor ok.');
        },
        function(errorCode)
        {
            // This error will happen on iOS, since this descriptor is not
            // listed when requesting descriptors. On iOS you are not allowed
            // to use the configuration descriptor explicitly. It should be
            // safe to ignore this error.
            console.log('Error: writeDescriptor: ' + errorCode + '.');
        });
    
    
	// Start accelerometer notifications.
	device.enableNotification(
		app.curie.IMU_ACC,
		function(data)
		{
			app.showInfo('Status: Data stream active - IMU');
			
            /**
             * The stream of bytes sent over BLE comes in here as the variable data
             * We create a DataView object and use the getFloat32() method to get
             * the floating point representation of our data here.
             */
            var ax = new DataView(data).getFloat32(0, true);
            var ay = new DataView(data).getFloat32(4, true);
            var az = new DataView(data).getFloat32(8, true);
            
            // debugging, can comment out
            console.log( '(ax,ay,az):' + '(' + ax + ',' + ay + ',' + az + ')' );
                              
            app.setAx(ax);
            app.setAy(ay);
	        app.setAz(az);

        },
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});
    
    
    // Start gyroscope notifications.
    device.enableNotification(
        app.curie.IMU_GYRO,
        function(data)
        {
            // See comments above.
            var gx = new DataView(data).getFloat32(0, true);
	        var gy = new DataView(data).getFloat32(4, true);
            var gz = new DataView(data).getFloat32(8, true);
           
 	   
            console.log( '(gx,gy,gz):' + '(' + gx + ',' + gy + ',' + gz + ')' );
                              
            app.setGx(gx);
            app.setGy(gy);
            app.setGz(gz);
        },
        function(errorCode)
        {
                console.log('Error: enableNotification: ' + errorCode + '.');
        });
};


// Initialize the app.
app.initialize();