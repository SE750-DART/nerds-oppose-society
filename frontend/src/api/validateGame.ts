import axios, { AxiosResponse } from "axios";
import ApiResponse from "./ApiResponse";
import axiosCall, { BASE_URL } from "./axiosCall";

const NO_CONTENT_204 = 204;

type Props = {
  gameCode: string;
};

/**
 * Expected status codes:
 * 204 - Valid Game Code,
 * 404 - Invalid Game Code,
 * 500 - Server Error
 * @param gameCode - game code to validate
 */
const validateGame: ({ gameCode }: Props) => Promise<ApiResponse<{}>> = async ({
  gameCode,
}: Props) => {
  // Check that game code is a number
  if (!gameCode.match(/^\d+$/)) {
    return {
      success: false,
      status: 400,
      error: "Game code must be a number",
    };
  }

  const url = `${BASE_URL}/game/validate`;
  const axiosMethod = async () =>
    axios.get<any, AxiosResponse<{}>>(url, {
      params: { gameCode },
    });
  const acceptedCodes = [NO_CONTENT_204];

  return axiosCall<{}>({ axiosMethod, acceptedCodes });
};

export default validateGame;
