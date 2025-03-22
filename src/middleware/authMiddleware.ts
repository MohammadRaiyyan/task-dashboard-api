import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { sendResponse } from "../utils/apiResponse";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    sendResponse(res, 401, "Unauthorized");
    return;
  }

  try {
    if (!process.env.JWT_SECRET) {
      sendResponse(res, 500, "Missing environment variables");
      return;
    }
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET) as {
      id: string;
    };

    const user = await User.findById(decoded.id);
    if (!user) {
      sendResponse(res, 401, "User not found");
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendResponse(res, 401, "Session expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      sendResponse(res, 401, "Invalid accessToken");
    } else {
      sendResponse(res, 500, "Server error");
    }
  }
};
