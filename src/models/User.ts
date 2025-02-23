import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, unique: true, required: true },
		password: { type: String, required: true },
		refreshToken: { type: String },
	},
	{ timestamps: true },
);

export const User = mongoose.model("User", UserSchema);
