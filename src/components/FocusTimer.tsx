"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";

const MODES = {
  focus: { label: "Focus", minutes: 25, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", ring: "#4f46e5" },
  short: { label: "Short Break", minutes: 5, color: "text-green-600", bg: "bg-green-50", border: "border-green-200", ring: "#10b981" },
  long: { label: "Long Break", minutes: 15, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", ring: "#3b82f6" },
};

type Mode = keyof typeof MODES;

export default function FocusTimer() {
  const [mode, setMode] = useState<Mode>("focus");
  const [seconds, setSeconds] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const total = MODES[mode].minutes * 60;
  const progress = ((total - seconds) / total) * 100;
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const circumference = 2 * Math.PI * 54;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false);
            if (mode === "focus") setSessions((prev) => prev + 1);
            new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA").play().catch(() => {});
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setSeconds(MODES[m].minutes * 60);
    setRunning(false);
  };

  const reset = () => { setSeconds(MODES[mode].minutes * 60); setRunning(false); };

  const cfg = MODES[mode];

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-2 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m ? `${MODES[m].bg} ${MODES[m].color} shadow-sm` : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="flex flex-col items-center py-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={cfg.ring} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800 tabular-nums">{mins}:{secs}</span>
            <span className={`text-xs font-medium mt-1 ${cfg.color}`}>{cfg.label}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button onClick={reset} className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all">
            <RotateCcw size={18} />
          </button>
          <button
            onClick={() => setRunning(!running)}
            className={`px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-md flex items-center gap-2 ${
              running ? "bg-gray-500 hover:bg-gray-600" : `bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200`
            }`}
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
            {running ? "Pause" : "Start"}
          </button>
          <div className="p-3 rounded-xl bg-gray-100 text-gray-500 flex items-center gap-1.5">
            <Brain size={16} className="text-indigo-500" />
            <span className="text-sm font-bold text-gray-700">{sessions}</span>
          </div>
        </div>
      </div>

      {/* Sessions Info */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Sessions Today", value: sessions, icon: "🎯" },
          { label: "Focus Time", value: `${sessions * 25}m`, icon: "⏱️" },
          { label: "Next Break", value: sessions > 0 && sessions % 4 === 0 ? "Long" : "Short", icon: "☕" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
            <p className="text-lg">{s.icon}</p>
            <p className="text-lg font-bold text-gray-800 mt-1">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-indigo-600 mb-1">💡 Pomodoro Technique</p>
        <p className="text-xs text-gray-500">Work for 25 mins, take a 5 min break. After 4 sessions, take a 15 min long break.</p>
      </div>
    </div>
  );
}
