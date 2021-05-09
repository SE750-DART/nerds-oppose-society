import { Server, Socket } from "socket.io";
import registerPlayerHandler, { playerJoin } from "./player.handler";
import registerGameHandler from "./game.handler";
import registerRoundHandler from "./round.handler";

export { default as Auth } from "./auth.handler";

export const Connection = async (io: Server, socket: Socket): Promise<void> => {
  registerPlayerHandler(io, socket);
  registerGameHandler(io, socket);
  registerRoundHandler(io, socket);

  await playerJoin(io, socket);
};
