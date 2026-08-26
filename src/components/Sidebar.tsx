"use client";
import { CheckSquare, BarChart2, Calendar, Zap, Target, Star } from "lucide-react";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "stats", label: "Analytics", icon: BarChart2 },
  { id: "goals", label: "Goals", icon: Target },
];

export default function Sidebar({ activeTab, setActiveTab }: Props) {
  return (
    <aside className="w-16 md:w-60 bg-white border-r border-gray-100 flex flex-col py-6 px-2 md:px-4 shrink-0 shadow-sm">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
          <Zap size={16} className="text-white" />
        </div>
        <span className="hidden md:block text-indigo-600 font-bold text-lg tracking-tight">Nexdo</span>
      </div>

      <nav className="space-y-1 flex-1">
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
            <Icon size={18} />
            <span className="hidden md:block">{label}</span>
          </button>
        ))}
      </nav>

      <div className="hidden md:block px-2 py-3 bg-indigo-50 border border-indigo-100 rounded-xl">
        <div className="flex items-center gap-1.5 mb-1">
          <Star size={12} className="text-indigo-500" />
          <p className="text-xs text-indigo-600 font-semibold">Pro Tip</p>
        </div>
        <p className="text-xs text-gray-400">Plan your week every Monday for best results!</p>
      </div>
    </aside>
  );
}
