const tap = require("tap");
const supertest = require("supertest");
const express = require('express');
const app = require("../app");
app.use(express.json());

const server = supertest(app);

// Test POST /register (register a user)
tap.test("POST /register", async (t) => {
  const newUser = {
    username: "newuser",
    password: "password123",
  };
  const response = await server.post("/register").send(newUser);
  t.equal(response.status, 201, "should return status 201");
  t.hasOwnProp(response.body, "id", "response should contain user id");
  t.equal(response.body.username, "newuser", "should return the correct username");
  t.end();
});

// Test POST /register with missing data (validation)
tap.test("POST /register with missing fields", async (t) => {
  const newUser = {
    username: "newuser",
  };
  const response = await server.post("/register").send(newUser);
  t.equal(response.status, 400, "should return status 400 for missing fields");
  t.end();
});

// Test POST /login (login a user)
tap.test("POST /login", async (t) => {
  const credentials = {
    username: "newuser",
    password: "password123",
  };
  const response = await server.post("/login").send(credentials);
  t.equal(response.status, 200, "should return status 200");
  t.hasOwnProp(response.body, "token", "response should contain a token");
  t.end();
});

// Test GET /files (get all files)
tap.test("GET /files", async (t) => {
  const response = await server.get("/files");
  t.equal(response.status, 200, "should return status 200");
  t.type(response.body, "object", "should return an array of files");
  t.hasOwnProp(response.body[0], "id", "files should have id");
  t.hasOwnProp(response.body[0], "name", "files should have name");
  t.end();
});

// Test POST /files/upload (upload a file)
tap.test("POST /files/upload", async (t) => {
  const newFile = {
    name: "testfile.txt",
    size: 1234,
    type: "text/plain",
  };
  const response = await server.post("/files/upload").send(newFile);
  t.equal(response.status, 201, "should return status 201 on successful file upload");
  t.hasOwnProp(response.body, "id", "response should contain file id");
  t.equal(response.body.name, "testfile.txt", "should return correct file name");
  t.end();
});

// Test GET /files/:id (get file by ID)
tap.test("GET /files/:id", async (t) => {
  const response = await server.get("/files/1");  // Assuming file with ID 1 exists
  t.equal(response.status, 200, "should return status 200");
  t.hasOwnProp(response.body, "id", "response should contain file id");
  t.equal(response.body.id, 1, "should return file with the correct ID");
  t.end();
});

// Test GET /files/:id with invalid ID
tap.test("GET /files/:id with invalid id", async (t) => {
  const response = await server.get("/files/9999");
  t.equal(response.status, 404, "should return status 404 for non-existent file");
  t.end();
});

// Test DELETE /files/:id (delete file by ID)
tap.test("DELETE /files/:id", async (t) => {
  const response = await server.delete("/files/1");  // Assuming file with ID 1 exists
  t.equal(response.status, 200, "should return status 200 on successful file deletion");
  t.end();
});

// Test DELETE /files/:id with invalid ID
tap.test("DELETE /files/:id with invalid id", async (t) => {
  const response = await server.delete("/files/9999");
  t.equal(response.status, 404, "should return status 404 for non-existent file");
  t.end();
});

// Test GET /folders (list folders)
tap.test("GET /folders", async (t) => {
  const response = await server.get("/folders");
  t.equal(response.status, 200, "should return status 200");
  t.type(response.body, "object", "should return an array of folders");
  t.end();
});

// Test POST /folders (create a folder)
tap.test("POST /folders", async (t) => {
  const newFolder = {
    name: "New Folder",
  };
  const response = await server.post("/folders").send(newFolder);
  t.equal(response.status, 201, "should return status 201 on successful folder creation");
  t.hasOwnProp(response.body, "id", "response should contain folder id");
  t.equal(response.body.name, "New Folder", "should return correct folder name");
  t.end();
});

// Test DELETE /folders/:id (delete folder by ID)
tap.test("DELETE /folders/:id", async (t) => {
  const response = await server.delete("/folders/1");  // Assuming folder with ID 1 exists
  t.equal(response.status, 200, "should return status 200 on successful folder deletion");
  t.end();
});

// Test DELETE /folders/:id with invalid ID
tap.test("DELETE /folders/:id with invalid id", async (t) => {
  const response = await server.delete("/folders/9999");
  t.equal(response.status, 404, "should return status 404 for non-existent folder");
  t.end();
});

tap.teardown(() => {
  process.exit(0);
});
