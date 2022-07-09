import axios, { AxiosResponse } from "axios";
import ApiResponse from "./ApiResponse";
import axiosCall from "./axiosCall";

const CREATED_201 = 201;

/**
 * Expected status codes:
 * 201 - Game Created Successfully,
 * 500 - Server Error
 */
const createGame: () => Promise<ApiResponse<string>> = async () => {
  const url = `/api/game/create`;
  const axiosMethod = async () =>
    axios.post<unknown, AxiosResponse<string>>(url);
  const acceptedCodes = [CREATED_201];

  return axiosCall<string>({ axiosMethod, acceptedCodes });
};

export default createGame;
