import mockAxios from "jest-mock-axios";
import { AxiosError, AxiosResponse } from "axios";
import createPlayer from "../createPlayer";
import { BASE_URL } from "../axiosCall";

const testPlayer = {
  nickname: "test",
  gameCode: "12345",
};

afterEach(() => {
  mockAxios.reset();
});

test("should return user id on successful creation", async () => {
  const mockResponse: AxiosResponse<string> = {
    data: "1a2b3c",
    status: 201,
    statusText: "CREATED",
    headers: {},
    config: {},
  };

  mockAxios.post.mockImplementationOnce(() => Promise.resolve(mockResponse));

  const res = await createPlayer(testPlayer);

  expect(mockAxios.post).toHaveBeenCalledTimes(1);
  expect(mockAxios.post).toHaveBeenCalledWith(
    `${BASE_URL}/player/create`,
    undefined,
    { params: testPlayer }
  );

  expect(res).toEqual({
    success: true,
    status: 201,
    data: "1a2b3c",
  });
});

test("should return error on 400 bad request (invalid code or nickname)", async () => {
  const mockError: AxiosError<string> = {
    name: "error",
    message: "test message",
    config: {},
    response: {
      data: "invalid nickname",
      status: 400,
      statusText: "BAD REQUEST",
      headers: {},
      config: {},
    },
    isAxiosError: true,
    toJSON: () => ({}),
  };

  mockAxios.post.mockImplementationOnce(() => Promise.reject(mockError));

  const res = await createPlayer(testPlayer);

  expect(mockAxios.post).toHaveBeenCalledTimes(1);
  expect(mockAxios.post).toHaveBeenCalledWith(
    `${BASE_URL}/player/create`,
    undefined,
    { params: testPlayer }
  );

  expect(res).toEqual({
    success: false,
    status: 400,
    error: "invalid nickname",
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

  mockAxios.post.mockImplementationOnce(() => Promise.reject(mockError));

  const res = await createPlayer(testPlayer);

  expect(mockAxios.post).toHaveBeenCalledTimes(1);
  expect(mockAxios.post).toHaveBeenCalledWith(
    `${BASE_URL}/player/create`,
    undefined,
    { params: testPlayer }
  );

  expect(res).toEqual({
    success: false,
    status: 500,
    error: "Server error, please try again.",
  });
});
