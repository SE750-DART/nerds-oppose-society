import axios, { AxiosResponse } from "axios";
import ApiResponse from "./ApiResponse";
import axiosCall, { BASE_URL } from "./axiosCall";

// Expected status codes
const CREATED_201 = 201;
// const BAD_REQUEST_400 = 400;
// const SERVER_ERROR_500 = 500;

type Props = {
  gameCode: string;
  nickname: string;
};

const createPlayer: (player: Props) => Promise<ApiResponse<string>> = async ({
  gameCode,
  nickname,
}: Props) => {
  const url = `${BASE_URL}/player/create`;
  const axiosMethod = async () =>
    axios.post<any, AxiosResponse<string>>(url, undefined, {
      params: {
        gameCode,
        nickname,
      },
    });
  const acceptedCodes = [CREATED_201];

  return axiosCall<string>({ axiosMethod, acceptedCodes });
};

export default createPlayer;
