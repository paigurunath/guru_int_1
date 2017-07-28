import serial
import json, urllib2
import time

s = serial.Serial('/dev/ttyACM0', 9600)
while True:
    try:
        data = s.readline()
        #print 'my data', data
        dataval = json.loads(data)

        if 'accelx' in dataval:
            req = urllib2.Request('http://localhost:8080/accel')
            req.add_header('Content-Type', 'application/json')

            response = urllib2.urlopen(req, json.dumps(dataval))
            print 'Saving accel'
        else:
            dataval1 = dataval
            req1 = urllib2.Request('http://localhost:8080/gyro')
            req1.add_header('Content-Type', 'application/json')

            response = urllib2.urlopen(req1, json.dumps(dataval1))
            print 'Saving gyro'
    except ValueError:
        print "data is not in json format, missing something"

    time.sleep(0.05)


