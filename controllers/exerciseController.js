import asyncHandler from "express-async-handler";
import Exercise from "../models/exercise.js";
import User from "../models/user.js";

const createExercise = asyncHandler(async (req, res) => {
  const { name, duration, repetitions, level, bodyPart } = req.body;
  if (!name || !duration || !repetitions || !level || !bodyPart) {
    return res.status(400).send({ error: "All fields are mandatory!" });
  }

  const exercise = await Exercise.create({
    name,
    duration,
    repetitions,
    level,
    bodyPart,
    creator: req.currentUserId,
  });

  await User.findByIdAndUpdate(
    req.currentUserId,
    {
      $push: {
        exercises: exercise,
      },
    },
    { new: true, useFindAndModify: false }
  );

  await exercise.validate();

  if (exercise) {
    return res.status(201).send({
      _id: exercise.id,
      name: exercise.name,
      duration: exercise.duration,
      repetitions: exercise.repetitions,
      level: exercise.level,
      bodyPart: exercise.bodyPart,
    });
  } else {
    return res.status(400).send({ error: "Exercise data is not valid" });
  }
});

const getExercises = asyncHandler(async (req, res, next) => {
  let page;
  let pageSize;
  Exercise.find()
    .countDocuments()
    .then((total) => {
      let query = Exercise.find().populate("creator");

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

const updateExercise = asyncHandler(async (req, res, next) => {
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
      } else res.send({ message: "Exercise was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating exercise",
      });
    })
    .catch(next);
});

export { getExercises, createExercise, updateExercise };
