import { Router } from "express";
import { createPlayer } from "../controllers/player.controller";

const router = Router();

router.post("/create", createPlayer);

export default router;
