"use client";

import { api, type Pattern } from "@/lib/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart2 } from "lucide-react";

export default function PatternsTable() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);

  useEffect(() => {
    api.patterns().then(setPatterns).catch(() => {});
    const interval = setInterval(() => api.patterns().then(setPatterns).catch(() => {}), 20000);
    return () => clearInterval(interval);
  }, []);

  const maxFreq = Math.max(...patterns.map((p) => p.frequency), 1);

  return (
    <div className="ag-glass  rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 size={18} className="text-green-400" />
        <h2 className="text-lg font-semibold">Detected Patterns</h2>
      </div>

      {patterns.length === 0 ? (
        <div className="text-center py-12 text-white/20">
          <BarChart2 size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No patterns detected yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {patterns.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="ag-glass-hover rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white/90 truncate">{p.name}</span>
                    <span className="text-[11px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full shrink-0">
                      {p.frequency}x
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-white/20 whitespace-nowrap">
                  {new Date(p.last_seen).toLocaleDateString()}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(p.frequency / maxFreq) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-green-500/60 to-emerald-400/60"
                />
              </div>
              {p.description && (
                <p className="text-[11px] text-white/40 mt-2 leading-relaxed line-clamp-2">
                  {p.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
