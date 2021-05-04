import { NextFunction, Request, Response } from "express";
import {
  createGame as createGameService,
  validateGameCode as validateGameCodeService,
} from "../services/game.service";

export const createGame = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gameCode = await createGameService();
    res.status(201).send(gameCode);
    return;
  } catch (e) {
    return next(e);
  }
};

export const validateGame = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const code = req.query.gameCode;
    if (typeof code != "string") {
      res.status(400).send("Code not of type string");
      return;
    }
    const isValid: boolean = await validateGameCodeService(code);
    if (isValid) {
      res.sendStatus(204);
      return;
    } else {
      res.sendStatus(404);
      return;
    }
  } catch (e) {
    return next(e);
  }
};
