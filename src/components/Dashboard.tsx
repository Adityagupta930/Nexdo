"use client";
import { useState, useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";
import { format } from "date-fns";
import { CheckCircle2, Circle, BookOpen, Flame, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";

const MOODS: Record<number, { emoji: string; label: string }> = {
  5: { emoji: "😄", label: "Great" },
  4: { emoji: "🙂", label: "Good" },
  3: { emoji: "😐", label: "Okay" },
  2: { emoji: "😔", label: "Low" },
  1: { emoji: "😞", label: "Bad" },
};

interface TodaySession {
  id: string;
  topic: string;
  subject: string;
  duration: number;
  batch: string;
  student_response: string;
}

export default function Dashboard() {
  const { tasks, toggleTask } = useTaskStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);

  useEffect(() => {
    supabase
      .from("teaching_logs")
      .select("id, topic, subject, duration, batch, student_response")
      .eq("date", today)
      .then(({ data }) => { if (data) setTodaySessions(data as TodaySession[]); });
  }, [today]);

  const todayTasks = tasks.filter((t) => t.dueDate.startsWith(today));
  const doneTasks = todayTasks.filter((t) => t.completed);
  const pendingTasks = todayTasks.filter((t) => !t.completed);
  const progress = todayTasks.length > 0 ? Math.round((doneTasks.length / todayTasks.length) * 100) : 0;

  let habitsDoneToday = 0, totalHabits = 0;
  try {
    const habits = JSON.parse(localStorage.getItem("nexdo-habits") || "[]");
    totalHabits = habits.length;
    habitsDoneToday = habits.filter((h: { logs: string[] }) => h.logs.includes(today)).length;
  } catch {}

  let todayMood: number | null = null;
  try {
    const moods = JSON.parse(localStorage.getItem("nexdo-moods") || "{}");
    todayMood = moods[today] ?? null;
  } catch {}

  let checklistDone = 0, checklistTotal = 0, checklistPct = 0;
  try {
    const items = JSON.parse(localStorage.getItem("nexdo-checklist-items") || "[]");
    const clogs = JSON.parse(localStorage.getItem("nexdo-checklist-logs") || "{}");
    checklistTotal = items.length;
    checklistDone  = (clogs[today] || []).length;
    checklistPct   = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;
  } catch {}

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const totalTeachingMins = todaySessions.reduce((a, s) => a + s.duration, 0);

  return (
    <div className="space-y-4">

      {/* Greeting Banner */}
      <div className="bg-gray-900 rounded-2xl p-5 text-white">
        <p className="text-sm font-medium opacity-60">{greeting} 👋</p>
        <p className="text-2xl font-black mt-1">
          {todayTasks.length === 0 && todaySessions.length === 0
            ? "Let's plan your day!"
            : progress === 100
            ? "All tasks done! Great work 🎉"
            : `${doneTasks.length} of ${todayTasks.length} tasks done`}
        </p>
        {todayTasks.length > 0 && (
          <div className="mt-3">
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-teal-400 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs opacity-50 mt-1">{progress}% complete</p>
          </div>
        )}
      </div>

      {/* Quick Stats — all connected */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-red-400">{pendingTasks.length}</p>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Pending</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
          <Flame size={18} className={`mx-auto mb-1 ${habitsDoneToday > 0 ? "text-orange-500" : "text-gray-300"}`} />
          <p className="text-[10px] text-gray-400 font-semibold">{habitsDoneToday}/{totalHabits}</p>
          <p className="text-[10px] text-gray-300">Habits</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
          <p className="text-xl">{todayMood ? MOODS[todayMood].emoji : "—"}</p>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{todayMood ? MOODS[todayMood].label : "No mood"}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
          <p className={`text-xl font-black ${checklistPct === 100 ? "text-teal-500" : "text-indigo-500"}`}>{checklistPct}%</p>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Checklist</p>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <p className="font-black text-gray-900 text-sm">📋 Today&apos;s Tasks</p>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
            {format(new Date(), "MMM d")}
          </span>
        </div>

        {todayTasks.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No tasks for today. Add from Tasks tab!</p>
        ) : (
          <div className="space-y-1.5">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all">
                <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                  <Circle size={18} className="text-gray-300 hover:text-teal-400 transition-colors" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                  {task.dueTime && <p className="text-xs text-gray-400">{task.dueTime}</p>}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  task.priority === "high" ? "bg-red-50 text-red-500" :
                  task.priority === "medium" ? "bg-yellow-50 text-yellow-600" :
                  "bg-green-50 text-green-600"
                }`}>{task.priority}</span>
              </div>
            ))}
            {doneTasks.length > 0 && (
              <>
                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Done</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                {doneTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl opacity-50">
                    <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                      <CheckCircle2 size={18} className="text-teal-400" />
                    </button>
                    <p className="text-sm text-gray-500 line-through truncate">{task.title}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Today's Teaching Sessions */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <p className="font-black text-gray-900 text-sm">👨‍🏫 Today&apos;s Teaching</p>
          {totalTeachingMins > 0 && (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Clock size={10} /> {totalTeachingMins} mins
            </span>
          )}
        </div>

        {todaySessions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No sessions logged today. Add from Teach Log tab!</p>
        ) : (
          <div className="space-y-2">
            {todaySessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 bg-blue-50 rounded-xl">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen size={14} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{s.topic}</p>
                  <p className="text-xs text-gray-400">{s.subject} {s.batch ? `· ${s.batch}` : ""} · {s.duration} mins</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
