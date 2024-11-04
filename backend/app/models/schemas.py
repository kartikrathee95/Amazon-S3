from pydantic import BaseModel, EmailStr, constr, Field
from typing import Optional, List
from enum import Enum as PyEnum
from datetime import datetime

class AccessType(PyEnum):
    private = 'private'
    public = 'public'
    shared = 'shared'

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class User(BaseModel):
    id: int
    email: EmailStr
    username: str
    password_hash: Optional[str]  # Optional for reading from DB
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class FileCreate(BaseModel):
    user_id: int
    file_name: str
    file_size: int
    file_type: str

class File(BaseModel):
    id: int
    user_id: int
    file_name: str
    file_size: int
    file_type: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    class Config:
        orm_mode = True

class FolderCreate(BaseModel):
    user_id: int
    folder_name: str
    parent_folder_id: Optional[int] = None

class Folder(BaseModel):
    id: int
    user_id: int
    folder_name: str
    parent_folder_id: Optional[int]
    created_at: datetime

    class Config:
        orm_mode = True
        
class FileUploadRequest(BaseModel):
    file: str  
    folder_name: Optional[str] = None

class FileVersionCreate(BaseModel):
    file_id: int
    version_number: int = Field(..., gt=0)
    file_size: int
    file_hash: str

class FileVersion(BaseModel):
    version_id: int
    id: int
    version_number: int
    file_size: int
    created_at: datetime
    file_hash: str

    class Config:
        orm_mode = True

class MetadataCreate(BaseModel):
    file_id: int
    key: constr(max_length=50)
    value: str

class Metadata(BaseModel):
    id: int
    file_id: int
    key: str
    value: str

    class Config:
        orm_mode = True

class PermissionCreate(BaseModel):
    user_id: str 
    folder_id: Optional[int] = None
    access_type: AccessType

class Permission(BaseModel):
    permission_id: int
    user_id: int
    file_id: Optional[int]
    folder_id: Optional[int]
    access_type: AccessType
    created_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class UsageAnalyticsCreate(BaseModel):
    user_id: int
    storage_used: int = Field(..., ge=0)
    total_files: int = Field(..., ge=0)

class UsageAnalytics(BaseModel):
    analytics_id: int
    user_id: int
    storage_used: int
    total_files: int
    last_accessed: datetime

    class Config:
        orm_mode = True