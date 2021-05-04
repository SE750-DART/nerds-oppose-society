import axios, { AxiosResponse } from "axios";
import ApiResponse from "./ApiResponse";
import axiosCall, { BASE_URL } from "./axiosCall";

// Expected status codes
const CREATED_201 = 201;
// const SERVER_ERROR_500 = 500;

const createGame: () => Promise<ApiResponse<string>> = async () => {
  const url = `${BASE_URL}/game/create`;
  const axiosMethod = async () => axios.post<any, AxiosResponse<string>>(url);
  const acceptedCodes = [CREATED_201];

  return axiosCall<string>({ axiosMethod, acceptedCodes });
};

export default createGame;
