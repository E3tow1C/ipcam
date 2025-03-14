import os
import secrets
import base64
from bson import ObjectId
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Request
from datetime import datetime, timedelta
from minio import Minio
from pymongo import MongoClient
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.openapi.utils import get_openapi
from starlette.middleware.base import BaseHTTPMiddleware

from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from pathlib import Path

import uvicorn
import cv2
import io
import uuid

load_dotenv(dotenv_path=".api.env")


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))

# MongoDB connection
BUCKET_NAME = os.getenv("BUCKET_NAME")
MONGO_URL = os.getenv("MONGO_URL")
API_EXTERNAL_URL = os.getenv("API_EXTERNAL_URL")

# MinIO connection
MINIO_HOST = os.getenv("MINIO_HOST")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")

# First user
FIRST_USER = os.getenv("FIRST_USER")
FIRST_USER_PASSWORD = os.getenv("FIRST_USER_PASSWORD")

COOKIE_DOMAIN = os.getenv("COOKIE_DOMAIN")

rtsp_url = "http://218.219.195.24/nphMotionJpeg?Resolution=640x480"


class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # DON'T DELETE THIS LINE - IT'S NEEDED FOR CORS PREFLIGHT REQUESTS
        if request.method == "OPTIONS":
            response = await call_next(request)
            return response
        #### END OF LINE #####

        if request.url.path not in [
            "/",
            "/auth/login",
            "/docs",
            "/openapi.json",
            "/auth/refresh",
            "/auth/validate",
        ] and not request.url.path.startswith("/storage/images"):
            token = request.headers.get("Authorization")

            if token and token.startswith("Bearer"):
                token = token.split(" ")[1]
            else:
                token = request.cookies.get("access_token")

            if not token:
                return JSONResponse(
                    status_code=401, content={"detail": "Not authenticated"}
                )

            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                request.state.username = payload.get("sub")
            except JWTError:
                return JSONResponse(
                    status_code=401, content={"detail": "Invalid token"}
                )

        response = await call_next(request)
        return response


# Password hashing context
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# MongoDB connection
mongo_client = MongoClient(MONGO_URL)
db = mongo_client["camera_db"]
images_collection = db["images"]
camera_collection = db["cameras"]
auth_collection = db["auth"]
user_collection = db["users"]
creadenials_collection = db["creadenials"]

app = FastAPI(
    title="IP Camera API",
    description="API for IP Camera management system",
    version="1.0.0",
    openapi_url="/openapi.json",
)

# get allowed origins from credentials collection
allowed_origins = ["http://localhost:3000"]
for origin in creadenials_collection.find():
    allowed_origins.append(origin["host"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(JWTMiddleware)


# Add security definitions to OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    # Add JWT bearer security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    # Apply security globally to all operations
    for path in openapi_schema["paths"].values():
        for operation in path.values():
            operation["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

# Initialize the auth collection with a test user
if user_collection.count_documents({"username": FIRST_USER}) == 0:
    user_collection.insert_one(
        {
            "username": FIRST_USER,
            "password": pwd_context.hash(FIRST_USER_PASSWORD),
        }
    )

minio_client = Minio(
    MINIO_HOST,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    region="us-east-1",
    secure=False,
)

if not minio_client.bucket_exists(BUCKET_NAME):
    minio_client.make_bucket(BUCKET_NAME)


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(username: str, password: str):
    user = user_collection.find_one({"username": username})
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
    return user


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = user_collection.find_one({"username": username})
    if user is None:
        raise credentials_exception
    return user


@app.post("/auth/login", response_model=dict)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect Username or Password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )

    refresh_token = create_refresh_token(
        data={"sub": user["username"]}, expires_delta=refresh_token_expires
    )

    response = JSONResponse(
        content={"access_token": access_token, "refresh_token": refresh_token}
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        path="/",
        secure=True,
        domain=COOKIE_DOMAIN,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        path="/",
        secure=True,
        domain=COOKIE_DOMAIN,
    )

    return response


@app.get("/auth/logout", response_model=dict)
async def logout():
    response = JSONResponse(content={"success": True})
    response.delete_cookie(
        key="refresh_token", path="/", httponly=True, secure=True, domain=COOKIE_DOMAIN
    )
    response.delete_cookie(
        key="access_token", path="/", secure=True, domain=COOKIE_DOMAIN
    )

    return response


@app.get("/auth/refresh", response_model=dict)
async def refresh_access_token(request: Request):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        refresh_token = request.cookies.get("refresh_token")

        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = user_collection.find_one({"username": username})
    if user is None:
        raise credentials_exception
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    new_access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    new_refresh_token = create_refresh_token(
        data={"sub": user["username"]}, expires_delta=refresh_token_expires
    )

    response = JSONResponse(
        content={"access_token": new_access_token, "refresh_token": new_refresh_token}
    )

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        path="/",
        secure=True,
        domain=COOKIE_DOMAIN,
    )

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        path="/",
        secure=True,
        domain=COOKIE_DOMAIN,
    )

    return response


