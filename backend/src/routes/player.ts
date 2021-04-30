import { Router } from "express";

const router = Router();

router.get("/ping", async (req, res) => res.sendStatus(200));

export default router;
