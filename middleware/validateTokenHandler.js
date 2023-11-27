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

function authorize(requiredPermission) {
  // Create an return an authorization middleware. The required permission
  // will be available in the returned function because it is a closure.
  return function authorizationMiddleware(req, res, next) {
    if (!req.currentUserPermissions) {
      // The user is not authenticated or has no permissions.
      return res.sendStatus(403);
    }
    const authorized = req.currentUserPermissions.includes(requiredPermission);
    if (!authorized) {
      // The user is authenticated but does not have the required permission.
      return res.sendStatus(403);
    }
    // The user is authorized.
    next();
  };
}

export { authenticate, authorize };
