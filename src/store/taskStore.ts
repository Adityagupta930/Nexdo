"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { Task, Priority, Category } from "@/types";
import { getCurrentWeekId } from "@/lib/utils";

interface TaskStore {
  tasks: Task[];
  selectedWeekId: string;
  setSelectedWeek: (weekId: string) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "completed">) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  getTasksByWeek: (weekId: string) => Task[];
  getTasksByDate: (date: string) => Task[];
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      selectedWeekId: getCurrentWeekId(),

      setSelectedWeek: (weekId) => set({ selectedWeekId: weekId }),

      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            { ...task, id: uuidv4(), createdAt: new Date().toISOString(), completed: false },
          ],
        })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
              : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      getTasksByWeek: (weekId) => get().tasks.filter((t) => t.weekId === weekId),

      getTasksByDate: (date) => get().tasks.filter((t) => t.dueDate.startsWith(date)),
    }),
    { name: "nexdo-tasks" }
  )
);
