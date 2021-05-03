import { Socket } from "socket.io";
import { Game, GameState } from "../../models";
import { navigatePlayer } from "../game.handler";

describe("navigatePlayer handler", () => {
  let socket: Socket;
  let game: Game;

  beforeEach(() => {
    socket = ({
      emit: jest.fn(),
    } as unknown) as Socket;

    game = ({
      state: GameState.lobby,
      players: [
        { nickname: "Bob", new: true },
        { nickname: "Fred", new: false },
      ],
      settings: {
        roundLimit: 69,
        maxPlayers: 25,
      },
    } as unknown) as Game;
  });

  it("navigates player to lobby", () => {
    navigatePlayer(socket, game);

    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith(
      "navigate",
      GameState.lobby,
      [{ nickname: "Fred", new: false }],
      { roundLimit: 69, maxPlayers: 25 }
    );
  });

  it("throws error for invalid game state", () => {
    game = ({
      state: "INVALID",
    } as unknown) as Game;

    expect(() => navigatePlayer(socket, game)).toThrow("Invalid game state");
  });
});
