"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Activity } from "lucide-react";
import ArchitectureFlow from "@/components/ArchitectureFlow";
import StatsCards from "@/components/StatsCards";
import InsightsList from "@/components/InsightsList";
import PatternsTable from "@/components/PatternsTable";
import KnowledgeView from "@/components/KnowledgeView";
import ReflectionHistory from "@/components/ReflectionHistory";
import { api, type SystemInfo } from "@/lib/api";

export default function Home() {
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    api.system().then(setSysInfo).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
            <Cpu size={28} className="text-white/80" />
          </div>
          <div>
            <h1 className="text-2xl font-bold glow-text">Agent Reflection Loop</h1>
            <p className="text-xs text-white/30 mt-1">
              Self-improving cognitive agent — memory, patterns & insights
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[10px] text-white/20">
          <Activity size={12} />
          <span>Auto-refreshes every 10s</span>
          {sysInfo && (
            <>
              <span className="w-px h-4 bg-white/10" />
              <span>{sysInfo.embed_model}</span>
              <span className="w-px h-4 bg-white/10" />
              <span>{sysInfo.reflect_model}</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Architecture Flow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <ArchitectureFlow />
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <StatsCards />
      </motion.div>

      {/* Two-column: Insights + Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <InsightsList />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <PatternsTable />
        </motion.div>
      </div>

      {/* Two-column: Knowledge + Reflection History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <KnowledgeView />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <ReflectionHistory />
        </motion.div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-white/10 pb-8">
        Agent Dashboard v1.0 — LanceDB + SQLite + Gemma 4 + Nomic Embed
      </div>
    </div>
  );
}
