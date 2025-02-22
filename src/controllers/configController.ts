import { Request, Response } from "express";

import { TaskPriority, TaskStatus } from "../models/Config";

import { TaskEntityType } from "../interfaces/taskInterfaces";
import { sendResponse } from "../utils/apiResponse";

export const createStatus = async (req: Request, res: Response) => {
	const { label, value, color }: TaskEntityType = req.body;

	try {
		const status = new TaskStatus({
			label,
			value,
			color,
			userId: req.user?.id,
		});
		await status.save();
		sendResponse(res, 201, "Status created successfully", status);
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 500, error.message);
			return;
		}
		sendResponse(res, 500, "Server error");
	}
};

export const createPriority = async (req: Request, res: Response) => {
	const { label, value, color }: TaskEntityType = req.body;

	try {
		const priority = new TaskPriority({
			label,
			value,
			color,
			userId: req.user?.id,
		});
		await priority.save();
		sendResponse(res, 201, "Priority created successfully", priority);
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 500, error.message);
			return;
		}
		sendResponse(res, 500, "Server error");
	}
};
