"use client";
import { useMemo } from "react";

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Small daily improvements lead to stunning results.", author: "Robin Sharma" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Productivity is never an accident. It is always the result of commitment.", author: "Paul J. Meyer" },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning ☀️";
  if (h < 17) return "Good Afternoon 🌤️";
  if (h < 21) return "Good Evening 🌙";
  return "Good Night 🌟";
}

export default function DailyQuote() {
  const quote = useMemo(() => {
    const day = new Date().getDate() + new Date().getMonth() * 31;
    return QUOTES[day % QUOTES.length];
  }, []);

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold opacity-80 mb-2">{getGreeting()}</p>
          <p className="text-base font-medium leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
          <p className="text-xs opacity-70 mt-2">— {quote.author}</p>
        </div>
        <span className="text-3xl flex-shrink-0">✨</span>
      </div>
    </div>
  );
}
