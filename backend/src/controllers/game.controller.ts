import { NextFunction, Request, Response } from "express";

export const createGame = async (
  req: Request,
  res: Response,
  next: NextFunction,
  service: () => Promise<string> = async () => {
    return "Success";
  }
): Promise<void> => {
  try {
    const dbResp = await service();
    console.log("Created game!");
    res.status(201).send(dbResp);
    next();
  } catch (e) {
    console.log(e.message);
    return next(e);
  }
};

export const validateGame = async (
  req: Request,
  res: Response,
  next: NextFunction,
  service: () => Promise<boolean> = async () => {
    return true;
  }
): Promise<void> => {
  try {
    const dbResp = await service();
    console.log("Validated game");
    res
      .status(204)
      .send({ body: `Game code ${req.query.gameCode}`, valid: dbResp });
  } catch (e) {
    console.log(e.message);
    return next(e);
  }
};
