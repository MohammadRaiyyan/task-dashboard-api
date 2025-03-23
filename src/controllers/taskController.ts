import type { Request, Response } from "express";

import asyncHandler from "express-async-handler";
import { AppError } from "../middleware/errorHandler";
import { Task } from "../models/Task";
import { sendResponse } from "../utils/apiResponse";

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { status, priority, createdAt, page, limit, sortBy, search } = req.query;
  const pageNumber = Number.parseInt(page as string) || 1;
  const limitNumber = Number.parseInt(limit as string) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const filters: { [key: string]: string | number | object | undefined } & { $and?: object[] } = {
    userId: req.user?.id,
  };

  if (status && !status.toString().startsWith("All")) {
    const statusDoc = await Task.findOne({ label: status });
    if (statusDoc) {
      const statusFilter = { status: statusDoc._id };
      filters.$and = Array.isArray(filters.$and) ? [...filters.$and, statusFilter] : [statusFilter];
    }
  }

  if (priority && !priority.toString().startsWith("All")) {
    const priorityDoc = await Task.findOne({ label: priority });
    if (priorityDoc) {
      const priorityFilter = { priority: priorityDoc._id };
      filters.$and = Array.isArray(filters.$and) ? [...filters.$and, priorityFilter] : [priorityFilter];
    }
  }

  if (createdAt) {
    const date = new Date(createdAt as string);
    if (!Number.isNaN(date.getTime())) {
      filters.createdAt = { $gte: date };
    }
  }

  if (search) {
    const searchFilter = {
      $or: [
        { title: { $regex: search as string, $options: "i" } },
        { description: { $regex: search as string, $options: "i" } },
      ],
    };
    filters.$and = Array.isArray(filters.$and) ? [...filters.$and, searchFilter] : [searchFilter];
  }

  let sort: { [key: string]: 1 | -1 } = {};
  switch (sortBy) {
    case "Newest":
      sort = { createdAt: -1 };
      break;
    case "Oldest":
      sort = { createdAt: 1 };
      break;
    case "Priority":
      sort = { priority: -1 };
      break;
    case "Due Date":
      sort = { dueOn: 1 };
      break;
    default:
      sort = { createdAt: -1 };
  }

  const tasks = await Task.aggregate([
    { $match: filters },
    { $sort: sort },
    { $skip: skip },
    { $limit: limitNumber },
    {
      $lookup: {
        from: "tasks",
        localField: "_id",
        foreignField: "parentTask",
        as: "subTasks",
      },
    },
    {
      $addFields: {
        subTaskCount: { $size: "$subTasks" },
      },
    },
    {
      $project: {
        description: 0,
        userId: 0,
        parentTask: 0,
        subTasks: 0,
      },
    },
  ]);

  const total = await Task.countDocuments(filters);
  const hasNext = pageNumber * limitNumber < total;

  sendResponse(res, 200, "", tasks, {
    limit: limitNumber,
    page: pageNumber,
    total,
    hasNext,
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

export const getSubTasks = asyncHandler(async (req: Request, res: Response) => {
  const { parentId } = req.params;
  if (!parentId) {
    throw new AppError("Parent task ID is missing", 400);
  }

  const subTasks = await Task.find({ parentTask: parentId })
    .select("-userId -parentTask")
    .populate("status")
    .populate("priority")
    .lean();

  sendResponse(res, 200, "", subTasks);
});
