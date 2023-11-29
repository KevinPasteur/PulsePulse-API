import jwt from "jsonwebtoken";
import { promisify } from "util";
import { jwtSecret } from "../config.js";
import User from "../models/user.js";

const signJwt = promisify(jwt.sign);

export const cleanUpDatabase = async function () {
  await Promise.all([User.deleteMany()]);
};

export function generateValidJwt(user) {
  // Generate a valid JWT which expires in 7 days.
  const exp = (new Date().getTime() + 7 * 24 * 3600 * 1000) / 1000;
  const claims = { sub: user._id.toString(), exp: exp };
  return signJwt(claims, jwtSecret);
}

export function generateValidAdminJwt(user) {
  // Generate a valid Admin JWT which expires in 7 days.
  const exp = (new Date().getTime() + 7 * 24 * 3600 * 1000) / 1000;
  const claims = { sub: user._id.toString(), exp: exp, scope: "admin" };
  return signJwt(claims, jwtSecret);
}
