import { Reducer, useCallback, useMemo, useReducer } from "react";
import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from "axios";

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
type Action<T, D> =
  | { type: ActionType.REQUEST_START }
  | { type: ActionType.REQUEST_SUCCESS }
  | { type: ActionType.REQUEST_ERROR; error: AxiosError<T, D> | Error };

/**
 * Request state
 */
type State<T, D> = {
  loading: boolean;
  error: AxiosError<T, D> | Error | undefined;
};

/**
 * Reducer function for request state
 * @param state
 * @param action
 */
const reducer = <T, D>(
  state: State<T, D>,
  action: Action<T, D>
): State<T, D> => {
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
type Request<T, D> = (
  controller?: AbortController
) => Promise<AxiosResponse<T, D> | null>;

/**
 * Manages state for an Axios request of type specified by `method`.
 * Returns request state (`loading`, `error`) and a function to execute the request.
 *
 * @param config - Request config. See [Axios docs](https://axios-http.com/docs/req_config)
 */
const useAxios = <T, D>(
  config: Omit<AxiosRequestConfig<D>, "signal">
): [State<T, D>, Request<T, D>] => {
  const [state, dispatch] = useReducer<Reducer<State<T, D>, Action<T, D>>>(
    reducer,
    {
      loading: false,
      error: undefined,
    }
  );

  const request = useCallback<Request<T, D>>(
    async (controller) => {
      dispatch({ type: ActionType.REQUEST_START });

      try {
        let requestConfig: AxiosRequestConfig<D> = config;
        if (controller) {
          requestConfig = { ...requestConfig, signal: controller.signal };
        }

        const response = await axios(requestConfig);
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
    [config]
  );

  return useMemo(() => [state, request], [state, request]);
};

/**
 * Manages state for an Axios `get` request.
 * Returns request state (`loading`, `error`) and a function to execute the request.
 *
 * @param url - Request URL
 * @param config - Request config. See [Axios docs](https://axios-http.com/docs/req_config)
 */
export const useGet = <T, D = unknown>(
  url: string,
  config?: Omit<AxiosRequestConfig<D>, "method" | "url" | "signal">
) => {
  return useAxios<T, D>(
    useMemo(() => ({ ...config, method: "get", url }), [config, url])
  );
};

/**
 * Manages state for an Axios `post` request.
 * Returns request state (`loading`, `error`) and a function to execute the request.
 *
 * @param url - Request URL
 * @param data - Request data
 * @param config - Request config. See [Axios docs](https://axios-http.com/docs/req_config)
 */
export const usePost = <T, D = unknown>(
  url: string,
  data?: D,
  config?: Omit<AxiosRequestConfig<D>, "method" | "url" | "data" | "signal">
) => {
  return useAxios<T, D>(
    useMemo(
      () => ({ ...config, method: "post", url, data }),
      [config, data, url]
    )
  );
};

/**
 * Returns a message from a request error.
 * @param error - Request error
 */
export const getRequestErrorMessage = <T, D>(
  error: AxiosError<T, D> | Error | undefined
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
