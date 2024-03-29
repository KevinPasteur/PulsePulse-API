import express from "express";
import createError from "http-errors";
import logger from "morgan";
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import exercisesRouter from "./routes/exercises.js";
import workoutsRouter from "./routes/workouts.js";
import mongoose from "mongoose";
import fs from "fs";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import "dotenv/config";
import cors from "cors";

const app = express();

// CORS middleware
const corsOptions = {
  origin: "http://localhost:8100", // l'origine de votre application Angular
  optionsSuccessStatus: 200, // certains navigateurs (IE11, divers SmartTV) chokent sur 204
};

mongoose
  .connect(process.env.DATABASE_URL ?? "mongodb://localhost:27017/pulsepulse")
  .then(() => {})
  .catch((err) => {
    process.exit();
  });

if (process.env.NODE_ENV !== "test") {
  mongoose.set("debug", true);
}

app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/exercises", exercisesRouter);
app.use("/api/v1/workouts", workoutsRouter);

// Parse the OpenAPI document.
const openApiDocument = yaml.load(fs.readFileSync("./openapi.yml"));
// Serve the Swagger UI documentation.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

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
