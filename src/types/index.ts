export type Priority = "low" | "medium" | "high";
export type Category = "work" | "personal" | "health" | "learning" | "other";
export type RecurrenceType = "daily" | "weekly" | "monthly";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  weekId: string;
  dueDate: string;
  dueTime?: string;
  reminderMinutes?: number;
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceDays?: number[]; // 0=Sun,1=Mon...6=Sat
  parentTaskId?: string;
  teachingLogId?: string;
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
