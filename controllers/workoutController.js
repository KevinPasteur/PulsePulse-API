import asyncHandler from "express-async-handler";
import Workout from "../models/workout.js";
import User from "../models/user.js";

const createWorkout = asyncHandler(async (req, res) => {
  const { name, description, isPublic } = req.body;

  if (!name || !isPublic) {
    return res.status(400).send({ error: "All fields are mandatory!" });
  }

  const workout = await Workout.create({
    name,
    description,
    isPublic,
    creator: req.currentUserId,
  });

  await User.findByIdAndUpdate(
    req.currentUserId,
    {
      $push: {
        workouts: workout,
      },
    },
    { new: true, useFindAndModify: false }
  );

  await workout.validate();

  if (workout) {
    const workoutFormatted = {
      _id: workout.id,
      name: workout.name,
      description: workout.description,
      isPublic: workout.isPublic,
    };

    return res.status(201).send(workoutFormatted);
  } else {
    return res.status(400).send({ error: "Workout data is not valid" });
  }
});

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

const updateWorkoutWithSpecificProperties = asyncHandler(
  async (req, res, next) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!",
      });
    }

    const id = req.params.id;

    //If not an admin do not allow modification of the creator field
    if (!req.currentUserPermissions.includes("admin") && req.body.creator) {
      return res.status(403).send({
        message: "You are not authorize to change the creator",
      });
    }

    Workout.findByIdAndUpdate(id, req.body)
      .then((data) => {
        if (!data) {
          res.status(404).send({
            message: `Workout was not found!`,
          });
        } else res.send({ message: "Workout was updated successfully." });
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error updating workout",
        });
      })
      .catch(next);
  }
);

const deleteAWorkout = asyncHandler(async (req, res) => {
  Workout.deleteOne({ _id: req.params.id })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Workout not found.`,
        });
      } else {
        res.status(200).send({ message: "Workout deleted successfully." });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });
});

const removeAnExerciseFromAWorkout = asyncHandler(async (req, res) => {});

export {
  createWorkout,
  getWorkouts,
  getPublicWorkouts,
  deleteAWorkout,
  updateWorkoutWithSpecificProperties,
};
