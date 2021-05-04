import { Router } from "express";

import game from "./game.route";
import player from "./player.route";

const routes = Router();

routes.use("/game", game);
routes.use("/player", player);

export default routes;
