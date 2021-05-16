import mockAxios from "jest-mock-axios";
import { AxiosError, AxiosResponse } from "axios";
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

  // @ts-ignore
  mockAxios.post.mockImplementationOnce(() => Promise.resolve(mockResponse));

  const res = await createGame();

  expect(mockAxios.post).toHaveBeenCalledTimes(1);
  expect(mockAxios.post).toHaveBeenCalledWith(`/game/create`);

  expect(res).toEqual({
    success: true,
    status: 201,
    data: "12345",
  });
});

test("should return error on 500 server error", async () => {
  const mockError: AxiosError<string> = {
    name: "error",
    message: "test message",
    config: {},
    request: "test request",
    isAxiosError: true,
    toJSON: () => ({}),
  };

  // @ts-ignore
  mockAxios.post.mockImplementationOnce(() => Promise.reject(mockError));

  const res = await createGame();

  expect(mockAxios.post).toHaveBeenCalledTimes(1);
  expect(mockAxios.post).toHaveBeenCalledWith(`/game/create`);

  expect(res).toEqual({
    success: false,
    status: 500,
    error: "Server error, please try again.",
  });
});