@app.get("/auth/validate")
async def validate_token(request: Request):
    try:
        token = request.cookies.get("access_token")

        if not token:
            return {"success": False}

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")

        if not username:
            return {"success": False, "message": "Invalid request"}

        user = user_collection.find_one({"username": username})
        if not user:
            return {"success": False, "message": "User error"}

        return {"success": True, "message": "Token is valid"}

    except jwt.ExpiredSignatureError:
        return {"success": False, "message": "Token has expired"}
    except JWTError:
        return {"success": False, "message": "Invalid token"}
    except Exception as e:
        return {
            "success": False,
            "message": f"Error validating token: {str(e)}",
        }


@app.get("/accounts")
async def get_all_users():
    try:
        accounts = user_collection.find({})
        all_accounts = []
        for account in accounts:
            account["_id"] = str(account["_id"])
            del account["password"]
            all_accounts.append(account)
        return {"success": True, "accounts": all_accounts}
    except Exception as e:
        return {"success": False, "message": f"Error getting accounts: {str(e)}"}


class User(BaseModel):
    username: str
    password: str


@app.post("/account/new")
async def create_user(user: User):
    if user_collection.count_documents({"username": user.username}) > 0:
        return {"success": False, "message": "User already exists"}

    user_collection.insert_one(
        {
            "username": user.username,
            "password": pwd_context.hash(user.password),
        }
    )

    return {"success": True, "message": "Account created successfully"}


@app.delete("/account/{id}")
async def delete_user(id: str):
    if len(id) != 24:
        return {"success": False, "message": "Invalid user id format"}

    if user_collection.count_documents({"_id": ObjectId(id)}) == 0:
        return {"success": False, "message": "User not found"}

    user_collection.delete_one({"_id": ObjectId(id)})
    return {"success": True, "message": f"User id: {id} deleted successfully"}


class Credential(BaseModel):
    name: str
    host: str
    expire: datetime = None
    secret: str = None


@app.get("/credentials")
async def get_all_credentials():
    try:
        credentials = creadenials_collection.find({})
        all_credentials = []

        for credential in credentials:
            credential["_id"] = str(credential["_id"])
            all_credentials.append(credential)

        return {"success": True, "credentials": all_credentials}

    except Exception as e:
        return {"success": False, "message": f"Error getting credentials: {str(e)}"}


@app.post("/credential/new")
async def create_credential(credential: Credential):
    if creadenials_collection.count_documents({"name": credential.name}) > 0:
        return {
            "success": False,
            "message": f"Credential name: {credential.name} already exists",
        }

    if not credential.name or not credential.host:
        return {
            "success": False,
            "message": "Missing required fields",
        }

    random_secret = secrets.token_bytes(96)
    api_key = base64.urlsafe_b64encode(random_secret).decode("utf-8").rstrip("=")
    credential_doc = {
        "name": credential.name,
        "host": credential.host,
        "secret": api_key,
    }

    if credential.expire:
        credential_doc["expire"] = credential.expire

    creadenials_collection.insert_one(credential_doc)
    return {
        "success": True,
        "message": f"Credential name: {credential.name} created successfully",
        "secret": api_key,
    }


@app.delete("/credential/{id}")
async def delete_credential(id: str):
    if len(id) != 24:
        return {"success": False, "message": "Invalid credential id format"}

    if creadenials_collection.count_documents({"_id": ObjectId(id)}) == 0:
        return {"success": False, "message": "Credential not found"}

    creadenials_collection.delete_one({"_id": ObjectId(id)})
    return {"success": True, "message": f"Credential id: {id} deleted successfully"}


@app.get("/protected-route")
async def protected_route(current_user: User = Depends(get_current_user)):
    return {"message": "This is a protected route", "user": current_user["username"]}


