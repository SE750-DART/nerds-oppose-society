import { Server, Socket } from "socket.io";
import registerRoundHandler from "../round.handler";
import * as RoundService from "../../services/round.service";
import { RoundState } from "../../models/round.model";
import { ErrorType, ServiceError } from "../../util";

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
    playerChoosePunchlines: (
      punchlines: string[],
      callback: (data: string) => void
    ) => Promise<void>;
    hostViewPunchline: (index: number) => void;
  };

  it("registers each round handler", async () => {
    handlers = registerRoundHandler(io, socket);

    expect(socket.on).toHaveBeenCalledTimes(2);
    expect(socket.on).toHaveBeenCalledWith(
      "round:player-choose",
      handlers.playerChoosePunchlines
    );
    expect(socket.on).toHaveBeenCalledWith(
      "round:host-view",
      handlers.hostViewPunchline
    );
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
      expect(ioMock).toHaveBeenNthCalledWith(
        1,
        "navigate",
        RoundState.hostChooses
      );
      expect(ioMock).toHaveBeenNthCalledWith(2, "round:chosen-punchlines", [
        ["To get to the other side"],
        ["To avoid bad jokes"],
        ["To go to KFC"],
      ]);
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

      handlers = registerRoundHandler(io, socket);
    });

    it("host views punchline 0 and transmits index to clients", () => {
      handlers.hostViewPunchline(0);

      expect(socket.to).toHaveBeenCalledTimes(1);
      expect(socket.to).toHaveBeenCalledWith("42069");

      expect(emitMock).toHaveBeenCalledTimes(1);
      expect(emitMock).toHaveBeenCalledWith("round:host-view", 0);
    });

    it("host views punchline 5 and transmits index to clients", () => {
      handlers.hostViewPunchline(5);

      expect(socket.to).toHaveBeenCalledTimes(1);
      expect(socket.to).toHaveBeenCalledWith("42069");

      expect(emitMock).toHaveBeenCalledTimes(1);
      expect(emitMock).toHaveBeenCalledWith("round:host-view", 5);
    });

    it("non-host calls socket and nothing happens", () => {
      socket.rooms.delete("42069:host");

      handlers.hostViewPunchline(0);

      expect(socket.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);
    });
  });
});
