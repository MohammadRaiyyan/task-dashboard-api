import { User } from "./authInterfaces";
import { TaskPriorityType, TaskStatusType } from "./taskInterfaces";

export type ManifestType = {
	user: Omit<User, "password">;
	taskStatuses: TaskStatusType[];
	taskPriorities: TaskPriorityType[];
};
