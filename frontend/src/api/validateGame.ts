import axios, { AxiosResponse } from "axios";
import ApiResponse from "./ApiResponse";
import axiosCall from "./axiosCall";

// Expected status codes
const NO_CONTENT_204 = 204;
// const SERVER_ERROR_500 = 500;

type Props = {
  gameCode: string;
};

const validateGame: ({ gameCode }: Props) => Promise<ApiResponse<{}>> = async ({
  gameCode,
}: Props) => {
  const url = "/game/validate";
  const axiosMethod = async () =>
    axios.get<any, AxiosResponse<{}>>(url, {
      params: { gameCode },
    });
  const acceptedCodes = [NO_CONTENT_204];

  return axiosCall<{}>({ axiosMethod, acceptedCodes });
};

export default validateGame;
