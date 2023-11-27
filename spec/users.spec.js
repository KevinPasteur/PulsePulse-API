import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app.js";
import { cleanUpDatabase, generateValidJwt } from "./utils.js";
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
    expect(res.body._id).toBeString();
    expect(res.body.username).toEqual("JohnDoe");
    expect(res.body.email).toEqual("JohnDoe@example.com");
    expect(res.body).toContainAllKeys(["_id", "username", "email"]);
  });
});

describe("PUT /api/v1/users/:id", function () {
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

  it("should update an user", async function () {
    const token = await generateValidJwt(johnDoe);
    await supertest(app)
      .put("/api/v1/users/" + johnDoe.id)
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
