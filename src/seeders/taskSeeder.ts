import { TaskPriority, TaskStatus } from "../models/Config";
import { Task } from "../models/Task";

export const seedTasks = async (userId: string) => {
  try {
    const todoStatus = await TaskStatus.findOne({ value: "todo", userId });
    const inProgressStatus = await TaskStatus.findOne({
      value: "inprogress",
      userId,
    });
    const doneStatus = await TaskStatus.findOne({ value: "done", userId });

    const lowPriority = await TaskPriority.findOne({ value: "low", userId });
    const normalPriority = await TaskPriority.findOne({
      value: "normal",
      userId,
    });
    const highPriority = await TaskPriority.findOne({ value: "high", userId });

    if (
      !todoStatus ||
      !inProgressStatus ||
      !doneStatus ||
      !lowPriority ||
      !normalPriority ||
      !highPriority
    ) {
      throw new Error(
        "Required TaskStatus or TaskPriority documents not found",
      );
    }

    const tasks = [
      {
        title: "Dummy todo sample task",
        status: todoStatus._id,
        priority: lowPriority._id,
        userId,
      },
      {
        title: "Dummy inprogress sample task",
        status: inProgressStatus._id,
        priority: normalPriority._id,
        userId,
      },
      {
        title: "Dummy done sample task",
        status: doneStatus._id,
        priority: highPriority._id,
        userId,
      },
    ];

    await Task.insertMany(tasks);
  } catch (error) {
    console.error("Error seeding tasks:", error);
  }
};
