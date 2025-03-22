import { AppError } from "@/middleware/errorHandler";
import { Task } from "@/models/Task";
import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import type { TaskEntityType } from "../interfaces/taskInterfaces";
import { TaskPriority, TaskStatus, TaskTag } from "../models/Config";
import { sendResponse } from "../utils/apiResponse";

export const createStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { label, color }: TaskEntityType = req.body;
    const existingStatus = await Task.find({ label });
    if (existingStatus) {
      throw new AppError("Status already exists", 400);
    }
    const status = new TaskStatus({
      label,
      color,
      userId: req.user?.id,
    });
    await status.save();
    sendResponse(res, 201, "Status created successfully", status);
  },
);

export const updateStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { label, color }: TaskEntityType = req.body;
    const existingStatus = await Task.find({ label });
    if (existingStatus) {
      throw new AppError("Status already exists", 400);
    }
    const status = await Task.findByIdAndUpdate(
      id,
      { label, color },
      { new: true },
    );
    if (!status) {
      throw new AppError("Status not found", 404);
    }
    sendResponse(res, 200, "Status updated successfully", status);
  },
);

export const deleteStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const status = await Task.findByIdAndDelete(id);
    if (!status) {
      throw new AppError("Status not found", 404);
    }
    sendResponse(res, 200, "Status deleted successfully");
  },
);

export const createPriority = asyncHandler(
  async (req: Request, res: Response) => {
    const { label, value, color }: TaskEntityType = req.body;
    const existingPriority = await TaskPriority.findOne({ label });
    if (existingPriority) {
      throw new AppError("Priority already exists", 400);
    }
    const priority = new TaskPriority({
      label,
      value,
      color,
      userId: req.user?.id,
    });
    await priority.save();
    sendResponse(res, 201, "Priority created successfully", priority);
  },
);

export const updatePriority = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { label, value, color }: TaskEntityType = req.body;
    const existingPriority = await TaskPriority.findOne({ label });
    if (existingPriority) {
      throw new AppError("Priority already exists", 400);
    }
    const priority = await TaskPriority.findByIdAndUpdate(
      id,
      { label, value, color },
      { new: true },
    );
    if (!priority) {
      throw new AppError("Priority not found", 404);
    }
    sendResponse(res, 200, "Priority updated successfully", priority);
  },
);

export const deletePriority = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const priority = await TaskPriority.findByIdAndDelete(id);
    if (!priority) {
      throw new AppError("Priority not found", 404);
    }
    sendResponse(res, 200, "Priority deleted successfully");
  },
);

export const createTag = asyncHandler(async (req: Request, res: Response) => {
  const { label, value, color }: TaskEntityType = req.body;
  const existingTag = await TaskTag.findOne({ label });
  if (existingTag) {
    throw new AppError("Tag already exists", 400);
  }
  const tag = new TaskTag({
    label,
    value,
    color,
    userId: req.user?.id,
  });
  await tag.save();
  sendResponse(res, 201, "Tag created successfully", tag);
});

export const updateTag = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { label, value, color }: TaskEntityType = req.body;
  const existingTag = await TaskTag.findOne({ label });
  if (existingTag) {
    throw new AppError("Tag already exists", 400);
  }
  const tag = await TaskTag.findByIdAndUpdate(
    id,
    { label, value, color },
    { new: true },
  );
  if (!tag) {
    throw new AppError("Tag not found", 404);
  }
  sendResponse(res, 200, "Tag updated successfully", tag);
});

export const deleteTag = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const tag = await TaskTag.findByIdAndDelete(id);
  if (!tag) {
    throw new AppError("Tag not found", 404);
  }
  sendResponse(res, 200, "Tag deleted successfully");
});

export const getStatuses = asyncHandler(async (req: Request, res: Response) => {
  const statuses = await TaskStatus.find({ userId: req.user?.id });
  sendResponse(res, 200, "", statuses);
});

export const getPriorities = asyncHandler(
  async (req: Request, res: Response) => {
    const priorities = await TaskPriority.find({ userId: req.user?.id });
    sendResponse(res, 200, "", priorities);
  },
);

export const getTags = asyncHandler(async (req: Request, res: Response) => {
  const tags = await TaskTag.find({ userId: req.user?.id });
  sendResponse(res, 200, "", tags);
});
