"use client";
import { useState } from "react";
import { X, Bell, RefreshCw } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { Priority, Category, RecurrenceType } from "@/types";
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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AddTaskModal({ onClose, defaultWeekId }: Props) {
  const { addTask, generateRecurringTasks } = useTaskStore();
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    category: "work" as Category,
    dueDate: format(new Date(), "yyyy-MM-dd"),
    dueTime: format(new Date(), "HH:mm"),
    reminderMinutes: 15,
    weekId: defaultWeekId,
    isRecurring: false,
    recurrenceType: "daily" as RecurrenceType,
    recurrenceDays: [] as number[],
  });
  const [notifGranted, setNotifGranted] = useState(
    typeof window !== "undefined" && Notification.permission === "granted"
  );

  const toggleDay = (day: number) => {
    setForm((f) => ({
      ...f,
      recurrenceDays: f.recurrenceDays.includes(day)
        ? f.recurrenceDays.filter((d) => d !== day)
        : [...f.recurrenceDays, day],
    }));
  };

  const handleEnableNotif = async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const newTask = await addTask({
      ...form,
      dueDate: new Date(form.dueDate).toISOString(),
      recurrenceDays: form.recurrenceType === "weekly" ? form.recurrenceDays : undefined,
    });

    if (newTask) {
      if (form.isRecurring) await generateRecurringTasks();
      if (notifGranted && form.dueTime) scheduleTaskReminder(newTask);
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
          <input type="text" placeholder="Task title..." value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm"
            autoFocus />

          <textarea placeholder="Description (optional)..." value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none text-sm" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:border-indigo-400 text-sm">
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:border-indigo-400 text-sm">
                <option value="work">💼 Work</option>
                <option value="personal">👤 Personal</option>
                <option value="health">💪 Health</option>
                <option value="learning">📚 Learning</option>
                <option value="other">✨ Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-indigo-400 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Due Time</label>
              <input type="time" value={form.dueTime} onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-indigo-400 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">⏰ Reminder</label>
            <select value={form.reminderMinutes} onChange={(e) => setForm({ ...form, reminderMinutes: parseInt(e.target.value) })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:border-indigo-400 text-sm">
              {REMINDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Recurring Toggle */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
            <button type="button" onClick={() => setForm({ ...form, isRecurring: !form.isRecurring })}
              className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw size={15} className="text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">Recurring Task</span>
              </div>
              <div className={`w-10 h-5 rounded-full transition-all relative ${form.isRecurring ? "bg-indigo-600" : "bg-gray-300"}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isRecurring ? "left-5" : "left-0.5"}`} />
              </div>
            </button>

            {form.isRecurring && (
              <div className="space-y-3 pt-1">
                <div className="flex gap-2">
                  {(["daily", "weekly", "monthly"] as RecurrenceType[]).map((t) => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, recurrenceType: t })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                        form.recurrenceType === t ? "bg-indigo-600 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-indigo-300"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>

                {form.recurrenceType === "weekly" && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">Repeat on days</p>
                    <div className="flex gap-1.5">
                      {DAYS.map((day, i) => (
                        <button key={day} type="button" onClick={() => toggleDay(i)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            form.recurrenceDays.includes(i) ? "bg-indigo-600 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-indigo-300"
                          }`}>
                          {day.slice(0, 1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-indigo-100">
                  <RefreshCw size={12} className="text-indigo-500" />
                  <p className="text-xs text-gray-600">
                    {form.recurrenceType === "daily" && "Repeats every day automatically"}
                    {form.recurrenceType === "weekly" && (
                      form.recurrenceDays.length > 0
                        ? `Repeats every ${form.recurrenceDays.map((d) => DAYS[d]).join(", ")}`
                        : "Repeats every week on same day"
                    )}
                    {form.recurrenceType === "monthly" && "Repeats every month on same date"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {!notifGranted ? (
            <button type="button" onClick={handleEnableNotif}
              className="w-full flex items-center gap-2 justify-center bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium py-2.5 rounded-xl hover:bg-amber-100 transition-all">
              <Bell size={15} />
              Enable notifications for reminders
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <Bell size={14} className="text-green-600" />
              <p className="text-xs text-green-700 font-medium">Notifications enabled ✓</p>
            </div>
          )}

          <button type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-lg">
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
}
