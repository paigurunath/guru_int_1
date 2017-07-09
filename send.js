var noble = require('noble');

// Search only for the Service UUID of the device (remove dashes)
var serviceUuids = ['19b10000e8f2537e4f6cd104768a1214'];

// Search only for the led charateristic
var characteristicUuids = ['19b10001e8f2537e4f6cd104768a1214'];

// start scanning when bluetooth is powered on
noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning(serviceUuids);
  } else {
    noble.stopScanning();
  }
});

// Search for BLE peripherals
noble.on('discover', function(peripheral) {
  peripheral.connect(function(error) {
    console.log('connected to peripheral: ' + peripheral.uuid);
    // Only discover the service we specified above
    peripheral.discoverServices(serviceUuids, function(error, services) {
      var service = services[0];
      console.log('discovered service');

      service.discoverCharacteristics(characteristicUuids, function(error, characteristics) {
        console.log('discovered characteristics');
        // Assign Characteristic
        var ledCharacteristic = characteristics[0];
        
        setInterval(function() {
           
            ledCharacteristic.read(function(error, data) {
            // data is a buffer
            console.log('sensor value is: ' + data.readUInt8(0));
                });
            
        }, 1000);

      });
    });
  });
});