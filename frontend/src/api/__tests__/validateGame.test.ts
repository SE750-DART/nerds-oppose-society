import mockAxios from "jest-mock-axios";
import { AxiosError, AxiosResponse } from "axios";
import validateGame from "../validateGame";

const testGameCode = { gameCode: "12345" };

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

  const res = await validateGame(testGameCode);

  expect(mockAxios.get).toHaveBeenCalledTimes(1);
  expect(mockAxios.get).toHaveBeenCalledWith("/game/validate", {
    params: testGameCode,
  });

  expect(res).toEqual({
    success: true,
    status: 204,
    data: {},
  });
});

test("should return error on 404 not found (invalid code)", async () => {
  const mockError: AxiosError<{}> = {
    name: "error",
    message: "test message",
    config: {},
    response: {
      data: {},
      status: 404,
      statusText: "NOT FOUND",
      headers: {},
      config: {},
    },
    isAxiosError: true,
    toJSON: () => ({}),
  };

  mockAxios.get.mockImplementationOnce(() => Promise.reject(mockError));

  const res = await validateGame(testGameCode);

  expect(mockAxios.get).toHaveBeenCalledTimes(1);
  expect(mockAxios.get).toHaveBeenCalledWith("/game/validate", {
    params: testGameCode,
  });

  expect(res).toEqual({
    success: false,
    status: 404,
    error: {},
  });
});

test("should return error on 500 server error", async () => {
  const mockError: AxiosError<{}> = {
    name: "error",
    message: "test message",
    config: {},
    request: "test request",
    isAxiosError: true,
    toJSON: () => ({}),
  };

  mockAxios.get.mockImplementationOnce(() => Promise.reject(mockError));

  const res = await validateGame(testGameCode);

  expect(mockAxios.get).toHaveBeenCalledTimes(1);
  expect(mockAxios.get).toHaveBeenCalledWith("/game/validate", {
    params: testGameCode,
  });

  expect(res).toEqual({
    success: false,
    status: 500,
    error: "test request",
  });
});
