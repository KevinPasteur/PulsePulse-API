import express from "express";
import { broadcastMessage } from "../ws.js";

const router = express.Router();

router.post("/", function (req, res, next) {
  try {
    broadcastMessage({ hello: "world" });
    return res.status(200).send({ message: "Broadcast success" });
  } catch (err) {
    return res.status(400).send({ error: err });
  }
});

export default router;
