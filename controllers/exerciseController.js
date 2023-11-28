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

const getExercises = asyncHandler(async (req, res) => {
  try {
    const data = await Exercise.find().populate("creator");
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export { getExercises, createExercise };
