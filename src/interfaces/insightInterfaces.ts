import type { Task } from "./taskInterfaces";

export type TaskBreakdown = {
  title: string;
  count: number;
};

export type Insights = {
  totalTasks: number;
  taskBreakdown: TaskBreakdown[];
};
export type Insight = {
  recentTasks: Task[];
  insights: Insights;
};
