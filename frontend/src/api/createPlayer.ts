import axios, { AxiosResponse } from "axios";
import ApiResponse from "./ApiResponse";
import axiosCall, { BASE_URL } from "./axiosCall";

const CREATED_201 = 201;

type Props = {
  gameCode: string;
  nickname: string;
};

/**
 * Expected status codes:
 * 201 - Player Created Successfully,
 * 400 - Bad Request,
 * 500 - Server Error
 * @param gameCode - code of the game the player will be added to
 * @param nickname - nickname of the new player
 */
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
