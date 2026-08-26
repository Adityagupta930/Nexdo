import { format, startOfWeek, endOfWeek, addWeeks, getISOWeek, getYear } from "date-fns";
import { Week } from "@/types";

export function getWeekId(date: Date): string {
  const week = getISOWeek(date);
  const year = getYear(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function getWeekFromId(weekId: string): Week {
  const [year, weekPart] = weekId.split("-W");
  const weekNum = parseInt(weekPart);
  const jan4 = new Date(parseInt(year), 0, 4);
  const startOfYear = startOfWeek(jan4, { weekStartsOn: 1 });
  const start = addWeeks(startOfYear, weekNum - 1);
  const end = endOfWeek(start, { weekStartsOn: 1 });
  return {
    id: weekId,
    label: `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

export function getCurrentWeekId(): string {
  return getWeekId(new Date());
}

export function getWeeksRange(count = 8): Week[] {
  const weeks: Week[] = [];
  const now = new Date();
  for (let i = -(count / 2); i < count / 2; i++) {
    const date = addWeeks(now, i);
    const id = getWeekId(date);
    weeks.push(getWeekFromId(id));
  }
  return weeks;
}

export const CATEGORY_COLORS: Record<string, string> = {
  work: "#6366f1",
  personal: "#f59e0b",
  health: "#10b981",
  learning: "#3b82f6",
  other: "#8b5cf6",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
};
