import express from "express";
import Exercise from "../models/exercise.js";
import { authenticate } from "../middleware/validateTokenHandler.js";
import {
  getExercises,
  createExercise,
} from "../controllers/exerciseController.js";

const router = express.Router();

router.get("/", authenticate, getExercises);
router.post("/", authenticate, createExercise);

export default router;
