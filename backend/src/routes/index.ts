import { Router } from "express";

import game from "./game";
import player from "./player";

const routes = Router();

routes.use("/game", game);
routes.use("/player", player);

export default routes;
