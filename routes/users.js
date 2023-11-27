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

export default router;
