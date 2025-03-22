import type { User } from "./authInterfaces";
import type { TaskPriorityType, TaskStatusType } from "./taskInterfaces";

export type ManifestType = {
  user: Omit<User, "password">;
  taskStatuses: TaskStatusType[];
  taskPriorities: TaskPriorityType[];
};