@app.get("/")
def read_root():
    return {"Hello": "World init project | version 1.2 test update with rolling update"}


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
            "http://minio:9000", f"{API_EXTERNAL_URL}/storage"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generate URL failed: {str(e)}")

    record = {
        "timestamp": datetime.now(),
        "type": "upload",
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


@app.get("/cameras")
def get_cameras():
    records = camera_collection.find({})
    all_cameras = [record for record in records]
    cameras = []
    for camera in all_cameras:
        camera["_id"] = str(camera["_id"])
        cameras.append(camera)
    return {"cameras": cameras}


@app.get("/camera/{camera_id}")
def get_camera(camera_id: str):
    if len(camera_id) != 24:
        raise HTTPException(status_code=404, detail="Camera not found")

    record = camera_collection.find_one({"_id": ObjectId(camera_id)})
    if record:
        camera = record
        camera = {**camera, "_id": str(camera["_id"])}
        return {"camera": camera}
    else:
        raise HTTPException(status_code=404, detail="Camera not found")


@app.get("/cameras/location/{location}")
def get_camera_by_location(location: str):
    records = camera_collection.find({"location": location})
    all_cameras = [record for record in records]
    cameras = []
    for camera in all_cameras:
        camera["_id"] = str(camera["_id"])
        cameras.append(camera)
    return {"cameras": cameras}


@app.get("/camera/{camera_id}/capture")
def capture_image_from_camera(camera_id: str):
    camera = camera_collection.find_one({"_id": ObjectId(camera_id)})
    if camera:
        rtsp_url = camera["url"]
        image_url = capture_and_save_image_from_camera(camera_id, rtsp_url)
        return {"status": "completed", "image_url": image_url}
    else:
        raise HTTPException(status_code=404, detail="Camera not found")


@app.delete("/camera/{camera_id}")
def delete_camera(camera_id: str):
    camera = camera_collection.find_one_and_delete({"_id": ObjectId(camera_id)})
    if camera:
        return {"status": "completed", "message": "Camera successfully deleted"}
    else:
        raise HTTPException(status_code=404, detail="Camera not found")


class CameraCreate(BaseModel):
    name: str
    url: str
    location: str
    username: str = None
    password: str = None
    authType: str = None


@app.post("/camera")
def add_camera(camera: CameraCreate):
    camera_dict = {"name": camera.name, "url": camera.url, "location": camera.location}

    if camera.username and camera.password and camera.authType:
        camera_dict.update(
            {
                "username": camera.username,
                "password": camera.password,
                "authType": camera.authType,
            }
        )

    result = camera_collection.insert_one(camera_dict)
    return {
        "status": "completed",
        "camera": {**camera_dict, "_id": str(result.inserted_id)},
    }


@app.patch("/camera/{camera_id}")
def update_camera(camera_id: str, camera: CameraCreate):
    if len(camera_id) != 24:
        return {"success": False, "message": "Invalid camera id format"}

    if camera_collection.count_documents({"_id": ObjectId(camera_id)}) == 0:
        return {"success": False, "message": "Camera not found"}

    camera_dict = camera.dict()
    camera_to_update = {}

    for field_name, field_value in camera_dict.items():
        if field_value is not None:
            camera_to_update[field_name] = field_value

    if not camera_to_update:
        return {"success": False, "message": "No fields to update"}

    camera_collection.replace_one({"_id": ObjectId(camera_id)}, camera_to_update)

    return {
        "success": True,
        "message": f"Camera id {camera_id}: updated successfully",
        "camera": camera_to_update,
    }


def capture_and_save_image_from_camera(camera_id: str, cam_rtsp_url: str):
    cap = cv2.VideoCapture(cam_rtsp_url)
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
            "http://minio:9000", f"{API_EXTERNAL_URL}/storage"
        )
        print(f"Image URL: {image_url}")
    except Exception as e:
        print(f"Generate URL failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generate URL failed: {str(e)}")

    record = {
        "timestamp": datetime.now(),
        "type": "capture",
        "object_name": object_name,
        "original_filename": object_name,
        "camera_id": camera_id,
        "image_url": image_url,
    }
    images_collection.insert_one(record)
    return image_url


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
            "http://minio:9000", f"{API_EXTERNAL_URL}/storage"
        )

    except Exception as e:
        print(f"Generate URL failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generate URL failed: {str(e)}")

    record = {
        "timestamp": datetime.now(),
        "type": "capture",
        "object_name": object_name,
        "original_filename": object_name,
        "image_url": image_url,
    }
    images_collection.insert_one(record)

    return image_url


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="debug")
