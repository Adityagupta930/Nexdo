"use client";
import { useTaskStore } from "@/store/taskStore";
import { getWeekFromId } from "@/lib/utils";
import { format, eachDayOfInterval } from "date-fns";
import TaskCard from "./TaskCard";

export default function DailyView() {
  const { selectedWeekId, tasks } = useTaskStore();
  const week = getWeekFromId(selectedWeekId);
  const days = eachDayOfInterval({ start: new Date(week.startDate), end: new Date(week.endDate) });

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
      {days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayTasks = tasks.filter(
          (t) => t.weekId === selectedWeekId && t.dueDate.startsWith(dateStr)
        );
        const isToday = format(new Date(), "yyyy-MM-dd") === dateStr;

        return (
          <div
            key={dateStr}
            className={`rounded-xl p-3 border min-h-[120px] ${
              isToday ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/8 bg-white/3"
            }`}
          >
            <div className="mb-2">
              <p className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-indigo-400" : "text-gray-500"}`}>
                {format(day, "EEE")}
              </p>
              <p className={`text-lg font-bold ${isToday ? "text-white" : "text-gray-400"}`}>
                {format(day, "d")}
              </p>
            </div>
            <div className="space-y-1.5">
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`text-xs p-2 rounded-lg truncate cursor-default ${
                    task.completed ? "line-through text-gray-600 bg-white/3" : "text-white bg-white/8"
                  }`}
                  title={task.title}
                >
                  {task.title}
                </div>
              ))}
              {dayTasks.length === 0 && (
                <p className="text-xs text-gray-700 italic">No tasks</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
