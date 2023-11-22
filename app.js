import express from "express";
import createError from "http-errors";
import logger from "morgan";
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import exercisesRouter from "./routes/exercises.js";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();

mongoose
  .connect(process.env.DATABASE_URL ?? "mongodb://localhost:27017/pulsepulse")
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

if (process.env.NODE_ENV !== "test") {
  mongoose.set("debug", true);
}

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/exercises", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error status
  res.status(err.status || 500);
  res.send(err.message);
});

export default app;
