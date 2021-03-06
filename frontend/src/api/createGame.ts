import axios, { AxiosResponse } from "axios";
import ApiResponse from "./ApiResponse";
import axiosCall, { BASE_URL } from "./axiosCall";

const CREATED_201 = 201;

/**
 * Expected status codes:
 * 201 - Game Created Successfully,
 * 500 - Server Error
 */
const createGame: () => Promise<ApiResponse<string>> = async () => {
  const url = `${BASE_URL}/game/create`;
  const axiosMethod = async () => axios.post<any, AxiosResponse<string>>(url);
  const acceptedCodes = [CREATED_201];

  return axiosCall<string>({ axiosMethod, acceptedCodes });
};

export default createGame;
