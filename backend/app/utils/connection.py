import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError
from sqlalchemy import text


DATABASE_URL = f"postgresql://postgres_sxfy_user:hk99PoFhEsoU3aRpcB6ELQ7JrSyi0wBc@dpg-csn6nl8gph6c73fu10cg-a.oregon-postgres.render.com/postgres_sxfy"

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
            result = connection.execute(text("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'postgres_sxfy'"))
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
