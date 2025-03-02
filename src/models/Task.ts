import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String, default: null },
		status: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "TaskStatus",
			default: null,
		},
		priority: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "TaskPriority",
			default: null,
		},
		dueOn: { type: Date, default: null },
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		parentTask: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Task",
			default: null,
		},
		subTasks: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Task",
			},
		],
	},
	{ timestamps: true },
);

export const Task = mongoose.model("Task", TaskSchema);
