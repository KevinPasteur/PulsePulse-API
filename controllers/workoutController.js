import asyncHandler from "express-async-handler";
import Workout from "../models/workout.js";

const createWorkout = asyncHandler(async (req, res) => {});

const getWorkouts = asyncHandler(async (req, res) => {
  Workout.aggregate([
    {
      $project: {
        name: 1,
        description: 1,
        creator: 1,
        exercises: 1,
        isPublic: 1,
        totalExercises: {
          $cond: {
            if: { $isArray: "$exercises" },
            then: { $size: "$exercises" },
            else: "NA",
          },
        },
      },
    },
  ])
    .then((results) => {
      res.send(results);
    })
    .catch(() => {
      res.status(400).send({
        message: "Workout not found",
      });
    });
});

const getPublicWorkouts = asyncHandler(async (req, res) => {
  Workout.aggregate([
    {
      $match: { isPublic: true },
    },

    {
      $project: {
        name: 1,
        description: 1,
        creator: 1,
        exercises: 1,
        totalExercises: {
          $cond: {
            if: { $isArray: "$exercises" },
            then: { $size: "$exercises" },
            else: "NA",
          },
        },
      },
    },
  ])
    .then((results) => {
      res.send(results);
    })
    .catch(() => {
      res.status(400).send({
        message: "Workout not found",
      });
    });
});

export { createWorkout, getWorkouts, getPublicWorkouts };
