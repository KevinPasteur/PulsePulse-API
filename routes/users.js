import express from "express";
import User from "../models/user.js";
import * as userController from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/validateTokenHandler.js";
const router = express.Router();

router.get("/", authenticate, authorize("admin"), userController.getUsers);

router.put("/:id", authenticate, function (req, res, next) {
  User.findById(req.params.id)
    .exec()
    .then((user) => {
      if (user.id === req.currentUserId) {
        userController.updateUserWithAllProperties(req, res);
      } else
        return res
          .status(400)
          .send({ error: "You are not authorize to perform that" });
    })
    .catch(next);
});

router.patch("/:id", authenticate, function (req, res, next) {
  User.findById(req.params.id)
    .exec()
    .then((user) => {
      if (user.id === req.currentUserId) {
        userController.updateUserWithSpecificProperties(req, res);
      } else
        return res
          .status(400)
          .send({ error: "You are not authorize to perform that" });
    })
    .catch(next);
});

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  function (req, res, next) {
    User.findById(req.params.id)
      .exec()
      .then((user) => {
        if (user.id !== req.currentUserId) {
          userController.deleteUser(req, res);
        } else
          return res.status(400).send({ error: "You cannot delete yourself" });
      })
      .catch(next);
  }
);

export default router;
