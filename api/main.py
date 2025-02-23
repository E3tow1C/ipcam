from fastapi import FastAPI, HTTPException
from datetime import datetime, timedelta
from minio import Minio
from pymongo import MongoClient
from typing import Union
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

import uvicorn
import cv2
import io

app = FastAPI()

minio_client = Minio(
    "minio:9000",
    access_key="root",
    secret_key="password",
    region="us-east-1",
    secure=False,
)
bucket_name = "images"

if not minio_client.bucket_exists(bucket_name):
    minio_client.make_bucket(bucket_name)

mongo_client = MongoClient("mongodb://root:password@mongodb:27017/")
db = mongo_client["camera_db"]
images_collection = db["images"]
if "images" not in db.list_collection_names():
    images_collection = db.create_collection("images")
    print("Database and collection 'images' created.")
else:
    images_collection = db["images"]

rtsp_url = "http://24.134.3.9/axis-cgi/mjpg/video.cgi"


@app.get("/")
def read_root():
    return {"Hello": "World init project"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.get("/capture")
def capture_image():
    image_url = capture_and_save_image()
    return {"status": "completed", "image_url": image_url}


@app.get("/storage/images/{object_name}")
async def get_image(object_name: str):
    try:
        data = minio_client.get_object(bucket_name, object_name)

        async def image_stream():
            image_data = data.read()
            yield image_data

        return StreamingResponse(
            image_stream(),
            media_type="image/jpeg",
            headers={"Content-Disposition": f"inline; filename={object_name}"},
        )

    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"Image not found or error accessing image: {str(e)}",
        )


def capture_and_save_image():
    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        print("Unable to connect to RTSP stream")
        raise HTTPException(status_code=500, detail="Unable to connect to RTSP stream")

    ret, frame = cap.read()
    cap.release()
    if not ret:
        print("Unable to read frame from RTSP stream")
        raise HTTPException(status_code=500, detail="Unable to read frame from RTSP stream")

    ret, buffer = cv2.imencode(".jpg", frame)

    if not ret:
        print("Unable to encode image as JPEG")
        raise HTTPException(status_code=500, detail="Unable to encode image as JPEG")

    image_bytes = buffer.tobytes()
    timestamp_str = datetime.now().strftime("%Y%m%d%H%M%S")
    object_name = f"{timestamp_str}.jpg"

    try:
        data = io.BytesIO(image_bytes)
        minio_client.put_object(
            bucket_name,
            object_name,
            data,
            length=len(image_bytes),
            content_type="image/jpeg",
        )
    except Exception as e:
        print(f"Upload to MinIO failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload to MinIO failed: {str(e)}")

    try:
        image_url = minio_client.presigned_get_object(
            bucket_name, object_name, expires=timedelta(days=7)
        )
        image_url = image_url.replace("http://minio:9000", "http://localhost:8000/storage")
        print(f"Image URL: {image_url}")
    except Exception as e:
        print(f"Generate URL failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generate URL failed: {str(e)}")

    record = {
        "timestamp": datetime.now(),
        "object_name": object_name,
        "image_url": image_url,
    }
    images_collection.insert_one(record)

    return image_url


# @app.get("/images/{date}")
# def get_images_by_date(date: str):
#     """
#     ดึงลิงก์ของรูปภาพที่ถูกจับในวันที่ระบุ
#     คาดว่าพารามิเตอร์ date มีรูปแบบ 'YYYY-MM-DD'
#     """
#     try:
#         date_obj = datetime.strptime(date, "%Y-%m-%d")
#     except ValueError:
#         raise HTTPException(status_code=400, detail="รูปแบบวันที่ไม่ถูกต้อง ควรเป็น YYYY-MM-DD")

#     start = date_obj
#     end = date_obj + timedelta(days=1)

#     # ค้นหาเอกสารที่มี timestamp ในช่วงเวลาที่ระบุ
#     records = images_collection.find({"timestamp": {"$gte": start, "$lt": end}})
#     image_urls = [record["image_url"] for record in records]

#     return {"image_urls": image_urls}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
