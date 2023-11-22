import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app.js";
import { cleanUpDatabase, generateValidJwt } from "./utils.js";
import "dotenv/config";

import User from "../models/user.js";

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(cleanUpDatabase);

describe("POST /api/v1/users", function () {
  it("should create a user", async function () {
    const res = await supertest(app)
      .post("/api/v1/users/register")
      .send({
        name: "John Doe",
        password: "1234",
      })
      .expect(201)
      .expect("Content-Type", /json/);

    expect(res.body).toBeObject();
    expect(res.body._id).toBeString();
    expect(res.body.name).toEqual("John Doe");
    expect(res.body).toContainAllKeys(["_id", "name"]);
  });
});
