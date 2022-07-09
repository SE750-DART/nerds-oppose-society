import axios, { AxiosResponse } from "axios";
import ApiResponse from "./ApiResponse";

export const BASE_URL = "http://localhost:42069";
const SERVER_ERROR_500 = 500;

type Props<Type> = {
  axiosMethod: () => Promise<AxiosResponse<Type>>;
  acceptedCodes: number[];
};

const axiosCall = async <Type>({
  axiosMethod,
  acceptedCodes,
}: Props<Type>): Promise<ApiResponse<Type>> => {
  try {
    const res = await axiosMethod();

    // Success
    if (acceptedCodes.find((code) => code === res.status)) {
      return {
        success: true,
        status: res.status,
        data: res.data,
      };
    }
    return {
      success: false,
      status: SERVER_ERROR_500,
      error: `Unexpected status code: ${res.status}. Data: ${res.data}`,
    };
  } catch (err) {
    // Error
    if (axios.isAxiosError(err)) {
      /*
       * The request was made and the server responded with a
       * status code that falls out of the range of 2xx
       */
      return {
        success: false,
        status: err.response?.status ?? SERVER_ERROR_500,
        error: err.response?.data ?? "Server error, please try again.",
      };
    }
    return {
      success: false,
      status: SERVER_ERROR_500,
      error: "Server error, please try again.",
    };
  }
};

export default axiosCall;
