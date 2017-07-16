var noble = require('noble');

//Example POST method invocation 
var Client = require('node-rest-client').Client;
 
var client = new Client();
 


// Search only for the Service UUID of the device (remove dashes)
var IMU_SERVICE_UUID = '917649a0d98e11e59eec0002a5d5c51b';

var uid_single1 = ['917649a1d98e11e59eec0002a5d5c51b','917649a2d98e11e59eec0002a5d5c51b']
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


// try{

// var Sequelize = require('sequelize');

// const sequelize = new Sequelize('db', 'root', 'root', {
//   host: 'localhost',
//   dialect: 'mysql'
// });

// sequelize
//   .authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });

//   //to create the table
// const Sensor = sequelize.define('sensor', {
//   accelx: {
//     type: Sequelize.REAL
//   },
//   accely: {
//     type: Sequelize.REAL
//   },
//   accelz: {
//     type: Sequelize.REAL
//   }
// });


// } catch(err) {
// 	console.log("Error in DB operation :"+ err);
// }

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
		
	      imuService.discoverCharacteristics(null, function(error, characteristics) {

		    characteristics.forEach(function(characteristic) {
		    	
		    	if(characteristic.uuid == uid_single1[0]) {

					console.log("if");
		    		console.log("characteristic connected : " + characteristic.uuid);
				
					characteristic.on('read', function(data, isNotification) {

						setInterval(function(){
					  console.log( "Ax : " + data.readFloatLE(0) + "Ay : " + data.readFloatLE(4) + "Az : " + data.readFloatLE(8));

					  var insertAxcel = {
					  	accelx : data.readFloatLE(0),
					  	accely : data.readFloatLE(4),
					  	accelz : data.readFloatLE(8)
					  };

					  console.log(insertAxcel);

					  // set content-type header and data as json in args parameter 
						var args = {
						    data: insertAxcel,
						    headers: { "Content-Type": "application/json" }
						};
 
						client.post("http://localhost:8080/accel", args, function (data, response) {
						});
						}, 5000);
					  
					});
			        // to enable notify
			        characteristic.subscribe(function(error) {
			          console.log('AX notification on');
			    	});

		    	} else {

		    		console.log("else");
		    		console.log("characteristic connected : " + characteristic.uuid);
				
					characteristic.on('read', function(data, isNotification) {

						setInterval(function(){
						  console.log( "Gx : " + data.readFloatLE(0) + "Gy : " + data.readFloatLE(4) + "Gz : " + data.readFloatLE(8));

						  var insertAxcel = {
						  	gyrox : data.readFloatLE(0),
						  	gyroy : data.readFloatLE(4),
						  	gyroz : data.readFloatLE(8)
						  };

						  console.log(insertAxcel);

						  // set content-type header and data as json in args parameter 
							var args = {
							    data: insertAxcel,
							    headers: { "Content-Type": "application/json" }
							};
	 
							client.post("http://localhost:8080/gyro", args, function (data, response) {
							});
						}, 5000);
					});

					
			        // to enable notify
			        characteristic.subscribe(function(error) {
			          console.log('GX notification on');
			    	});

		   //  		Gyro.create({
					//   accelx: data.readFloatLE(0),
					//   accely: data.readFloatLE(4),
					//   accelz: data.readFloatLE(8)
					// }).then(function(data) {
					// 	console.log("saved");
					// }).catch(function(error) {
					//     console.log("error :" + error);
					// });
		    	}
			    	
		    	
          	});
	      });
	    });
	  });
	});
} catch(Err) {
	console.log("Error in discover :" + Err);
}

