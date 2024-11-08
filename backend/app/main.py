from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import List, Optional
import base64
import shutil
import os
import secrets
from passlib.context import CryptContext
from app.models.models import Base, User as DBUser, File as DBFile, Folder, Permission, FileVersion as DBFileVersion
from app.models.schemas import PermissionCreate, UserCreate, User, Token, AccessType, FileUploadRequest, FolderCreate, FileVersion, FileSearchRequest, RollbackRequest
from app.utils.connection import create_database_if_not_exists, create_tables,  SessionLocal

app = FastAPI()

create_database_if_not_exists()
create_tables()

# Define your constants
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "r3K6sbv0e9F6JpxtsRmtV9f3XtU88e9TwL6zMbLQF3w6z5-8wUcmk9JX1A8Lv2pE"
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
    except JWTError as e:
        print(f"JWTError: {e}")
        raise credentials_exception
    except Exception as e:
        print(f"Error in get_current_user: {e}")
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
        print(f"Error in register: {exception}")
        raise HTTPException(status_code=400, detail=str(exception))
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
    except Exception as e:
        print(f"Error in login: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        db.close()

@app.get("/S3/auth/profile", response_model=User)
async def get_profile(current_user: DBUser = Depends(get_current_user)):
    try:
        return current_user
    except Exception as e:
        print(f"Error in get_profile: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/S3/files/upload")
async def upload_file(
    file_upload: FileUploadRequest,
    current_user: DBUser = Depends(get_current_user)
):
    db: Session = SessionLocal()
    filename = file_upload.file_name
    
    try:
        # Check if the file is empty
        if file_upload.file == "":
            # Handle the empty file like a regular file upload, but with size 0
            base64_file = ""
            file_data = b""  # Empty byte data for empty file
        else:
            base64_file = file_upload.file
            if not base64_file:
                raise HTTPException(status_code=400, detail="File is required.")
            file_data = base64.b64decode(base64_file)

        os.makedirs("files", exist_ok=True)

        # Check if the file already exists, to handle versioning
        file_record = db.query(DBFile).filter(DBFile.file_name == filename, DBFile.user_id == current_user.id).first()

        if file_record:
            # If file exists, create a new version
            last_version = db.query(DBFileVersion).filter(DBFileVersion.id == file_record.id).order_by(DBFileVersion.version_number.desc()).first()
            version_number = last_version.version_number + 1 if last_version else 1
        else:
            version_number = 1

        # Save the file with a versioned filename: filename_version
        file_location = os.path.join("files", f"{filename}_{version_number}")

        # Write the file data to disk
        with open(file_location, "wb") as buffer:
            buffer.write(file_data)

        # Folder handling logic (same as before)
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

        # Save the new file record or update the existing one
        if not file_record:
            file_record = DBFile(
                user_id=current_user.id,
                file_name=filename,
                file_size=len(file_data),
                file_type="application/octet-stream",
                folder_id=folder_id,
                current_version=version_number,
            )
            db.add(file_record)
            db.commit()
            db.refresh(file_record)
        else:
            db.commit()

        # Create a new version record for the file
        file_version = DBFileVersion(
            id=file_record.id,
            version_number=version_number,
            file_size=len(file_data),
            file_hash=secrets.token_urlsafe(16),
        )
        db.add(file_version)
        db.commit()

        return {"filename": file_record.file_name, "file_id": file_record.id}
    except Exception as e:
        print(f"Error in upload_file: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/S3/files/download/{file_id}")
async def download_file(file_id: int, current_user: DBUser = Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        # Fetch the file record
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

        # Get the current version number
        current_version_number = file_record.current_version

        # The file location is now versioned: filename_version
        file_location = f"files/{file_record.file_name}_{current_version_number}"

        # Check if the file exists
        if not os.path.exists(file_location):
            raise HTTPException(status_code=404, detail="File content not found")

        return FileResponse(
            path=file_location,
            media_type="application/octet-stream",  # You can specify a different MIME type if needed
            filename=file_record.file_name,
            headers={"Content-Disposition": f"attachment; filename={file_record.file_name}"}
        )

    except Exception as e:
        print(f"Error in download_file: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
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

        # Prepare the response to include the current version info
        response = []
        for file in unique_files:
            # Get the current version from the DBFile's current_version field
            current_version = file.current_version
            file_version = db.query(DBFileVersion).filter(DBFileVersion.id == file.id, DBFileVersion.version_number == current_version).first()
            if file_version:
                response.append({
                    "file_id": file.id,
                    "filename": file.file_name,
                    "current_version": current_version,
                    "file_size": file_version.file_size,
                })
            else:
                response.append({
                    "file_id": file.id,
                    "filename": file.file_name,
                    "current_version": "N/A",
                    "file_size": file.file_size,
                })

        return response

    except Exception as e:
        print(f"Error in list_files: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

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
    except Exception as e:
        print(f"Error in delete_file: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
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
    except Exception as e:
        print(f"Error in create_folder: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        db.close()

@app.get("/S3/folders")
def get_folders(current_user: DBUser = Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        return db.query(Folder).filter(Folder.user_id == current_user.id).all()
    except Exception as e:
        print(f"Error in get_folders: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
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

        # Iterate through folders and add files based on the current_version
        for folder in folders:
            folder_files = [file for file in files if file.folder_id == folder.id]
            folder_response = {
                "folder_id": folder.id,
                "folder_name": folder.name,
                "files": []
            }

            for file in folder_files:
                # Fetch the file version based on current_version
                current_version_number = file.current_version
                file_version = db.query(DBFileVersion).filter(
                    DBFileVersion.id == file.id,
                    DBFileVersion.version_number == current_version_number
                ).first()

                if file_version:
                    folder_response["files"].append({
                        "file_id": file.id,
                        "filename": file.file_name,
                        "current_version": current_version_number,
                        "file_size": file_version.file_size,
                        "file_hash": file_version.file_hash
                    })

            response["folders"].append(folder_response)

        independent_files = [file for file in files if file.folder_id is None]
        for file in independent_files:
            current_version_number = file.current_version
            file_version = db.query(DBFileVersion).filter(
                DBFileVersion.id == file.id,
                DBFileVersion.version_number == current_version_number
            ).first()

            if file_version:
                response["independent_files"].append({
                    "file_id": file.id,
                    "filename": file.file_name,
                    "current_version": current_version_number,
                    "file_size": file_version.file_size,
                    "file_hash": file_version.file_hash
                })

        return response

    except Exception as e:
        print(f"Error in list_files_and_folders: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
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
    except Exception as e:
        print(f"Error in share_file: {e}")
        raise HTTPException(status_code=404, detail="Not Found Error")
    finally:
        db.close()

@app.get("/S3/files/search")
async def search_files(
    keyword: Optional[str] = Query(None),
    file_type: Optional[str] = Query(None),
    created_after: Optional[str] = Query(None),
    created_before: Optional[str] = Query(None),
):
    db = SessionLocal()
    try:
        query = db.query(DBFile)
        
        if keyword:
            query = query.filter(DBFile.file_name.ilike(f"%{keyword}%"))
        
        if file_type:
            query = query.filter(DBFile.file_type == file_type)
        
        if created_after:
            query = query.filter(DBFile.created_at >= created_after)
        
        if created_before:
            query = query.filter(DBFile.created_at <= created_before)

        files = query.all()
        return files
    except Exception as e:
        print(f"Error in search_files: {str(e)}")

@app.get("/S3/files/{file_id}/versions")
def get_file_versions(file_id: int):
    db = SessionLocal()
    try:
        file = db.query(DBFile).filter(DBFile.id == file_id).first()
        
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        versions = db.query(DBFileVersion).filter(DBFileVersion.id == file_id).order_by(DBFileVersion.version_number).all()
        
        if not versions:
            raise HTTPException(status_code=404, detail="No versions found for this file")
        
        return versions

    except Exception as e:
        print(f"Error in get_file_versions: {str(e)}")
        raise HTTPException(status_code=404, detail = "Not Found Error")


@app.post("/S3/files/rollback")
async def rollback_file(
    rollback_request: RollbackRequest, current_user: DBUser = Depends(get_current_user)
):
    db: Session = SessionLocal()
    try:
        file_id = rollback_request.file_id
        version_number = rollback_request.version_number
        # Get the file record to be rolled back
        file_record = db.query(DBFile).filter(DBFile.id == file_id, DBFile.user_id == current_user.id).first()
        if not file_record:
            raise HTTPException(status_code=404, detail="File not found")

        # Get the file version to roll back to
        file_version = db.query(DBFileVersion).filter(
            DBFileVersion.id == file_id, DBFileVersion.version_number == version_number
        ).first()

        if not file_version:
            raise HTTPException(status_code=404, detail="Version not found")

        file_record.updated_at = datetime.utcnow()
        file_record.file_size = file_version.file_size
        file_record.current_version = version_number  # Mark the current version of the file as the rolled-back version
        
        db.commit()

        return {"message": "File rolled back successfully", "file_id": file_id, "version": version_number}

    except Exception as e:
        print(f"Error in rollback_file: {e}")
        db.rollback()  # Ensure transaction is rolled back in case of failure
        raise HTTPException(status_code=404, detail="Not Found Error")

    finally:
        db.close()


