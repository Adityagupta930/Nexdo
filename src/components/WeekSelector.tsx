"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { getWeekFromId, getWeeksRange, getCurrentWeekId } from "@/lib/utils";
import { addWeeks } from "date-fns";

export default function WeekSelector() {
  const { selectedWeekId, setSelectedWeek } = useTaskStore();

  const navigate = (dir: number) => {
    const current = getWeekFromId(selectedWeekId);
    const newDate = addWeeks(new Date(current.startDate), dir);
    const weeks = getWeeksRange(20);
    const found = weeks.find((w) => {
      const s = new Date(w.startDate);
      return s <= newDate && newDate <= new Date(w.endDate);
    });
    if (found) setSelectedWeek(found.id);
  };

  const week = getWeekFromId(selectedWeekId);
  const isCurrentWeek = selectedWeekId === getCurrentWeekId();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate(-1)}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="text-center min-w-[180px]">
        <p className="text-white font-semibold text-sm">{week.label}</p>
        {isCurrentWeek && (
          <span className="text-xs text-indigo-400 font-medium">Current Week</span>
        )}
      </div>

      <button
        onClick={() => navigate(1)}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
      >
        <ChevronRight size={16} />
      </button>

      {!isCurrentWeek && (
        <button
          onClick={() => setSelectedWeek(getCurrentWeekId())}
          className="text-xs text-indigo-400 hover:text-indigo-300 underline transition-colors"
        >
          Today
        </button>
      )}
    </div>
  );
}
