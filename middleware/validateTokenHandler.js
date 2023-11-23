import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config.js";

const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, jwtSecret, (err, payload) => {
      if (err) {
        return res.status(401).send({ error: "User is not authorized" });
      }
      req.currentUserId = payload.sub;
      next();
    });

    if (!token) {
      return res
        .status(401)
        .send({ error: "User is not authorized or token is missing" });
    }
  } else {
    return res.status(401).send({ error: "Token is missing" });
  }
});

export default authenticate;
