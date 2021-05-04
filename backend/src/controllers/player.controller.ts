import { NextFunction, Request, Response } from "express";
import { createPlayer as createPlayerService } from "../services/player.service";

export const createPlayer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Are we hitting the API like POST /player?gameCode=6942069&nickname=bob or with params that aren't in the query string?
    const code = req.query.gameCode;
    const nickname = req.query.nickname;
    if (typeof code != "string" || typeof nickname != "string") {
      throw new Error("Code or Nickname not passed in as a string");
    }
    const dbResp = await createPlayerService(code, nickname);
    console.log("Created player");
    res.status(201).send(dbResp);
  } catch (e) {
    return next(e);
  }
};
