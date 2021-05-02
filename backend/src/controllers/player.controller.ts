import { NextFunction, Request, Response } from "express";

export const createPlayer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("Created player");

    res.sendStatus(201);
    next();
  } catch (e) {
    console.log(e.message);
    return next(e);
  }
};
