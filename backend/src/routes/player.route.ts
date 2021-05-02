import { Router } from "express";
import { createPlayer } from "../controllers/player.controller";

const router = Router();

router.get("/ping", async (req, res) => res.sendStatus(200));

router.post("/create", createPlayer);

export default router;
