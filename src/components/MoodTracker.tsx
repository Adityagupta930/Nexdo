"use client";
import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const MOODS = [
  { value: 5, emoji: "😄", label: "Great", color: "#10b981" },
  { value: 4, emoji: "🙂", label: "Good", color: "#6366f1" },
  { value: 3, emoji: "😐", label: "Okay", color: "#f59e0b" },
  { value: 2, emoji: "😔", label: "Low", color: "#f97316" },
  { value: 1, emoji: "😞", label: "Bad", color: "#ef4444" },
];

const STORAGE_KEY = "nexdo-moods";

function load(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

export default function MoodTracker() {
  const [logs, setLogs] = useState<Record<string, number>>(load);
  const today = new Date().toISOString().split("T")[0];
  const todayMood = logs[today];

  const logMood = (value: number) => {
    const updated = { ...logs, [today]: value };
    setLogs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const last14 = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const key = d.toISOString().split("T")[0];
      return {
        date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
        mood: logs[key] ?? null,
      };
    });
  }, [logs]);

  const avgMood = useMemo(() => {
    const vals = Object.values(logs).filter(Boolean);
    if (!vals.length) return 0;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }, [logs]);

  const currentMoodData = MOODS.find((m) => m.value === todayMood);

  return (
    <div className="space-y-5">
      {/* Today's Mood */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">How are you feeling today?</h3>
        <div className="flex justify-between gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => logMood(mood.value)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                todayMood === mood.value
                  ? "border-indigo-400 bg-indigo-50 scale-105 shadow-md"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs font-medium text-gray-500">{mood.label}</span>
            </button>
          ))}
        </div>
        {currentMoodData && (
          <p className="text-center text-sm mt-3 font-medium" style={{ color: currentMoodData.color }}>
            Feeling {currentMoodData.label} today {currentMoodData.emoji}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Avg Mood", value: avgMood || "—", emoji: "📊" },
          { label: "Days Logged", value: Object.keys(logs).length, emoji: "📅" },
          { label: "Best Mood", value: MOODS.find((m) => m.value === Math.max(...Object.values(logs)))?.emoji || "—", emoji: "🏆" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
            <p className="text-xl">{s.emoji}</p>
            <p className="text-lg font-bold text-gray-800 mt-1">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 14-day Graph */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Last 14 Days</h3>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={last14}>
            <defs>
              <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "12px" }}
              formatter={(val: number) => [MOODS.find((m) => m.value === val)?.emoji + " " + MOODS.find((m) => m.value === val)?.label, "Mood"]}
            />
            <Area type="monotone" dataKey="mood" stroke="#6366f1" fill="url(#moodGrad)" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
