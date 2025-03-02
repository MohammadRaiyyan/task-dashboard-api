import { Request, Response } from "express";

import asyncHandler from "express-async-handler";
import { AppError } from "../middleware/errorHandler";
import { Task } from "../models/Task";
import { sendResponse } from "../utils/apiResponse";

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { status, priority, createdAt, page, limit } = req.query;
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
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError("Task id missing");
  }
  const task = await Task.findById(id)
    .select("-userId")
    .populate("parentTask", "title")
    .populate("subTasks");
  sendResponse(res, 200, "", task);
});
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, status, priority, dueOn, parentTask } = req.body;

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
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, status, priority, dueOn } = req.body;

  const task = await Task.findByIdAndUpdate(
    id,
    { title, description, status, priority, dueOn },
    { new: true },
  );
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  sendResponse(res, 200, "Task updated successfully", task);
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const task = await Task.findByIdAndDelete(id);
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  sendResponse(res, 200, "Task deleted successfully");
});
