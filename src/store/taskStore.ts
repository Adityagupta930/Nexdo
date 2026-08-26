"use client";
import { create } from "zustand";
import { Task, Priority, Category } from "@/types";
import { getCurrentWeekId } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface TaskStore {
  tasks: Task[];
  selectedWeekId: string;
  loading: boolean;
  setSelectedWeek: (weekId: string) => void;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, "id" | "createdAt" | "completed">) => Promise<Task | null>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
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
      const tasks: Task[] = data.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        priority: t.priority as Priority,
        category: t.category as Category,
        weekId: t.week_id,
        dueDate: t.due_date,
        dueTime: t.due_time ?? undefined,
        reminderMinutes: t.reminder_minutes ?? 15,
        completed: t.completed,
        completedAt: t.completed_at,
        createdAt: t.created_at,
      }));
      set({ tasks });
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
        completed: false,
        user_id: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category,
        weekId: data.week_id,
        dueDate: data.due_date,
        dueTime: data.due_time ?? undefined,
        reminderMinutes: data.reminder_minutes ?? 15,
        completed: data.completed,
        createdAt: data.created_at,
      };
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

  deleteTask: async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) {
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
}));
