import axios, { AxiosResponse } from "axios";
import ApiResponse from "./ApiResponse";
import axiosCall from "./axiosCall";

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
  const url = "/player/create";
  const axiosMethod = async () =>
    axios.post<any, AxiosResponse<string>>(url, {
      gameCode,
      nickname,
    });
  const acceptedCodes = [CREATED_201];

  return axiosCall<string>({ axiosMethod, acceptedCodes });
};

export default createPlayer;
