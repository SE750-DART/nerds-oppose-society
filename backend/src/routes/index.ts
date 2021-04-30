import express from "express";

import game from "./game";
import player from "./player";

const routes = express.Router();

routes.use("/game", game);
routes.use("/player", player);

export default routes;
