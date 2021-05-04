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
    const dbResp = await createGameService();
    console.log("Created game!");
    res.status(201).send(dbResp);
    next();
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
      throw new Error("Code not of type string");
    }
    const dbResp = await validateGameCodeService(code);
    console.log("Validated game");
    res
      .status(204)
      .send({ body: `Game code ${req.query.gameCode}`, valid: dbResp });
  } catch (e) {
    return next(e);
  }
};
