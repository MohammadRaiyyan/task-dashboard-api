export type TaskEntityType = {
	label: string;
	value: string;
	color: string;
	userId: string;
};

export type TaskStatusType = TaskEntityType;
export type TaskPriorityType = TaskEntityType;

export type Task = {
	id: string;
	title: string;
	description: string;
	createdAt: string;
	updatedAt: string;
	status: string;
	priority: string;
	dueOn?: string;
	userId: string;
};
