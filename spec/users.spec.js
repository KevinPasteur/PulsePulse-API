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
    expect(res.body.name).toEqual("John Doe");
    expect(res.body).toContainAllKeys(["_id", "name"]);
  });
});
