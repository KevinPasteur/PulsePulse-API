import express from "express";
import Exercise from "../models/exercise.js";
import { authenticate} from "../middleware/validateTokenHandler.js";
import {
    getExercises,
  } from "../controllers/exerciseController.js";

const router = express.Router();
router.get("/", authenticate, getExercises);
export default router;
