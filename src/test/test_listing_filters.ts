import { expect } from "chai";
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({
  path: resolve(__dirname, "../../.env.development"),
});

import request from "supertest";

import App from "../app";
import User, { IUser } from "@/models/users.model";
import Profile, { IProfile } from "@/models/profile.model";
import Listing, { IListing } from "@/models/listing.model";
import Image from "@/models/image.model";
import { HydratedDocument, Types } from "mongoose";

function testIDeql(id1: Types.ObjectId) {
  return (id2: Types.ObjectId | string) => {
    return id1.equals(id2);
  };
}

async function beforeEachSuite() {
  await User.deleteMany({});
  await Profile.deleteMany({});
  await Listing.deleteMany({});
  await Image.deleteMany({});
}

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
  return await Profile.create({
    user: user_id,
    avatarImage: null,
    bio: "testbio",
    displayName: "test",
  });
}

async function loginTestUser(request: request.SuperTest<request.Test>) {
  const response = await request.post("/api/v0/auth/login").send({
    email: "test@example.com", // email is the email
    password: "test",
  });

  return response.headers["authorization"];
}

async function createTestListingWithBody(
  user_id: Types.ObjectId,
  listing: any
): Promise<HydratedDocument<IListing>> {
  const testProfile = await Profile.findOne({ user: user_id });
  expect(testProfile).to.not.be.null;
  const testListing = await Listing.create({
    ...listing,
    poster: testProfile!._id,
  });

  return testListing;
}

