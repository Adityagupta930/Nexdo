"use client";
import { useState } from "react";
import { Plus, Trash2, Flame } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  logs: string[]; // ISO date strings
}

const COLORS = ["bg-indigo-500", "bg-pink-500", "bg-green-500", "bg-amber-500", "bg-purple-500", "bg-blue-500"];
const EMOJIS = ["💪", "📚", "🏃", "💧", "🧘", "🍎", "😴", "✍️", "🎯", "🌿"];

const STORAGE_KEY = "nexdo-habits";

function load(): Habit[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function save(h: Habit[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(h)); }

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(load);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💪");
  const [color, setColor] = useState(COLORS[0]);
  const days = getLast7Days();
  const today = new Date().toISOString().split("T")[0];

  const addHabit = () => {
    if (!name.trim()) return;
    const updated = [...habits, { id: Date.now().toString(), name, emoji, color, logs: [] }];
    setHabits(updated); save(updated);
    setName(""); setEmoji("💪"); setColor(COLORS[0]); setAdding(false);
  };

  const toggleDay = (id: string, date: string) => {
    const updated = habits.map((h) => {
      if (h.id !== id) return h;
      const logs = h.logs.includes(date) ? h.logs.filter((d) => d !== date) : [...h.logs, date];
      return { ...h, logs };
    });
    setHabits(updated); save(updated);
  };

  const deleteHabit = (id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated); save(updated);
  };

  const getStreak = (habit: Habit) => {
    let streak = 0;
    const d = new Date();
    while (habit.logs.includes(d.toISOString().split("T")[0])) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{habits.length} habits tracked</p>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-200"
        >
          <Plus size={15} /> Add Habit
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
          <input
            type="text" placeholder="Habit name..." value={name}
            onChange={(e) => setName(e.target.value)} autoFocus
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 text-sm"
          />
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Pick emoji</p>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map((e) => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-lg text-lg transition-all ${emoji === e ? "bg-indigo-100 ring-2 ring-indigo-400" : "bg-gray-100 hover:bg-gray-200"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Pick color</p>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full ${c} transition-all ${color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`} />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addHabit} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 transition-all">Save</button>
            <button onClick={() => setAdding(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">Cancel</button>
          </div>
        </div>
      )}

      {/* Day Headers */}
      {habits.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-[1fr_repeat(7,2.5rem)] gap-0 px-4 py-2 border-b border-gray-50">
            <div />
            {days.map((d) => {
              const date = new Date(d);
              const isToday = d === today;
              return (
                <div key={d} className="text-center">
                  <p className={`text-xs font-bold ${isToday ? "text-indigo-600" : "text-gray-400"}`}>
                    {date.toLocaleDateString("en", { weekday: "short" }).slice(0, 1)}
                  </p>
                  <p className={`text-xs ${isToday ? "text-indigo-600 font-bold" : "text-gray-400"}`}>
                    {date.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          {habits.map((habit) => {
            const streak = getStreak(habit);
            return (
              <div key={habit.id} className="group grid grid-cols-[1fr_repeat(7,2.5rem)] gap-0 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors items-center">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="text-lg">{habit.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{habit.name}</p>
                    {streak > 0 && (
                      <div className="flex items-center gap-1">
                        <Flame size={10} className="text-orange-500" />
                        <span className="text-xs text-orange-500 font-medium">{streak} day streak</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 ml-auto text-gray-300 hover:text-red-400 transition-all flex-shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
                {days.map((d) => {
                  const done = habit.logs.includes(d);
                  const isFuture = d > today;
                  return (
                    <div key={d} className="flex items-center justify-center">
                      <button
                        onClick={() => !isFuture && toggleDay(habit.id, d)}
                        disabled={isFuture}
                        className={`w-7 h-7 rounded-lg transition-all ${
                          done ? `${habit.color} shadow-sm` : isFuture ? "bg-gray-50" : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {done && <span className="text-white text-xs">✓</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {habits.length === 0 && !adding && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Flame size={24} className="text-orange-400" />
          </div>
          <p className="text-gray-500 font-medium">No habits yet</p>
          <p className="text-gray-400 text-sm mt-1">Track daily habits to build consistency!</p>
        </div>
      )}
    </div>
  );
}
