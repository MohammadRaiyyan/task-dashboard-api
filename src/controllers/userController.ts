import type { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { AppError } from "../middleware/errorHandler";
import { User } from "../models/User";
import { sendResponse } from "../utils/apiResponse";

export const user = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError("User not found", 404);
  }
  sendResponse(res, 200, "", user);
});
