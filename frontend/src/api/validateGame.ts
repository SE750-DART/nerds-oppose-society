import axios, { AxiosResponse } from "axios";
import ApiResponse from "./ApiResponse";

const NO_CONTENT_204 = 204;
const NOT_FOUND_404 = 404;
const SERVER_ERROR_500 = 500;

type Props = {
  gameCode: string;
};

const validateGame: ({ gameCode }: Props) => Promise<ApiResponse<{}>> = async ({
  gameCode,
}: Props) => {
  const url = "/game/validate";
  const res = await axios.get<any, AxiosResponse<string>>(url, {
    params: { gameCode },
  });

  switch (res.status) {
    case NO_CONTENT_204:
      return {
        success: true,
      };
    case NOT_FOUND_404:
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

export default validateGame;
