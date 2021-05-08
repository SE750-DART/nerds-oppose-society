import axios, { AxiosResponse } from "axios";
import ApiResponse from "./ApiResponse";
import axiosCall, { BASE_URL } from "./axiosCall";

const CREATED_201 = 201;

type Props = {
  gameCode: string;
  nickname: string;
};

export type Response = {
  playerId: string;
  token: string;
};

/**
 * Expected status codes:
 * 201 - Player Created Successfully,
 * 400 - Bad Request,
 * 500 - Server Error
 * @param gameCode - code of the game the player will be added to
 * @param nickname - nickname of the new player
 */
const createPlayer: (player: Props) => Promise<ApiResponse<Response>> = async ({
  gameCode,
  nickname,
}: Props) => {
  // Check that game code is a number
  if (!gameCode.match(/^\d+$/)) {
    return {
      success: false,
      status: 400,
      error: "Game code must be a number",
    };
  }

  const url = `${BASE_URL}/player/create`;
  const axiosMethod = async () =>
    axios.post<any, AxiosResponse<Response>>(url, undefined, {
      params: {
        gameCode,
        nickname,
      },
    });
  const acceptedCodes = [CREATED_201];

  return axiosCall<Response>({ axiosMethod, acceptedCodes });
};

export default createPlayer;
