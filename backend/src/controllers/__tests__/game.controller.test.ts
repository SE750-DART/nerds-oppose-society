import { validateGame } from "../game.controller";

/*eslint-disable @typescript-eslint/no-explicit-any*/
describe("Game controller", () => {
  describe("Create Game", () => {
    it("should respond with a 201 on endpoint hit", () => {
      expect(false).toBe(true);
    });
  });
  describe("Validate Game", () => {
    it("should respond with a 204 if the game code is valid", async () => {
      const req: any = {
        query: {
          gameCode: "6942069",
        },
      };
      const send = jest.fn((message: string) => {
        expect(message).toStrictEqual({
          body: "Game code 6942069",
          valid: true,
        });
      });
      const status = jest.fn((code: string) => {
        expect(code).toBe(204);
        return { send: send };
      });
      const res: any = {
        status: status,
      };
      const next: any = jest.fn();
      const service: () => Promise<boolean> = async () => {
        return true;
      };
      await validateGame(req, res, next, service);
      expect(send).toHaveBeenCalled();
      expect(status).toHaveBeenCalled();
      // expect(next).toHaveBeenCalled();
    });
  });
});
