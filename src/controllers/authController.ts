import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import type {
  LoginPayload,
  RegisterPayload,
} from "../interfaces/authInterfaces";
import { AppError } from "../middleware/errorHandler";
import { TaskPriority, TaskStatus } from "../models/Config";
import { User } from "../models/User";
import {
  seedTaskPriority,
  seedTaskStatus,
} from "../resources/onboardingResources";
import { seedTasks } from "../seeders/taskSeeder";
import { sendResponse } from "../utils/apiResponse";
import {
  generateAccessToken,
  generateRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "../utils/tokenService";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password }: RegisterPayload = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  await user.save();

  try {
    await TaskStatus.create(seedTaskStatus(user.id));
    await TaskPriority.create(seedTaskPriority(user.id));
    await seedTasks(user.id);
  } catch (seedError) {
    await User.findByIdAndDelete(user.id);
    throw new AppError("Error creating default data", 500);
  }
  setRefreshTokenCookie(res, refreshToken);
  setAccessTokenCookie(res, accessToken);
  sendResponse(res, 201, "Account created successfully");
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginPayload = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid credentials", 400);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Password did not matched", 400);
  }
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  await user.save();
  setRefreshTokenCookie(res, refreshToken);
  setAccessTokenCookie(res, accessToken);
  sendResponse(res, 200, "Logged in successfully");
});

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, currentPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    sendResponse(res, 200, "Password changed successfully");
  },
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError("Refresh token is missing", 401);
    }
    if (!process.env.JWT_SECRET) {
      throw new AppError("Missing environment variables", 500);
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET) as {
      id: string;
    };
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const newToken = generateAccessToken(user.id);
    await user.save();
    setAccessTokenCookie(res, newToken);
    sendResponse(res, 200, "");
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  sendResponse(res, 200, "Logged out successfully");
});
