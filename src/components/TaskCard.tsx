"use client";
import { useState } from "react";
import { Trash2, CheckCircle2, Circle, RefreshCw } from "lucide-react";
import { Task } from "@/types";
import { useTaskStore } from "@/store/taskStore";
import { CATEGORY_COLORS, PRIORITY_COLORS } from "@/lib/utils";
import { format } from "date-fns";

export default function TaskCard({ task }: { task: Task }) {
  const { toggleTask, deleteTask } = useTaskStore();
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const isChild = !!task.parentTaskId;

  const priorityBorder: Record<string, string> = {
    high: "border-l-red-400",
    medium: "border-l-amber-400",
    low: "border-l-green-400",
  };

  return (
    <div className={`group relative flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-gray-100 border-l-4 hover:shadow-md hover:shadow-gray-100 hover:-translate-y-0.5 transition-all duration-200 slide-up ${
      task.completed ? "opacity-50" : priorityBorder[task.priority]
    }`}>

      {/* Check */}
      <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 hover:scale-110 transition-transform">
        {task.completed
          ? <CheckCircle2 size={20} className="text-teal-400" />
          : <Circle size={20} className="text-gray-200 hover:text-teal-400 transition-colors" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`font-semibold text-sm ${task.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
            {task.title}
          </p>
          {(task.isRecurring || isChild) && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-500">
              <RefreshCw size={8} />
              {task.isRecurring ? task.recurrenceType : "recurring"}
            </span>
          )}
        </div>
        {task.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
        )}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: CATEGORY_COLORS[task.category] + "18", color: CATEGORY_COLORS[task.category] }}>
            {task.category}
          </span>
          <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
            {format(new Date(task.dueDate), "MMM d")}
          </span>
          {task.dueTime && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-400">
              ⏰ {task.dueTime}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <div className="relative flex-shrink-0">
        {showDeleteMenu && isChild && (
          <div className="absolute right-0 top-7 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 z-20 w-44 space-y-0.5 pop-in">
            <button onClick={() => { deleteTask(task.id, false); setShowDeleteMenu(false); }}
              className="w-full text-left text-xs px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
              Delete this only
            </button>
            <button onClick={() => { deleteTask(task.id, true); setShowDeleteMenu(false); }}
              className="w-full text-left text-xs px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-500 font-medium">
              Delete all recurring
            </button>
            <button onClick={() => setShowDeleteMenu(false)}
              className="w-full text-left text-xs px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-400">
              Cancel
            </button>
          </div>
        )}
        <button
          onClick={() => isChild ? setShowDeleteMenu(!showDeleteMenu) : deleteTask(task.id, false)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
