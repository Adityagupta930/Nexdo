"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Filter, LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTaskStore } from "@/store/taskStore";
import Sidebar from "@/components/Sidebar";
import WeekSelector from "@/components/WeekSelector";
import TaskCard from "@/components/TaskCard";
import DailyView from "@/components/DailyView";
import StatsGraph from "@/components/StatsGraph";
import Goals from "@/components/Goals";
import FocusTimer from "@/components/FocusTimer";
import QuickNotes from "@/components/QuickNotes";
import SearchTasks from "@/components/SearchTasks";
import AddTaskModal from "@/components/AddTaskModal";
import DailyQuote from "@/components/DailyQuote";
import HabitTracker from "@/components/HabitTracker";
import MoodTracker from "@/components/MoodTracker";
import PriorityMatrix from "@/components/PriorityMatrix";
import { Priority, Category } from "@/types";
import type { User } from "@supabase/supabase-js";
import { scheduleAllReminders, requestNotificationPermission } from "@/lib/notifications";

type FilterType = "all" | Priority | Category;

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  tasks: { title: "Weekly Tasks", subtitle: "" },
  calendar: { title: "Daily Calendar", subtitle: "Your week at a glance" },
  focus: { title: "Focus Timer", subtitle: "Stay in the zone with Pomodoro" },
  habits: { title: "Habit Tracker", subtitle: "Build consistency day by day" },
  mood: { title: "Mood Tracker", subtitle: "Log and visualize your daily mood" },
  matrix: { title: "Priority Matrix", subtitle: "Eisenhower method to prioritize tasks" },
  goals: { title: "My Goals", subtitle: "Set and track long-term goals" },
  stats: { title: "Analytics", subtitle: "Track your productivity over time" },
  search: { title: "Search", subtitle: "Find any task instantly" },
  notes: { title: "Week Notes", subtitle: "Capture ideas and reflections" },
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const router = useRouter();

  const { selectedWeekId, tasks, fetchTasks, loading, generateRecurringTasks } = useTaskStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) {
        fetchTasks().then(() => {
          generateRecurringTasks();
          requestNotificationPermission().then((granted) => {
            if (granted) scheduleAllReminders(useTaskStore.getState().tasks);
          });
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) fetchTasks();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/auth");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="text-indigo-500 animate-spin" />
      </div>
    );
  }

  const weekTasks = tasks.filter((t) => t.weekId === selectedWeekId);
  const filteredTasks = weekTasks.filter((t) => {
    if (filter === "all") return true;
    return t.priority === filter || t.category === filter;
  });

  const completed = weekTasks.filter((t) => t.completed).length;
  const progress = weekTasks.length > 0 ? (completed / weekTasks.length) * 100 : 0;
  const tab = TAB_TITLES[activeTab];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{tab.title}</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {activeTab === "tasks"
                  ? `${completed}/${weekTasks.length} tasks completed this week`
                  : tab.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === "tasks" && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md shadow-indigo-200 hover:shadow-lg active:scale-95"
                >
                  <Plus size={16} />
                  Add Task
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="p-2.5 rounded-xl bg-white border border-gray-100 hover:bg-red-50 hover:border-red-100 text-gray-400 hover:text-red-400 transition-all shadow-sm"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Daily Quote - only on tasks tab */}
          {activeTab === "tasks" && <DailyQuote />}

          {/* Week Selector */}
          {(activeTab === "tasks" || activeTab === "calendar" || activeTab === "notes") && (
            <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
              <WeekSelector />
              {activeTab === "tasks" && weekTasks.length > 0 && (
                <div className="hidden md:flex items-center gap-3">
                  <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{Math.round(progress)}%</span>
                </div>
              )}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {(["all", "high", "medium", "low", "work", "personal", "health", "learning"] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize ${
                      filter === f
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                        : "bg-white text-gray-400 border border-gray-100 hover:text-indigo-600 hover:border-indigo-200"
                    }`}
                  >
                    {f === "all" ? "All" : f}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="text-indigo-500 animate-spin" />
                </div>
              ) : filteredTasks.length > 0 ? (
                <div className="space-y-2">
                  {filteredTasks.filter((t) => !t.completed).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {filteredTasks.filter((t) => t.completed).length > 0 && (
                    <>
                      <p className="text-xs text-gray-400 font-medium pt-2 pb-1">✅ Completed</p>
                      {filteredTasks.filter((t) => t.completed).map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Filter size={24} className="text-indigo-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No tasks this week</p>
                  <p className="text-gray-400 text-sm mt-1">Click &quot;Add Task&quot; to get started</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "calendar" && <DailyView />}
          {activeTab === "focus" && <FocusTimer />}
          {activeTab === "habits" && <HabitTracker />}
          {activeTab === "mood" && <MoodTracker />}
          {activeTab === "matrix" && <PriorityMatrix />}
          {activeTab === "goals" && <Goals />}
          {activeTab === "stats" && <StatsGraph />}
          {activeTab === "search" && <SearchTasks />}
          {activeTab === "notes" && <QuickNotes />}
        </div>
      </main>

      {showModal && (
        <AddTaskModal onClose={() => setShowModal(false)} defaultWeekId={selectedWeekId} />
      )}
    </div>
  );
}
