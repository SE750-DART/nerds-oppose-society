import axios from "axios";
import ApiResponse from "./ApiResponse";

const CREATED_201 = 201;
const BAD_REQUEST_400 = 400;
const SERVER_ERROR_500 = 500;

const createPlayer: (
  gameCode: string,
  nickname: string
) => Promise<ApiResponse<string>> = async (
  gameCode: string,
  nickname: string
) => {
  const url = "/game/create";
  const res = await axios.post(url, { gameCode, nickname });

  switch (res.status) {
    case CREATED_201:
      return {
        success: true,
        data: res.data,
      };
    case BAD_REQUEST_400:
      return {
        success: false,
        error: res.data,
      };
    case SERVER_ERROR_500:
      return {
        success: false,
        error: res.data,
      };
    default:
      return {
        success: false,
        error: `Unexpected status code: ${res.status}. Data: ${res.data}`,
      };
  }
};

export default createPlayer;
