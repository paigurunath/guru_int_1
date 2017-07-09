var noble = require('noble');

// Search only for the Service UUID of the device (remove dashes)
var IMU_SERVICE_UUID = '917649a0d98e11e59eec0002a5d5c51b';

var uid_single1 = ['917649a1d98e11e59eec0002a5d5c51b']
var uid_single2 = ['917649a2d98e11e59eec0002a5d5c51b']


	// start scanning when bluetooth is powered on
	noble.on('stateChange', function(state) {
	  if(state === 'poweredOn') {
	    console.log('Start BLE scan...')
	    noble.startScanning([IMU_SERVICE_UUID], false);
	  }
	  else {
	    console.log('Cannot scan... state is not poweredOn')
	    noble.stopScanning();
	  }
	});


try {
	// Discover the peripheral's IMU service and corresponding characteristics
	// Then, emit each data point on the socket stream
	noble.on('discover', function(peripheral) {
	console.log("peripheral :" + peripheral);
	  peripheral.connect(function(error) {
	    console.log('Connected to peripheral: ' + peripheral.uuid);
	    peripheral.discoverServices([IMU_SERVICE_UUID], function(error, services) {
	      var imuService = services[0];

	      console.log('Discovered IMU service');
		console.log("imuService : " + imuService);
		
	      imuService.discoverCharacteristics(uid_single1, function(error, characteristics) {

	        var axCharacteristic = characteristics[0];

	        console.log("axCharacteristic" + axCharacteristic);

			axCharacteristic.on('read', function(data, isNotification) {
			  console.log( "Ax : " + data.readFloatLE(0) + "Ay : " + data.readFloatLE(4) + "Az : " + data.readFloatLE(8));
			});
	        // to enable notify
	        axCharacteristic.subscribe(function(error) {
	          console.log('AX notification on');
	    	});

	      });


	      imuService.discoverCharacteristics(uid_single2, function(error, characteristics) {

	        var gxCharacteristic = characteristics[0];

	        console.log("gxCharacteristic" + gxCharacteristic);

			gxCharacteristic.on('read', function(data, isNotification) {
			  console.log( "gx : " + data.readFloatLE(0) + "gy : " + data.readFloatLE(4) + "gz : " + data.readFloatLE(8));
			});
	        // to enable notify
	        gxCharacteristic.subscribe(function(error) {
	          console.log('GX notification on');
	    	});

	      });


	    });
	  });
	});
} catch(Err) {
	console.log("Error in discover :" + Err);
}
