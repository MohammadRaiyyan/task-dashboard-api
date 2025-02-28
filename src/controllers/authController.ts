import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { LoginPayload, RegisterPayload } from "../interfaces/authInterfaces";
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

export const register = async (req: Request, res: Response) => {
	const { firstName, lastName, email, password }: RegisterPayload = req.body;
	try {
		if (!firstName || !lastName || !email || !password) {
			sendResponse(
				res,
				400,
				"All fields are required: firstName, lastName, email, password",
			);
			return;
		}
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			sendResponse(res, 400, "User already exists");
			return;
		}

		if (password.length < 8) {
			sendResponse(res, 400, "Password must be at least 8 characters long");
			return;
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
		// Seeding default template
		try {
			await TaskStatus.create(seedTaskStatus(user.id));
			await TaskPriority.create(seedTaskPriority(user.id));
			await seedTasks(user.id);
		} catch (seedError) {
			console.error("Error seeding default data:", seedError);
			await User.findByIdAndDelete(user.id);
			sendResponse(res, 500, "Error creating default data");
			return;
		}
		setRefreshTokenCookie(res, refreshToken);
		setAccessTokenCookie(res, accessToken);
		sendResponse(res, 201, "Account created successfully");
	} catch (error) {
		if (error instanceof Error) {
			console.log("error", error);
			sendResponse(res, 400, error.message);
			return;
		}
		sendResponse(res, 500, "Server error");
	}
};

export const login = async (req: Request, res: Response) => {
	const { email, password }: LoginPayload = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			sendResponse(res, 400, "Invalid credentials");
			return;
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			sendResponse(res, 400, "Invalid credentials");
			return;
		}
		const accessToken = generateAccessToken(user.id);
		const refreshToken = generateRefreshToken(user.id);
		await user.save();
		setRefreshTokenCookie(res, refreshToken);
		setAccessTokenCookie(res, accessToken);
		sendResponse(res, 200, "Logged in successfully");
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 500, error.message);
			return;
		}
		sendResponse(res, 500, "Server error");
	}
};

export const resetPassword = async (req: Request, res: Response) => {
	const { email, currentPassword, newPassword } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			sendResponse(res, 404, "User not found");
			return;
		}
		if (!currentPassword) {
			sendResponse(res, 422, "Current Password is required");
			return;
		}
		if (currentPassword === newPassword) {
			sendResponse(
				res,
				400,
				"New password must be different from the current password",
			);
			return;
		}
		const isCurrentPasswordMatched = await bcrypt.compare(
			currentPassword,
			user.password,
		);
		if (!isCurrentPasswordMatched) {
			sendResponse(res, 400, "Current password does'nt matched");
			return;
		}
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;
		await user.save();
		sendResponse(res, 200, "Password changed successfully");
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 500, error.message);
			return;
		}
		sendResponse(res, 500, "Server error");
	}
};

export const refreshToken = async (req: Request, res: Response) => {
	const refreshToken = req.cookies.refreshToken;

	if (!refreshToken) {
		sendResponse(res, 401, "Refresh token is missing");
		return;
	}

	try {
		const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
			id: string;
		};
		const user = await User.findById(decoded.id);
		if (!user) {
			sendResponse(res, 401, "Session expired");
			return;
		}
		const newToken = generateAccessToken(user.id);
		await user.save();
		setAccessTokenCookie(res, newToken);
		sendResponse(res, 200, "");
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			sendResponse(res, 401, "Refresh token expired");
		} else if (error instanceof jwt.JsonWebTokenError) {
			sendResponse(res, 401, "Invalid refresh token");
		} else {
			sendResponse(res, 500, "Server error");
		}
	}
};

export const logout = async (req: Request, res: Response) => {
	const refreshToken = req.cookies.refreshToken;

	if (!refreshToken) {
		sendResponse(res, 401, "Refresh token is required");
		return;
	}
	try {
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
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 401, error.message);
			return;
		}
		sendResponse(res, 401, "Invalid token");
	}
};
