import { Router } from "express";
import { createGame, validateGame } from "../controllers/game.controller";

const router = Router();

router.post("/create", createGame);

router.get("/validate", validateGame);

export default router;