describe("test listing filters", async function () {
  this.timeout(1000);
  let app_: App;
  let testListing0: HydratedDocument<IListing>;
  let testListing1: HydratedDocument<IListing>;
  let testListing2: HydratedDocument<IListing>;
  let testUser: HydratedDocument<IUser>;

  beforeEach(async function () {
    await beforeEachSuite();
    app_ = new App();
    testUser = await createTestUser();
    await createTestProfile(testUser._id);
    testListing0 = await createTestListingWithBody(testUser._id, {
      title: "test0",
      description: "listingTest",
      location: {
        coords: [0, 1], // around 111km away
        name: "test",
      },
      type: "LOST",
      bounty: 10,
      tags: ["test"],
      createdAt: new Date("2022-05-01"),
    });
    testListing1 = await createTestListingWithBody(testUser._id, {
      title: "test1",
      description: "test_keyword",
      bounty: 10,
      location: {
        coords: [0, 0],
        name: "test",
      },
      type: "FOUND",
      createdAt: new Date("2021-05-01"),
      tags: ["test"],
    });
    testListing2 = await createTestListingWithBody(testUser._id, {
      title: "test2",
      description: "listingTest",
      location: {
        coords: [180, 0], // wayyyy far away
        name: "test",
      },
      type: "LOST",
      createdAt: new Date("2021-01-01"),
      bounty: 20,
      tags: ["differentTag"],
    });
  });

  it("should return a 200 and search with a keyword", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));
    const newSearchParams = new URLSearchParams({
      search: "test_keyword",
    });
    const response = await request(app_.app)
      .get(`/api/v0/listings?${newSearchParams.toString()}`)
      .set("authorization", JWT)
      .send();

    expect(response.status).to.equal(200);
    expect(response.type).to.equal("application/json");
    expect(response.body.listings).to.be.an("array");
    expect(response.body.listings).to.have.length(1);
    expect(response.body.listings[0]._id).to.satisfy(
      testIDeql(testListing1._id)
    );
  });

  it("should return a 200 and filter with a type", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));
    const newSearchParams = new URLSearchParams({
      type: "FOUND",
    });
    const response = await request(app_.app)
      .get(`/api/v0/listings?${newSearchParams.toString()}`)
      .set("authorization", JWT)
      .send();

    expect(response.status).to.equal(200);
    expect(response.type).to.equal("application/json");
    expect(response.body.listings).to.be.an("array");
    expect(response.body.listings).to.have.length(1);
    expect(response.body.listings[0]._id).to.satisfy(
      testIDeql(testListing1._id)
    );
  });

  it("should return a 200 and filter by less than a certain date", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));
    const newSearchParams = new URLSearchParams({
      datelt: new Date("2021-01-02").getTime().toString(),
    });
    const response = await request(app_.app)
      .get(`/api/v0/listings?${newSearchParams.toString()}`)
      .set("authorization", JWT)
      .send();

    expect(response.status).to.equal(200);
    expect(response.type).to.equal("application/json");
    expect(response.body.listings).to.be.an("array");
    expect(response.body.listings).to.have.length(1);
    expect(response.body.listings[0]._id).to.satisfy(
      testIDeql(testListing2._id)
    );
  });
  it("should return a 200 and filter by greater than a certain date", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));
    const newSearchParams = new URLSearchParams({
      dategt: new Date("2021-01-02").getTime().toString(),
    });
    const response = await request(app_.app)
      .get(`/api/v0/listings?${newSearchParams.toString()}`)
      .set("authorization", JWT)
      .send();

    expect(response.status).to.equal(200);
    expect(response.type).to.equal("application/json");
    expect(response.body.listings).to.be.an("array");
    expect(response.body.listings).to.have.length(2);
    expect(response.body.listings[0]._id).to.satisfy(
      testIDeql(testListing0._id)
    );
  });
  it("should return a 200 and filter by bounty less than a certain amount", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));
    const newSearchParams = new URLSearchParams({
      bountylt: "15",
    });
    const response = await request(app_.app)
      .get(`/api/v0/listings?${newSearchParams.toString()}`)
      .set("authorization", JWT)
      .send();

    expect(response.status).to.equal(200);
    expect(response.type).to.equal("application/json");
    expect(response.body.listings).to.be.an("array");
    expect(response.body.listings).to.have.length(2);
    expect(response.body.listings[0]._id).to.satisfy(
      testIDeql(testListing0._id)
    );
  });

  it("should return a 200 and filter by bounty greater than a certain amount", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));
    const newSearchParams = new URLSearchParams({
      bountygt: "15",
    });
    const response = await request(app_.app)
      .get(`/api/v0/listings?${newSearchParams.toString()}`)
      .set("authorization", JWT)
      .send();

    expect(response.status).to.equal(200);
    expect(response.type).to.equal("application/json");
    expect(response.body.listings).to.be.an("array");
    expect(response.body.listings).to.have.length(1);
    expect(response.body.listings[0]._id).to.satisfy(
      testIDeql(testListing2._id)
    );
  });

  it("should return a 200 and filter by multiple parameters", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));
    const newSearchParams = new URLSearchParams({
      search: "test",
      type: "LOST",
      datelt: new Date("2021-01-02").getTime().toString(),
      bountygt: "15",
    });
    const response = await request(app_.app)
      .get(`/api/v0/listings?${newSearchParams.toString()}`)
      .set("authorization", JWT)
      .send();

    expect(response.status).to.equal(200);
    expect(response.type).to.equal("application/json");
    expect(response.body.listings).to.be.an("array");
    expect(response.body.listings).to.have.length(1);
    expect(response.body.listings[0]._id).to.satisfy(
      testIDeql(testListing2._id)
    );
  });

  it("should return a 200 and filter by tags", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));
    const newSearchParams = new URLSearchParams({
      tags: "test",
    });
    const response = await request(app_.app)
      .get(`/api/v0/listings?${newSearchParams.toString()}`)
      .set("authorization", JWT)
      .send();

    expect(response.status).to.equal(200);
    expect(response.type).to.equal("application/json");
    expect(response.body.listings).to.be.an("array");
    expect(response.body.listings).to.have.length(2);
    expect(response.body.listings[0]._id).to.satisfy(
      testIDeql(testListing0._id)
    );
  });

  it("should return a 200 and filter by radius from coords", async function () {
    const JWT = await loginTestUser(request.agent(app_.app));
    const newSearchParams = new URLSearchParams({
      latitude: "0",
      longitude: "0",
      radius: (150 * 1000).toString(), // 150 km
    });

    const response = await request(app_.app)
      .get(`/api/v0/listings?${newSearchParams.toString()}`)
      .set("authorization", JWT)
      .send();

    expect(response.status).to.equal(200);
    expect(response.type).to.equal("application/json");
    expect(response.body.listings).to.be.an("array");
    expect(response.body.listings).to.have.length(2);
    expect(response.body.listings[0]._id).to.satisfy(
      testIDeql(testListing1._id)
    ); // closest to 0,0
  });
});
