import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { jwtSecret } from "../config.js";
import exercise from "../models/exercise.js";

const signJwt = promisify(jwt.sign);

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const userAvailable = await User.findOne({ username, email });
  if (userAvailable) {
    return res.status(400).send({ message: "User already registered!" });
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (error) {
    return res.status(400).send({ message: "Password field required" });
  }

  const user = new User({
    username,
    password: hashedPassword,
    email,
    status: "active",
    role: "user",
  });

  try {
    await user.validate();
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }

  await user.save();

  if (user) {
    return res
      .status(201)
      .send({ id: user.id, username: user.username, email: user.email });
  } else {
    return res.status(400).send({ message: "User data is not valid" });
  }
});

const loginUser = asyncHandler(async (req, res, next) => {
  // Attempt to find a user with the provided name
  User.findOne({ username: req.body.username })
    .exec()
    .then((user) => {
      if (!user) return res.status(401).send({ message: "User not found" }); // user not found
      // Compare the provided password with the stored hashed password
      return bcrypt.compare(req.body.password, user.password).then((valid) => {
        if (!valid) return res.status(401).send({ message: "Wrong password" }); // wrong password
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
          res.send({
            user: user,
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

    // Prevent modification of role if not an admin
    if (!req.currentUserPermissions.includes("admin")) {
      if (req.body.role) {
        return res.status(403).send({
          message: "You are not authorized to change role",
        });
      }
    }

    // Attempt to find a user with the provided id
    User.findByIdAndUpdate(id, req.body)
      .then((data) => {
        if (!data) {
          res.status(404).send({
            message: `User was not found!`,
          });
        } else res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error updating user",
        });
      })
      .catch(next);
  }
);

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

const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).exec();
  if (!user) {
    return res.status(400).send({
      message: "User not found",
    });
  }
  res.send(user);
});

const getExercisesFromAUser = asyncHandler(async (req, res, next) => {
  const userWithExercises = await User.findById(req.params.id)
    .populate("exercises")
    .exec();

  res.send({
    exercises: userWithExercises.exercises,
  });
});

const getWorkoutsFromAUser = asyncHandler(async (req, res, next) => {
  const userWithWorkouts = await User.findById(req.params.id)
    .populate("workouts")
    .exec();

  res.send({
    workouts: userWithWorkouts.workouts,
  });
});

export {
  registerUser,
  loginUser,
  currentUser,
  updateUserWithSpecificProperties,
  deleteUser,
  getUsers,
  getUser,
  getExercisesFromAUser,
  getWorkoutsFromAUser,
};
