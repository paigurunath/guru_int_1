import numpy as np
import cv2
import time

while True:
    try:
        im = cv2.imread('/home/pi/Documents/intel_ui/intel_app_ui/public/dist/img/pothole/pothole1.jpg')

        #Gray Scale
        im_ycrcb = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
        im_ycrcb  = cv2.GaussianBlur(im_ycrcb, (3, 3), 0)
        cv2.imwrite('/home/pi/Documents/intel_ui/intel_app_ui/public/dist/img/pothole/output1.jpg', im_ycrcb) # Second image

        # detect edges in the image
        edged = cv2.Canny(im_ycrcb, 10, 250)
        cv2.imwrite("output2.jpg", edged)

        # construct and apply a closing kernel to 'close' gaps between 'white'
        # pixels
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
        closed = cv2.morphologyEx(edged, cv2.MORPH_CLOSE, kernel)
        cv2.imwrite("/home/pi/Documents/intel_ui/intel_app_ui/public/dist/img/pothole/output3.jpg", closed)


        #Finding Contours
        areaArray = []
        count = 1

        contours,hierarchy = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for i, c in enumerate(contours):
            area = cv2.contourArea(c)
            areaArray.append(area)

        #first sort the array by area
        sorteddata = sorted(zip(areaArray, contours), key=lambda x: x[0], reverse=True)

        try:
            #find the nth largest contour [n-1][1], in this case 1
            largestcontour = sorteddata[0][1]

            #draw it
            x, y, w, h = cv2.boundingRect(largestcontour)
            cv2.drawContours(im, largestcontour, -1, (255, 0, 0), 2)
            cv2.rectangle(im, (x, y), (x+w, y+h), (0,255,0), 2)

            #find the nth largest contour [n-1][1], in this case 2
            secondlargestcontour = sorteddata[1][1]

            #draw it
            x, y, w, h = cv2.boundingRect(secondlargestcontour)
            cv2.drawContours(im, secondlargestcontour, -1, (255, 0, 0), 2)
            cv2.rectangle(im, (x, y), (x+w, y+h), (0,255,0), 2)

            cv2.imwrite('/home/pi/Documents/intel_ui/intel_app_ui/public/dist/img/pothole/output.jpg', im)
        except IndexError:
            sorteddata = 'null'
    except cv2.error as e:
        print 'CV2 error'

    time.sleep(2)