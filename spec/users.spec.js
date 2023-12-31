import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app.js";
import {
  cleanUpDatabase,
  generateValidJwt,
  generateValidAdminJwt,
} from "./utils.js";
import "dotenv/config";
import bcrypt from "bcrypt";

import User from "../models/user.js";

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(cleanUpDatabase);

describe("POST /api/v1/users", function () {
  it("should create a user", async function () {
    const hashedPassword = await bcrypt.hash("1234", 10);
    const res = await supertest(app)
      .post("/api/v1/users/register")
      .send({
        username: "JohnDoe",
        email: "JohnDoe@example.com",
        password: hashedPassword,
      })
      .expect(201)
      .expect("Content-Type", /json/);

    expect(res.body).toBeObject();
    expect(res.body.id).toBeString();
    expect(res.body.username).toEqual("JohnDoe");
    expect(res.body.email).toEqual("JohnDoe@example.com");
    expect(res.body).toContainAllKeys(["id", "username", "email"]);
  });
});

describe("PATCH /api/v1/users/:id", function () {
  let johnDoe;

  beforeEach(async function () {
    const hashedPassword = await bcrypt.hash("1234", 10);
    // Create 1 user before update informations.
    [johnDoe] = await Promise.all([
      User.create({
        username: "johnDoe",
        email: "johnDoe@example.com",
        password: hashedPassword,
        role: "user",
      }),
    ]);
  });

  it("should update the email of an user", async function () {
    const token = await generateValidJwt(johnDoe);
    await supertest(app)
      .patch("/api/v1/users/" + johnDoe.id)
      .auth(token, { type: "bearer" })
      .send({
        email: "JohnDoee@example.com",
      })
      .expect(200)
      .expect("Content-Type", /json/);

    const user = await User.findOne({ username: johnDoe.username });
    expect(user.email).toEqual("JohnDoee@example.com");
  });
});

describe("DELETE /api/v1/users/:id", function () {
  let johnDoe;
  let janeDoe;

  beforeEach(async function () {
    const hashedPassword = await bcrypt.hash("1234", 10);
    // Create 2 users before delete Jane.
    [johnDoe, janeDoe] = await Promise.all([
      User.create({
        username: "johnDoe",
        email: "JohnDoe@example.com",
        password: hashedPassword,
        role: "admin",
      }),
      User.create({
        username: "janeDoe",
        email: "janeDoe@example.com",
        password: hashedPassword,
        role: "user",
      }),
    ]);
  });

  it("should remove an user", async function () {
    const token = await generateValidAdminJwt(johnDoe);
    await supertest(app)
      .delete("/api/v1/users/" + janeDoe.id)
      .auth(token, { type: "bearer" })
      .expect(200)
      .expect("Content-Type", /json/);

    const user = await User.findOne({ username: janeDoe.username });
    expect(user.status).toEqual("disabled");
  });
});

describe("GET /api/v1/users", function () {
  let johnDoe;
  let janeDoe;

  beforeEach(async function () {
    const hashedPassword = await bcrypt.hash("1234", 10);
    // Create 2 users before list them.
    [johnDoe, janeDoe] = await Promise.all([
      User.create({
        username: "johnDoe",
        email: "JohnDoe@example.com",
        password: hashedPassword,
        status: "active",
        role: "admin",
      }),
      User.create({
        username: "janeDoe",
        email: "janeDoe@example.com",
        password: hashedPassword,
        status: "active",
        role: "user",
      }),
    ]);
  });

  it("should retrieve the list of users", async function () {
    const token = await generateValidAdminJwt(johnDoe);
    const res = await supertest(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toBeArray();
    expect(res.body).toHaveLength(2);

    expect(res.body[0]).toBeObject();
    expect(res.body[0].id).toEqual(johnDoe.id);
    expect(res.body[0].username).toEqual("johnDoe");
    expect(res.body[0]).toContainAllKeys([
      "id",
      "username",
      "email",
      "role",
      "status",
      "createdAt",
      "updatedAt",
      "exercises",
      "workouts",
    ]);

    expect(res.body[1]).toBeObject();
    expect(res.body[1].id).toEqual(janeDoe.id);
    expect(res.body[1].username).toEqual("janeDoe");
    expect(res.body[1]).toContainAllKeys([
      "id",
      "username",
      "email",
      "role",
      "status",
      "createdAt",
      "updatedAt",
      "exercises",
      "workouts",
    ]);
  });
});
