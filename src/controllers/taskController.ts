import { Request, Response } from "express";

import { Task } from "../models/Task";
import { sendResponse } from "../utils/apiResponse";

export const getTasks = async (req: Request, res: Response) => {
	const { status, priority, createdAt, page, limit } = req.query;

	try {
		const pageNumber = parseInt(page as string) || 1;
		const limitNumber = parseInt(limit as string) || 10;
		const skip = (pageNumber - 1) * limitNumber;
		const filters: any = {
			userId: req.user?.id,
		};
		if (status) filters.status = status;
		if (priority) filters.priority = priority;
		if (createdAt) filters.createdAt = { $gte: new Date(createdAt as string) };
		const tasks = await Task.find(filters)
			.select("-description -userId -parentTask -subTasks")
			.skip(skip)
			.limit(limitNumber);

		const total = await Task.countDocuments(filters);
		sendResponse(res, 200, "", tasks, {
			limit: limitNumber,
			page: pageNumber,
			total,
		});
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 400, error.message);
			return;
		}
		sendResponse(res, 500, "Server error");
	}
};

export const getTaskById = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const task = await Task.findById(id)
			.populate("parentTask", "title")
			.populate("subTasks");
		sendResponse(res, 200, "", task);
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 400, error.message);
			return;
		}
		sendResponse(res, 500, "Server error");
	}
};
export const createTask = async (req: Request, res: Response) => {
	const { title, description, status, priority, dueOn, parentTask } = req.body;
	try {
		const newTask = new Task({
			title,
			description,
			status,
			priority,
			dueOn,
			userId: req.user?.id,
			parentTask: parentTask || null,
		});
		await newTask.save();
		if (parentTask) {
			await Task.findByIdAndUpdate(parentTask, {
				$push: { subTasks: newTask._id },
			});
		}

		sendResponse(res, 201, "Task created successfully");
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 400, error.message);
			return;
		}
		sendResponse(res, 500, "Server error");
	}
};

export const updateTask = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { title, description, status, priority, dueOn } = req.body;
	try {
		const task = await Task.findByIdAndUpdate(
			id,
			{ title, description, status, priority, dueOn },
			{ new: true },
		);
		if (!task) {
			sendResponse(res, 404, "Task not found");
			return;
		}
		sendResponse(res, 200, "Task updated successfully", task);
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 400, error.message);
			return;
		}
		sendResponse(res, 500, "Server error");
	}
};

export const deleteTask = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const task = await Task.findByIdAndDelete(id);
		if (!task) {
			sendResponse(res, 404, "Task not found");
			return;
		}
		sendResponse(res, 200, "Task deleted successfully");
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 400, error.message);
			return;
		}
		sendResponse(res, 500, "Server error");
	}
};
