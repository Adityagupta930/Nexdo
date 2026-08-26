"use client";
import { CheckSquare, BarChart2, Calendar, Zap } from "lucide-react";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "stats", label: "Analytics", icon: BarChart2 },
];

export default function Sidebar({ activeTab, setActiveTab }: Props) {
  return (
    <aside className="w-16 md:w-56 bg-[#12122a] border-r border-white/8 flex flex-col py-6 px-2 md:px-4 shrink-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <span className="hidden md:block text-white font-bold text-lg tracking-tight">Nexdo</span>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
              activeTab === id
                ? "bg-indigo-600 text-white"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={18} />
            <span className="hidden md:block">{label}</span>
          </button>
        ))}
      </nav>

      <div className="hidden md:block px-2 py-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
        <p className="text-xs text-indigo-300 font-medium">Pro Tip 💡</p>
        <p className="text-xs text-gray-500 mt-1">Plan your week every Monday for best results!</p>
      </div>
    </aside>
  );
}
