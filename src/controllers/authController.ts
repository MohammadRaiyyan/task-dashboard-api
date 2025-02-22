import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { LoginPayload, RegisterPayload } from "../interfaces/authInterfaces";
import { Blacklist } from "../models/Blacklist";
import { TaskPriority, TaskStatus } from "../models/Config";
import { User } from "../models/User";
import {
	seedTaskPriority,
	seedTaskStatus,
} from "../resources/onboardingResources";
import { seedTasks } from "../seeders/taskSeeder";
import { sendResponse } from "../utils/apiResponse";

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
		await user.save();
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
			expiresIn: "1h",
		});
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

		sendResponse(res, 201, "Account created successfully", { token });
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
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
			expiresIn: "1h",
		});
		sendResponse(res, 200, "Logged in successfully", { token });
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
			sendResponse(res, 400, "User not found");
			return;
		}
		if (!currentPassword) {
			sendResponse(res, 422, "Current Password is required");
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
	const { token } = req.body;

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			id: string;
		};
		const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET!, {
			expiresIn: "1h",
		});
		sendResponse(res, 200, "", { token: newToken });
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 400, error.message);
			return;
		}
		sendResponse(res, 400, "Invalid token");
	}
};

export const logout = async (req: Request, res: Response) => {
	const token = req.header("Authorization")?.replace("Bearer ", "");

	if (!token) {
		sendResponse(res, 400, "Token is required");
		return;
	}
	try {
		const blackListed = new Blacklist({ token });
		await blackListed.save();
		sendResponse(res, 200, "Logged out successfully");
	} catch (error) {
		if (error instanceof Error) {
			sendResponse(res, 500, error.message);
			return;
		}
		sendResponse(res, 500, "Invalid token");
	}
};
