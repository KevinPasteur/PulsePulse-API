import express from "express";
const router = express.Router();

router.get("/", function (req, res, next) {
  res.send(
    "Bienvenue sur l'API de PulsePulse. Pour plus d'informations, rendez-vous sur : https://github.com/KevinPasteur/PulsePulse-API"
  );
});

export default router;
