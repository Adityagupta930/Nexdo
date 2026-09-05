"use client";
import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, RotateCcw, TrendingUp, RefreshCw } from "lucide-react";
import { format } from "date-fns";

type RecurType = "daily" | "weekdays" | "weekends" | "custom";

interface ChecklistItem {
  id: string;
  text: string;
  recur: RecurType;
  days: number[]; // 0=Sun..6=Sat, used when recur=custom
}

interface DailyLog {
  [date: string]: string[];
}

const STORAGE_ITEMS = "nexdo-checklist-items";
const STORAGE_LOGS  = "nexdo-checklist-logs";
const DAY_LABELS    = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const RECUR_OPTIONS: { value: RecurType; label: string }[] = [
  { value: "daily",    label: "Every Day" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "custom",   label: "Custom" },
];

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return fallback; }
}

function isItemActiveToday(item: ChecklistItem, dayOfWeek: number): boolean {
  if (item.recur === "daily")    return true;
  if (item.recur === "weekdays") return dayOfWeek >= 1 && dayOfWeek <= 5;
  if (item.recur === "weekends") return dayOfWeek === 0 || dayOfWeek === 6;
  if (item.recur === "custom")   return item.days.includes(dayOfWeek);
  return true;
}

function recurLabel(item: ChecklistItem): string {
  if (item.recur === "daily")    return "Every day";
  if (item.recur === "weekdays") return "Mon–Fri";
  if (item.recur === "weekends") return "Sat–Sun";
  if (item.recur === "custom")   return item.days.map((d) => DAY_LABELS[d]).join(", ") || "No days";
  return "";
}

