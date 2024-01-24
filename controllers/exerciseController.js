import asyncHandler from "express-async-handler";
import Exercise from "../models/exercise.js";
import User from "../models/user.js";
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";

import { broadcastMessage } from "../ws.js";

const createExercise = asyncHandler(async (req, res) => {
  console.log(JSON.parse(req.body.data));
  console.log("controller");

  console.log("controller2");

  const {
    name,
    description,
    duration,
    repetitions,
    sets,
    level,
    bodyPart,
    commentLink,
  } = JSON.parse(req.body.data);

  const exercise = new Exercise({
    name,
    description,
    duration,
    repetitions,
    sets,
    level,
    bodyPart,
    commentLink,
    creator: req.currentUserId,
    status: "active",
  });

  if (req.file && req.file.location) {
    exerciseData.videoLink = req.file.location; // Ajoutez videoLink uniquement si req.file existe
  }

  console.log(exercise);

  try {
    await exercise.validate();
  } catch (err) {
    return res.status(400).send(err.message);
  }

  await exercise.save();

  await User.findByIdAndUpdate(
    req.currentUserId,
    {
      $push: {
        exercises: exercise,
      },
    },
    { new: true, useFindAndModify: false }
  );

  if (exercise) {
    const exerciseFormatted = {
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      duration: exercise.duration,
      repetitions: exercise.repetitions,
      sets: exercise.sets,
      level: exercise.level,
      bodyPart: exercise.bodyPart,
      videoLink: exercise.videoLink,
      commentLink: exercise.commentLink,
      status: exercise.status,
    };

    try {
      broadcastMessage(
        exerciseFormatted,
        "create",
        "exercise",
        "New exercise created"
      );
    } catch (err) {
      return res.status(400).send({ message: err });
    }

    return res.status(201).send(exerciseFormatted);
  } else {
    return res.status(400).send({ message: "Exercise data is not valid" });
  }
});

const getExercises = asyncHandler(async (req, res, next) => {
  let page;
  let pageSize;
  Exercise.find()
    .countDocuments()
    .then((total) => {
      let query = Exercise.find();

      // Parse the "page" param (default to 1 if invalid)
      page = parseInt(req.query.page, 10);
      if (isNaN(page) || page < 1) {
        page = 1;
      }

      // Parse the "pageSize" param (default to 100 if invalid)
      pageSize = parseInt(req.query.pageSize, 10);
      if (isNaN(pageSize) || pageSize < 0 || pageSize > 100) {
        pageSize = 100;
      }

      // Apply skip and limit to select the correct page of elements
      query = query.skip((page - 1) * pageSize).limit(pageSize);

      return query.exec().then((exercises) => {
        return { total, exercises };
      });
    })
    .then(({ total, exercises }) => {
      res.send({
        page: page,
        pageSize: pageSize,
        total: total,
        data: exercises,
      });
    })
    .catch((err) => {
      next(err);
    });
});

const updateExerciseWithSpecificProperties = asyncHandler(
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

    Exercise.findByIdAndUpdate(id, req.body)
      .then((data) => {
        if (!data) {
          res.status(404).send({
            message: `Exercise was not found!`,
          });
        } else res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error updating exercise",
        });
      })
      .catch(next);
  }
);

const deleteAnExercise = asyncHandler(async (req, res, next) => {
  if (!req.params.id) {
    res.status(400).send({
      message: "Exercise not provided",
    });
  }

  const id = req.params.id;

  await Exercise.findByIdAndUpdate(id, {
    status: "disabled",
    updatedAt: new Date(),
  })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Exercise not found.`,
        });
      } else {
        res.status(200).send({ message: "Exercise deleted successfully." });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });
});

export {
  getExercises,
  createExercise,
  updateExerciseWithSpecificProperties,
  deleteAnExercise,
};
