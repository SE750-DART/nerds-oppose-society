import mockAxios from "jest-mock-axios";
import { AxiosResponse } from "axios";
import validateGame from "../validateGame";

afterEach(() => {
  mockAxios.reset();
});

test("should return success on valid game code", async () => {
  const mockResponse: AxiosResponse<{}> = {
    data: {},
    status: 204,
    statusText: "NO CONTENT",
    headers: {},
    config: {},
  };

  mockAxios.get.mockImplementationOnce(() => Promise.resolve(mockResponse));

  const res = await validateGame({ gameCode: "12345" });

  expect(mockAxios.get).toHaveBeenCalledTimes(1);
  expect(mockAxios.get).toHaveBeenCalledWith("/game/validate", {
    params: { gameCode: "12345" },
  });

  expect(res).toEqual({
    success: true,
    status: 204,
  });
});
