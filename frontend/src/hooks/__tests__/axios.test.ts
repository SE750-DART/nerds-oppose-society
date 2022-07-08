import axios, { AxiosError } from "axios";
import { act, renderHook } from "@testing-library/react-hooks";
import { getRequestErrorMessage, useGet, usePost } from "../axios";
import { AxiosResponse } from "axios";

const mockAxios = jest.mocked(axios, true);

describe("useGet()", () => {
  it("initially loading is false and error is undefined", () => {
    const { result } = renderHook(() => useGet("/"));
    const [{ loading, error }] = result.current;

    expect(loading).toBeFalsy();
    expect(error).toBeUndefined();
  });

  it("while request pending loading is true and error is undefined", () => {
    mockAxios.get.mockImplementation(() => new Promise(() => null));

    const { result } = renderHook(() => useGet("/"));
    const [, request] = result.current;

    /*
    This throws an intentional warning in the Jest consÏole as we are not
    resolving `requestPromise` to simulate the request pending and inspect the
    `loading` and `error` values - nothing to see here!
     */
    act(() => {
      request();
    });

    const [{ loading, error }] = result.current;
    expect(loading).toBeTruthy();
    expect(error).toBeUndefined();
  });

  it("request success returns axios response, loading is false and error is undefined", async () => {
    const mockResponse: AxiosResponse<string> = {
      config: {},
      data: "testResponse",
      headers: {},
      status: 200,
      statusText: "OK",
    };
    mockAxios.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGet<string>("/"));
    const [, request] = result.current;

    await act(async () => {
      const response = await request();
      expect(response).toEqual(mockResponse);
    });

    const [{ loading, error }] = result.current;
    expect(loading).toBeFalsy();
    expect(error).toBeUndefined();
  });

  it("request error of AxiosError returns null, loading is false and error is defined", async () => {
    const mockAxiosErrorBody = {
      config: {},
      isAxiosError: true,
      message: "",
      name: "",
    };
    const mockAxiosError: AxiosError<string> = {
      ...mockAxiosErrorBody,
      toJSON: () => mockAxiosErrorBody,
    };
    mockAxios.get.mockRejectedValue(mockAxiosError);

    const { result } = renderHook(() => useGet<string>("/"));
    const [, request] = result.current;

    await act(async () => {
      const response = await request();
      expect(response).toBeNull();
    });

    const [{ loading, error }] = result.current;
    expect(loading).toBeFalsy();
    expect(error).toEqual(mockAxiosError);
  });

  it("request error of Error returns null, loading is false and error is defined", async () => {
    const mockError = new Error("Error");
    mockAxios.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useGet<string>("/"));
    const [, request] = result.current;

    await act(async () => {
      const response = await request();
      expect(response).toBeNull();
    });

    const [{ loading, error }] = result.current;
    expect(loading).toBeFalsy();
    expect(error).toBeDefined();
    expect(error?.message).toBe("Server Error");
  });

  it("error transitions to undefined when request pending", async () => {
    const mockError = new Error("Error");
    mockAxios.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useGet("/"));
    const [, request] = result.current;

    await act(async () => {
      const response = await request();
      expect(response).toBeNull();
    });

    const [{ error: errorPrevious }] = result.current;
    expect(errorPrevious).toBeDefined();
    expect(errorPrevious?.message).toBe("Server Error");

    mockAxios.get.mockImplementation(() => new Promise(() => null));

    /*
    This throws an intentional warning in the Jest consÏole as we are not
    resolving `requestPromise` to simulate the request pending and inspect the
    `loading` and `error` values - nothing to see here!
     */
    act(() => {
      request();
    });

    const [{ error: errorPending }] = result.current;
    expect(errorPending).toBeUndefined();
  });
});

