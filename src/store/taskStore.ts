"use client";
import { create } from "zustand";
import { Task, Priority, Category, RecurrenceType } from "@/types";
import { getCurrentWeekId, getWeekId } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { format, addDays, addWeeks, addMonths, startOfDay } from "date-fns";

interface TaskStore {
  tasks: Task[];
  selectedWeekId: string;
  loading: boolean;
  setSelectedWeek: (weekId: string) => void;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, "id" | "createdAt" | "completed">) => Promise<Task | null>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string, deleteAll?: boolean) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  generateRecurringTasks: () => Promise<void>;
}

function mapRow(t: any): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority as Priority,
    category: t.category as Category,
    weekId: t.week_id,
    dueDate: t.due_date,
    dueTime: t.due_time ?? undefined,
    reminderMinutes: t.reminder_minutes ?? 15,
    isRecurring: t.is_recurring ?? false,
    recurrenceType: t.recurrence_type ?? undefined,
    recurrenceDays: t.recurrence_days ?? undefined,
    parentTaskId: t.parent_task_id ?? undefined,
    completed: t.completed,
    completedAt: t.completed_at,
    createdAt: t.created_at,
  };
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedWeekId: getCurrentWeekId(),
  loading: false,

  setSelectedWeek: (weekId) => set({ selectedWeekId: weekId }),

  fetchTasks: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      set({ tasks: data.map(mapRow) });
    }
    set({ loading: false });
  },

  addTask: async (task) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: task.category,
        week_id: task.weekId,
        due_date: task.dueDate,
        due_time: task.dueTime ?? null,
        reminder_minutes: task.reminderMinutes ?? 15,
        is_recurring: task.isRecurring ?? false,
        recurrence_type: task.recurrenceType ?? null,
        recurrence_days: task.recurrenceDays ?? null,
        parent_task_id: task.parentTaskId ?? null,
        completed: false,
        user_id: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      const newTask = mapRow(data);
      set((state) => ({ tasks: [newTask, ...state.tasks] }));
      return newTask;
    }
    return null;
  },

  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const completed = !task.completed;
    const { error } = await supabase
      .from("tasks")
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq("id", id);
    if (!error) {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, completed, completedAt: completed ? new Date().toISOString() : undefined } : t
        ),
      }));
    }
  },

  deleteTask: async (id, deleteAll = false) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    if (deleteAll && task.isRecurring) {
      // Delete parent + all children
      const parentId = task.parentTaskId ?? id;
      await supabase.from("tasks").delete().eq("parent_task_id", parentId);
      await supabase.from("tasks").delete().eq("id", parentId);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== parentId && t.parentTaskId !== parentId),
      }));
    } else {
      await supabase.from("tasks").delete().eq("id", id);
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    }
  },

  updateTask: async (id, updates) => {
    const { error } = await supabase.from("tasks").update(updates).eq("id", id);
    if (!error) {
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
    }
  },

  generateRecurringTasks: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all parent recurring tasks
    const { data: recurringTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_recurring", true)
      .is("parent_task_id", null)
      .eq("user_id", user.id);

    if (!recurringTasks) return;

    const today = startOfDay(new Date());
    const next14days = Array.from({ length: 14 }, (_, i) => addDays(today, i));
    const inserts: any[] = [];

    for (const parent of recurringTasks) {
      const task = mapRow(parent);

      for (const day of next14days) {
        const dayOfWeek = day.getDay();
        const dateStr = format(day, "yyyy-MM-dd");
        const weekId = getWeekId(day);

        let shouldCreate = false;

        if (task.recurrenceType === "daily") {
          shouldCreate = true;
        } else if (task.recurrenceType === "weekly") {
          shouldCreate = !task.recurrenceDays?.length || task.recurrenceDays.includes(dayOfWeek);
        } else if (task.recurrenceType === "monthly") {
          const parentDay = new Date(task.dueDate).getDate();
          shouldCreate = day.getDate() === parentDay;
        }

        if (!shouldCreate) continue;

        // Check if already exists for this date
        const alreadyExists = get().tasks.some(
          (t) => t.parentTaskId === task.id && t.dueDate.startsWith(dateStr)
        );
        if (alreadyExists) continue;

        inserts.push({
          title: task.title,
          description: task.description,
          priority: task.priority,
          category: task.category,
          week_id: weekId,
          due_date: new Date(dateStr).toISOString(),
          due_time: task.dueTime ?? null,
          reminder_minutes: task.reminderMinutes ?? 15,
          is_recurring: false,
          parent_task_id: task.id,
          completed: false,
          user_id: user.id,
        });
      }
    }

    if (inserts.length > 0) {
      const { data } = await supabase.from("tasks").insert(inserts).select();
      if (data) {
        set((state) => ({ tasks: [...state.tasks, ...data.map(mapRow)] }));
      }
    }
  },
}));
