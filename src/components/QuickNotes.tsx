"use client";
import { useState, useEffect } from "react";
import { Save, StickyNote } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { getWeekFromId } from "@/lib/utils";

export default function QuickNotes() {
  const { selectedWeekId } = useTaskStore();
  const week = getWeekFromId(selectedWeekId);
  const storageKey = `nexdo-notes-${selectedWeekId}`;

  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) || "";
    setNote(stored);
    setSaved(false);
  }, [selectedWeekId]);

  const save = () => {
    localStorage.setItem(storageKey, note);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote size={16} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-700">Week Notes</h3>
          <span className="text-xs text-gray-400">{week.label}</span>
        </div>
        <button
          onClick={save}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
            saved ? "bg-green-50 text-green-600 border border-green-200" : "bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100"
          }`}
        >
          <Save size={12} />
          {saved ? "Saved!" : "Save"}
        </button>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write your weekly notes, ideas, reflections..."
        rows={5}
        className="w-full bg-amber-50/50 border border-amber-100 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-300 transition-all resize-none text-sm"
      />
    </div>
  );
}
