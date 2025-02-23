from fastapi import FastAPI, HTTPException
import cv2
import io
from datetime import datetime, timedelta
from minio import Minio
from pymongo import MongoClient

app = FastAPI()

# ตั้งค่า MinIO client
minio_client = Minio(
    "localhost:9000",  # เปลี่ยนเป็น URL ของ MinIO server
    access_key="minio_access_key",   # เปลี่ยนเป็น access key ของคุณ
    secret_key="minio_secret_key",     # เปลี่ยนเป็น secret key ของคุณ
    secure=False  # หากใช้ https ให้เปลี่ยนเป็น True
)
bucket_name = "images"

# ตรวจสอบว่ามี bucket แล้วหรือไม่ ถ้าไม่มีก็สร้างขึ้นมา
if not minio_client.bucket_exists(bucket_name):
    minio_client.make_bucket(bucket_name)

# ตั้งค่า MongoDB client
mongo_client = MongoClient("mongodb://localhost:27017")  # เปลี่ยน connection string ตามสภาพแวดล้อมของคุณ
db = mongo_client["camera_db"]
images_collection = db["images"]

# URL ของ RTSP stream จาก iPcamera
rtsp_url = "http://24.134.3.9/axis-cgi/mjpg/video.cgi"

@app.get("/ipcam")
def capture_and_save_image():
    # เปิดการเชื่อมต่อกับ RTSP stream
    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        raise HTTPException(status_code=500, detail="ไม่สามารถเชื่อมต่อกับ RTSP stream ได้")
    
    ret, frame = cap.read()
    cap.release()
    if not ret:
        raise HTTPException(status_code=500, detail="ไม่สามารถอ่านเฟรมจาก RTSP stream ได้")
    
    # เข้ารหัสเฟรมเป็น JPEG
    ret, buffer = cv2.imencode('.jpg', frame)
    if not ret:
        raise HTTPException(status_code=500, detail="ไม่สามารถเข้ารหัสภาพเป็น JPEG ได้")
    image_bytes = buffer.tobytes()
    
    # สร้างชื่อไฟล์ที่ไม่ซ้ำกันโดยใช้เวลาปัจจุบัน (UTC)
    timestamp_str = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    object_name = f"{timestamp_str}.jpg"
    
    #อัปโหลดภาพไปยัง MinIO
    try:
        data = io.BytesIO(image_bytes)
        minio_client.put_object(
            bucket_name,
            object_name,
            data,
            length=len(image_bytes),
            content_type='image/jpeg'
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload to MinIO failed: {str(e)}")
    
    # สร้าง URL แบบ presigned (กำหนดอายุการใช้งาน 7 วัน)
    try:
        image_url = minio_client.presigned_get_object(bucket_name, object_name, expires=timedelta(days=7))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generate URL failed: {str(e)}")
    
    # บันทึกข้อมูลลงใน MongoDB
    record = {
        "timestamp": datetime.utcnow(),
        "object_name": object_name,
        "image_url": image_url
    }
    images_collection.insert_one(record)
    
    return {"image_url": image_url}

@app.get("/images/{date}")
def get_images_by_date(date: str):
    """
    ดึงลิงก์ของรูปภาพที่ถูกจับในวันที่ระบุ
    คาดว่าพารามิเตอร์ date มีรูปแบบ 'YYYY-MM-DD'
    """
    try:
        date_obj = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="รูปแบบวันที่ไม่ถูกต้อง ควรเป็น YYYY-MM-DD")
    
    start = date_obj
    end = date_obj + timedelta(days=1)
    
    # ค้นหาเอกสารที่มี timestamp ในช่วงเวลาที่ระบุ
    records = images_collection.find({"timestamp": {"$gte": start, "$lt": end}})
    image_urls = [record["image_url"] for record in records]
    
    return {"image_urls": image_urls}
