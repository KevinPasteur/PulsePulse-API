import express from "express";
import User from "../models/user.js";
const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Got a response from the users route");
});

router.get("/test", function (req, res, next) {
  User.find()
    .sort("name")
    .exec()
    .then((users) => {
      console.log(users);
      res.send(users);
    })
    .catch(next);
});

export default router;
