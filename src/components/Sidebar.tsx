"use client";
import { CheckSquare, BarChart2, Calendar, Zap, Target, Timer, Search, StickyNote, Flame, LayoutGrid, Smile } from "lucide-react";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "focus", label: "Focus", icon: Timer },
  { id: "habits", label: "Habits", icon: Flame },
  { id: "mood", label: "Mood", icon: Smile },
  { id: "matrix", label: "Matrix", icon: LayoutGrid },
  { id: "goals", label: "Goals", icon: Target },
  { id: "stats", label: "Analytics", icon: BarChart2 },
  { id: "search", label: "Search", icon: Search },
  { id: "notes", label: "Notes", icon: StickyNote },
];

export default function Sidebar({ activeTab, setActiveTab }: Props) {
  return (
    <aside className="w-16 md:w-60 bg-white border-r border-gray-100 flex flex-col py-6 px-2 md:px-4 shrink-0 shadow-sm">
      <div className="flex items-center gap-2 mb-6 px-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
          <Zap size={16} className="text-white" />
        </div>
        <span className="hidden md:block text-indigo-600 font-bold text-lg tracking-tight">Nexdo</span>
      </div>

      <nav className="space-y-0.5 flex-1 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
              activeTab === id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            <Icon size={17} />
            <span className="hidden md:block">{label}</span>
          </button>
        ))}
      </nav>

      <div className="hidden md:block px-2 py-3 bg-indigo-50 border border-indigo-100 rounded-xl mt-4">
        <p className="text-xs text-indigo-600 font-semibold mb-1">💡 Pro Tip</p>
        <p className="text-xs text-gray-400">Check Matrix to prioritize tasks using Eisenhower method!</p>
      </div>
    </aside>
  );
}
