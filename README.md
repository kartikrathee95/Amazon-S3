# Amazon S3 Cloud Storage

This project is a cloud storage solution inspired by Amazon S3, where users can upload, download, share, search, and manage their files securely. The backend is built using **FastAPI**, and the frontend is built using **React**.

---

## Table of Contents

- [Overview](#overview)
- [UI Details](#ui-details)
- [Backend Details](#backend-details)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [File Management](#file-management)
  - [Folder Management](#folder-management)
  - [File Sharing](#file-sharing)
  - [File Search](#file-search)
- [Running the Project Locally](#running-the-project-locally)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Install Node.js v20 Using NVM](#install-nodejs-v20-using-nvm)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This project is designed to provide a scalable and secure cloud storage service similar to Amazon S3. It allows users to upload, manage, and share their files, while also supporting versioning and rollback functionality.

---

## UI Details

The frontend of the application is a simple, user-friendly interface built with **React**. You can interact with the application directly by visiting the deployed frontend UI.

### UI Deployment

The UI is deployed and accessible at:  
[https://amazon-s3-1.onrender.com/](https://amazon-s3-1.onrender.com/)

### UI Walkthrough

Upon visiting the UI URL, you will see the following screen:

#### 1. **Welcome Screen**
The welcome screen provides a brief introduction to the application:

> **"Welcome to Amazon S3 Cloud Storage"**  
> Your cloud storage solution for storing and sharing files securely.

You can then click the **Login to your account** button to proceed to the login page.

#### 2. **Login Screen**
On the login page, you can enter your **username** and **password** to log into your account. If you don't have an account, you can register using the **Register** button (via the backend registration API).

#### 3. **Dashboard**
After logging in, you are taken to the main dashboard with the following options:

- **File Upload**: Upload files to the cloud storage.
- **File Download**: Download previously uploaded files.
- **File Share**: Share files with other users.
- **File Search**: Search for files based on filename, type, or creation date.
- **File Delete**: Delete files from cloud storage.
- **Rollback Version**: Roll back to a previous version of a file.
- **Logout**: Log out of your account.

---

## Backend Details

The backend is developed using **FastAPI**, which provides robust, scalable, and secure APIs for managing files, users, and folders.

### Backend Deployment

The backend is deployed and accessible at:  
[https://amazon-s3-2.onrender.com/](https://amazon-s3-2.onrender.com/)

### Features

- **Authentication**: Register and login users using OAuth2 with JWT tokens.
- **File Management**: Upload, download, delete, and manage file versions.
- **Folder Management**: Create and list folders to organize files.
- **File Sharing**: Share files with other users by assigning permissions.
- **File Search**: Search for files by name, type, or date.
- **Version Rollback**: Rollback files to a previous version.

---

## API Endpoints

### Authentication

1. **POST /S3/auth/oauth/register**  
   Registers a new user. Requires `username`, `email`, and `password`.

2. **POST /S3/auth/oauth/login**  
   Authenticates a user and returns a JWT token for further API requests.

3. **GET /S3/auth/profile**  
   Retrieves the current user's profile information.

### File Management

1. **POST /S3/files/upload**  
   Upload a new file to the storage. Supports versioning.

2. **GET /S3/files/download/{file_id}**  
   Download a file by its `file_id`.

3. **GET /S3/files**  
   Lists all files uploaded by the current user.

4. **DELETE /S3/files/{file_id}**  
   Delete a file by its `file_id`.

5. **GET /S3/files/{file_id}/versions**  
   Retrieve all versions of a specific file.

6. **POST /S3/files/rollback**  
   Roll back a file to a specific version.

### Folder Management

1. **POST /S3/folders**  
   Create a new folder in the cloud storage.

2. **GET /S3/folders**  
   List all folders created by the current user.

3. **GET /S3/files-and-folders**  
   List all files and folders associated with the current user.

### File Sharing

1. **POST /S3/share_file/{file_id}**  
   Share a file with another user by providing their `user_id`.

### File Search

1. **GET /S3/files/search**  
   Search for files based on `keyword`, `file_type`, `created_after`, and `created_before`.

---

## Running the Project Locally

To run the project locally, follow the steps below:

### Prerequisites

- **Python 3.8+** (for the backend)
- **Node.js 14+** (for the frontend)
- **PostgreSQL** (for the database)

### Backend

1. Clone the repository:

    ```bash
    git clone -b gh-pages https://github.com/kartikrathee95/Amazon-S3.git
    git checkout gh-pages
    cd Amazon-S3/backend
    ```

2. Create and activate a virtual environment:

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Install the required dependencies:

    ```bash
    pip install poetry
    poetry install
    ```

    For running the unit tests:

    ```bash
    poetry run pytest -s
    ```

4. Run the FastAPI server:

    ```bash
    uvicorn app.main:app --reload
    ```

The backend will be running at `http://localhost:8000/`.

### Frontend

#### Install Node.js v20 Using NVM

This project requires **Node.js v20** to run. Follow the instructions below to install **Node.js v20** using **nvm** (Node Version Manager) on **Windows**, **macOS**, and **Ubuntu (Linux)**.

1. **Install `nvm` (Node Version Manager)**

    - **For Windows**:
      1. Download the latest release of [nvm-windows](https://github.com/coreybutler/nvm-windows/releases).
      2. Run the installer and follow the setup instructions.

    - **For macOS and Ubuntu (Linux)**:
      1. Run the following command to install `nvm`:

         ```bash
         curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
         ```

      2. After installation, restart your terminal or run the following to load `nvm` into your session:

         ```bash
         source ~/.bashrc   # For bash
         source ~/.zshrc    # For zsh
         ```

2. **Install Node.js v20**

    Once `nvm` is installed, you can install **Node.js v20** by running the following command:

    ```bash
    nvm install 20
    nvm use 20
    ```

3. **Install Frontend Dependencies**

    1. Navigate to the frontend directory:

       ```bash
       cd Amazon-S3/frontend
       ```

    2. Install the dependencies:

       ```bash
       npm install
       ```

4. **Start the React Development Server**

    ```bash
    npm start
    ```

The frontend will be running at `http://localhost:3000/`.

---

## Deployment

Both the frontend and backend are deployed and hosted using **Render**.

- **Frontend URL**: [https://amazon-s3-1.onrender.com/](https://amazon-s3-1.onrender.com/)
- **Backend URL**: [https://amazon-s3-2.onrender.com/](https://amazon-s3-2.onrender.com/)

### Backend

The backend is deployed using FastAPI with a PostgreSQL database and has the following configurations:

- **Database URL**: Configured in `app/utils/connection.py`.
- **CORS**: The backend allows requests from the frontend deployed at `https://amazon-s3-1.onrender.com/` and `http://localhost:3000`.

### Frontend

The frontend is a React-based application that communicates with the backend via API requests. It uses **Axios** to handle API calls and **React Router** to manage navigation.

---

## Acknowledgements

- FastAPI for the backend framework.
- React for the frontend framework.
- PostgreSQL for the database.

---
