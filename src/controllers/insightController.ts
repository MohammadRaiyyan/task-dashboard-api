import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Insights } from "../interfaces/insightInterfaces";
import { TaskStatus } from "../models/Config";
import { Task } from "../models/Task";
import { sendResponse } from "../utils/apiResponse";

export const getInsights = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const totalTasks = await Task.find({ userId }).countDocuments();
  const taskBreakdown = await Task.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        statusId: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);

  const statusDetails = await TaskStatus.find({
    _id: { $in: taskBreakdown.map((item) => item.statusId) },
    userId: new mongoose.Types.ObjectId(userId),
  });

  const taskBreakdownWithDetails = taskBreakdown.map((item) => {
    const status = statusDetails.find((s) => s._id.equals(item.statusId));
    return {
      title: status ? status.label : "Unknown Status",
      count: item.count,
    };
  });

  const recentTasks = await Task.find({ userId })
    .select("-description -userId -parentTask -subTasks")
    .sort({ createdAt: -1 })
    .limit(5);

  const insights: Insights = {
    totalTasks,
    taskBreakdown: taskBreakdownWithDetails,
  };

  sendResponse(res, 200, "", {
    recentTasks,
    insights,
  });
});
