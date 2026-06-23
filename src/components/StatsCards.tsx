"use client";

import { api, type Stats } from "@/lib/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain, Database, Lightbulb, RefreshCw, MessageSquare, Hash,
} from "lucide-react";

const statCards = [
  { key: "insights" as const, label: "Insights", icon: Lightbulb, color: "text-blue-400" },
  { key: "patterns" as const, label: "Patterns", icon: Hash, color: "text-green-400" },
  { key: "knowledge" as const, label: "Knowledge Entries", icon: Database, color: "text-purple-400" },
  { key: "reflection_runs" as const, label: "Reflection Runs", icon: RefreshCw, color: "text-cyan-400" },
  { key: "chat_messages" as const, label: "Chat Messages", icon: MessageSquare, color: "text-amber-400" },
  { key: "interactions" as const, label: "Logged Interactions", icon: Brain, color: "text-emerald-400" },
];

function AnimatedStat({ value, label, icon: Icon, color }: {
  value: number; label: string; icon: React.ElementType; color: string;
}) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const dur = 800;
    const step = Math.max(1, Math.floor(value / 30));
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(interval); }
      else setDisplay(start);
    }, dur / (value / step));
    return () => clearInterval(interval);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ag-glass rounded-2xl p-5 flex items-center gap-4"
    >
      <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="text-3xl font-bold count-up tracking-tight">{display.toLocaleString()}</div>
        <div className="text-xs text-white/40 uppercase tracking-widest mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}

export default function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
    const interval = setInterval(() => api.stats().then(setStats).catch(() => {}), 10000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
            <div key={s.key} className="ag-glass rounded-2xl p-5 flex items-center gap-4 animate-pulse">
            <div className="p-3 rounded-xl bg-white/5" />
            <div className="space-y-2">
              <div className="h-7 w-16 bg-white/5 rounded" />
              <div className="h-3 w-20 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((s, i) => (
        <motion.div
          key={s.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <AnimatedStat value={stats[s.key]} label={s.label} icon={s.icon} color={s.color} />
        </motion.div>
      ))}
    </div>
  );
}
