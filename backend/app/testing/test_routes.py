import pytest
import random
import string
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import MagicMock

@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client

@pytest.fixture
def mock_db():
    db_mock = MagicMock()
    yield db_mock
    db_mock.close()

# Test user registration
def test_register(client):
    username = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
    response = client.post("/S3/auth/oauth/register", json={
        "username": username, 
        "email": "test@example.com", 
        "password": "testpassword"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

# Test user login (Token is automatically fetched from conftest.py)
def test_login(token, client):
    response = client.post("/S3/auth/oauth/login", data={
        "username": "testuser", 
        "password": "testpassword"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["access_token"] == token

# Test profile retrieval
def test_get_profile(client, token):
    response = client.get("/S3/auth/profile", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"

# Test file upload
def test_upload_file(client, token):
    file_data = {
        "file_name": "test_file.txt",
        "file": "SGVsbG8gd29ybGQ="  # Base64 encoded string for "Hello world"
    }
    response = client.post("/S3/files/upload", json=file_data, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert "file_id" in response.json()

# Test file download
def test_download_file(client, token, mock_db):
    # Mock the database response for file lookup
    file_id = 1
    mock_db.query().filter().first.return_value = {"id": file_id, "file_name": "test_file.txt", "user_id": 2}
    response_files = client.get("/S3/files",headers = {"Authorization":f"Bearer {token}"}).json()
    response = client.get(f"/S3/files/download/{response_files[0]['file_id']}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

# Test delete file
def test_delete_file(client, token):
    response_files = client.get("/S3/files",headers = {"Authorization":f"Bearer {token}"}).json()
    response = client.delete(f"/S3/files/{response_files[0]['file_id']}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json() == {"detail": "File deleted"}

# Test file search
def test_search_files(client, token):
    response = client.get("/S3/files/search", params={"keyword": "test"}, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# Test file rollback
def test_rollback_file(client, token):
    response_files = client.get("/S3/files",headers = {"Authorization":f"Bearer {token}"}).json()
    if response_files:
        rollback_data = {"file_id": response_files[0]['file_id'], "version_number": 1}
        response = client.post("/S3/files/rollback", json=rollback_data, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["message"] == "File rolled back successfully"
    else:
        response = client.post(f"/S3/files/rollback", json={"file_id": 1001, "version_number": 1}, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 404

# Test sharing file
def test_share_file(client, token):
    response_files = client.get("/S3/files",headers = {"Authorization":f"Bearer {token}"}).json()
    if response_files:
        share_data = {"user_id": "testuser2", "access_type":"shared"}
        response = client.post(f"/S3/share_file/{response_files[0]['file_id']}", json=share_data, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["message"] == "File shared successfully"
    else:
        share_data = {"user_id": "testuser2", "access_type":"shared"}
        response = client.post(f"/S3/share_file/1001", json=share_data, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 404
