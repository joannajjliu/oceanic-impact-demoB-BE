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
import { IProfile } from "@/models/profile.model";
import { IImage } from "@/models/image.model";
import mongoose, { HydratedDocument } from "mongoose";

let mongod: MongoMemoryServer;

before(async function () {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  connectDatabase(uri, "test"); // Connect to the in-memory database
});

async function beforeEachSuite() {
  await mongoose.connection.collection("users").deleteMany({}); // clear the users collection
}

after(async function () {
  await disconnectDatabase();
  await mongod.stop(); // stop the in-memory database
});

async function createTestUser(): Promise<HydratedDocument<IUser>> {
  const User = mongoose.model<IUser>("User");
  const user = new User({
    email: "test@example.com",
    password: "test",
    emailVerificationInfo: {
      isVerified: true,
      token: {
        value: "test",
        expiresAt: new Date(),
      },
    },
  });

  return await user.save(); // run pre-save hook
}

describe("get all users", async function () {
  this.timeout(1000);
  let app_: App;

  before(async function () {
    await beforeEachSuite();
    app_ = new App();
    // create test user
    await createTestUser();
  });

  it("should not return the password", async function () {
    const all_users = await request(app_.app).get("/api/v0/users");
    expect(all_users.status).to.equal(200);
    expect(all_users.type).to.equal("application/json");
    expect(all_users.body.users).to.be.an("array");
    expect(all_users.body.users[0]).to.be.an("object");
    expect(all_users.body.users[0]).to.not.have.property("password");
  });

  it("should not return the email token", async function () {
    const all_users = await request(app_.app).get("/api/v0/users");
    expect(all_users.status).to.equal(200);
    expect(all_users.type).to.equal("application/json");
    expect(all_users.body.users).to.be.an("array");
    expect(all_users.body.users[0]).to.be.an("object");
    expect(all_users.body.users[0]).to.not.have.property(
      "emailVerificationInfo"
    );
  });

  it("should return a 200 and an array of users", async function () {
    const all_users = await request(app_.app).get("/api/v0/users");

    expect(all_users.status).to.equal(200);
    expect(all_users.type).to.equal("application/json");
    expect(all_users.body.users).to.be.an("array");
    expect(all_users.body.users).to.have.lengthOf(1); // only one user in the database
  });
});

describe("get images of logged in user", async function () {
  this.timeout(2000);
  let app_: App;
  const Image = mongoose.model<IImage>("Image");
  let testImage: mongoose.HydratedDocument<IImage>;

  before(async function () {
    await beforeEachSuite();
    app_ = new App();
    // create test user
    const testUser = await createTestUser();

    testImage = new Image({
      author: testUser._id,
      img: {
        data: Buffer.from("DEADBEEF", "base64"),
        contentType: "image/png",
      },
    });
    await testImage.save(); // calls the pre-save hook
  });

  async function loginTestUser(agent: request.SuperAgentTest) {
    await agent.post("/api/v0/auth/login").send({
      username: "test@example.com", // username is the email
      password: "test",
    });
  }

  it("should return all images for a logged-in user", async function () {
    const agent = request.agent(app_.app);
    await loginTestUser(agent);

    const images = await agent.get("/api/v0/image/mine");

    expect(images.status).to.equal(200);
    expect(images.type).to.equal("application/json");
    expect(images.body.images).to.be.an("array");
    expect(images.body.images).to.have.length(1);
  });

  it("should return an image by it's id", async function () {
    const agent = request.agent(app_.app);
    await loginTestUser(agent);

    const images = await agent.get(`/api/v0/image/${testImage._id}`);

    expect(images.status).to.equal(200);
    expect(images.type).to.equal("application/json");
    expect(images.body.imageData).to.be.an("string");
    expect(images.body.imageData).to.equal("DEADBEEF");
  });

  it("should return a list of image ids", async function () {
    const agent = request.agent(app_.app);
    await loginTestUser(agent);

    const imageIDs = await agent.get("/api/v0/image/mine");

    expect(imageIDs.status).to.equal(200);

    const image = await agent.get(`/api/v0/image/${imageIDs.body.images[0]}`);

    expect(image.status).to.equal(200);
    expect(image.body.imageData).to.equal("DEADBEEF");
  });
});

