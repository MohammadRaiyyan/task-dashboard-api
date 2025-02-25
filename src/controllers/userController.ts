import { User } from "@/models/User";
import { sendResponse } from "@/utils/apiResponse";
import { Request, Response } from "express";

export const user = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id;
		const user = await User.findById(userId).select("-password");
		if (!user) {
			sendResponse(res, 401, "User not found");
			return;
		}

		sendResponse(res, 200, "", user);
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 401, error.message);
			return;
		}
		sendResponse(res, 500, "Server error");
	}
};
