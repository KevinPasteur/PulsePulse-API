import express from "express";
import { broadcastMessage } from "../ws.js";
import {
  getWorkouts,
  getPublicWorkouts,
} from "../controllers/workoutController.js";
import { authenticate } from "../middleware/validateTokenHandler.js";

const router = express.Router();

router.get("/", authenticate, function (req, res, next) {
  const authorized = req.currentUserPermissions.includes("admin");

  if (req.query.isPublic) {
    getPublicWorkouts(req, res);
  } else if (authorized) {
    getWorkouts(req, res);
  } else {
    res.status(403).send({
      message: "Unauthorized",
    });
  }
});

router.post("/", function (req, res, next) {
  try {
    broadcastMessage({ hello: "world" });
    return res.status(200).send({ message: "Broadcast success" });
  } catch (err) {
    return res.status(400).send({ error: err });
  }
});

export default router;
