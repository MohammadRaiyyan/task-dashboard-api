// src/utils/apiResponse.ts
import { Response } from "express";
import { ApiResponse } from "../interfaces/apiResponse";

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
