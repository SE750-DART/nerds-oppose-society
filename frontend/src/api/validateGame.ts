import axios, { AxiosResponse } from "axios";
import ApiResponse from "./ApiResponse";

const NO_CONTENT_204 = 204;
const SERVER_ERROR_500 = 500;

type Props = {
  gameCode: string;
};

const validateGame: ({ gameCode }: Props) => Promise<ApiResponse<{}>> = async ({
  gameCode,
}: Props) => {
  const url = "/game/validate";

  try {
    const res = await axios.get<any, AxiosResponse<{}>>(url, {
      params: { gameCode },
    });

    // Success
    if (res.status === NO_CONTENT_204) {
      return {
        success: true,
        status: res.status,
      };
    }
    return {
      success: false,
      status: SERVER_ERROR_500,
      error: `Unexpected status code: ${res.status}. Data: ${res.data}`,
    };
  } catch (err) {
    // Error
    if (err.response) {
      /*
       * The request was made and the server responded with a
       * status code that falls out of the range of 2xx
       */
      return {
        success: false,
        status: err.response.status,
        error: err.response.data,
      };
    }
    if (err.request) {
      /*
       * The request was made but no response was received, `error.request`
       * is an instance of XMLHttpRequest in the browser and an instance
       * of http.ClientRequest in Node.js
       */
      return {
        success: false,
        status: SERVER_ERROR_500,
        error: err.request,
      };
    }
    return {
      success: false,
      status: SERVER_ERROR_500,
      error: err.message,
    };
  }
};

export default validateGame;
