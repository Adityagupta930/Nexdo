export type Priority = "low" | "medium" | "high";
export type Category = "work" | "personal" | "health" | "learning" | "other";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  weekId: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface Week {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
}
