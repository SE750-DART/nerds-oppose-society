import mockAxios from "jest-mock-axios";
import { AxiosResponse } from "axios";
import createPlayer from "../createPlayer";

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

  const res = await createPlayer({
    nickname: "test",
    gameCode: "12345",
  });

  expect(mockAxios.post).toHaveBeenCalledTimes(1);
  expect(mockAxios.post).toHaveBeenCalledWith("/player/create", {
    nickname: "test",
    gameCode: "12345",
  });

  expect(res).toEqual({
    success: true,
    status: 201,
    data: "1a2b3c",
  });
});
