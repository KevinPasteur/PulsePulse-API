import express from "express";
import User from "../models/user.js";
import {
  registerUser,
  loginUser,
  currentUser,
  updateUser,
} from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/validateTokenHandler.js";
const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Got a response from the users route");
});

router.put("/:id", authenticate, function (req, res, next) {
  User.findById(req.params.id)
    .exec()
    .then((user) => {
      if (user.id === req.currentUserId || authorize("admin")) {
        updateUser(req, res);
      } else
        return res
          .status(400)
          .send({ error: "You are not authorize to perform that" });
    })
    .catch(next);
});

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
