import express from "express";

const router = express.Router();

// router.post('/create', async (req, res)=> {
//
// })

router.get("/ping", async (req, res) => res.sendStatus(200));

export default router;
