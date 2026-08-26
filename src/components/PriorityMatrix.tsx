"use client";
import { useTaskStore } from "@/store/taskStore";
import { CheckCircle2, Circle } from "lucide-react";

const QUADRANTS = [
  { id: "do", label: "Do First", desc: "Urgent & Important", color: "border-red-200 bg-red-50", badge: "bg-red-100 text-red-600", dot: "bg-red-500" },
  { id: "schedule", label: "Schedule", desc: "Not Urgent & Important", color: "border-indigo-200 bg-indigo-50", badge: "bg-indigo-100 text-indigo-600", dot: "bg-indigo-500" },
  { id: "delegate", label: "Delegate", desc: "Urgent & Not Important", color: "border-amber-200 bg-amber-50", badge: "bg-amber-100 text-amber-600", dot: "bg-amber-500" },
  { id: "eliminate", label: "Eliminate", desc: "Not Urgent & Not Important", color: "border-gray-200 bg-gray-50", badge: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
];

function getQuadrant(priority: string, category: string): string {
  if (priority === "high") return "do";
  if (priority === "medium" && ["work", "learning"].includes(category)) return "schedule";
  if (priority === "medium") return "delegate";
  return "eliminate";
}

export default function PriorityMatrix() {
  const { tasks, toggleTask, selectedWeekId } = useTaskStore();
  const weekTasks = tasks.filter((t) => t.weekId === selectedWeekId && !t.completed);

  return (
    <div className="space-y-4">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
        <p className="text-xs text-indigo-600 font-semibold">📐 Eisenhower Matrix</p>
        <p className="text-xs text-gray-500 mt-0.5">Tasks auto-sorted by priority & category. High = Do First, Medium Work/Learning = Schedule, Medium Others = Delegate, Low = Eliminate.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUADRANTS.map((q) => {
          const qTasks = weekTasks.filter((t) => getQuadrant(t.priority, t.category) === q.id);
          return (
            <div key={q.id} className={`border-2 rounded-xl p-4 ${q.color} min-h-[160px]`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${q.dot}`} />
                <div>
                  <p className="text-sm font-bold text-gray-700">{q.label}</p>
                  <p className="text-xs text-gray-400">{q.desc}</p>
                </div>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${q.badge}`}>
                  {qTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {qTasks.length === 0 && (
                  <p className="text-xs text-gray-400 italic text-center py-4">No tasks here</p>
                )}
                {qTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2 border border-white">
                    <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                      <Circle size={15} className="text-gray-300 hover:text-indigo-400 transition-colors" />
                    </button>
                    <span className="text-xs text-gray-700 truncate font-medium">{task.title}</span>
                    <span className="ml-auto text-xs">{task.category === "work" ? "💼" : task.category === "health" ? "💪" : task.category === "learning" ? "📚" : "👤"}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
