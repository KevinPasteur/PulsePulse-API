import express from "express";
import User from "../models/user.js";
import {
  registerUser,
  loginUser,
  currentUser,
} from "../controllers/userController.js";
import authenticate from "../middleware/validateTokenHandler.js";
const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Got a response from the users route");
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/test", authenticate, currentUser);

router.get("/test", function (req, res, next) {
  User.find()
    .sort("name")
    .exec()
    .then((users) => {
      console.log(users);
      res.send(users);
    })
    .catch(next);
});

export default router;
