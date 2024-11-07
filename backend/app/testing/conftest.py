# tests/conftest.py

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.utils.connection import Base, DATABASE_URL
from app.main import app

DATABASE_TEST_URL = "postgresql://postgres:12345qwert@localhost/test_entity_store"

# Create a new engine for the test database
engine = create_engine(DATABASE_TEST_URL, pool_size=10, max_overflow=20, pool_timeout=30, pool_pre_ping=True)

# Create a session maker for testing
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a fixture to initialize the database for testing
@pytest.fixture(scope="module")
def test_db():
    # Create all tables in the test database
    Base.metadata.create_all(bind=engine)

    # Create a new session for each test
    db = SessionLocal()
    try:
        yield db  # this will be the session that is passed to the test function
    finally:
        db.close()
        # Drop all tables after tests are done
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def token():
    client = TestClient(app)
    
    # Register the user (you could also mock this step if you wanted)
    client.post("/S3/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword"
    })
    
    # Login and retrieve the token
    login_response = client.post("/S3/auth/oauth/login", data={
        "username": "testuser", 
        "password": "testpassword"
    })
    
    # Ensure login was successful
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    return token