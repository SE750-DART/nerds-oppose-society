import axios, { AxiosResponse } from "axios";
import ApiResponse from "./ApiResponse";

const CREATED_201 = 201;
const BAD_REQUEST_400 = 400;
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
  const res = await axios.post<any, AxiosResponse<string>>(url, {
    gameCode,
    nickname,
  });

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
