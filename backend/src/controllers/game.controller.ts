import { NextFunction, Request, Response } from "express";

export const createGame = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("Created game!");

    res.sendStatus(201);
    next();
  } catch (e) {
    console.log(e.message);
    return next(e);
  }
};

export const validateGame = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("Validated game");
    res.sendStatus(204);
  } catch (e) {
    console.log(e.message);
    return next(e);
  }
};
