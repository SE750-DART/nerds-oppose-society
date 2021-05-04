import { Router } from "express";
import { createGame, validateGame } from "../controllers/game.controller";

const router = Router();

router.post("/create", createGame);

router.get("/validate", validateGame);

router.get("/ping", async (req, res) => res.sendStatus(200));

export default router;
