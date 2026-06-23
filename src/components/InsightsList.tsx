"use client";

import { api, type Insight } from "@/lib/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

const typeColor: Record<string, string> = {
  insight: "badge-insight",
  preference: "badge-preference",
  pattern: "badge-pattern",
  correction: "badge-correction",
  decision: "badge-decision",
  technical: "badge-technical",
  project: "badge-project",
};

function badgeClass(type: string): string {
  const t = type.toLowerCase();
  for (const [k, v] of Object.entries(typeColor)) {
    if (t.includes(k)) return v;
  }
  return "badge-insight";
}

export default function InsightsList() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.insights(query || undefined).then(setInsights).catch(() => {});
    const interval = setInterval(() => api.insights(query || undefined).then(setInsights).catch(() => {}), 15000);
    return () => clearInterval(interval);
  }, [query]);

  return (
    <div className="ag-glass  rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-blue-400" />
          <h2 className="text-lg font-semibold">Learned Insights</h2>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search insights..."
            className="ag-glass rounded-xl pl-9 pr-4 py-2 text-xs w-56 outline-none focus:border-white/20 transition-colors"
          />
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-16 text-white/20">
          <Sparkles size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No insights yet. The reflector runs every 15 minutes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((ins, i) => (
            <motion.div
              key={ins.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="ag-glass-hover rounded-xl p-4 transition-all cursor-default"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`badge ${badgeClass(ins.type)}`}>
                      {ins.type}
                    </span>
                    {(ins.categories || []).map((cat: string) => (
                      <span key={cat} className="text-[10px] text-white/30 uppercase tracking-wider">
                        {cat}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-semibold text-white/90">{ins.summary}</h3>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">{ins.detail}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                    <span>confidence</span>
                    <span className="text-white/70 font-semibold">{Math.round(ins.confidence * 100)}%</span>
                  </div>
                  <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ins.confidence * 100}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
