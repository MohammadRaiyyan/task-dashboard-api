// src/utils/apiResponse.ts
import type { Response } from "express";
import type { ApiResponse } from "../interfaces/apiResponse";

/**
 * Utility function to send a standardized API response.
 * @param res - Express Response object.
 * @param status - HTTP status code.
 * @param message - Response message.
 * @param data - Optional data payload.
 * @param pagination - Optional pagination metadata.
 */
export const sendResponse = <T>(
  res: Response,
  status: number,
  message: string,
  data?: T,
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean
  },
) => {
  const response: ApiResponse<T> = {
    status,
    message,
    data,
    pagination,
  };
  res.status(status).json(response);
};
