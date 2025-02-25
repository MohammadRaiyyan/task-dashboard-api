import { Request, Response } from "express";
import { TaskPriority, TaskStatus } from "../models/Config";
import { sendResponse } from "../utils/apiResponse";

export const getManifests = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id;
		const statuses = await TaskStatus.find({ userId }).select("-userId");
		const priorities = await TaskPriority.find({ userId }).select("-userId");
		sendResponse(res, 200, "", {
			statuses,
			priorities,
		});
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 400, error.message);
			return;
		}
		sendResponse(res, 500, "Server error");
	}
};
