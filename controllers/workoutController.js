import asyncHandler from "express-async-handler";
import Workout from "../models/workout.js";
import User from "../models/user.js";
import { broadcastMessage } from "../ws.js";

const createWorkout = asyncHandler(async (req, res) => {
  const { name, description, isPublic } = req.body;

  const workout = new Workout({
    name,
    description,
    isPublic,
    creator: req.currentUserId,
  });

  try {
    await workout.validate();
  } catch (err) {
    return res.status(400).send(err);
  }

  await workout.save();

  await User.findByIdAndUpdate(
    req.currentUserId,
    {
      $push: {
        workouts: workout,
      },
    },
    { new: true, useFindAndModify: false }
  );

  if (workout) {
    const workoutFormatted = {
      id: workout.id,
      name: workout.name,
      description: workout.description,
      isPublic: workout.isPublic,
    };

    if (workout.isPublic) {
      try {
        broadcastMessage(
          workoutFormatted,
          "create",
          "workout",
          "New public workout created"
        );
      } catch (err) {
        return res.status(400).send({ message: err });
      }
    }

    return res.status(201).send(workoutFormatted);
  } else {
    return res.status(400).send({ message: "Workout data is not valid" });
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
        } else res.send(data);
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

export {
  createWorkout,
  getWorkouts,
  getPublicWorkouts,
  deleteAWorkout,
  updateWorkoutWithSpecificProperties,
};
