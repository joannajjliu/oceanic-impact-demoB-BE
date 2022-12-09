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
import User, { IUser } from "@/models/users.model";
import Profile, { IProfile } from "@/models/profile.model";
import Listing, { IListing } from "@/models/listing.model";
import Image, { IImage } from "@/models/image.model";
import mongoose, { HydratedDocument, Types } from "mongoose";

let mongod: MongoMemoryServer;

before(async function () {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  connectDatabase(uri, "test"); // Connect to the in-memory database
});

async function beforeEachSuite() {
  await User.deleteMany({});
  await Profile.deleteMany({});
  await Listing.deleteMany({});
  await Image.deleteMany({});
}

after(async function () {
  await disconnectDatabase();
  await mongod.stop(); // stop the in-memory database
});

async function createTestUser(
  email: string = "test@example.com"
): Promise<HydratedDocument<IUser>> {
  const user = new User({
    email: email,
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

async function createTestProfile(
  user_id: Types.ObjectId
): Promise<HydratedDocument<IProfile>> {
  // create profile
  const user = await User.findOne({ _id: user_id })
  return await Profile.create({
    user: user_id,
    avatarImage: null,
    bio: "testbio",
    displayName: "test",
    emailInfo: {
      isVerified: true,
      email: user!.email, // should not be null user
    }
  });
}

async function loginTestUser(request: request.SuperTest<request.Test>) {
  const response = await request.post("/api/v0/auth/login").send({
    email: "test@example.com", // email is the email
    password: "test",
  });

  return response.headers["authorization"];
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

  it("should return all images for a logged-in user", async function () {
    const JWT = await loginTestUser(request(app_.app));

    const images = await request(app_.app)
      .get("/api/v0/image/mine")
      .set("authorization", JWT); // set the authorization header

    expect(images.status).to.equal(200);
    expect(images.type).to.equal("application/json");
    expect(images.body.images).to.be.an("array");
    expect(images.body.images).to.have.length(1);
  });

  it("should return an image by it's id", async function () {
    const JWT = await loginTestUser(request(app_.app));

    const images = await request(app_.app)
      .get(`/api/v0/image/${testImage._id}`)
      .set("authorization", JWT); // set the authorization header

    expect(images.status).to.equal(200);
    expect(images.type).to.equal("application/octet-stream");
    expect(images.body).to.deep.equal(Buffer.from("DEADBEEF", "base64"));
  });

  it("should return a list of image ids", async function () {
    const JWT = await loginTestUser(request(app_.app));

    const imageIDs = await request(app_.app)
      .get("/api/v0/image/mine")
      .set("authorization", JWT); // set the authorization header

    expect(imageIDs.status).to.equal(200);

    const image = await request(app_.app)
      .get(`/api/v0/image/${imageIDs.body.images[0]}`)
      .set("authorization", JWT); // set the authorization header

    expect(image.status).to.equal(200);
    expect(image.type).to.equal("application/octet-stream");
    expect(image.body).to.deep.equal(Buffer.from("DEADBEEF", "base64"));
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

  it("should return a 200 for a logged-in user", async function () {
    const JWT = await loginTestUser(request(app_.app));

    const user = await request(app_.app)
      .get("/api/v0/users/me")
      .set("authorization", JWT); // set the authorization header

    expect(user.status).to.equal(200);
    expect(user.type).to.equal("application/json");
    expect(user.body.user).to.be.an("object");
    expect(user.body.user).to.have.property("email", "test@example.com");
  });

  it("should not return the password field", async function () {
    const JWT = await loginTestUser(request(app_.app));

    const all_users = await request(app_.app)
      .get("/api/v0/users/me")
      .set("authorization", JWT); // set the authorization header

    expect(all_users.status).to.equal(200);
    expect(all_users.type).to.equal("application/json");
    expect(all_users.body.user).to.be.an("object");
    expect(all_users.body.user).to.not.have.property("password");
  });

  it("should not return 200 for a user that wasn't logged-in", async function () {
    const all_users = await request(app_.app).get("/api/v0/users/me");

    expect(all_users.status).to.equal(401); // unauthorized
  });

  it("should not return 200 for a user that didn't pass JWT", async function () {
    const JWT = await loginTestUser(request(app_.app));

    // don't send the JWT
    const all_users = await request(app_.app)
      .get("/api/v0/users/me")
    //.set("authorization", `JWT ${JWT}`);

    expect(all_users.status).to.equal(401); // unauthorized
  });

  it("login route should be ok on success", async function () {
    const response = await request(app_.app).post("/api/v0/auth/login").send({
      email: "test@example.com",
      password: "test",
    });

    expect(response.status).to.equal(200);
  });

  it("login route success should return JWT in header", async function () {
    const response = await request(app_.app).post("/api/v0/auth/login").send({
      email: "test@example.com",
      password: "test",
    });

    expect(response.status).to.equal(200);
    expect(response.headers["authorization"]).to.be.a("string");
    expect(response.headers["authorization"]).to.include("JWT"); // JWT is the token type
  });

  it("login route should 401 on failure", async function () {
    const response = await request(app_.app).post("/api/v0/auth/login").send({
      email: "test@example.com",
      password: "WRONGPASSWORD",
    });

    expect(response.status).to.equal(401); // unauthorized
  });

  it("login route failure should NOT return JWT in header", async function () {
    const response = await request(app_.app).post("/api/v0/auth/login").send({
      email: "test@example.com",
      password: "WRONGPASSWORD",
    });

    expect(response.headers).to.not.have.property("authorization"); // no JWT header
  });

  it("login route should failure on wrong credentials", async function () {
    const response = await request(app_.app).post("/api/v0/auth/login").send({
      email: "test@example.com",
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
      email: "test@example.com", // email is the email
      password: "test",
    });

    expect(login.status).to.equal(401); // unauthorized
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
      email: "test@example.com", // email is the email
      password: "test",
    });

    expect(login.status).to.equal(200); // success
    // expect JWT in header
    expect(login.headers["authorization"]).to.be.a("string");
    expect(login.headers["authorization"]).to.include("JWT"); // JWT is the token type
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

    const loginResponse = await agent.post("/api/v0/auth/login").send({
      email: "test@example.com", // email is the email
      password: "test",
    });

    const JWT = loginResponse.headers["authorization"];

    // get own user info
    const user = await agent.get("/api/v0/users/me").set("authorization", JWT);

    expect(user.status).to.equal(200);
    expect(user.type).to.equal("application/json");

    const profile = await agent
      .get("/api/v0/profile")
      .set("authorization", JWT);

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

    const loginResponse = await agent.post("/api/v0/auth/login").send({
      email: "test@example.com", // email is the email
      password: "test",
    });

    const JWT = loginResponse.headers["authorization"];

    const profile = await request(app_.app).get(
      `/api/v0/profile/${testProfile._id}`
    );

    expect(profile.status).to.equal(200);
    expect(profile.type).to.equal("application/json");
    expect(profile.body.profile).to.have.property("displayName", "test");

    const edit_response = await agent
      .patch("/api/v0/profile")
      .set("authorization", JWT)
      .send({
        bio: "Aryan is testing", displayName: "aryantest"
      });

    expect(edit_response.status).to.equal(200);

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

    const loginResponse = await agent.post("/api/v0/auth/login").send({
      email: "test@example.com", // email is the email
      password: "test",
    });

    const JWT = loginResponse.headers["authorization"];

    const profile = await request(app_.app).get(
      `/api/v0/profile/${testProfile._id}`
    );

    const user = profile.body.profile.user;

    expect(profile.status).to.equal(200);
    expect(profile.type).to.equal("application/json");
    expect(profile.body.profile).to.have.property("user", user);

    await agent
      .patch("/api/v0/profile")
      .set("authorization", JWT)
      .send({
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

    const loginResponse = await agent.post("/api/v0/auth/login").send({
      email: "test@example.com", // email is the email
      password: "test",
    });

    const JWT = loginResponse.headers["authorization"];

    const profile = await request(app_.app).get(
      `/api/v0/profile/${testProfile._id}`
    );

    const user = profile.body.profile.user;

    expect(profile.status).to.equal(200);
    expect(profile.type).to.equal("application/json");
    expect(profile.body.profile).to.have.property("user", user);
    expect(profile.body.profile).to.have.property("displayName", "test");
    expect(profile.body.profile).to.not.haveOwnProperty("bio");

    const update_response = await agent
      .patch("/api/v0/profile")
      .set("authorization", JWT)
      .send({
          user: "213213",
          bio: "Aryan is testing",
          displayName: "aryantest",
      });
    
    expect(update_response.status).to.equal(200);

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

async function createTestListing(user_id: Types.ObjectId): Promise<HydratedDocument<IListing>> {
  const testProfile = await Profile.findOne({ user: user_id });
  expect(testProfile).to.not.be.null;
  const testListing = await Listing.create({
    title: "test",
    description: "listingTest",
    poster: testProfile!._id,
    location: {
      coords: [0, 0],
      name: "test",
    },
    type: "LOST",
  });

  return testListing;
}

describe("add new listing", async function () {
  this.timeout(2000);
  let app_: App;
  let testUser: mongoose.HydratedDocument<IUser>;
  let testProfile: mongoose.HydratedDocument<IProfile>;

  before(async function () {
    await beforeEachSuite();
    app_ = new App();
    testUser = await createTestUser();
    testProfile = await createTestProfile(testUser._id);
  });

  it("should return a 201 and the new listing object", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));
    const response = await request(app_.app)
      .post("/api/v0/listings/")
      .set("authorization", JWT)
      .send({
        title: "test",
        description: "listingTest",
        bounty: 0.0,
        poster: testProfile._id,
        location: {
          coords: [0, 0],
          name: "test",
        },
        type: "LOST",
        tags: [],
      });

    expect(response.status).to.equal(201); // created
    expect(response.type).to.equal("application/json");
    expect(response.body).to.have.property("listing");
    expect(response.body.listing).to.have.property("title", "test");
  });

  it("should return a 401 if not logged in", async function () {
    const response = await request(app_.app)
      .post("/api/v0/listings/")
      // .set('authorization', JWT) // no auth
      .send({
        title: "test",
        description: "listingTest",
        poster: testUser._id,
        location: {
          coords: [0, 0],
          name: "test",
        },
        type: "LOST",
      });

    expect(response.status).to.equal(401); // unauthorized
  });
});

describe("delete existing listing", async function () {
  this.timeout(1000);
  let app_: App;
  let testListing: HydratedDocument<IListing>;
  let testUser: HydratedDocument<IUser>;

  beforeEach(async function () {
    await beforeEachSuite();
    app_ = new App();
    testUser = await createTestUser();
    await createTestProfile(testUser._id);
    testListing = await createTestListing(testUser._id);
  });

  it("should return a 200 and the listing object", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));
    const response = await request(app_.app)
      .delete(`/api/v0/listings/${testListing._id}`)
      .set("authorization", JWT)
      .send();

    expect(response.status).to.equal(200);
    expect(response.type).to.equal("application/json");
    expect(response.body.deletedListing).to.be.an("object");
    expect(response.body.deletedListing).to.have.property("title", "test");
  });

  it("should not be returned if deleted", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));
    const response = await request(app_.app)
      .delete(`/api/v0/listings/${testListing._id}`)
      .set("authorization", JWT)
      .send();

    expect(response.status).to.equal(200);
    expect(response.type).to.equal("application/json");
    expect(response.body.deletedListing).to.be.an("object");
    expect(response.body.deletedListing).to.have.property("title", "test");

    const listings = await request(app_.app).get("/api/v0/listings/").send();

    expect(listings.status).to.equal(200);
    expect(listings.type).to.equal("application/json");
    expect(listings.body.listings).to.be.an("array");
    expect(
      (listings.body.listings as Array<HydratedDocument<IListing>>).some(
        (listing) => listing._id === testListing._id
      )
    ).to.be.false;
  });

  it("should return a 401 if not logged in", async function () {
    const response = await request(app_.app)
      .delete(`/api/v0/listings/${testListing._id}`)
      // .set('authorization', JWT) no auth
      .send();

    expect(response.status).to.equal(401); // unauthorized
  });

  it("should return a 403 if didn't create the listing", async function () {
    const differentTestUser = await createTestUser("test1@example.com");
    await createTestProfile(differentTestUser._id);
    const JWT = await loginTestUser(request.agent(app_.app));
    const testListingCreatedByDifferentUser = await createTestListing(
      differentTestUser._id
    );

    const response = await request(app_.app)
      .delete(`/api/v0/listings/${testListingCreatedByDifferentUser._id}`)
      .set("authorization", JWT) // different user
      .send();

    expect(response.status).to.equal(403); // forbidden (not logged in)
  });
});

