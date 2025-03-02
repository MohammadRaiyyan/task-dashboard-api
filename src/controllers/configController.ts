import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { TaskEntityType } from "../interfaces/taskInterfaces";
import { TaskPriority, TaskStatus } from "../models/Config";
import { sendResponse } from "../utils/apiResponse";

export const createStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { label, value, color }: TaskEntityType = req.body;
    const status = new TaskStatus({
      label,
      value,
      color,
      userId: req.user?.id,
    });
    await status.save();
    sendResponse(res, 201, "Status created successfully", status);
  },
);

export const createPriority = asyncHandler(
  async (req: Request, res: Response) => {
    const { label, value, color }: TaskEntityType = req.body;
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
