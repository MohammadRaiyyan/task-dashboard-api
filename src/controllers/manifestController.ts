import { Request, Response } from "express";
import { TaskPriority, TaskStatus } from "../models/Config";
import { User } from "../models/User";
import { sendResponse } from "../utils/apiResponse";

export const getManifests = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id;
		const user = await User.findById(userId).select("-password");
		if (!user) {
			sendResponse(res, 401, "User not found");
			return;
		}
		const statuses = await TaskStatus.find({ userId }).select("-userId");
		const priorities = await TaskPriority.find({ userId }).select("-userId");
		sendResponse(res, 200, "", {
			user,
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
