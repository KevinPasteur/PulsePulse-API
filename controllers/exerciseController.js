import asyncHandler from "express-async-handler";
import Exercise from "../models/exercise.js";

const createExercise = asyncHandler(async (req, res) => {});

const getExercises = asyncHandler(async (req, res) => {
    try {
      const data = await Exercise.find().populate("creator");
      console.log(data);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  export { getExercises };