export default function DailyChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>(() => load(STORAGE_ITEMS, []));
  const [logs,  setLogs]  = useState<DailyLog>(() => load(STORAGE_LOGS, {}));
  const [adding, setAdding] = useState(false);
  const [newText, setNewText]   = useState("");
  const [newRecur, setNewRecur] = useState<RecurType>("daily");
  const [newDays,  setNewDays]  = useState<number[]>([]);

  const today      = format(new Date(), "yyyy-MM-dd");
  const dayOfWeek  = new Date().getDay();
  const todayDone  = logs[today] || [];

  const saveItems = (u: ChecklistItem[]) => { setItems(u); localStorage.setItem(STORAGE_ITEMS, JSON.stringify(u)); };
  const saveLogs  = (u: DailyLog)        => { setLogs(u);  localStorage.setItem(STORAGE_LOGS,  JSON.stringify(u)); };

  const addItem = () => {
    if (!newText.trim()) return;
    saveItems([...items, { id: Date.now().toString(), text: newText.trim(), recur: newRecur, days: newDays }]);
    setNewText(""); setNewRecur("daily"); setNewDays([]); setAdding(false);
  };

  const toggleItem = (id: string) => {
    const done = todayDone.includes(id) ? todayDone.filter((x) => x !== id) : [...todayDone, id];
    saveLogs({ ...logs, [today]: done });
  };

  const deleteItem = (id: string) => {
    saveItems(items.filter((i) => i.id !== id));
    const u = { ...logs };
    Object.keys(u).forEach((d) => { u[d] = u[d].filter((x) => x !== id); });
    saveLogs(u);
  };

  const toggleDay = (d: number) =>
    setNewDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  // Only show items active today
  const todayItems = items.filter((i) => isItemActiveToday(i, dayOfWeek));
  const doneCount  = todayItems.filter((i) => todayDone.includes(i.id)).length;
  const progress   = todayItems.length > 0 ? Math.round((doneCount / todayItems.length) * 100) : 0;

  // Last 7 days — count only items active on that day
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d   = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key    = format(d, "yyyy-MM-dd");
    const dow    = d.getDay();
    const active = items.filter((it) => isItemActiveToday(it, dow));
    const done   = (logs[key] || []).filter((id) => active.some((it) => it.id === id)).length;
    const total  = active.length;
    const pct    = total > 0 ? Math.round((done / total) * 100) : 0;
    return { label: format(d, "EEE"), key, pct, isToday: key === today };
  });

  // Streak
  const streak = (() => {
    let s = 0;
    for (let i = 0; i < 30; i++) {
      const d   = new Date(); d.setDate(d.getDate() - i);
      const key = format(d, "yyyy-MM-dd");
      const dow = d.getDay();
      const active = items.filter((it) => isItemActiveToday(it, dow));
      if (active.length === 0) { s++; continue; }
      const done = (logs[key] || []).filter((id) => active.some((it) => it.id === id)).length;
      if (done === active.length) s++; else break;
    }
    return s;
  })();

  const avgPct = Math.round(last7.reduce((a, d) => a + d.pct, 0) / last7.length);
  const r = 28, circ = 2 * Math.PI * r;
  const dash = circ - (progress / 100) * circ;

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-black text-gray-900">Daily Checklist</p>
          <p className="text-xs text-gray-400 mt-0.5">Resets every day automatically ✨</p>
        </div>
        <div className="flex items-center gap-2">
          {doneCount > 0 && (
            <button onClick={() => saveLogs({ ...logs, [today]: [] })}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all" title="Reset today">
              <RotateCcw size={14} />
            </button>
          )}
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
            <Plus size={15} /> Add Item
          </button>
        </div>
      </div>

      {/* Progress + Stats */}
      {todayItems.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <svg width="72" height="72" className="-rotate-90">
              <circle cx="36" cy="36" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
              <circle cx="36" cy="36" r={r} fill="none" stroke={progress === 100 ? "#2dd4bf" : "#6366f1"}
                strokeWidth="6" strokeDasharray={circ} strokeDashoffset={dash}
                strokeLinecap="round" className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm font-black text-gray-900">{progress}%</p>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xl font-black text-gray-900">{doneCount}/{todayItems.length}</p>
              <p className="text-[10px] text-gray-400 font-semibold">Done Today</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-orange-500">{streak}</p>
              <p className="text-[10px] text-gray-400 font-semibold">🔥 Streak</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-indigo-500">{avgPct}%</p>
              <p className="text-[10px] text-gray-400 font-semibold">7d Avg</p>
            </div>
          </div>
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
          <input type="text" placeholder="e.g. Morning walk, Read 30 mins..."
            value={newText} onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            autoFocus
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-300 text-sm focus:outline-none focus:border-gray-400 transition-all" />

          {/* Recur selector */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <RefreshCw size={12} className="text-indigo-400" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Repeat</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {RECUR_OPTIONS.map((o) => (
                <button key={o.value} type="button" onClick={() => setNewRecur(o.value)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold border-2 transition-all ${
                    newRecur === o.value
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-100 bg-white text-gray-500 hover:border-gray-300"
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom day picker */}
          {newRecur === "custom" && (
            <div className="flex gap-1.5">
              {DAY_LABELS.map((label, i) => (
                <button key={i} type="button" onClick={() => toggleDay(i)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    newDays.includes(i)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={addItem} className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-gray-700 transition-all">Save</button>
            <button onClick={() => { setAdding(false); setNewText(""); setNewRecur("daily"); setNewDays([]); }}
              className="px-5 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all">Cancel</button>
          </div>
        </div>
      )}

      {/* Checklist items */}
      {items.length === 0 && !adding ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm border border-gray-100">✅</div>
          <p className="font-black text-gray-900 text-lg">No daily items yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">Add items with recurring schedule — they reset every day!</p>
          <button onClick={() => setAdding(true)} className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all">
            + Add First Item
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Today's active items */}
          {todayItems.length > 0 && (
            <>
              {todayItems.map((item) => {
                const done = todayDone.includes(item.id);
                return (
                  <div key={item.id} className={`group flex items-center gap-3 bg-white border rounded-2xl px-4 py-3.5 transition-all ${done ? "border-teal-100 bg-teal-50/30" : "border-gray-100 hover:shadow-sm"}`}>
                    <button onClick={() => toggleItem(item.id)} className="flex-shrink-0">
                      {done
                        ? <CheckCircle2 size={20} className="text-teal-400" />
                        : <Circle size={20} className="text-gray-300 hover:text-teal-400 transition-colors" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${done ? "line-through text-gray-400" : "text-gray-800"}`}>{item.text}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <RefreshCw size={9} /> {recurLabel(item)}
                      </p>
                    </div>
                    <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </>
          )}

          {/* Items not active today */}
          {items.filter((i) => !isItemActiveToday(i, dayOfWeek)).length > 0 && (
            <div className="pt-1">
              <div className="flex items-center gap-2 py-1 mb-1">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Not today</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              {items.filter((i) => !isItemActiveToday(i, dayOfWeek)).map((item) => (
                <div key={item.id} className="group flex items-center gap-3 bg-white border border-gray-50 rounded-2xl px-4 py-3 opacity-40">
                  <Circle size={18} className="text-gray-200 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-500">{item.text}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <RefreshCw size={9} /> {recurLabel(item)}
                    </p>
                  </div>
                  <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7-day bar chart */}
      {items.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-indigo-400" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last 7 Days</p>
          </div>
          <div className="flex gap-2 items-end h-16">
            {last7.map((d) => (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
                <p className="text-[10px] font-bold text-gray-500">{d.pct > 0 ? `${d.pct}%` : ""}</p>
                <div className="w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: "36px" }}>
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      d.pct === 100 ? "bg-teal-400" : d.isToday ? "bg-indigo-400" : "bg-indigo-200"
                    }`}
                    style={{ height: `${d.pct}%`, marginTop: `${100 - d.pct}%` }}
                  />
                </div>
                <p className={`text-[10px] font-bold ${d.isToday ? "text-indigo-500" : "text-gray-400"}`}>{d.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
