"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, LogOut, Loader2, Zap } from "lucide-react";
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

const TAB_META: Record<string, { title: string; subtitle: string; emoji: string }> = {
  tasks:    { title: "Weekly Tasks",    subtitle: "Plan and conquer your week",       emoji: "✅" },
  calendar: { title: "Daily Calendar",  subtitle: "Your week at a glance",            emoji: "📅" },
  focus:    { title: "Focus Timer",     subtitle: "Deep work with Pomodoro",          emoji: "⏱️" },
  habits:   { title: "Habit Tracker",   subtitle: "Build consistency day by day",     emoji: "🔥" },
  mood:     { title: "Mood Tracker",    subtitle: "Log your daily mood",              emoji: "😊" },
  matrix:   { title: "Priority Matrix", subtitle: "Eisenhower method for clarity",    emoji: "📐" },
  goals:    { title: "My Goals",        subtitle: "Set and track long-term goals",    emoji: "🎯" },
  stats:    { title: "Analytics",       subtitle: "Track your productivity",          emoji: "📊" },
  search:   { title: "Search",          subtitle: "Find any task instantly",          emoji: "🔍" },
  notes:    { title: "Week Notes",      subtitle: "Capture ideas and reflections",    emoji: "📝" },
};

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All",      value: "all" },
  { label: "🔴 High",  value: "high" },
  { label: "🟡 Medium",value: "medium" },
  { label: "🟢 Low",   value: "low" },
  { label: "💼 Work",  value: "work" },
  { label: "👤 Personal", value: "personal" },
  { label: "💪 Health",   value: "health" },
  { label: "📚 Learning", value: "learning" },
];

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

  if (authLoading) return (
    <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-3 float-logo">
          <Zap size={22} className="text-white" />
        </div>
        <p className="text-gray-400 text-sm font-medium">Loading Nexdo...</p>
      </div>
    </div>
  );

  if (!user) { router.push("/auth"); return null; }

  const weekTasks = tasks.filter((t) => t.weekId === selectedWeekId);
  const filteredTasks = weekTasks.filter((t) => {
    if (filter === "all") return true;
    return t.priority === filter || t.category === filter;
  });

  const completed = weekTasks.filter((t) => t.completed).length;
  const progress = weekTasks.length > 0 ? (completed / weekTasks.length) * 100 : 0;
  const tab = TAB_META[activeTab];

  return (
    <div className="flex h-screen bg-[#F7F8FC] overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-6 space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-gray-100">
                {tab.emoji}
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900 leading-tight">{tab.title}</h1>
                <p className="text-gray-400 text-xs font-medium">
                  {activeTab === "tasks" ? `${completed} of ${weekTasks.length} completed` : tab.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === "tasks" && (
                <button onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95">
                  <Plus size={15} />
                  <span className="hidden sm:block">New Task</span>
                </button>
              )}
              <button
                onClick={async () => { await supabase.auth.signOut(); router.push("/auth"); }}
                className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-400 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm">
                <LogOut size={15} />
              </button>
            </div>
          </div>

          {/* Quote */}
          {activeTab === "tasks" && <DailyQuote />}

          {/* Week selector */}
          {(activeTab === "tasks" || activeTab === "calendar" || activeTab === "notes") && (
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
              <WeekSelector />
              {activeTab === "tasks" && weekTasks.length > 0 && (
                <div className="hidden md:flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-400 rounded-full transition-all duration-700"
                      style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-xs font-bold text-teal-500">{Math.round(progress)}%</span>
                </div>
              )}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === "tasks" && (
            <div className="space-y-3 slide-up">
              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                {FILTERS.map((f) => (
                  <button key={f.value} onClick={() => setFilter(f.value)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all border ${
                      filter === f.value
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-500 border-gray-100 hover:border-gray-300 hover:text-gray-900"
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 size={24} className="text-teal-400 animate-spin" />
                </div>
              ) : filteredTasks.length > 0 ? (
                <div className="space-y-2">
                  {filteredTasks.filter((t) => !t.completed).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {filteredTasks.filter((t) => t.completed).length > 0 && (
                    <>
                      <div className="flex items-center gap-3 py-1">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Completed</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                      {filteredTasks.filter((t) => t.completed).map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 slide-up">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm border border-gray-100">📋</div>
                  <p className="font-black text-gray-900 text-lg">Nothing here yet</p>
                  <p className="text-gray-400 text-sm mt-1 mb-5">Add your first task and start crushing it!</p>
                  <button onClick={() => setShowModal(true)}
                    className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-sm">
                    + Add Task
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "calendar" && <div className="slide-up"><DailyView /></div>}
          {activeTab === "focus"    && <div className="slide-up"><FocusTimer /></div>}
          {activeTab === "habits"   && <div className="slide-up"><HabitTracker /></div>}
          {activeTab === "mood"     && <div className="slide-up"><MoodTracker /></div>}
          {activeTab === "matrix"   && <div className="slide-up"><PriorityMatrix /></div>}
          {activeTab === "goals"    && <div className="slide-up"><Goals /></div>}
          {activeTab === "stats"    && <div className="slide-up"><StatsGraph /></div>}
          {activeTab === "search"   && <div className="slide-up"><SearchTasks /></div>}
          {activeTab === "notes"    && <div className="slide-up"><QuickNotes /></div>}
        </div>
      </main>

      {showModal && <AddTaskModal onClose={() => setShowModal(false)} defaultWeekId={selectedWeekId} />}
    </div>
  );
}
