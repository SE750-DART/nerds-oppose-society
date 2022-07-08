import { Reducer, useCallback, useMemo, useReducer } from "react";
import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from "axios";

/**
 * Function signature for an Axios request. See [Axios docs](https://axios-http.com/docs/api_intro).
 */
type AxiosRequest<T> = (
  url: string,
  config?: AxiosRequestConfig
) => Promise<AxiosResponse<T>>;

/**
 * Request actions
 */
enum ActionType {
  REQUEST_START = "request_start",
  REQUEST_SUCCESS = "request_success",
  REQUEST_ERROR = "request_error",
}

/**
 * Request reducer actions
 */
type Action<T> =
  | { type: ActionType.REQUEST_START }
  | { type: ActionType.REQUEST_SUCCESS }
  | { type: ActionType.REQUEST_ERROR; error: AxiosError<T> | Error };

/**
 * Request state
 */
type State<T> = {
  loading: boolean;
  error: AxiosError<T> | Error | undefined;
};

/**
 * Reducer function for request state
 * @param state
 * @param action
 */
const reducer = <T>(state: State<T>, action: Action<T>): State<T> => {
  switch (action.type) {
    case ActionType.REQUEST_START: {
      return { loading: true, error: undefined };
    }
    case ActionType.REQUEST_SUCCESS: {
      return { ...state, loading: false };
    }
    case ActionType.REQUEST_ERROR: {
      return { loading: false, error: action.error };
    }
  }
};

/**
 * Performs an Axios request using the function specified by `method`.
 * Returns request state (`loading`, `error`) and a function to execute the request.
 *
 * @param url - Request URL
 * @param method - Request method. See [Axios docs](https://axios-http.com/docs/api_intro).
 * @param config - Request config. See [Axios docs](https://axios-http.com/docs/req_config).
 */
const useAxios = <T>(
  url: string,
  method: AxiosRequest<T>,
  config?: AxiosRequestConfig
): [State<T>, () => Promise<AxiosResponse<T> | null>] => {
  const [state, dispatch] = useReducer<Reducer<State<T>, Action<T>>>(reducer, {
    loading: false,
    error: undefined,
  });

  const request = useCallback(async () => {
    dispatch({ type: ActionType.REQUEST_START });

    try {
      const response = await method(url, config);
      dispatch({ type: ActionType.REQUEST_SUCCESS });
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        dispatch({ type: ActionType.REQUEST_ERROR, error });
      } else {
        const error = Error("Server Error");
        dispatch({ type: ActionType.REQUEST_ERROR, error });
      }
      return null;
    }
  }, [config, method, url]);

  return useMemo(() => [state, request], [state, request]);
};

/**
 * Performs an Axios `get` request.
 * Returns request state (`loading`, `error`) and a function to execute the request.
 *
 * @param url - Request URL
 * @param config - Request config. See [Axios docs](https://axios-http.com/docs/req_config).
 */
export const useGet = <T>(url: string, config?: AxiosRequestConfig) => {
  return useAxios<T>(url, axios.get, config);
};

/**
 * Performs an Axios `post` request.
 * Returns request state (`loading`, `error`) and a function to execute the request.
 *
 * @param url - Request URL
 * @param config - Request config. See [Axios docs](https://axios-http.com/docs/req_config).
 */
export const usePost = <T>(url: string, config?: AxiosRequestConfig) => {
  return useAxios<T>(url, axios.post, config);
};

/**
 * Returns a message from a request error.
 * @param error - Request error
 */
export const getRequestErrorMessage = <T>(
  error: AxiosError<T> | Error | undefined
): string | undefined => {
  let errorMessage: string | undefined;
  if (error) {
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.statusText;
    } else {
      errorMessage = error.message;
    }
  }
  return errorMessage;
};
