from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import base64
import shutil
import os
import secrets
from passlib.context import CryptContext
from app.models.models import Base, User as DBUser, File as DBFile, Folder, Permission
from app.models.schemas import PermissionCreate, UserCreate, User, Token, AccessType, FileUploadRequest, FolderCreate
from app.utils.connection import SessionLocal

# Define your constants
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = secrets.token_urlsafe(32)
ALGORITHM = "HS256"
TOKEN_URL = "/S3/auth/oauth/login"

app = FastAPI()
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=TOKEN_URL)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    db: Session = SessionLocal()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        user = db.query(DBUser).filter(DBUser.username == username).first()
        if user is None:
            raise credentials_exception
        return user
    except JWTError:
        raise credentials_exception
    finally:
        db.close()

@app.post("/S3/auth/oauth/register", response_model=Token)
async def register(user: UserCreate):
    db: Session = SessionLocal()
    try:
        db_user = db.query(DBUser).filter(DBUser.username == user.username).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")

        db_user = DBUser(
            email=user.email,
            username=user.username,
            password_hash=get_password_hash(user.password)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        access_token = create_access_token(data={"sub": db_user.username})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as exception:
        return JSONResponse(status_code=400, content={"Error": str(exception)})
    finally:
        db.close()

@app.post(TOKEN_URL, response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db: Session = SessionLocal()
    try:
        db_user = db.query(DBUser).filter(DBUser.username == form_data.username).first()
        if not db_user or not verify_password(form_data.password, db_user.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect username or password")

        access_token = create_access_token(data={"sub": db_user.username})
        return {"access_token": access_token, "token_type": "bearer"}
    finally:
        db.close()

@app.get("/S3/auth/profile", response_model=User)
async def get_profile(current_user: DBUser = Depends(get_current_user)):
    return current_user

@app.post("/S3/files/upload")
async def upload_file(
    file_upload: FileUploadRequest,
    current_user: DBUser = Depends(get_current_user)
):
    db: Session = SessionLocal()
    try:
        base64_file = file_upload.file
        if not base64_file:
            raise HTTPException(status_code=400, detail="File is required.")

        filename = f"{current_user.username}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.dat"
        file_data = base64.b64decode(base64_file)

        os.makedirs("files", exist_ok=True)
        file_location = os.path.join("files", filename)

        with open(file_location, "wb") as buffer:
            buffer.write(file_data)

        folder_name = file_upload.folder_name
        folder_id = None
        if folder_name:
            folder = db.query(Folder).filter(Folder.name == folder_name, Folder.user_id == current_user.id).first()
            if folder is None:
                folder = Folder(
                    user_id=current_user.id,
                    name=folder_name,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(folder)
                db.commit()
                db.refresh(folder)
            folder_id = folder.id

        file_record = DBFile(
            user_id=current_user.id,
            file_name=filename,
            file_size=len(file_data),
            file_type="application/octet-stream",
            folder_id=folder_id,
        )
        db.add(file_record)
        db.commit()
        db.refresh(file_record)

        return {"filename": file_record.file_name, "file_id": file_record.id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/S3/files/download/{file_id}")
async def download_file(file_id: int, current_user: DBUser = Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        file_record = db.query(DBFile).filter(DBFile.id == file_id, DBFile.user_id == current_user.id).first()
        if file_record is None:
            file_record = (
                db.query(DBFile)
                .join(Permission)
                .filter(DBFile.id == file_id, Permission.user_id == current_user.id)
                .first()
            )

        if file_record is None:
            raise HTTPException(status_code=404, detail="File not found")

        file_location = f"files/{file_record.file_name}"
        return FileResponse(
            path=file_location,
            media_type=file_record.file_type,
            filename=file_record.file_name,
            headers={"Content-Disposition": f"attachment; filename={file_record.file_name}"}
        )
    finally:
        db.close()

@app.get("/S3/files")
async def list_files(current_user: DBUser = Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        owned_files = db.query(DBFile).filter(DBFile.user_id == current_user.id).all()
        shared_files = (
            db.query(DBFile)
            .join(Permission)
            .filter(Permission.user_id == current_user.id)
            .all()
        )
        all_files = owned_files + shared_files
        unique_files = {file.id: file for file in all_files}.values()
        print(all_files,unique_files)
        return [{"file_id": file.id, "filename": file.file_name} for file in unique_files]
    finally:
        db.close()

@app.delete("/S3/files/{file_id}")
async def delete_file(file_id: int, current_user: DBUser = Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        file_record = db.query(DBFile).filter(DBFile.id == file_id, DBFile.user_id == current_user.id).first()
        
        if file_record is None:
            raise HTTPException(status_code=404, detail="File not found")

        db.delete(file_record)
        db.commit()
        return {"detail": "File deleted"}
    finally:
        db.close()

@app.post("/S3/folders")
def create_folder(folder: FolderCreate, current_user: DBUser = Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        db_folder = Folder(name=folder.name, user_id=current_user.id)
        db.add(db_folder)
        db.commit()
        db.refresh(db_folder)
        return db_folder
    finally:
        db.close()

@app.get("/S3/folders")
def get_folders(current_user: DBUser = Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        return db.query(Folder).filter(Folder.user_id == current_user.id).all()
    finally:
        db.close()

@app.get("/S3/files-and-folders")
async def list_files_and_folders(current_user: DBUser = Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        folders = db.query(Folder).filter(Folder.user_id == current_user.id).all()
        files = db.query(DBFile).filter(DBFile.user_id == current_user.id).all()

        response = {
            "folders": [],
            "independent_files": []
        }

        for folder in folders:
            folder_files = [file for file in files if file.folder_id == folder.id]
            response["folders"].append({
                "folder_id": folder.id,
                "folder_name": folder.name,
                "files": [{"file_id": file.id, "filename": file.file_name} for file in folder_files]
            })

        independent_files = [file for file in files if file.folder_id is None]
        response["independent_files"] = [{"file_id": file.id, "filename": file.file_name} for file in independent_files]

        return response
    finally:
        db.close()

@app.post("/S3/share_file/{file_id}")
def share_file(file_id: int, share_request: PermissionCreate):
    db: Session = SessionLocal()
    try:
        user = db.query(DBUser).filter(DBUser.username == share_request.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        file = db.query(DBFile).filter(DBFile.id == file_id).first()
        if not file:
            raise HTTPException(status_code=404, detail="File not found")

        permission = Permission(
            user_id=user.id,
            file_id=file.id,
            access_type="shared"
        )
        
        db.add(permission)
        db.commit()
        return {"message": "File shared successfully"}
    finally:
        db.close()
