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
 * Invokes an Axios request.
 *
 * @param controller - AbortController used to cancel effects -
 * See [Axios docs](https://axios-http.com/docs/cancellation).
 * This is important when invoking a request within a `useEffect` to perform
 * [cleanup](https://reactjs.org/docs/hooks-effect.html#example-using-hooks-1).
 */
type Request<T> = (
  controller?: AbortController
) => Promise<AxiosResponse<T> | null>;

/**
 * Manages state for an Axios request of type specified by `method`.
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
): [State<T>, Request<T>] => {
  const [state, dispatch] = useReducer<Reducer<State<T>, Action<T>>>(reducer, {
    loading: false,
    error: undefined,
  });

  const request = useCallback<Request<T>>(
    async (controller) => {
      dispatch({ type: ActionType.REQUEST_START });

      try {
        let requestConfig = config;
        if (controller) {
          requestConfig = { ...requestConfig, signal: controller.signal };
        }

        const response = await method(url, requestConfig);
        dispatch({ type: ActionType.REQUEST_SUCCESS });
        return response;
      } catch (error) {
        if (axios.isCancel(error)) {
          return null;
        } else if (axios.isAxiosError(error)) {
          dispatch({ type: ActionType.REQUEST_ERROR, error });
        } else {
          const error = Error("Server Error");
          dispatch({ type: ActionType.REQUEST_ERROR, error });
        }
        return null;
      }
    },
    [config, method, url]
  );

  return useMemo(() => [state, request], [state, request]);
};

/**
 * Manages state for an Axios `get` request.
 * Returns request state (`loading`, `error`) and a function to execute the request.
 *
 * @param url - Request URL
 * @param config - Request config. See [Axios docs](https://axios-http.com/docs/req_config).
 */
export const useGet = <T>(url: string, config?: AxiosRequestConfig) => {
  return useAxios<T>(url, axios.get, config);
};

/**
 * Manages state for an Axios `post` request.
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
