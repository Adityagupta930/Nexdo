"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Zap, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";

const ALLOWED_EMAIL = "adityaworkspace021103@gmail.com";

const FEATURES = [
  { emoji: "✅", text: "Smart task management" },
  { emoji: "🔥", text: "Daily habit tracking" },
  { emoji: "⏱️", text: "Pomodoro focus timer" },
  { emoji: "📊", text: "Productivity analytics" },
  { emoji: "🎯", text: "Goal setting & tracking" },
  { emoji: "🔔", text: "Smart reminders" },
];

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (email.trim().toLowerCase() !== ALLOWED_EMAIL) {
      setError("Access denied. Unauthorized email.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Wrong email or password."); setLoading(false); return; }
    if (data.session) { router.push("/"); router.refresh(); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[#F7F8FC]">

      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-500 opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400 opacity-10 rounded-full blur-3xl" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-white font-black text-xl tracking-tight">Nexdo</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white leading-tight mb-3">
            Get more<br />
            <span className="text-red-400">done</span> every<br />
            single day.
          </h2>
          <p className="text-gray-500 text-base mb-10">Your all-in-one productivity suite.</p>
          <div className="grid grid-cols-2 gap-2">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                <span className="text-sm">{f.emoji}</span>
                <span className="text-gray-400 text-xs font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-xs relative z-10">Built for focused individuals.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 lg:max-w-[460px] flex items-center justify-center p-8">
        <div className="w-full max-w-sm slide-up">

          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
              <Zap size={17} className="text-white" />
            </div>
            <span className="font-black text-xl text-gray-900">Nexdo</span>
          </div>

          <h2 className="text-3xl font-black text-gray-900 mb-1">Sign in</h2>
          <p className="text-gray-400 text-sm mb-8">Welcome back! Let&apos;s get productive.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all text-sm font-medium" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3.5 pr-12 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all text-sm font-medium" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                <span className="text-sm">⚠️</span>
                <p className="text-red-500 text-xs font-semibold">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95 mt-2 text-sm">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-300 mt-6">🔒 Private access only</p>
        </div>
      </div>
    </div>
  );
}
