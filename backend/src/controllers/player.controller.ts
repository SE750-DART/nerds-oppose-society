import { NextFunction, Request, Response } from "express";

export const createPlayer = async (
  req: Request,
  res: Response,
  next: NextFunction,
  service: () => Promise<string> = async () => {
    return "Success";
  }
): Promise<void> => {
  try {
    console.log("Created player");
    const dbResp = await service();
    res.status(201).send(dbResp);
    next();
  } catch (e) {
    console.log(e.message);
    return next(e);
  }
};
