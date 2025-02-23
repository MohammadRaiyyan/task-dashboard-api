import { TaskPriorityType, TaskStatusType } from "../interfaces/taskInterfaces";

export const seedTaskStatus = (userId: string): TaskStatusType[] => {
	return [
		{ label: "Todo", value: "todo", color: "#FAFAFA", userId },
		{ label: "Inprogress", value: "inprogress", color: "#EEBC28", userId },
		{ label: "Done", value: "done", color: "#0C9500", userId },
	];
};

export const seedTaskPriority = (userId: string): TaskPriorityType[] => {
	return [
		{ label: "Low", value: "low", color: "#FAFAFA", userId },
		{ label: "Normal", value: "normal", color: "#07CD98", userId },
		{ label: "High", value: "high", color: "#CD0707", userId },
	];
};
