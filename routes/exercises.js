import express from "express";
import Exercise from "../models/exercise.js";
import { authenticate } from "../middleware/validateTokenHandler.js";
import {
  getExercises,
  createExercise,
  updateExerciseWithSpecificProperties,
  deleteAnExercise,
  overwriteExercise,
} from "../controllers/exerciseController.js";
import upload from "../utils/upload.helper.js";

const router = express.Router();

router.get("/", authenticate, getExercises);
router.get("/:id", authenticate, function (req, res, next) {
  Exercise.findById(req.params.id)
    .exec()
    .then((exercise) => {
      if (!exercise) {
        return res.status(400).send({
          message: "This exercise doesn't exist",
        });
      }
      res.send(exercise);
    })
    .catch(next);
});

router.post(
  "/",
  authenticate,
  upload.fields([{ name: "audio" }, { name: "video" }]),
  createExercise
);
router.put("/:id", authenticate, function (req, res, next) {
  Exercise.findById(req.params.id)
    .exec()
    .then((exercise) => {
      const authorized =
        req.currentUserPermissions.includes("admin") ||
        req.currentUserId === exercise.creator._id.toString();

      if (!authorized) {
        return res
          .status(403)
          .send({ message: "You are not authorize to perform that" });
      }
      overwriteExercise(req, res);
    })
    .catch((error) => {
      res.status(400).send({
        message: "This exercise doesn't exist",
      });
    });
});
router.patch("/:id", authenticate, function (req, res, next) {
  Exercise.findById(req.params.id)
    .exec()
    .then((exercise) => {
      const authorized =
        req.currentUserPermissions.includes("admin") ||
        req.currentUserId === exercise.creator._id.toString();

      if (!authorized) {
        return res
          .status(403)
          .send({ message: "You are not authorize to perform that" });
      }
      updateExerciseWithSpecificProperties(req, res);
    })
    .catch((error) => {
      res.status(400).send({
        message: "This exercise doesn't exist",
      });
    });
});

router.delete("/:id", authenticate, function (req, res, next) {
  Exercise.findById(req.params.id)
    .exec()
    .then((exercise) => {
      const authorized =
        req.currentUserPermissions.includes("admin") ||
        req.currentUserId === exercise.creator._id.toString();

      if (!authorized) {
        return res
          .status(403)
          .send({ message: "You are not authorize to perform that" });
      }

      if (!exercise) {
        return res.status(400).send({
          message: "This exercise doesn't exist",
        });
      }

      deleteAnExercise(req, res);
    })
    .catch((error) => {
      res.status(400).send({
        message: error.message,
      });
    });
});

export default router;
