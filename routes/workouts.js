import express from "express";
import { broadcastMessage } from "../ws.js";
import {
  getWorkouts,
  getPublicWorkouts,
  createWorkout,
  deleteAWorkout,
} from "../controllers/workoutController.js";
import { authenticate } from "../middleware/validateTokenHandler.js";
import Workout from "../models/workout.js";

const router = express.Router();

router.get("/", authenticate, function (req, res, next) {
  const authorized = req.currentUserPermissions.includes("admin");

  if (req.query.isPublic) {
    getPublicWorkouts(req, res);
  } else if (authorized) {
    getWorkouts(req, res);
  } else {
    res.status(403).send({
      message: "Unauthorized",
    });
  }
});

router.post("/", authenticate, createWorkout);

router.patch("/:id", authenticate, function (req, res, next) {});

router.delete("/:id", authenticate, function (req, res, next) {
  Workout.findById(req.params.id)
    .exec()
    .then((workout) => {
      // The user is authorized to edit the thing only if he or she is
      // the owner of the thing, or if he or she is an administrator.
      const authorized =
        req.currentUserPermissions.includes("admin") ||
        req.currentUserId === workout.creator._id.toString();

      if (!authorized) {
        return res
          .status(403)
          .send({ error: "You are not authorize to perform that" });
      }

      if (!workout) {
        return res.status(400).send({
          message: "This workout doesn't exist",
        });
      }

      deleteAWorkout(req, res);
    })
    .catch((error) => {
      res.status(400).send({
        message: error.message,
      });
    });
});

export default router;
