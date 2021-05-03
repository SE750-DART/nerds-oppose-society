import mockAxios from "jest-mock-axios";
import { AxiosResponse } from "axios";
import createGame from "../createGame";

afterEach(() => {
  mockAxios.reset();
});

test("should return game code on successful creation", async () => {
  const mockResponse: AxiosResponse<string> = {
    data: "12345",
    status: 201,
    statusText: "CREATED",
    headers: {},
    config: {},
  };

  mockAxios.post.mockImplementationOnce(() => Promise.resolve(mockResponse));

  const res = await createGame();

  expect(mockAxios.post).toHaveBeenCalledTimes(1);
  expect(mockAxios.post).toHaveBeenCalledWith("/game/create");

  expect(res).toEqual({
    success: true,
    data: "12345",
  });
});
