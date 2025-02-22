import { Request, Response } from "express";
import { ManifestType } from "../interfaces/manifestInterface";
import { TaskPriority, TaskStatus } from "../models/Config";
import { User } from "../models/User";
import { sendResponse } from "../utils/apiResponse";

export const getManifests = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id;
		const statuses = await TaskStatus.find({ userId }).select("-userId");
		const priorities = await TaskPriority.find({ userId }).select("-userId");
		const user = await User.findById(userId).select("-password");
		if (!user) {
			sendResponse(res, 404, "User not found");
			return;
		}
		const userObj: ManifestType["user"] = {
			userId: user._id.toString(),
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			createdAt: user.createdAt.toString(),
			updatedAt: user.updatedAt.toString(),
		};
		sendResponse(res, 200, "", {
			user: userObj,
			statuses,
			priorities,
		});
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 500, error.message);
			return;
		}
		sendResponse(res, 500, "Server error");
	}
};
