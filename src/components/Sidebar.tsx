"use client";
import { CheckSquare, BarChart2, Calendar, Zap, Target, Timer, Search, StickyNote, Flame, LayoutGrid, Smile } from "lucide-react";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: "tasks",    label: "Tasks",     icon: CheckSquare, color: "#FF6B6B" },
  { id: "calendar", label: "Calendar",  icon: Calendar,    color: "#4ECDC4" },
  { id: "focus",    label: "Focus",     icon: Timer,       color: "#F59E0B" },
  { id: "habits",   label: "Habits",    icon: Flame,       color: "#FF8E53" },
  { id: "mood",     label: "Mood",      icon: Smile,       color: "#10B981" },
  { id: "matrix",   label: "Matrix",    icon: LayoutGrid,  color: "#8B5CF6" },
  { id: "goals",    label: "Goals",     icon: Target,      color: "#EF4444" },
  { id: "stats",    label: "Analytics", icon: BarChart2,   color: "#3B82F6" },
  { id: "search",   label: "Search",    icon: Search,      color: "#6366F1" },
  { id: "notes",    label: "Notes",     icon: StickyNote,  color: "#F59E0B" },
];

export default function Sidebar({ activeTab, setActiveTab }: Props) {
  return (
    <aside className="w-16 md:w-60 bg-white border-r border-gray-100 flex flex-col py-5 px-2 md:px-3 shrink-0 h-screen sticky top-0">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-7 px-2">
        <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 float-logo">
          <Zap size={17} className="text-white" />
        </div>
        <div className="hidden md:block">
          <p className="font-black text-gray-900 text-lg leading-none tracking-tight">Nexdo</p>
          <p className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase mt-0.5">Productivity</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon, color }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150 text-sm font-semibold group ${
                isActive
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive ? "bg-white/20" : "bg-gray-100 group-hover:bg-white group-hover:shadow-sm"
                }`}
              >
                <Icon size={14} style={{ color: isActive ? "#fff" : color }} />
              </div>
              <span className="hidden md:block">{label}</span>
              {isActive && (
                <span className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-white/40" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom tip */}
      <div className="hidden md:block mt-4 p-3 rounded-2xl bg-orange-50 border border-orange-100">
        <p className="text-xs font-bold text-orange-500 mb-1">🔥 Keep it up!</p>
        <p className="text-xs text-gray-400 leading-relaxed">Consistency beats perfection every day.</p>
      </div>
    </aside>
  );
}