describe("usePost()", () => {
  it("initially loading is false and error is undefined", () => {
    const { result } = renderHook(() => usePost("/"));
    const [{ loading, error }] = result.current;

    expect(loading).toBeFalsy();
    expect(error).toBeUndefined();
  });

  it("while request pending loading is true and error is undefined", () => {
    mockAxios.post.mockImplementation(() => new Promise(() => null));

    const { result } = renderHook(() => usePost("/"));
    const [, request] = result.current;

    /*
    This throws an intentional warning in the Jest consÏole as we are not
    resolving `requestPromise` to simulate the request pending and inspect the
    `loading` and `error` values - nothing to see here!
     */
    act(() => {
      request();
    });

    const [{ loading, error }] = result.current;
    expect(loading).toBeTruthy();
    expect(error).toBeUndefined();
  });

  it("request success returns axios response, loading is false and error is undefined", async () => {
    const mockResponse: AxiosResponse<string> = {
      config: {},
      data: "testResponse",
      headers: {},
      status: 200,
      statusText: "OK",
    };
    mockAxios.post.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePost<string>("/"));
    const [, request] = result.current;

    await act(async () => {
      const response = await request();
      expect(response).toEqual(mockResponse);
    });

    const [{ loading, error }] = result.current;
    expect(loading).toBeFalsy();
    expect(error).toBeUndefined();
  });

  it("request error of AxiosError returns null, loading is false and error is defined", async () => {
    const mockAxiosErrorBody = {
      config: {},
      isAxiosError: true,
      message: "",
      name: "",
    };
    const mockAxiosError: AxiosError<string> = {
      ...mockAxiosErrorBody,
      toJSON: () => mockAxiosErrorBody,
    };
    mockAxios.post.mockRejectedValue(mockAxiosError);

    const { result } = renderHook(() => usePost<string>("/"));
    const [, request] = result.current;

    await act(async () => {
      const response = await request();
      expect(response).toBeNull();
    });

    const [{ loading, error }] = result.current;
    expect(loading).toBeFalsy();
    expect(error).toEqual(mockAxiosError);
  });

  it("request error of Error returns null, loading is false and error is defined", async () => {
    const mockError = new Error("Error");
    mockAxios.post.mockRejectedValue(mockError);

    const { result } = renderHook(() => usePost<string>("/"));
    const [, request] = result.current;

    await act(async () => {
      const response = await request();
      expect(response).toBeNull();
    });

    const [{ loading, error }] = result.current;
    expect(loading).toBeFalsy();
    expect(error).toBeDefined();
    expect(error?.message).toBe("Server Error");
  });

  it("error transitions to undefined when request pending", async () => {
    const mockError = new Error("Error");
    mockAxios.post.mockRejectedValue(mockError);

    const { result } = renderHook(() => usePost("/"));
    const [, request] = result.current;

    await act(async () => {
      const response = await request();
      expect(response).toBeNull();
    });

    const [{ error: errorPrevious }] = result.current;
    expect(errorPrevious).toBeDefined();
    expect(errorPrevious?.message).toBe("Server Error");

    mockAxios.post.mockImplementation(() => new Promise(() => null));

    /*
    This throws an intentional warning in the Jest consÏole as we are not
    resolving `requestPromise` to simulate the request pending and inspect the
    `loading` and `error` values - nothing to see here!
     */
    act(() => {
      request();
    });

    const [{ error: errorPending }] = result.current;
    expect(errorPending).toBeUndefined();
  });
});

describe("getRequestErrorMessage()", () => {
  it("returns undefined when error is undefined", () => {
    const message = getRequestErrorMessage(undefined);
    expect(message).toBeUndefined();
  });

  it("returns response.statusText when error is AxiosError", () => {
    const mockAxiosErrorBody = {
      config: {},
      isAxiosError: true,
      message: "",
      name: "",
      response: {
        config: {},
        data: "axiosError",
        headers: {},
        status: 500,
        statusText: "AxiosError",
      },
    };
    const mockAxiosError: AxiosError<string> = {
      ...mockAxiosErrorBody,
      toJSON: () => mockAxiosErrorBody,
    };

    const message = getRequestErrorMessage(mockAxiosError);
    expect(message).toBe("AxiosError");
  });

  it("returns message when error is Error", () => {
    const mockError = Error("Error message");

    const message = getRequestErrorMessage(mockError);
    expect(message).toBe("Error message");
  });
});
