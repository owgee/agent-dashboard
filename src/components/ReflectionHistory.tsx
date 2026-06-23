"use client";

import { api, type ReflectionRun } from "@/lib/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function ReflectionHistory() {
  const [runs, setRuns] = useState<ReflectionRun[]>([]);

  useEffect(() => {
    api.reflectionHistory().then(setRuns).catch(() => {});
  }, []);

  return (
    <div className="ag-glass  rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Activity size={18} className="text-cyan-400" />
        <h2 className="text-lg font-semibold">Reflection Runs</h2>
      </div>

      {runs.length === 0 ? (
        <div className="text-center py-10 text-white/20">
          <Activity size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No reflection runs recorded.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {runs.map((run, i) => (
            <motion.div
              key={run.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between ag-glass-hover rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${run.n_insights && run.n_insights > 0 ? "bg-green-400" : "bg-white/10"}`} />
                <div>
                  <span className="text-xs text-white/60">
                    {run.n_interactions || 0} interactions → {run.n_insights || 0} insights
                  </span>
                  {(run.topics || []).length > 0 && (
                    <div className="flex gap-1.5 mt-1">
                      {(run.topics || []).slice(0, 3).map((t: string) => (
                        <span key={t} className="text-[9px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-white/20 shrink-0">
                {run.created_at ? new Date(run.created_at).toLocaleString() : ""}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
