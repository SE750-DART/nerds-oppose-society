import { NextFunction, Request, Response } from "express";
import { createPlayer as createPlayerService } from "../services/player.service";
import { ErrorType } from "../util";

export const createPlayer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const code = req.query.gameCode;
    const nickname = req.query.nickname;
    if (typeof code != "string") {
      res.status(400).send("Code not of type string");
      return;
    }
    if (typeof nickname != "string") {
      res.status(400).send("Nickname not of type string");
      return;
    }
    const dbResp = await createPlayerService(code, nickname);
    res.status(201).send(dbResp);
    return;
  } catch (e) {
    console.log(e);
    if (e.type === ErrorType.gameCode) {
      res.status(400).send("Could not get game");
      return;
    } else if (e.type === ErrorType.playerName) {
      res.status(400).send("Nickname taken");
      return;
    } else {
      return next(e);
    }
  }
};
