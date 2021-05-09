import { Server, Socket } from "socket.io";
import registerRoundHandler from "../round.handler";
import * as GameHandler from "../game.handler";
import * as GameService from "../../services/game.service";
import * as RoundService from "../../services/round.service";
import { RoundState } from "../../models/round.model";
import { ErrorType, ServiceError } from "../../util";
import { Game, Player, SetupType } from "../../models";

describe("Round handler", () => {
  const io = ("io" as unknown) as Server;
  const socket: Socket = ({
    data: {
      gameCode: "42069",
      playerId: "12345",
    },
    on: jest.fn(),
  } as unknown) as Socket;

  let handlers: {
    hostStartRound: (callback: (data: string) => void) => void;
    playerChoosePunchlines: (
      punchlines: string[],
      callback: (data: string) => void
    ) => Promise<void>;
    hostViewPunchline: (
      index: number,
      callback: (data: string) => void
    ) => void;
    hostChooseWinner: (
      winningPunchlines: string[],
      callback: (data: string) => void
    ) => Promise<void>;
    hostNextRound: (callback: (data: string) => void) => void;
  };

  it("registers each round handler", async () => {
    handlers = registerRoundHandler(io, socket);

    expect(socket.on).toHaveBeenCalledTimes(5);
    expect(socket.on).toHaveBeenCalledWith(
      "round:host-begin",
      handlers.hostStartRound
    );
    expect(socket.on).toHaveBeenCalledWith(
      "round:player-choose",
      handlers.playerChoosePunchlines
    );
    expect(socket.on).toHaveBeenCalledWith(
      "round:host-view",
      handlers.hostViewPunchline
    );
    expect(socket.on).toHaveBeenCalledWith(
      "round:host-choose",
      handlers.hostChooseWinner
    );
    expect(socket.on).toHaveBeenCalledWith(
      "round:host-next",
      handlers.hostNextRound
    );
  });

  describe("hostStartRound handler", () => {
    let stateSpy: jest.SpyInstance;
    let activeSpy: jest.SpyInstance;
    let allocateSpy: jest.SpyInstance;

    let callback: jest.Mock;
    let emitMock: jest.Mock;
    let socketMock: jest.Mock;
    let saveMock: jest.Mock;

    let io: Server;
    let socket: Socket;

    let activePlayers: Player[];
    let game: Game;
    let socketsByPlayerId: Map<Player["id"], Socket>;

    beforeEach(() => {
      stateSpy = jest.spyOn(RoundService, "enterPlayersChooseState");
      stateSpy.mockImplementation();
      activeSpy = jest.spyOn(GameHandler, "getActivePlayers");
      allocateSpy = jest.spyOn(GameService, "allocatePlayerPunchlines");

      callback = jest.fn();

      emitMock = jest.fn();
      io = ({
        to: jest.fn(() => {
          return {
            emit: emitMock,
          };
        }),
      } as unknown) as Server;

      socketMock = jest.fn();
      saveMock = jest.fn();

      socket = ({
        data: {
          gameCode: "42069",
          playerId: "abc123",
        },
        rooms: new Set(["<socket afjshfiou>", "42069", "42069:host"]),
        on: jest.fn(),
      } as unknown) as Socket;

      handlers = registerRoundHandler(io, socket);

      activePlayers = ([{ id: "1" }] as unknown) as Player[];
      game = ({
        gameId: "42069",
        save: saveMock,
        rounds: [
          {
            setup: {
              type: SetupType.pickOne,
            },
          },
        ],
      } as unknown) as Game;
      socketsByPlayerId = (new Map([
        ["1", { emit: socketMock }],
      ]) as unknown) as Map<Player["id"], Socket>;

      activeSpy.mockReturnValue({
        activePlayers: activePlayers,
        game: game,
        socketsByPlayerId: socketsByPlayerId,
      });
      allocateSpy.mockReturnValue(["To get to the other side", "To go to KFC"]);
    });

    afterEach(() => {
      stateSpy.mockRestore();
      activeSpy.mockRestore();
      allocateSpy.mockRestore();
    });

    it("starts the next round", async () => {
      await handlers.hostStartRound(callback);

      expect(callback).toHaveBeenCalledTimes(0);

      expect(activeSpy).toHaveBeenCalledTimes(1);
      expect(allocateSpy).toHaveBeenCalledTimes(1);
      expect(allocateSpy).toHaveBeenCalledWith(game, "1", 10);

      expect(socketMock).toHaveBeenCalledTimes(1);
      expect(socketMock).toHaveBeenCalledWith("punchlines:add", [
        "To get to the other side",
        "To go to KFC",
      ]);
      expect(saveMock).toHaveBeenCalledTimes(1);

      expect(io.to).toHaveBeenCalledTimes(1);
      expect(io.to).toHaveBeenCalledWith("42069");

      expect(emitMock).toHaveBeenCalledTimes(1);
      expect(emitMock).toHaveBeenCalledWith(
        "navigate",
        RoundState.playersChoose
      );
    });

    it("calls allocatePlayerPunchlines with limit of 12 for setup type of DRAW_TWO_PICK_THREE", async () => {
      game.rounds[0].setup.type = SetupType.drawTwoPickThree;

      await handlers.hostStartRound(callback);

      expect(callback).toHaveBeenCalledTimes(0);

      expect(activeSpy).toHaveBeenCalledTimes(1);
      expect(allocateSpy).toHaveBeenCalledTimes(1);
      expect(allocateSpy).toHaveBeenCalledWith(game, "1", 12);

      expect(socketMock).toHaveBeenCalledTimes(1);
      expect(socketMock).toHaveBeenCalledWith("punchlines:add", [
        "To get to the other side",
        "To go to KFC",
      ]);
      expect(saveMock).toHaveBeenCalledTimes(1);

      expect(io.to).toHaveBeenCalledTimes(1);
      expect(io.to).toHaveBeenCalledWith("42069");

      expect(emitMock).toHaveBeenCalledTimes(1);
      expect(emitMock).toHaveBeenCalledWith(
        "navigate",
        RoundState.playersChoose
      );
    });

    it("throws error due to round not being defined", async () => {
      game = ({
        rounds: [],
      } as unknown) as Game;
      activeSpy.mockReturnValue({
        activePlayers: activePlayers,
        game: game,
        socketsByPlayerId: socketsByPlayerId,
      });

      await handlers.hostStartRound(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Server error");

      expect(activeSpy).toHaveBeenCalledTimes(1);

      expect(allocateSpy).toHaveBeenCalledTimes(0);
      expect(socketMock).toHaveBeenCalledTimes(0);
      expect(saveMock).toHaveBeenCalledTimes(0);

      expect(io.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);
    });

    it("non-host calls handler and nothing happens", async () => {
      socket.rooms.delete("42069:host");

      await handlers.hostStartRound(callback);

      expect(callback).toHaveBeenCalledTimes(0);

      expect(io.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);
    });

    it("catches ServiceError thrown by playerChoosePunchlines service", async () => {
      stateSpy.mockRejectedValue(
        new ServiceError(ErrorType.gameCode, "Game does not exist")
      );

      await handlers.hostStartRound(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Game does not exist");

      expect(io.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);
    });

    it("catches generic Error thrown by playerChoosePunchlines service", async () => {
      stateSpy.mockRejectedValue(Error());

      await handlers.hostStartRound(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Server error");

      expect(io.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);
    });
  });

  describe("handlePlayerChoosePunchlines handler", () => {
    let playersChooseSpy: jest.SpyInstance;
    let hostStateSpy: jest.SpyInstance;

    let ioMock: jest.Mock;
    let socketMock: jest.Mock;
    let fetchMock: jest.Mock;
    let callback: jest.Mock;

    let io: Server;
    let socket: Socket;

    beforeEach(() => {
      playersChooseSpy = jest.spyOn(RoundService, "playerChoosePunchlines");
      hostStateSpy = jest.spyOn(RoundService, "enterHostChoosesState");

      ioMock = jest.fn();
      fetchMock = jest.fn();
      io = ({
        to: jest.fn(() => {
          return {
            emit: ioMock,
          };
        }),
        in: jest.fn(() => {
          return {
            fetchSockets: fetchMock,
          };
        }),
      } as unknown) as Server;

      socketMock = jest.fn();
      socket = ({
        data: {
          gameCode: "42069",
          playerId: "abc123",
        },
        on: jest.fn(),
        to: jest.fn(() => {
          return {
            emit: socketMock,
          };
        }),
      } as unknown) as Socket;

      handlers = registerRoundHandler(io, socket);

      playersChooseSpy.mockReturnValue(new Set(["abc123"]));
      fetchMock.mockReturnValue([
        { data: { playerId: "abc123" } },
        { data: { playerId: "def456" } },
        { data: { playerId: "ghi789" } },
      ]);

      callback = jest.fn();
    });

    afterEach(() => {
      playersChooseSpy.mockRestore();
      hostStateSpy.mockRestore();
    });

    it("chooses player punchlines and notifies other players to increment", async () => {
      await handlers.playerChoosePunchlines(
        ["To get to the other side"],
        callback
      );

      expect(callback).toHaveBeenCalledTimes(0);

      expect(socket.to).toHaveBeenCalledTimes(1);
      expect(socket.to).toHaveBeenCalledWith("42069");

      expect(socketMock).toHaveBeenCalledTimes(1);
      expect(socketMock).toHaveBeenCalledWith("round:increment-players-chosen");

      expect(io.to).toHaveBeenCalledTimes(0);
      expect(ioMock).toHaveBeenCalledTimes(0);
    });

    it("final player chooses punchlines notifying all clients to navigate to host chooses", async () => {
      playersChooseSpy.mockReturnValue(new Set(["abc123", "def456", "ghi789"]));
      hostStateSpy.mockReturnValue([
        ["To get to the other side"],
        ["To avoid bad jokes"],
        ["To go to KFC"],
      ]);

      await handlers.playerChoosePunchlines(
        ["To get to the other side"],
        callback
      );

      expect(callback).toHaveBeenCalledTimes(0);

      expect(socket.to).toHaveBeenCalledTimes(1);
      expect(socket.to).toHaveBeenCalledWith("42069");

      expect(socketMock).toHaveBeenCalledTimes(1);
      expect(socketMock).toHaveBeenCalledWith("round:increment-players-chosen");

      expect(io.to).toHaveBeenCalledTimes(2);
      expect(io.to).toHaveBeenNthCalledWith(1, "42069");
      expect(io.to).toHaveBeenNthCalledWith(2, "42069");

      expect(ioMock).toHaveBeenCalledTimes(2);
      expect(ioMock).toHaveBeenNthCalledWith(1, "round:chosen-punchlines", [
        ["To get to the other side"],
        ["To avoid bad jokes"],
        ["To go to KFC"],
      ]);
      expect(ioMock).toHaveBeenNthCalledWith(
        2,
        "navigate",
        RoundState.hostChooses
      );
    });

    it("catches ServiceError thrown by playerChoosePunchlines service", async () => {
      playersChooseSpy.mockRejectedValue(
        new ServiceError(ErrorType.gameCode, "Game does not exist")
      );

      await handlers.playerChoosePunchlines(
        ["To get to the other side"],
        callback
      );

      expect(hostStateSpy).toHaveBeenCalledTimes(0);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Game does not exist");

      expect(socket.to).toHaveBeenCalledTimes(0);
      expect(socketMock).toHaveBeenCalledTimes(0);
      expect(io.to).toHaveBeenCalledTimes(0);
      expect(ioMock).toHaveBeenCalledTimes(0);
    });

    it("catches generic Error thrown by playerChoosePunchlines service", async () => {
      playersChooseSpy.mockRejectedValue(Error());

      await handlers.playerChoosePunchlines(
        ["To get to the other side"],
        callback
      );

      expect(hostStateSpy).toHaveBeenCalledTimes(0);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Server error");

      expect(socket.to).toHaveBeenCalledTimes(0);
      expect(socketMock).toHaveBeenCalledTimes(0);
      expect(io.to).toHaveBeenCalledTimes(0);
      expect(ioMock).toHaveBeenCalledTimes(0);
    });
  });

  describe("hostViewPunchline handler", () => {
    let emitMock: jest.Mock;
    let callback: jest.Mock;

    let io: Server;
    let socket: Socket;

    beforeEach(() => {
      emitMock = jest.fn();
      socket = ({
        data: {
          gameCode: "42069",
          playerId: "abc123",
        },
        rooms: new Set(["<socket cqwdqcd>", "42069", "42069:host"]),
        on: jest.fn(),
        to: jest.fn(() => {
          return {
            emit: emitMock,
          };
        }),
      } as unknown) as Socket;

      callback = jest.fn();

      handlers = registerRoundHandler(io, socket);
    });

    it("host views punchline 0 and transmits index to clients", () => {
      handlers.hostViewPunchline(0, callback);

      expect(callback).toHaveBeenCalledTimes(0);

      expect(socket.to).toHaveBeenCalledTimes(1);
      expect(socket.to).toHaveBeenCalledWith("42069");

      expect(emitMock).toHaveBeenCalledTimes(1);
      expect(emitMock).toHaveBeenCalledWith("round:host-view", 0);
    });

    it("host views punchline 5 and transmits index to clients", () => {
      handlers.hostViewPunchline(5, callback);

      expect(callback).toHaveBeenCalledTimes(0);

      expect(socket.to).toHaveBeenCalledTimes(1);
      expect(socket.to).toHaveBeenCalledWith("42069");

      expect(emitMock).toHaveBeenCalledTimes(1);
      expect(emitMock).toHaveBeenCalledWith("round:host-view", 5);
    });

    it("non-host calls handler and nothing happens", () => {
      socket.rooms.delete("42069:host");

      handlers.hostViewPunchline(0, callback);

      expect(callback).toHaveBeenCalledTimes(0);

      expect(socket.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);
    });

    it("catches error", () => {
      emitMock.mockImplementation(() => {
        throw Error();
      });

      handlers.hostViewPunchline(0, callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Server error");

      expect(socket.to).toHaveBeenCalledTimes(1);
      expect(socket.to).toHaveBeenCalledWith("42069");
      expect(emitMock).toHaveBeenCalledTimes(1);
      expect(emitMock).toHaveReturnedTimes(0);
    });
  });

  describe("hostChooseWinner handler", () => {
    let serviceSpy: jest.SpyInstance;

    let emitMock: jest.Mock;
    let callback: jest.Mock;

    let io: Server;
    let socket: Socket;

    beforeEach(() => {
      serviceSpy = jest.spyOn(RoundService, "hostChooseWinner");

      emitMock = jest.fn();
      io = ({
        to: jest.fn(() => {
          return {
            emit: emitMock,
          };
        }),
      } as unknown) as Server;

      socket = ({
        data: {
          gameCode: "42069",
          playerId: "abc123",
        },
        rooms: new Set(["<socket cqwdqcd>", "42069", "42069:host"]),
        on: jest.fn(),
      } as unknown) as Socket;

      callback = jest.fn();

      handlers = registerRoundHandler(io, socket);
    });

    afterEach(() => {
      serviceSpy.mockRestore();
    });

    it("host chooses winner", async () => {
      serviceSpy.mockReturnValue("def456");

      await handlers.hostChooseWinner(["To go to KFC"], callback);

      expect(callback).toHaveBeenCalledTimes(0);

      expect(io.to).toHaveBeenCalledTimes(2);
      expect(io.to).toHaveBeenNthCalledWith(1, "42069");
      expect(io.to).toHaveBeenNthCalledWith(2, "42069");

      expect(emitMock).toHaveBeenCalledTimes(2);
      expect(emitMock).toHaveBeenNthCalledWith(1, "round:winner", "def456", [
        "To go to KFC",
      ]);
      expect(emitMock).toHaveBeenNthCalledWith(2, "navigate", RoundState.after);
    });

    it("hostChooseWinner service throws ServiceError", async () => {
      serviceSpy.mockRejectedValue(
        new ServiceError(ErrorType.gameCode, "Game does not exist")
      );

      await handlers.hostChooseWinner(["To go to KFC"], callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Game does not exist");

      expect(io.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);
    });

    it("hostChooseWinner service throws error", async () => {
      serviceSpy.mockRejectedValue(Error());

      await handlers.hostChooseWinner(["To go to KFC"], callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Server error");

      expect(io.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);
    });

    it("non-host calls handler and nothing happens", async () => {
      socket.rooms.delete("42069:host");

      await handlers.hostChooseWinner(["It was feeling cocky"], callback);

      expect(callback).toHaveBeenCalledTimes(0);

      expect(io.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);
    });
  });

  describe("hostNextRound handler", () => {
    let hostSpy: jest.SpyInstance;
    let initialiseSpy: jest.SpyInstance;
    let gameEndedSpy: jest.SpyInstance;

    let callback: jest.Mock;

    let io: Server;
    let socket: Socket;

    beforeEach(() => {
      hostSpy = jest.spyOn(GameHandler, "assignNextHost");
      hostSpy.mockReturnValue("def456");
      gameEndedSpy = jest.spyOn(GameService, "checkGameEnded");
      initialiseSpy = jest.spyOn(GameHandler, "initialiseNextRound");

      io = ("io" as unknown) as Server;

      socket = ({
        data: {
          gameCode: "42069",
          playerId: "abc123",
        },
        rooms: new Set(["<socket cqwdqcd>", "42069", "42069:host"]),
        on: jest.fn(),
      } as unknown) as Socket;

      callback = jest.fn();

      handlers = registerRoundHandler(io, socket);
    });

    afterEach(() => {
      hostSpy.mockRestore();
      initialiseSpy.mockRestore();
      gameEndedSpy.mockRestore();
    });

    it("non-host calls handler and nothing happens", async () => {
      socket.rooms.delete("42069:host");

      await handlers.hostNextRound(callback);

      expect(callback).toHaveBeenCalledTimes(0);

      expect(hostSpy).toHaveBeenCalledTimes(0);
      expect(initialiseSpy).toHaveBeenCalledTimes(0);
    });

    it("assigns new host and initialises next round", async () => {
      initialiseSpy.mockImplementation();
      gameEndedSpy.mockReturnValue(false);

      await handlers.hostNextRound(callback);

      expect(gameEndedSpy).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledTimes(0);

      expect(hostSpy).toHaveBeenCalledTimes(1);
      expect(initialiseSpy).toHaveBeenCalledTimes(1);
    });

    it("assigns new host and initialises next round but the game is over", async () => {
      initialiseSpy.mockImplementation();
      gameEndedSpy.mockReturnValue(true);

      await handlers.hostNextRound(callback);

      expect(gameEndedSpy).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledTimes(1);

      expect(hostSpy).toHaveBeenCalledTimes(1);
      expect(initialiseSpy).toHaveBeenCalledTimes(0);
    });

    it("catches ServiceError thrown by initialiseNextRound handler", async () => {
      initialiseSpy.mockRejectedValue(
        new ServiceError(ErrorType.gameCode, "Game does not exist")
      );
      gameEndedSpy.mockReturnValue(false);

      await handlers.hostNextRound(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Game does not exist");
    });

    it("catches Error thrown by initialiseNextRound handler", async () => {
      initialiseSpy.mockRejectedValue(Error());
      gameEndedSpy.mockReturnValue(false);

      await handlers.hostNextRound(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Server error");
    });
  });
});
