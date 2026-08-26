"use client";
import { Trash2, CheckCircle2, Circle } from "lucide-react";
import { Task } from "@/types";
import { useTaskStore } from "@/store/taskStore";
import { CATEGORY_COLORS, PRIORITY_COLORS } from "@/lib/utils";
import { format } from "date-fns";

export default function TaskCard({ task }: { task: Task }) {
  const { toggleTask, deleteTask } = useTaskStore();

  return (
    <div
      className={`group flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
        task.completed
          ? "bg-white/3 border-white/5 opacity-60"
          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8"
      }`}
    >
      <button onClick={() => toggleTask(task.id)} className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110">
        {task.completed ? (
          <CheckCircle2 size={20} className="text-indigo-400" />
        ) : (
          <Circle size={20} className="text-gray-500 hover:text-indigo-400 transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${task.completed ? "line-through text-gray-500" : "text-white"}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: CATEGORY_COLORS[task.category] + "22", color: CATEGORY_COLORS[task.category] }}
          >
            {task.category}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: PRIORITY_COLORS[task.priority] + "22", color: PRIORITY_COLORS[task.priority] }}
          >
            {task.priority}
          </span>
          <span className="text-xs text-gray-600">
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        </div>
      </div>

      <button
        onClick={() => deleteTask(task.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all flex-shrink-0"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
