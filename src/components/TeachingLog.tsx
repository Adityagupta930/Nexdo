"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, BookOpen, Clock, Users, ChevronDown, ChevronUp, Search, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

interface TeachingLog {
  id: string;
  date: string;
  subject: string;
  topic: string;
  duration: number;
  batch: string;
  notes: string;
  extra_topics: string;
  student_response: string;
  completed: boolean;
  created_at: string;
}

interface LinkedTask {
  id: string;
  title: string;
  completed: boolean;
  teaching_log_id: string;
}

const RESPONSES = [
  { value: "excellent", label: "Excellent 🔥", color: "bg-green-100 text-green-600" },
  { value: "good",      label: "Good 👍",       color: "bg-blue-100 text-blue-600" },
  { value: "average",   label: "Average 😐",    color: "bg-yellow-100 text-yellow-600" },
  { value: "poor",      label: "Poor 😔",       color: "bg-red-100 text-red-600" },
];

const SUBJECTS = ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "DSA", "CSS", "HTML", "Database", "Git", "Other"];

const emptyForm = {
  date: format(new Date(), "yyyy-MM-dd"),
  subject: "JavaScript",
  topic: "",
  duration: 60,
  batch: "",
  notes: "",
  extra_topics: "",
  student_response: "good",
};

export default function TeachingLog() {
  const [logs, setLogs] = useState<TeachingLog[]>([]);
  const [linkedTasks, setLinkedTasks] = useState<LinkedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [newTaskText, setNewTaskText] = useState<Record<string, string>>({});
  const [addingTaskFor, setAddingTaskFor] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: logsData }, { data: tasksData }] = await Promise.all([
      supabase.from("teaching_logs").select("*").order("date", { ascending: false }),
      supabase.from("tasks").select("id, title, completed, teaching_log_id").not("teaching_log_id", "is", null),
    ]);
    if (logsData) setLogs(logsData as TeachingLog[]);
    if (tasksData) setLinkedTasks(tasksData as LinkedTask[]);
    setLoading(false);
  };

  const saveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("teaching_logs")
      .insert({ ...form, user_id: user.id })
      .select().single();

    if (!error && data) {
      setLogs([data as TeachingLog, ...logs]);
      setForm(emptyForm);
      setShowForm(false);
    }
    setSaving(false);
  };

  const deleteLog = async (id: string) => {
    await supabase.from("teaching_logs").delete().eq("id", id);
    setLogs(logs.filter((l) => l.id !== id));
    setLinkedTasks(linkedTasks.filter((t) => t.teaching_log_id !== id));
  };

  const addLinkedTask = async (logId: string) => {
    const text = newTaskText[logId]?.trim();
    if (!text) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const log = logs.find((l) => l.id === logId);
    const today = format(new Date(), "yyyy-MM-dd");

    const { data, error } = await supabase.from("tasks").insert({
      title: text,
      priority: "medium",
      category: "learning",
      week_id: log?.date.slice(0, 10) ?? today,
      due_date: new Date(log?.date ?? today).toISOString(),
      completed: false,
      teaching_log_id: logId,
      user_id: user.id,
    }).select("id, title, completed, teaching_log_id").single();

    if (!error && data) {
      setLinkedTasks([...linkedTasks, data as LinkedTask]);
      setNewTaskText({ ...newTaskText, [logId]: "" });
      setAddingTaskFor(null);
    }
  };

  const toggleLinkedTask = async (taskId: string, current: boolean) => {
    await supabase.from("tasks").update({ completed: !current, completed_at: !current ? new Date().toISOString() : null }).eq("id", taskId);
    setLinkedTasks(linkedTasks.map((t) => t.id === taskId ? { ...t, completed: !current } : t));
  };

  const deleteLinkedTask = async (taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    setLinkedTasks(linkedTasks.filter((t) => t.id !== taskId));
  };

  const filtered = logs.filter((l) => {
    const matchSearch = l.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.batch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSubject = filterSubject === "all" || l.subject === filterSubject;
    return matchSearch && matchSubject;
  });

  const totalHours = Math.round(logs.reduce((a, l) => a + l.duration, 0) / 60);
  const subjects = [...new Set(logs.map((l) => l.subject))];
  const thisWeekLogs = logs.filter((l) => {
    const d = new Date(l.date);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return d >= weekStart;
  });

  const responseColor = (r: string) => RESPONSES.find((x) => x.value === r)?.color ?? "bg-gray-100 text-gray-500";
  const responseLabel = (r: string) => RESPONSES.find((x) => x.value === r)?.label ?? r;

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Sessions", value: logs.length,        emoji: "📚", color: "bg-blue-50 border-blue-100 text-blue-600" },
          { label: "Hours Taught",   value: `${totalHours}h`,   emoji: "⏱️", color: "bg-orange-50 border-orange-100 text-orange-600" },
          { label: "Subjects",       value: subjects.length,    emoji: "🎯", color: "bg-green-50 border-green-100 text-green-600" },
          { label: "This Week",      value: thisWeekLogs.length,emoji: "📅", color: "bg-purple-50 border-purple-100 text-purple-600" },
        ].map((s) => (
          <div key={s.label} className={`border rounded-2xl p-4 text-center ${s.color}`}>
            <p className="text-2xl mb-1">{s.emoji}</p>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs font-semibold opacity-70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter + Add */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Search size={15} className="text-gray-400" />
          <input type="text" placeholder="Search topic, subject, batch..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm bg-white border border-gray-100 rounded-xl px-3 py-2 text-gray-700 placeholder-gray-300 focus:outline-none focus:border-gray-300 w-48 transition-all" />
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
            className="text-sm bg-white border border-gray-100 rounded-xl px-3 py-2 text-gray-600 focus:outline-none focus:border-gray-300">
            <option value="all">All Subjects</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
          <Plus size={15} /> Log Session
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm slide-up">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-blue-500" /> New Teaching Session
          </h3>
          <form onSubmit={saveLog} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-gray-400 transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Subject</label>
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-gray-400 transition-all">
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Topic Covered *</label>
              <input type="text" placeholder="e.g. React Hooks - useState & useEffect"
                value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}
                required autoFocus
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-300 text-sm focus:outline-none focus:border-gray-400 transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Batch / Class</label>
                <input type="text" placeholder="e.g. Batch A, Morning"
                  value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 placeholder-gray-300 text-sm focus:outline-none focus:border-gray-400 transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Duration (mins)</label>
                <input type="number" min={15} max={480} step={15}
                  value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-gray-400 transition-all" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Student Response</label>
              <div className="flex gap-2 flex-wrap">
                {RESPONSES.map((r) => (
                  <button key={r.value} type="button" onClick={() => setForm({ ...form, student_response: r.value })}
                    className={`text-xs px-3 py-1.5 rounded-xl font-semibold border-2 transition-all ${
                      form.student_response === r.value
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-100 bg-white text-gray-500 hover:border-gray-300"
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Extra Topics Covered</label>
              <input type="text" placeholder="e.g. Closures, Event Loop (optional)"
                value={form.extra_topics} onChange={(e) => setForm({ ...form, extra_topics: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-300 text-sm focus:outline-none focus:border-gray-400 transition-all" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Notes / What went well</label>
              <textarea placeholder="Key points covered, doubts raised, homework given..."
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-300 text-sm focus:outline-none focus:border-gray-400 transition-all resize-none" />
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving}
                className="flex-1 bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all">
                {saving ? "Saving..." : "Save Session"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }}
                className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Logs List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm border border-gray-100">📖</div>
          <p className="font-black text-gray-900 text-lg">No sessions logged yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">Start logging your teaching sessions daily!</p>
          <button onClick={() => setShowForm(true)}
            className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all">
            + Log First Session
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const isExpanded = expandedId === log.id;
            const sessionTasks = linkedTasks.filter((t) => t.teaching_log_id === log.id);
            const hasContent = log.notes || log.extra_topics || sessionTasks.length > 0;

            return (
              <div key={log.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:shadow-gray-100 transition-all">
                {/* Main row */}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} className="text-blue-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-gray-900 truncate">{log.topic}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 flex-shrink-0">
                        {log.subject}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${responseColor(log.student_response)}`}>
                        {responseLabel(log.student_response)}
                      </span>
                      {sessionTasks.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 flex-shrink-0">
                          {sessionTasks.filter((t) => t.completed).length}/{sessionTasks.length} tasks
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> {log.duration} mins
                      </span>
                      {log.batch && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Users size={10} /> {log.batch}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {format(new Date(log.date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    <button onClick={() => deleteLog(log.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Expanded section */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-50 space-y-3 pt-3">

                    {/* Extra Topics */}
                    {log.extra_topics && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Extra Topics</p>
                        <p className="text-sm text-gray-600 bg-purple-50 rounded-xl p-3">{log.extra_topics}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {log.notes && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Notes</p>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{log.notes}</p>
                      </div>
                    )}

                    {/* Linked Tasks */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Linked Tasks</p>
                        <button onClick={() => setAddingTaskFor(addingTaskFor === log.id ? null : log.id)}
                          className="flex items-center gap-1 text-xs text-teal-600 font-semibold hover:text-teal-700 transition-all">
                          <Plus size={12} /> Add Task
                        </button>
                      </div>

                      {addingTaskFor === log.id && (
                        <div className="flex gap-2 mb-2">
                          <input type="text" placeholder="Task title..."
                            value={newTaskText[log.id] || ""}
                            onChange={(e) => setNewTaskText({ ...newTaskText, [log.id]: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && addLinkedTask(log.id)}
                            autoFocus
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-gray-400 transition-all" />
                          <button onClick={() => addLinkedTask(log.id)}
                            className="px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition-all">
                            Add
                          </button>
                        </div>
                      )}

                      {sessionTasks.length === 0 && addingTaskFor !== log.id ? (
                        <p className="text-xs text-gray-300 italic">No tasks linked yet</p>
                      ) : (
                        <div className="space-y-1.5">
                          {sessionTasks.map((task) => (
                            <div key={task.id} className="group flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                              <button onClick={() => toggleLinkedTask(task.id, task.completed)} className="flex-shrink-0">
                                {task.completed
                                  ? <CheckCircle2 size={15} className="text-teal-400" />
                                  : <Circle size={15} className="text-gray-300 hover:text-teal-400 transition-colors" />}
                              </button>
                              <p className={`flex-1 text-xs font-medium ${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                                {task.title}
                              </p>
                              <button onClick={() => deleteLinkedTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
