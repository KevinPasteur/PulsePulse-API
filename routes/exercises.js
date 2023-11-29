import express from "express";
import Exercise from "../models/exercise.js";
import { authenticate, authorize } from "../middleware/validateTokenHandler.js";
import {
  getExercises,
  createExercise,
  updateExercise,
} from "../controllers/exerciseController.js";

const router = express.Router();

router.get("/", authenticate, getExercises);
router.post("/", authenticate, createExercise);
router.put("/:id", authenticate, function (req, res, next) {
  Exercise.findById(req.params.id)
    .exec()
    .then((exercise) => {
      // The user is authorized to edit the thing only if he or she is
      // the owner of the thing, or if he or she is an administrator.
      const authorized =
        req.currentUserPermissions.includes("admin") ||
        req.currentUserId === exercise.creator._id.toString();

      if (!authorized) {
        return res
          .status(403)
          .send({ error: "You are not authorize to perform that" });
      }

      updateExercise(req, res);
    })
    .catch(next);
});

export default router;
