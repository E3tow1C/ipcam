import cv2

rtsp_url = "http://24.134.3.9/axis-cgi/mjpg/video.cgi"

cap = cv2.VideoCapture(rtsp_url)

if not cap.isOpened():
    print("ไม่สามารถเชื่อมต่อกับ RTSP stream ได้")
    exit()

while True:
    ret, frame = cap.read()

    if not ret:
        print("ไม่สามารถอ่านเฟรมจาก RTSP stream ได้")
        break

    cv2.imshow('RTSP Stream', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