describe('edit existing listing', async function () {
  this.timeout(1000);
  let app_: App
  let testListing: HydratedDocument<IListing>;
  let testUser: HydratedDocument<IUser>;
  let testImage: mongoose.HydratedDocument<IImage>;
  let testProfile: mongoose.HydratedDocument<IProfile>;

  beforeEach(async function () {
    await beforeEachSuite();
    app_ = new App();
    testUser = await createTestUser();
    testProfile = await createTestProfile(testUser._id);
    testListing = await createTestListing(testUser._id);
    testImage = new Image({
      author: testUser._id,
      img: {
        data: Buffer.from("DEADBEEF", "base64"),
        contentType: "image/png",
      },
    });
    await testImage.save();
  });

  it("should be able to edit modifiable fields", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));

    const agent = request.agent(app_.app);

    const update_response = await agent
      .patch(`/api/v0/listings/${testListing._id}`)
      .set("authorization", JWT)
      .send({
          description: "test listing",
          location: {
            coords: [1, 1],
            name: "new"
          },
          bounty: 10,
          tags: "one",
          imageIDs: [testImage._id],
          resolved: true,
      });

    expect(update_response.status).to.equal(200);

    const updatedListing = await request(app_.app).get(
      `/api/v0/listings/${testListing._id}`
    );
    expect(updatedListing.status).to.equal(200);
    expect(updatedListing.type).to.equal("application/json");
    expect(updatedListing.body.listing.poster).to.equal(testProfile!._id.toString()); //profile user should remain the same
    expect(updatedListing.body.listing).to.have.property(
      "description",
      "test listing"
    );
    expect(updatedListing.body.listing).to.have.property(
      "bounty",
      10
    );
    expect(updatedListing.body.listing.imageIDs[0]).to.eql(
      testImage._id.toString()
    );
    expect(updatedListing.body.listing.location).to.have.property(
      "name",
      "new"
    );
    expect(updatedListing.body.listing).to.have.property(
      "resolved",
      true
    );
  });
  
  it("should not be able to edit nonmodifiable fields", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));

    const agent = request.agent(app_.app);

    await agent
      .patch(`/api/v0/listings/${testListing._id}`)
      .set("authorization", JWT)
      .send({
          poster: "totally different user id",
      });

    const updatedListing = await request(app_.app).get(
      `/api/v0/listings/${testListing._id}`
    );
    expect(updatedListing.status).to.equal(200);
    expect(updatedListing.type).to.equal("application/json");
    expect(updatedListing.body.listing.poster).to.equal(testProfile!._id.toString()); //profile user should remain the same
    // should not be able to edit poster
  });

  it("should only be able to edit modifiable fields", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));

    const agent = request.agent(app_.app);

    const update_response = await agent
      .patch(`/api/v0/listings/${testListing._id}`)
      .set("authorization", JWT)
      .send({
          title: "updated title",
          description: "test listing",
          bounty: 10,
          poster: "totally different profile id",
      });

    expect(update_response.status).to.equal(200); // should be able to edit

    const updatedListing = await request(app_.app).get(
      `/api/v0/listings/${testListing._id}`
    );
    expect(updatedListing.status).to.equal(200);
    expect(updatedListing.type).to.equal("application/json");
    expect(updatedListing.body.listing.poster).to.equal(testProfile!._id.toString()); //profile user should remain the same
    // should not be able to edit poster

    // all other fields should be updated
    expect(updatedListing.body.listing).to.have.property(
      "title",
      "updated title"
    );
    expect(updatedListing.body.listing).to.have.property(
      "bounty",
      10
    );
    expect(updatedListing.body.listing).to.have.property(
      "description",
      "test listing"
    );
  });

  it("should return a 401 if not logged in", async function () {
    //const JWT = await loginTestUser(request.agent(app_.app));

    const agent = request.agent(app_.app);
    const response = await agent
      .patch(`/api/v0/listings/${testListing._id}`)
      //.set("authorization", JWT) unauthorized
      .send({
          title: "updated title",
          description: "test listing",
          bounty: 10,
      });

      expect(response.status).to.equal(401); 
  });

  it("should return a 403 if user is not the owner ", async function () {
    const differentTestUser = await createTestUser("test1@example.com");
    await createTestProfile(differentTestUser._id);
    const JWT = await loginTestUser(request.agent(app_.app));
    const testListingCreatedByDifferentUser = await createTestListing(
      differentTestUser._id
    );
    const agent = request.agent(app_.app);
    const response = await agent
      .patch(`/api/v0/listings/${testListingCreatedByDifferentUser._id}`)
      .set("authorization", JWT) // authorized, but not the same user
      .send({
          title: "updated title",
          description: "test listing",
          bounty: 10,
      });
    
    expect(response.status).to.equal(403); // authorized but forbidden
  });

  it("should not update image if user is not the owner", async function () {
    const agent = request.agent(app_.app);
    const JWT = await loginTestUser(agent);

    const differentTestUser = await createTestUser("test1@example.com");
    await createTestProfile(differentTestUser._id);

    const differentTestImage = await Image.create({
      author: differentTestUser._id,
      img: {
        data: Buffer.from("DEADBEEF", "base64"),
        contentType: "image/png",
      },
    });

    const update_response = await agent
      .patch(`/api/v0/listings/${testListing._id}`)
      .set("authorization", JWT)
      .send({
          imageIDs: [differentTestImage._id],
      });

    expect(update_response.status).to.equal(403); // authorized but forbidden

    const updatedListing = await request(app_.app).get(
      `/api/v0/listings/${testListing._id}`
    );
    expect(updatedListing.status).to.equal(200);
    expect(updatedListing.type).to.equal("application/json");
    expect(updatedListing.body.listing.imageIDs).to.be.an("array");
    expect(updatedListing.body.listing.imageIDs).to.have.lengthOf(0);
  });
  
  it("should update image if user IS the owner", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));

    const agent = request.agent(app_.app);

    const differentTestImage = new Image({
      author: testUser._id,
      img: {
        data: Buffer.from("DEADBEEF", "base64"),
        contentType: "image/png",
      },
    });
    await differentTestImage.save();

    const update_response = await agent
      .patch(`/api/v0/listings/${testListing._id}`)
      .set("authorization", JWT)
      .send({
          imageIDs: [differentTestImage._id],
      });

    expect(update_response.status).to.equal(200);

    const updatedListing = await request(app_.app).get(
      `/api/v0/listings/${testListing._id}`
    );
    expect(updatedListing.status).to.equal(200);
    expect(updatedListing.type).to.equal("application/json");
    expect(updatedListing.body.listing.imageIDs).to.be.an("array");
    expect(updatedListing.body.listing.imageIDs).to.have.lengthOf(1);

  });
});
