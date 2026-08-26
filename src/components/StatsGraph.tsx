"use client";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { useTaskStore } from "@/store/taskStore";
import { getWeeksRange, CATEGORY_COLORS } from "@/lib/utils";

export default function StatsGraph() {
  const { tasks } = useTaskStore();

  const weeks = getWeeksRange(8);
  const weeklyData = weeks.map((w) => {
    const weekTasks = tasks.filter((t) => t.weekId === w.id);
    const completed = weekTasks.filter((t) => t.completed).length;
    return { week: w.label.split(" - ")[0], total: weekTasks.length, completed };
  });

  const categories = ["work", "personal", "health", "learning", "other"];
  const categoryData = categories
    .map((cat) => ({ name: cat, value: tasks.filter((t) => t.category === cat).length }))
    .filter((d) => d.value > 0);

  const priorityData = [
    { name: "High", value: tasks.filter((t) => t.priority === "high").length, color: "#ef4444" },
    { name: "Medium", value: tasks.filter((t) => t.priority === "medium").length, color: "#f59e0b" },
    { name: "Low", value: tasks.filter((t) => t.priority === "low").length, color: "#10b981" },
  ].filter((d) => d.value > 0);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const streak = (() => {
    const today = new Date();
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const hasDone = tasks.some((t) => t.completed && t.completedAt?.startsWith(ds));
      if (hasDone) count++;
      else break;
    }
    return count;
  })();

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      color: "#1a1a2e",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    },
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Tasks", value: totalTasks, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
          { label: "Completed", value: completedTasks, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
          { label: "Pending", value: totalTasks - completedTasks, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
          { label: "Completion", value: `${completionRate}%`, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Streak */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-5 text-white flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">Current Streak 🔥</p>
          <p className="text-3xl font-bold mt-1">{streak} days</p>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const ds = d.toISOString().split("T")[0];
            const done = tasks.some((t) => t.completed && t.completedAt?.startsWith(ds));
            return (
              <div
                key={i}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  done ? "bg-white text-indigo-600" : "bg-white/20 text-white/50"
                }`}
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Weekly Progress</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="total" stroke="#6366f1" fill="url(#totalGrad)" strokeWidth={2} name="Total" />
            <Area type="monotone" dataKey="completed" stroke="#10b981" fill="url(#completedGrad)" strokeWidth={2} name="Completed" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category + Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">By Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "#6b7280" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-300 text-sm text-center py-8">No data yet</p>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">By Priority</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={priorityData} barSize={32}>
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-300 text-sm text-center py-8">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
