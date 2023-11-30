import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { jwtSecret } from "../config.js";

const signJwt = promisify(jwt.sign);

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  const userAvailable = await User.findOne({ username, email });
  if (userAvailable) {
    return res.status(400).send({ error: "User already registered!" });
  }

  //Hash password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (error) {
    return res.status(400).send({ error: "Password field required" });
  }

  const user = new User({
    username,
    password: hashedPassword,
    email,
    status: "active",
    role: role ?? "user",
  });

  try {
    await user.validate();
  } catch (err) {
    return res.status(400).send(err);
  }

  await user.save();

  if (user) {
    return res
      .status(201)
      .send({ id: user.id, username: user.username, email: user.email });
  } else {
    return res.status(400).send({ error: "User data is not valid" });
  }
});

const loginUser = asyncHandler(async (req, res, next) => {
  // Attempt to find a user with the provided name
  User.findOne({ username: req.body.username })
    .exec()
    .then((user) => {
      if (!user) return res.sendStatus(401); // user not found
      // Compare the provided password with the stored hashed password
      return bcrypt.compare(req.body.password, user.password).then((valid) => {
        if (!valid) return res.sendStatus(401); // wrong password
        // Define JWT expiration: current time + 1 week (in seconds)
        const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
        // Create the payload for the JWT including the user ID and expiration
        const payload = {
          sub: user._id.toString(),
          exp: exp,
          scope: user.role.toString(),
        };
        // Sign the JWT and send it to the client
        return signJwt(payload, jwtSecret).then((jwt) => {
          console.log(`User ${user.username} logged in`);
          res.send({
            message: `Welcome ${user.username}!`,
            token: jwt,
          });
        });
      });
    })
    .catch(next);
});

const updateUserWithSpecificProperties = asyncHandler(
  async (req, res, next) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!",
      });
    }

    const id = req.params.id;

    // Attempt to find a user with the provided id
    User.findByIdAndUpdate(id, req.body)
      .then((data) => {
        if (!data) {
          res.status(404).send({
            message: `User was not found!`,
          });
        } else res.send({ message: "User was updated successfully." });
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error updating user",
        });
      })
      .catch(next);
  }
);

const updateUserWithAllProperties = asyncHandler(async (req, res, next) => {
  // Update properties present in the request body
  if (req.body.username !== undefined) {
    req.user.username = req.body.username;
  }
  if (req.body.email !== undefined) {
    req.user.email = req.body.email;
  }
  if (req.body.password !== undefined) {
    req.user.password = req.body.password;
  }

  //If not an admin do not allow modification of the creator field
  if (req.currentUserPermissions.includes("admin")) {
    if (req.body.status !== undefined) {
      req.user.status = req.body.status;
    }
    if (req.body.role !== undefined) {
      req.user.role = req.body.role;
    }
  }

  req.user
    .save()
    .then((savedUser) => {
      debug(`Updated user "${savedUser.username}"`);
      res.send(savedUser);
    })
    .catch(next);
});

const deleteUser = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400).send({
      message: "User not provided",
    });
  }

  const id = req.params.id;

  await User.findByIdAndUpdate(id, {
    status: "disabled",
    updatedAt: new Date(),
  })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `User not found.`,
        });
      } else {
        res.status(200).send({ message: "User deleted successfully." });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });
});

const currentUser = asyncHandler(async (req, res) => {
  const userFound = await User.findById(req.currentUserId);
  if (userFound) {
    return res.send(userFound);
  }
});

const getUsers = asyncHandler(async (req, res) => {
  let users = User.find();

  if (req.query.status) {
    users = users.where("status").equals(req.query.status);
  }

  users
    .exec()
    .then((users) => res.send(users))
    .catch((err) => next(err));
});

export {
  registerUser,
  loginUser,
  currentUser,
  updateUserWithSpecificProperties,
  updateUserWithAllProperties,
  deleteUser,
  getUsers,
};
