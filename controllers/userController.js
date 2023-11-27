import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { jwtSecret } from "../config.js";

const signJwt = promisify(jwt.sign);

//@desc Register a user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !password || !email) {
    return res.status(400).send({ error: "All fields are mandatory!" });
  }
  const userAvailable = await User.findOne({ username, email });
  if (userAvailable) {
    return res.status(400).send({ error: "User already registered!" });
  }

  //Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashedPassword,
    email,
    status: "normal",
    role: role ?? "user",
  });

  if (user) {
    return res
      .status(201)
      .send({ _id: user.id, username: user.username, email: user.email });
  } else {
    return res.status(400).send({ error: "User data is not valid" });
  }
});

const loginUser = asyncHandler(async (req, res, next) => {
  // Attempt to find a user with the provided name
  User.findOne({ name: req.body.name })
    .exec()
    .then((user) => {
      if (!user) return res.sendStatus(401); // user not found
      // Compare the provided password with the stored hashed password
      return bcrypt.compare(req.body.password, user.password).then((valid) => {
        if (!valid) return res.sendStatus(401); // wrong password
        // Define JWT expiration: current time + 1 week (in seconds)
        const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
        // Create the payload for the JWT including the user ID and expiration
        const payload = { sub: user._id.toString(), exp: exp };
        // Sign the JWT and send it to the client
        return signJwt(payload, jwtSecret).then((jwt) => {
          console.log(`User ${user.name} logged in`);
          res.send({
            message: `Welcome ${user.name}!`,
            token: jwt,
          });
        });
      });
    })
    .catch(next);
});

const updateUser = asyncHandler(async (req, res, next) => {
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
});

//@desc Delete user
//@route DELETE /api/users/:id
//@access private
const deleteUser = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400).send({
      message: "User not provided",
    });
  }

  const id = req.params.id;

  await User.findByIdAndUpdate(id, { status: "deleted", updatedAt: new Date() })
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

//@desc Current user info
//@route POST /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  const userFound = await User.findById(req.currentUserId);
  if (userFound) {
    return res.send(userFound);
  }
});

export { registerUser, loginUser, currentUser, updateUser, deleteUser };
