"use client";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import TaskCard from "./TaskCard";

export default function SearchTasks() {
  const [query, setQuery] = useState("");
  const { tasks } = useTaskStore();

  const results = query.trim().length > 1
    ? tasks.filter((t) =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition-all text-sm shadow-sm"
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>

      {query.trim().length > 1 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-medium">{results.length} result{results.length !== 1 ? "s" : ""} found</p>
          {results.length > 0 ? (
            results.map((task) => <TaskCard key={task.id} task={task} />)
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No tasks found for &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
