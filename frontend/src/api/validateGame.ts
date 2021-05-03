import axios from "axios";
import ApiResponse from "./ApiResponse";

const NO_CONTENT_204 = 204;
const NOT_FOUND_404 = 404;
const SERVER_ERROR_500 = 500;

type Props = {
  gameCode: string;
};

const validateGame: ({
  gameCode,
}: Props) => Promise<ApiResponse<null>> = async ({ gameCode }: Props) => {
  const url = "/game/create";
  const res = await axios.post(url, { gameCode });

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
