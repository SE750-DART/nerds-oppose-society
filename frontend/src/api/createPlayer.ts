import axios, { AxiosResponse } from "axios";
import ApiResponse from "./ApiResponse";

const CREATED_201 = 201;
// const BAD_REQUEST_400 = 400;
const SERVER_ERROR_500 = 500;

type Props = {
  gameCode: string;
  nickname: string;
};

const createPlayer: (player: Props) => Promise<ApiResponse<string>> = async ({
  gameCode,
  nickname,
}: Props) => {
  const url = "/player/create";

  try {
    const res = await axios.post<any, AxiosResponse<string>>(url, {
      gameCode,
      nickname,
    });

    // Success
    if (res.status === CREATED_201) {
      return {
        success: true,
        status: res.status,
        data: res.data,
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

export default createPlayer;
