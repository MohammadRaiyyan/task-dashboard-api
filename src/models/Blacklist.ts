import mongoose from "mongoose";

const BlacklistSchema = new mongoose.Schema({
	token: { type: String, required: true, unique: true },
	createdAt: { type: Date, default: Date.now, expires: "1h" },
});

export const Blacklist = mongoose.model("Blacklist", BlacklistSchema);