describe("get logged in user", async function () {
  this.timeout(2000);
  let app_: App;

  before(async function () {
    await beforeEachSuite();
    app_ = new App();
    // create test user
    await createTestUser();
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

describe("create user", function () {
  this.timeout(2000);
  let app_: App;

  beforeEach(async function () {
    await beforeEachSuite();
    app_ = new App();
  });

  it("should return a 201 and the created user", async function () {
    const user = await request(app_.app).post("/api/v0/auth").send({
      email: "test@example.com",
      password: "test",
    });

    expect(user.status).to.equal(201);
    expect(user.type).to.equal("application/json");
    expect(user.body.user).to.be.an("object");
    expect(user.body.user).to.have.property("email", "test@example.com");
    expect(user.body.user).to.not.have.property("password");

    // should have meesage about email verification
    expect(user.body.message).to.be.a("string");
    expect(user.body.message).to.include("verify").and.include("email");
  });

  it("should return a 409 for a user with an existing email", async function () {
    const user = await request(app_.app).post("/api/v0/auth").send({
      email: "test@example.com", // same email as above
      password: "test",
    });

    expect(user.status).to.equal(201);

    const duplicateEmailUser = await request(app_.app)
      .post("/api/v0/auth")
      .send({
        email: "test@example.com", // same email as above
        password: "test",
      });

    expect(duplicateEmailUser.status).to.equal(409); // user already exists
    expect(duplicateEmailUser.type).to.equal("application/json");
    expect(duplicateEmailUser.body.message).to.be.a("string");
    expect(duplicateEmailUser.body.message)
      .to.include("email")
      .and.include("already");
  });

  it("should return a 400 if email is missing", async function () {
    const response = await request(app_.app).post("/api/v0/auth").send({
      password: "test",
    });

    expect(response.status).to.equal(400);
    expect(response.type).to.equal("application/json");
    expect(response.body).to.have.property("message");
    expect(response.body.message).to.include("email");
  });

  it("should return a 400 if password is missing", async function () {
    const response = await request(app_.app).post("/api/v0/auth").send({
      email: "test@example.com",
    });

    expect(response.status).to.equal(400);
    expect(response.type).to.equal("application/json");
    expect(response.body).to.have.property("message");
    expect(response.body.message).to.include("password");
  });

  it("should not login before email is verified", async function () {
    const user = await request(app_.app).post("/api/v0/auth").send({
      email: "test@example.com", // same email as above
      password: "test",
    });

    expect(user.status).to.equal(201);

    const login = await request(app_.app).post("/api/v0/auth/login").send({
      username: "test@example.com", // username is the email
      password: "test",
    });

    expect(login.status).to.equal(302); // redirect on failure
    expect(login.header).to.have.property(
      "location",
      process.env.AUTH_FAILURE_REDIRECT
    ); // failed to login
  });

  it("should be able to login after email is verified", async function () {
    const user = await request(app_.app).post("/api/v0/auth").send({
      email: "test@example.com", // same email as above
      password: "test",
    });

    expect(user.status).to.equal(201);

    // verify email with token
    const verify = await request(app_.app).get(
      "/api/v0/auth/verify?email=test@example.com&token=faketokendoesntmatter"
    ); // all tokens are valid for testing
    expect(verify.status).to.equal(204); // success

    const login = await request(app_.app).post("/api/v0/auth/login").send({
      username: "test@example.com", // username is the email
      password: "test",
    });

    expect(login.status).to.equal(302); // redirect on success
    expect(login.header).to.have.property(
      "location",
      process.env.AUTH_SUCCESS_REDIRECT
    ); // successful login
  });
});

describe("profile create on signup", async function () {
  this.timeout(2000);
  let app_: App;

  before(async function () {
    await beforeEachSuite();
    app_ = new App();
  });

  it("should be able to get own profile after signup", async function () {
    // create test user using signup route
    const agent = request.agent(app_.app);
    await agent.post("/api/v0/auth").send({
      email: "test@example.com",
      password: "test",
    });

    // verify email with token
    const verify = await request(app_.app).get(
      "/api/v0/auth/verify?email=test@example.com&token=faketokendoesntmatter"
    ); // all tokens are valid for testing
    expect(verify.status).to.equal(204); // success

    await agent.post("/api/v0/auth/login").send({
      username: "test@example.com", // username is the email
      password: "test",
    });

    // get own user info
    const user = await agent.get("/api/v0/users/me");

    expect(user.status).to.equal(200);
    expect(user.type).to.equal("application/json");

    const profile = await agent.get("/api/v0/profile");

    expect(profile.status).to.equal(200);
    expect(profile.type).to.equal("application/json");
    expect(profile.body.profile).to.be.an("object");
    expect(profile.body.profile).to.have.property("user", user.body.user._id);
  });
});

describe("get profile details", async function () {
  this.timeout(2000);
  let app_: App;

  let testProfile: mongoose.HydratedDocument<IProfile>;

  before(async function () {
    await beforeEachSuite();
    app_ = new App();

    const testUser = await createTestUser();

    // create test profile
    const Profile = mongoose.model<IProfile>("Profile");
    testProfile = await Profile.create({
      user: testUser._id,
      displayName: "test",
    });
  });

  it("should be able to get a profile by its id", async function () {
    const profile = await request(app_.app).get(
      `/api/v0/profile/${testProfile._id}`
    );

    expect(profile.status).to.equal(200);
    expect(profile.type).to.equal("application/json");
  });
});

describe("edit profile details", async function () {
  this.timeout(2000);
  let app_: App;

  let testProfile: mongoose.HydratedDocument<IProfile>;

  before(async function () {
    await beforeEachSuite();
    app_ = new App();

    const testUser = await createTestUser();

    // create test profile
    const Profile = mongoose.model<IProfile>("Profile");
    testProfile = await Profile.create({
      user: testUser,
      displayName: "test",
    });

    // verify email with token
    const verify = await request(app_.app).get(
      "/api/v0/auth/verify?email=test@example.com&token=faketokendoesntmatter"
    ); // all tokens are valid for testing
    expect(verify.status).to.equal(204); // success
  });

  it("should be able to edit modifiable fields", async function () {
    const agent = request.agent(app_.app);

    await agent.post("/api/v0/auth/login").send({
      username: "test@example.com", // username is the email
      password: "test",
    });

    const profile = await request(app_.app).get(
      `/api/v0/profile/${testProfile._id}`
    );

    expect(profile.status).to.equal(200);
    expect(profile.type).to.equal("application/json");
    expect(profile.body.profile).to.have.property("displayName", "test");

    await agent.patch("/api/v0/profile").send({
      values: { bio: "Aryan is testing", displayName: "aryantest" },
    });

    const updatedProfile = await request(app_.app).get(
      `/api/v0/profile/${testProfile._id}`
    );

    expect(updatedProfile.status).to.equal(200);
    expect(updatedProfile.type).to.equal("application/json");
    expect(updatedProfile.body.profile).to.have.property(
      "displayName",
      "aryantest"
    );
    expect(updatedProfile.body.profile).to.have.property(
      "bio",
      "Aryan is testing"
    );
  });
});

describe("edit profile details", async function () {
  this.timeout(2000);
  let app_: App;

  let testProfile: mongoose.HydratedDocument<IProfile>;

  before(async function () {
    await beforeEachSuite();
    app_ = new App();

    const testUser = await createTestUser();

    // create test profile
    const Profile = mongoose.model<IProfile>("Profile");
    testProfile = await Profile.create({
      user: testUser,
      displayName: "test",
    });

    // verify email with token
    const verify = await request(app_.app).get(
      "/api/v0/auth/verify?email=test@example.com&token=faketokendoesntmatter"
    ); // all tokens are valid for testing
    expect(verify.status).to.equal(204); // success
  });

  it("should not be able to edit unmodifiable fields", async function () {
    const agent = request.agent(app_.app);

    await agent.post("/api/v0/auth/login").send({
      username: "test@example.com", // username is the email
      password: "test",
    });

    const profile = await request(app_.app).get(
      `/api/v0/profile/${testProfile._id}`
    );

    const user = profile.body.profile.user;

    expect(profile.status).to.equal(200);
    expect(profile.type).to.equal("application/json");
    expect(profile.body.profile).to.have.property("user", user);

    await agent.patch("/api/v0/profile").send({
      values: { user: "213213" },
    });

    const updatedProfile = await request(app_.app).get(
      `/api/v0/profile/${testProfile._id}`
    );

    expect(updatedProfile.status).to.equal(200);
    expect(updatedProfile.type).to.equal("application/json");
    expect(updatedProfile.body.profile).to.have.property("user", user); //profile user should remain the same
  });
});

describe("edit profile details", async function () {
  this.timeout(2000);
  let app_: App;

  let testProfile: mongoose.HydratedDocument<IProfile>;

  before(async function () {
    await beforeEachSuite();
    app_ = new App();

    const testUser = await createTestUser();

    // create test profile
    const Profile = mongoose.model<IProfile>("Profile");
    testProfile = await Profile.create({
      user: testUser,
      displayName: "test",
    });

    // verify email with token
    const verify = await request(app_.app).get(
      "/api/v0/auth/verify?email=test@example.com&token=faketokendoesntmatter"
    ); // all tokens are valid for testing
    expect(verify.status).to.equal(204); // success
  });

  it("should only be able to edit modifiable fields", async function () {
    const agent = request.agent(app_.app);

    await agent.post("/api/v0/auth/login").send({
      username: "test@example.com", // username is the email
      password: "test",
    });

    const profile = await request(app_.app).get(
      `/api/v0/profile/${testProfile._id}`
    );

    const user = profile.body.profile.user;

    expect(profile.status).to.equal(200);
    expect(profile.type).to.equal("application/json");
    expect(profile.body.profile).to.have.property("user", user);
    expect(profile.body.profile).to.have.property("displayName", "test");
    expect(profile.body.profile).to.not.haveOwnProperty("bio");

    await agent.patch("/api/v0/profile").send({
      values: {
        user: "213213",
        bio: "Aryan is testing",
        displayName: "aryantest",
      },
    });

    const updatedProfile = await request(app_.app).get(
      `/api/v0/profile/${testProfile._id}`
    );

    expect(updatedProfile.status).to.equal(200);
    expect(updatedProfile.type).to.equal("application/json");
    expect(updatedProfile.body.profile).to.have.property("user", user); //profile user should remain the same
    expect(updatedProfile.body.profile).to.have.property(
      "displayName",
      "aryantest"
    );
    expect(updatedProfile.body.profile).to.have.property(
      "bio",
      "Aryan is testing"
    );
  });
});
