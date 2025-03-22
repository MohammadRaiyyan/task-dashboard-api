import mongoose from "mongoose";

const TaskEntitySchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    color: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const TaskStatus = mongoose.model("TaskStatus", TaskEntitySchema);
export const TaskPriority = mongoose.model("TaskPriority", TaskEntitySchema);
export const TaskTag = mongoose.model("TaskTag", TaskEntitySchema);
