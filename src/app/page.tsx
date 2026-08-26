"use client";
import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import Sidebar from "@/components/Sidebar";
import WeekSelector from "@/components/WeekSelector";
import TaskCard from "@/components/TaskCard";
import DailyView from "@/components/DailyView";
import StatsGraph from "@/components/StatsGraph";
import AddTaskModal from "@/components/AddTaskModal";
import { Priority, Category } from "@/types";

type FilterType = "all" | Priority | Category;

export default function Home() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const { selectedWeekId, tasks } = useTaskStore();

  const weekTasks = tasks.filter((t) => t.weekId === selectedWeekId);
  const filteredTasks = weekTasks.filter((t) => {
    if (filter === "all") return true;
    return t.priority === filter || t.category === filter;
  });

  const completed = weekTasks.filter((t) => t.completed).length;
  const progress = weekTasks.length > 0 ? (completed / weekTasks.length) * 100 : 0;

  return (
    <div className="flex h-screen bg-[#0d0d1a] text-white overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {activeTab === "tasks" && "Weekly Tasks"}
                {activeTab === "calendar" && "Daily Calendar"}
                {activeTab === "stats" && "Analytics"}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {activeTab === "tasks" && `${completed}/${weekTasks.length} tasks completed`}
                {activeTab === "calendar" && "Your week at a glance"}
                {activeTab === "stats" && "Track your productivity"}
              </p>
            </div>
            {activeTab === "tasks" && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
              >
                <Plus size={16} />
                Add Task
              </button>
            )}
          </div>

          {/* Week Selector */}
          {(activeTab === "tasks" || activeTab === "calendar") && (
            <div className="flex items-center justify-between bg-white/3 border border-white/8 rounded-xl px-4 py-3">
              <WeekSelector />
              {activeTab === "tasks" && weekTasks.length > 0 && (
                <div className="hidden md:flex items-center gap-3">
                  <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
                </div>
              )}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                {(["all", "high", "medium", "low", "work", "personal", "health", "learning"] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize ${
                      filter === f
                        ? "bg-indigo-600 text-white"
                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {f === "all" ? "All" : f}
                  </button>
                ))}
              </div>

              {/* Task List */}
              {filteredTasks.length > 0 ? (
                <div className="space-y-2">
                  {/* Pending */}
                  {filteredTasks.filter((t) => !t.completed).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {/* Completed */}
                  {filteredTasks.filter((t) => t.completed).length > 0 && (
                    <>
                      <p className="text-xs text-gray-600 font-medium pt-2 pb-1">Completed</p>
                      {filteredTasks.filter((t) => t.completed).map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Filter size={24} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500 font-medium">No tasks this week</p>
                  <p className="text-gray-700 text-sm mt-1">Click &quot;Add Task&quot; to get started</p>
                </div>
              )}
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === "calendar" && <DailyView />}

          {/* Stats Tab */}
          {activeTab === "stats" && <StatsGraph />}
        </div>
      </main>

      {showModal && (
        <AddTaskModal onClose={() => setShowModal(false)} defaultWeekId={selectedWeekId} />
      )}
    </div>
  );
}
