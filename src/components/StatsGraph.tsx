"use client";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { useTaskStore } from "@/store/taskStore";
import { getWeeksRange, CATEGORY_COLORS } from "@/lib/utils";
import { format } from "date-fns";

export default function StatsGraph() {
  const { tasks } = useTaskStore();

  // Weekly completion trend (last 8 weeks)
  const weeks = getWeeksRange(8);
  const weeklyData = weeks.map((w) => {
    const weekTasks = tasks.filter((t) => t.weekId === w.id);
    const completed = weekTasks.filter((t) => t.completed).length;
    return {
      week: w.label.split(" - ")[0],
      total: weekTasks.length,
      completed,
    };
  });

  // Category breakdown
  const categories = ["work", "personal", "health", "learning", "other"];
  const categoryData = categories.map((cat) => ({
    name: cat,
    value: tasks.filter((t) => t.category === cat).length,
  })).filter((d) => d.value > 0);

  // Priority breakdown
  const priorityData = [
    { name: "High", value: tasks.filter((t) => t.priority === "high").length, color: "#ef4444" },
    { name: "Medium", value: tasks.filter((t) => t.priority === "medium").length, color: "#f59e0b" },
    { name: "Low", value: tasks.filter((t) => t.priority === "low").length, color: "#10b981" },
  ].filter((d) => d.value > 0);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Tasks", value: totalTasks, color: "text-indigo-400" },
          { label: "Completed", value: completedTasks, color: "text-green-400" },
          { label: "Pending", value: totalTasks - completedTasks, color: "text-yellow-400" },
          { label: "Completion Rate", value: `${completionRate}%`, color: "text-purple-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Trend */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Weekly Progress</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
            />
            <Area type="monotone" dataKey="total" stroke="#6366f1" fill="url(#totalGrad)" strokeWidth={2} name="Total" />
            <Area type="monotone" dataKey="completed" stroke="#10b981" fill="url(#completedGrad)" strokeWidth={2} name="Completed" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category + Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">By Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-sm text-center py-8">No data yet</p>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">By Priority</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={priorityData} barSize={32}>
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-sm text-center py-8">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
