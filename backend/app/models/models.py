# SQLAlchemy Models
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, BigInteger, Boolean, ForeignKey, Enum as SQLAlchemyEnum, DateTime, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from app.utils.connection import Base, engine


class AccessType(Enum):
    private = 'private'
    public = 'public'
    shared = 'shared'


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    username = Column(String, unique=True)
    password_hash = Column(String)  # For storing hashed passwords
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    files = relationship("File", back_populates="owner")
    folders = relationship("Folder", back_populates="owner")
    permissions = relationship("Permission", back_populates="user")
    usage_analytics = relationship("UsageAnalytics", back_populates="user")


class File(Base):
    __tablename__ = 'files'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    folder_id = Column(Integer, ForeignKey('folders.id'), nullable=True)
    file_name = Column(String, nullable=False)
    file_size = Column(BigInteger, nullable=False)
    file_type = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    current_version = Column(Integer)

    owner = relationship("User", back_populates="files")
    versions = relationship("FileVersion", back_populates="file")
    file_metadata = relationship("Metadata", back_populates="file")
    permissions = relationship("Permission", back_populates="file")
    folder = relationship("Folder", back_populates="files")



class Folder(Base):
    __tablename__ = 'folders'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="folders")
    files = relationship("File", back_populates="folder")
    permissions = relationship("Permission", back_populates="folder")



class FileVersion(Base):
    __tablename__ = 'file_versions'

    version_id = Column(Integer, primary_key=True, index=True)
    id = Column(Integer, ForeignKey('files.id'))
    version_number = Column(Integer, nullable=False)
    file_size = Column(BigInteger, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    file_hash = Column(String)

    file = relationship("File", back_populates="versions")


class Metadata(Base):
    __tablename__ = 'metadata'

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey('files.id'))
    key = Column(String(50), nullable=False)
    value = Column(Text, nullable=False)

    file = relationship("File", back_populates="file_metadata")


class Permission(Base):
    __tablename__ = 'permissions'

    permission_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    file_id = Column(Integer, ForeignKey('files.id'), nullable=True)
    folder_id = Column(Integer, ForeignKey('folders.id'), nullable=True)
    access_type = Column(SQLAlchemyEnum(AccessType, name='access_type_enum', native_enum=False), nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    user = relationship("User", back_populates="permissions")
    file = relationship("File", back_populates="permissions")
    folder = relationship("Folder", back_populates="permissions")


class UsageAnalytics(Base):
    __tablename__ = 'usage_analytics'

    analytics_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    storage_used = Column(BigInteger, nullable=False)
    total_files = Column(Integer, nullable=False)
    last_accessed = Column(TIMESTAMP, default=datetime.utcnow)

    user = relationship("User", back_populates="usage_analytics")

Base.metadata.create_all(bind=engine)