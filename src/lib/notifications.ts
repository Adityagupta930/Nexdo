import { Task } from "@/types";

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function showNotification(title: string, body: string, icon = "/icons/icon-192.png") {
  if (Notification.permission !== "granted") return;
  new Notification(title, { body, icon, badge: "/icons/icon-192.png" });
}

// Store scheduled timeouts in memory
const scheduledTimers: Record<string, NodeJS.Timeout[]> = {};

export function scheduleTaskReminder(task: Task) {
  if (!task.dueTime || task.completed) return;
  cancelTaskReminder(task.id);

  const [hours, minutes] = task.dueTime.split(":").map(Number);
  const dueDate = new Date(task.dueDate);
  dueDate.setHours(hours, minutes, 0, 0);

  const now = Date.now();
  const timers: NodeJS.Timeout[] = [];

  // Reminder BEFORE due time
  const reminderMins = task.reminderMinutes ?? 15;
  const reminderTime = dueDate.getTime() - reminderMins * 60 * 1000;
  if (reminderTime > now) {
    const t = setTimeout(() => {
      showNotification(
        `⏰ Reminder: ${task.title}`,
        `Due in ${reminderMins} minute${reminderMins !== 1 ? "s" : ""}! Get it done.`
      );
    }, reminderTime - now);
    timers.push(t);
  }

  // Notification AT due time
  if (dueDate.getTime() > now) {
    const t = setTimeout(() => {
      showNotification(
        `🔔 Task Due Now: ${task.title}`,
        `This task is due right now! Time to complete it.`
      );
    }, dueDate.getTime() - now);
    timers.push(t);
  }

  // Notification AFTER due time (overdue) - 30 mins after
  const overdueTime = dueDate.getTime() + 30 * 60 * 1000;
  if (overdueTime > now) {
    const t = setTimeout(() => {
      showNotification(
        `⚠️ Overdue: ${task.title}`,
        `This task is 30 minutes overdue. Please complete it soon!`
      );
    }, overdueTime - now);
    timers.push(t);
  }

  if (timers.length > 0) scheduledTimers[task.id] = timers;
}

export function cancelTaskReminder(taskId: string) {
  if (scheduledTimers[taskId]) {
    scheduledTimers[taskId].forEach(clearTimeout);
    delete scheduledTimers[taskId];
  }
}

export function scheduleAllReminders(tasks: Task[]) {
  tasks.forEach((task) => {
    if (!task.completed && task.dueTime) scheduleTaskReminder(task);
  });
}
