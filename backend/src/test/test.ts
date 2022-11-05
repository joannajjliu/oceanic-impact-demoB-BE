import { expect } from "chai";
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({
  path: resolve(__dirname, "../../.env.development"),
});

import request from "supertest";

import { connectDatabase, disconnectDatabase } from "@/db";
import { MongoMemoryServer } from "mongodb-memory-server";

import App from "../app";
import { IUser } from "@/models/users.model";
import mongoose from "mongoose";

let mongod: MongoMemoryServer;

before(async function() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  connectDatabase(uri, "test"); // Connect to the in-memory database
});

const beforeEachSuite = async function() {
    await mongoose.connection.dropDatabase();
};

after(async function() {
  await disconnectDatabase();
  await mongod.stop(); // stop the in-memory database
});

describe("get all users", async function () {
  this.timeout(1000);
  let app_: App;

  before(async function() {
    await beforeEachSuite();
    app_ = new App();
    // create test user
    const users = mongoose.model<IUser>("User");
    await users.create({
      email: "test@example.com",
      password: "test",
    });
  });

  it("should not return the password", async function () {
    const all_users = await request(app_.app).get("/api/v0/users");
    expect(all_users.status).to.equal(200);
    expect(all_users.type).to.equal("application/json");
    expect(all_users.body.users).to.be.an("array");
    expect(all_users.body.users[0]).to.be.an("object");
    expect(all_users.body.users[0]).to.not.have.property("password");
  });

  it("should return a 200 and an array of users", async function () {
    const all_users = await request(app_.app).get("/api/v0/users");

    expect(all_users.status).to.equal(200);
    expect(all_users.type).to.equal("application/json");
    expect(all_users.body.users).to.be.an("array");
    expect(all_users.body.users).to.have.lengthOf(1); // only one user in the database
  });
});

describe("get logged in user", async function () {
  this.timeout(2000);
  let app_: App;

  before(async function() {
    await beforeEachSuite();
    app_ = new App();
    // create test user
    const User = mongoose.model<IUser>("User");
    const testUser = new User({
      email: "test@example.com",
      password: "test",
    });
    await testUser.save(); // calls the pre-save hook
  });

  async function loginTestUser(agent: request.SuperAgentTest) {
    await agent.post("/api/v0/auth/login").send({
      username: "test@example.com", // username is the email
      password: "test",
    });
  }

  it("should return a 200 for a logged-in user", async function () {
    const agent = request.agent(app_.app);
    await loginTestUser(agent);

    const user = await agent.get("/api/v0/users/me");


    expect(user.status).to.equal(200);
    expect(user.type).to.equal("application/json");
    expect(user.body.user).to.be.an("object");
    expect(user.body.user).to.have.property("email", "test@example.com");
  });

  it("should not return the password field", async function () {
    const agent = request.agent(app_.app);
    await loginTestUser(agent);

    const all_users = await agent.get("/api/v0/users/me");

    expect(all_users.status).to.equal(200);
    expect(all_users.type).to.equal("application/json");
    expect(all_users.body.user).to.be.an("object");
    expect(all_users.body.user).to.not.have.property("password");
  });

  it("should not return 200 for a user that wasn't logged-in", async function () {
    const all_users = await request(app_.app).get("/api/v0/users/me");

    expect(all_users.status).to.equal(401); // unauthorized
  });

  it("should not return 200 for a user that logged-out", async function () {
    const agent = request.agent(app_.app);
    await loginTestUser(agent);

    await agent.post("/api/v0/users/logout"); // logout

    const all_users = await request(app_.app).get("/api/v0/users/me");

    expect(all_users.status).to.equal(401); // unauthorized
  });

  it("login route should redirect on success", async function () {
    const response = await request(app_.app).post("/api/v0/auth/login").send({
      username: "test@example.com",
      password: "test",
    });

    expect(response.status).to.equal(302); // redirect on success
    expect(response.header).to.have.property(
      "location",
      process.env.AUTH_SUCCESS_REDIRECT
    );
  });

  it("login route should redirect on failure", async function () {
    const response = await request(app_.app).post("/api/v0/auth/login").send({
      username: "test@example.com",
      password: "WRONGPASSWORD",
    });

    expect(response.status).to.equal(302); // redirect on failure
    expect(response.header).to.have.property(
      "location",
      process.env.AUTH_FAILURE_REDIRECT
    );
  });

  it("login route should failure on wrong credentials", async function () {
    const response = await request(app_.app).post("/api/v0/auth/login").send({
      username: "test@example.com",
      password: "WRONGPASSWORD",
    });

    expect(response.status).to.not.be.equal(200); // failure
  });
});
