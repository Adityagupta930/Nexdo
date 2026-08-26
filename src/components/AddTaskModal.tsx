"use client";
import { useState } from "react";
import { X, Bell } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { Priority, Category } from "@/types";
import { format } from "date-fns";
import { scheduleTaskReminder, requestNotificationPermission } from "@/lib/notifications";

interface Props {
  onClose: () => void;
  defaultWeekId: string;
}

const REMINDER_OPTIONS = [
  { label: "5 min before", value: 5 },
  { label: "10 min before", value: 10 },
  { label: "15 min before", value: 15 },
  { label: "30 min before", value: 30 },
  { label: "1 hour before", value: 60 },
  { label: "2 hours before", value: 120 },
];

export default function AddTaskModal({ onClose, defaultWeekId }: Props) {
  const addTask = useTaskStore((s) => s.addTask);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    category: "work" as Category,
    dueDate: format(new Date(), "yyyy-MM-dd"),
    dueTime: format(new Date(), "HH:mm"),
    reminderMinutes: 15,
    weekId: defaultWeekId,
  });
  const [notifGranted, setNotifGranted] = useState(
    typeof window !== "undefined" && Notification.permission === "granted"
  );

  const handleEnableNotif = async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const task = await addTask({
      ...form,
      dueDate: new Date(form.dueDate).toISOString(),
    });

    // Schedule reminder if notification granted and time set
    if (notifGranted && form.dueTime) {
      scheduleTaskReminder({
        ...form,
        id: (task as any)?.id ?? "",
        dueDate: new Date(form.dueDate).toISOString(),
        completed: false,
        createdAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">New Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Task title..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm"
            autoFocus
          />

          <textarea
            placeholder="Description (optional)..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none text-sm"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:border-indigo-400 transition-all text-sm">
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:border-indigo-400 transition-all text-sm">
                <option value="work">💼 Work</option>
                <option value="personal">👤 Personal</option>
                <option value="health">💪 Health</option>
                <option value="learning">📚 Learning</option>
                <option value="other">✨ Other</option>
              </select>
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-indigo-400 transition-all text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Due Time</label>
              <input type="time" value={form.dueTime} onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-indigo-400 transition-all text-sm" />
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">⏰ Reminder</label>
            <select value={form.reminderMinutes} onChange={(e) => setForm({ ...form, reminderMinutes: parseInt(e.target.value) })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:border-indigo-400 transition-all text-sm">
              {REMINDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Notification Permission Banner */}
          {!notifGranted && (
            <button type="button" onClick={handleEnableNotif}
              className="w-full flex items-center gap-2 justify-center bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium py-2.5 rounded-xl hover:bg-amber-100 transition-all">
              <Bell size={15} />
              Enable notifications to get reminders
            </button>
          )}
          {notifGranted && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <Bell size={14} className="text-green-600" />
              <p className="text-xs text-green-700 font-medium">Notifications enabled — you&apos;ll get reminders!</p>
            </div>
          )}

          <button type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-lg mt-2">
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
}
