from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql://postgres:12345qwert@db/entity_store"
Base = declarative_base()
engine = create_engine(DATABASE_URL,
pool_size=10,
max_overflow=20,
pool_timeout=30,
pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
