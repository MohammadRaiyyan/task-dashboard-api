import { Request, Response } from "express";

import { Task } from "../models/Task";

import { Insights } from "../interfaces/insightInterfaces";
import { TaskStatus } from "../models/Config";
import { sendResponse } from "../utils/apiResponse";

export const getInsights = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id;
		const totalTasks = await Task.find({ userId }).countDocuments();

		const taskBreakdown = await Task.aggregate([
			{ $match: { userId } },
			{ $group: { _id: "$status", count: { $sum: 1 } } },
			{ $project: { statusId: "$_id", count: 1, _id: 0 } },
		]);

		const statusDetails = await TaskStatus.find({
			_id: { $in: taskBreakdown.map((item) => item.statusId) },
			userId,
		});

		const taskBreakdownWithDetails = taskBreakdown.map((item) => {
			const status = statusDetails.find((s) => s._id.equals(item.statusId));
			return {
				title: status ? status.label : "Unknown",
				count: item.count,
			};
		});

		const recentTasks = await Task.find({ userId })
			.sort({ createdAt: -1 })
			.limit(5)
			.populate("status priority");

		const insights: Insights = {
			totalTasks,
			taskBreakdown: taskBreakdownWithDetails,
		};

		sendResponse(res, 200, "Insights fetched successfully", {
			recentTasks,
			insights,
		});
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 500, error.message);
			return;
		}
		sendResponse(res, 500, "Server error");
	}
};
