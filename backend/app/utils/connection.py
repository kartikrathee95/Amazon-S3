import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError
from sqlalchemy import text

# For local development
if os.getenv("ENV") and os.getenv("ENV") == "local":
    DB_HOST = "db"  # Docker Compose service name
else:
    DB_HOST = "https://amazon-s3-3.onrender.com/"
  
DATABASE_URL = f"postgresql://postgres:12345qwert@{DB_HOST}:5432/entity_store"

Base = declarative_base()

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL,
                       pool_size=10,
                       max_overflow=20,
                       pool_timeout=30,
                       pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_database_if_not_exists():
    try:
        with engine.connect() as connection:
            # Check if the 'entity_store' database exists
            result = connection.execute(text("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'entity_store'"))
            if not result.fetchone():
                connection.execute(text("CREATE DATABASE entity_store"))
                print("Database 'entity_store' created!")
            else:
                print("Database 'entity_store' already exists.")
    except OperationalError as e:
        print(f"Error: {e}")
def create_tables():
    Base.metadata.create_all(bind=engine)
    print("Tables created!")
