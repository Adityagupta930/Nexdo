"use client";
import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Target } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  deadline: string;
  completed: boolean;
  progress: number;
}

const STORAGE_KEY = "nexdo-goals";

function loadGoals(): Goal[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveGoals(goals: Goal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [adding, setAdding] = useState(false);

  const addGoal = () => {
    if (!title.trim()) return;
    const updated = [...goals, { id: Date.now().toString(), title, deadline, completed: false, progress: 0 }];
    setGoals(updated);
    saveGoals(updated);
    setTitle(""); setDeadline(""); setAdding(false);
  };

  const toggleGoal = (id: string) => {
    const updated = goals.map((g) => g.id === id ? { ...g, completed: !g.completed, progress: !g.completed ? 100 : g.progress } : g);
    setGoals(updated); saveGoals(updated);
  };

  const updateProgress = (id: string, progress: number) => {
    const updated = goals.map((g) => g.id === id ? { ...g, progress } : g);
    setGoals(updated); saveGoals(updated);
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated); saveGoals(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{goals.filter((g) => g.completed).length}/{goals.length} goals achieved</p>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-200"
        >
          <Plus size={15} /> Add Goal
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
          <input
            type="text"
            placeholder="Goal title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 text-sm"
          />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-indigo-400 text-sm"
          />
          <div className="flex gap-2">
            <button onClick={addGoal} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 transition-all">Save</button>
            <button onClick={() => setAdding(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">Cancel</button>
          </div>
        </div>
      )}

      {goals.length === 0 && !adding ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target size={24} className="text-indigo-400" />
          </div>
          <p className="text-gray-500 font-medium">No goals yet</p>
          <p className="text-gray-400 text-sm mt-1">Set your first goal to stay motivated!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className={`group bg-white border rounded-xl p-4 shadow-sm transition-all ${goal.completed ? "border-green-100 opacity-70" : "border-gray-100 hover:border-indigo-200"}`}>
              <div className="flex items-start gap-3">
                <button onClick={() => toggleGoal(goal.id)} className="mt-0.5 flex-shrink-0">
                  {goal.completed
                    ? <CheckCircle2 size={20} className="text-green-500" />
                    : <Circle size={20} className="text-gray-300 hover:text-indigo-400 transition-colors" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${goal.completed ? "line-through text-gray-400" : "text-gray-800"}`}>{goal.title}</p>
                  {goal.deadline && <p className="text-xs text-gray-400 mt-0.5">Deadline: {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>}
                  {!goal.completed && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs font-semibold text-indigo-600">{goal.progress}%</span>
                      </div>
                      <input
                        type="range"
                        min={0} max={100}
                        value={goal.progress}
                        onChange={(e) => updateProgress(goal.id, parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-full accent-indigo-600"
                      />
                    </div>
                  )}
                </div>
                <button onClick={() => deleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
