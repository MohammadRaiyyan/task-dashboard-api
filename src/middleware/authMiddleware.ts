import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Blacklist } from "../models/Blacklist";
import { sendResponse } from "../utils/apiResponse";

export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const token = req.header("Authorization")?.replace("Bearer ", "");
	if (!token) {
		sendResponse(res, 401, "Unauthorized");
		return;
	}
	try {
		const blackListed = await Blacklist.findOne({ token });
		if (blackListed) {
			sendResponse(res, 401, "Invalid Token");
			return;
		}
		const verified = jwt.verify(token, process.env.JWT_SECRET!);
		req.user = verified as { id: string };
		next();
	} catch (err) {
		sendResponse(res, 401, "Session expired");
	}
};
