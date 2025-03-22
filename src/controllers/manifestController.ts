import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { TaskPriority, TaskStatus } from "../models/Config";
import { User } from "../models/User";
import { sendResponse } from "../utils/apiResponse";

export const getManifests = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const user = await User.findById(userId).select("-password");
    const statuses = await TaskStatus.find({ userId }).select("-userId");
    const priorities = await TaskPriority.find({ userId }).select("-userId");
    sendResponse(res, 200, "", {
      user,
      statuses,
      priorities,
    });
  },
);
