import axios, { AxiosError, AxiosResponse, CanceledError } from "axios";
import { act, renderHook } from "@testing-library/react-hooks";
import { getRequestErrorMessage, useGet, usePost } from "../axios";

const mockAxios = jest.mocked(axios, true);

const mockedAxiosResponse = <T>(
  data: T,
  statusText = "OK"
): AxiosResponse<T> => ({
  config: {},
  data: data,
  headers: {},
  status: 200,
  statusText: statusText,
});

const mockedAxiosError = <T>(
  isCanceled = false,
  response?: AxiosResponse<T>
): AxiosError<T> | CanceledError<T> => {
  const mockAxiosErrorBody = {
    config: {},
    isAxiosError: true,
    message: "",
    name: "",
    response,
    __CANCEL__: isCanceled,
  };
  return {
    ...mockAxiosErrorBody,
    toJSON: () => mockAxiosErrorBody,
  };
};

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
    This throws an intentional warning in the Jest console as we are not resolving
    the request promise to simulate the request pending and inspect the `loading`
    and `error` values - nothing to see here!
     */
    act(() => {
      request();
    });

    const [{ loading, error }] = result.current;
    expect(loading).toBeTruthy();
    expect(error).toBeUndefined();
  });

  it("request success returns axios response, loading is false and error is undefined", async () => {
    const mockAxiosResponse = mockedAxiosResponse("textResponse");
    mockAxios.get.mockResolvedValue(mockAxiosResponse);

    const { result } = renderHook(() => useGet<string>("/"));
    const [, request] = result.current;

    await act(async () => {
      const response = await request();
      expect(response).toEqual(mockAxiosResponse);
    });

    const [{ loading, error }] = result.current;
    expect(loading).toBeFalsy();
    expect(error).toBeUndefined();
  });

  it("request error of AxiosError returns null, loading is false and error is defined", async () => {
    const mockAxiosError = mockedAxiosError();
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
    This throws an intentional warning in the Jest console as we are not resolving
    the request promise to simulate the request pending and inspect the `loading`
    and `error` values - nothing to see here!
     */
    act(() => {
      request();
    });

    const [{ error: errorPending }] = result.current;
    expect(errorPending).toBeUndefined();
  });

  it("cancelled request returns null, loading is false and error is undefined", async () => {
    const mockCancelledError = mockedAxiosError(true);

    mockAxios.get.mockRejectedValue(mockCancelledError);

    const { result } = renderHook(() => useGet("/"));
    const [, request] = result.current;

    await act(async () => {
      const controller = new AbortController();
      const response = await request(controller);
      expect(response).toBeNull();
      expect(mockAxios.get).toHaveBeenCalledWith("/", {
        signal: controller.signal,
      });
    });

    const [{ loading, error }] = result.current;
    expect(loading).toBeTruthy();
    expect(error).toBeUndefined();
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
    This throws an intentional warning in the Jest console as we are not resolving
    the request promise to simulate the request pending and inspect the `loading`
    and `error` values - nothing to see here!
     */
    act(() => {
      request();
    });

    const [{ loading, error }] = result.current;
    expect(loading).toBeTruthy();
    expect(error).toBeUndefined();
  });

  it("request success returns axios response, loading is false and error is undefined", async () => {
    const mockAxiosResponse = mockedAxiosResponse("textResponse");
    mockAxios.post.mockResolvedValue(mockAxiosResponse);

    const { result } = renderHook(() => usePost<string>("/"));
    const [, request] = result.current;

    await act(async () => {
      const response = await request();
      expect(response).toEqual(mockAxiosResponse);
    });

    const [{ loading, error }] = result.current;
    expect(loading).toBeFalsy();
    expect(error).toBeUndefined();
  });

  it("request error of AxiosError returns null, loading is false and error is defined", async () => {
    const mockAxiosError = mockedAxiosError();
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
    This throws an intentional warning in the Jest console as we are not resolving
    the request promise to simulate the request pending and inspect the `loading`
    and `error` values - nothing to see here!
     */
    act(() => {
      request();
    });

    const [{ error: errorPending }] = result.current;
    expect(errorPending).toBeUndefined();
  });

  it("cancelled request returns null, loading is true and error is undefined", async () => {
    const mockCancelledError = mockedAxiosError(true);

    mockAxios.post.mockRejectedValue(mockCancelledError);

    const { result } = renderHook(() => usePost("/"));
    const [, request] = result.current;

    await act(async () => {
      const controller = new AbortController();
      const response = await request(controller);
      expect(response).toBeNull();
      expect(mockAxios.post).toHaveBeenCalledWith("/", {
        signal: controller.signal,
      });
    });

    const [{ loading, error }] = result.current;
    expect(loading).toBeTruthy();
    expect(error).toBeUndefined();
  });
});

describe("getRequestErrorMessage()", () => {
  it("returns undefined when error is undefined", () => {
    const message = getRequestErrorMessage(undefined);
    expect(message).toBeUndefined();
  });

  it("returns response.statusText when error is AxiosError", () => {
    const mockAxiosResponse = mockedAxiosResponse("axiosError", "AxiosError");
    const mockAxiosError = mockedAxiosError(false, mockAxiosResponse);

    const message = getRequestErrorMessage(mockAxiosError);
    expect(message).toBe("AxiosError");
  });

  it("returns message when error is Error", () => {
    const mockError = Error("Error message");

    const message = getRequestErrorMessage(mockError);
    expect(message).toBe("Error message");
  });
});
