from bson import ObjectId
from fastapi import FastAPI, HTTPException, UploadFile, File
from datetime import datetime, timedelta
from minio import Minio
from pymongo import MongoClient
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

import uvicorn
import cv2
import io
import uuid

BUCKET_NAME = "images"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


minio_client = Minio(
    "minio:9000",
    access_key="root",
    secret_key="password",
    region="us-east-1",
    secure=False,
)


if not minio_client.bucket_exists(BUCKET_NAME):
    minio_client.make_bucket(BUCKET_NAME)

mongo_client = MongoClient("mongodb://root:password@mongodb:27017/")
db = mongo_client["camera_db"]
images_collection = db["images"]
if "images" not in db.list_collection_names():
    images_collection = db.create_collection("images")
    print("Database and collection 'images' created.")
else:
    images_collection = db["images"]

rtsp_url = "http://218.219.195.24/nphMotionJpeg?Resolution=640x480"


@app.get("/")
def read_root():
    return {"Hello": "World init project"}


@app.post("/upload")
def upload_image(file: UploadFile = File(...)):
    try:
        data = file.file.read()
        file_extension = Path(file.filename).suffix
        object_name = f"uploaded_{uuid.uuid4()}_{datetime.now().strftime("%Y%m%d%H%M%S")}{file_extension}"

        minio_client.put_object(
            BUCKET_NAME,
            object_name,
            io.BytesIO(data),
            length=len(data),
            content_type=file.content_type,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload to MinIO failed: {str(e)}")

    try:
        image_url = minio_client.presigned_get_object(
            BUCKET_NAME, object_name, expires=timedelta(days=7)
        )
        image_url = image_url.replace(
            "http://minio:9000", "http://localhost:8000/storage"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generate URL failed: {str(e)}")

    record = {
        "timestamp": datetime.now(),
        "object_name": object_name,
        "original_filename": file.filename,
        "image_url": image_url,
    }
    images_collection.insert_one(record)

    return {"status": "completed", "image_url": image_url}


@app.delete(
    "/delete/{image_id}",
    summary="Delete an image",
    description="Delete an image from both MinIO storage and MongoDB",
    responses={
        200: {"description": "Image successfully deleted"},
        404: {"description": "Image not found"},
        500: {"description": "Internal server error"},
    },
)
def delete_image(image_id: str):
    try:
        if not ObjectId.is_valid(image_id):
            raise HTTPException(status_code=400, detail="Invalid image_id format")

        record = images_collection.find_one_and_delete({"_id": ObjectId(image_id)})

        if not record:
            raise HTTPException(
                status_code=404, detail=f"Image with id {image_id} not found"
            )

        object_name = record["object_name"]
        try:
            minio_client.remove_object(BUCKET_NAME, object_name)
            return {
                "status": "completed",
                "message": f"Image {object_name} successfully deleted",
            }
        except Exception as minio_error:
            images_collection.insert_one(record)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete from storage: {str(minio_error)}",
            )

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete image failed: {str(e)}")


@app.delete(
    "/delete_all",
    summary="Delete all images",
    description="Delete all images from both MinIO storage and MongoDB",
    responses={
        200: {"description": "All images successfully deleted"},
        500: {"description": "Internal server error"},
    },
)
def delete_all_images():
    try:
        records = images_collection.find({})
        for record in records:
            object_name = record["object_name"]
            minio_client.remove_object(BUCKET_NAME, object_name)

        images_collection.delete_many({})
        return {"status": "completed", "message": "All images successfully deleted"}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Delete all images failed: {str(e)}"
        )


@app.get("/capture")
def capture_image():
    image_url = capture_and_save_image()
    return {"status": "completed", "image_url": image_url}


@app.get("/images")
def get_images():
    records = images_collection.find({})
    all_image_urls = [record["image_url"] for record in records]
    return {"all_image_urls": all_image_urls}


@app.get("/storage/images/{object_name}")
async def get_image(object_name: str):
    try:
        data = minio_client.get_object(BUCKET_NAME, object_name)

        async def image_stream():
            try:
                while True:
                    chunk = data.read(8 * 1024)
                    if not chunk:
                        break
                    yield chunk

            finally:
                data.close()
                data.release_conn()

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
        raise HTTPException(
            status_code=500, detail="Unable to read frame from RTSP stream"
        )

    ret, buffer = cv2.imencode(".jpg", frame)

    if not ret:
        print("Unable to encode image as JPEG")
        raise HTTPException(status_code=500, detail="Unable to encode image as JPEG")

    image_bytes = buffer.tobytes()
    timestamp_str = datetime.now().strftime("%Y%m%d%H%M%S")
    object_name = f"captured_{uuid.uuid4()}_{timestamp_str}.jpg"

    try:
        data = io.BytesIO(image_bytes)
        minio_client.put_object(
            BUCKET_NAME,
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
            BUCKET_NAME, object_name, expires=timedelta(days=7)
        )
        image_url = image_url.replace(
            "http://minio:9000", "http://localhost:8000/storage"
        )
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


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
