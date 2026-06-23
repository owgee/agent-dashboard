"use client";

import { api, type Knowledge, type KnowledgeCategory } from "@/lib/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BookOpen } from "lucide-react";

const CAT_COLORS: Record<string, string> = {
  strength: "#34d399",
  weakness: "#f59e0b",
  communication: "#60a5fa",
  preference: "#a78bfa",
  goal: "#f472b6",
  project: "#22d3ee",
};

const CAT_LABELS: Record<string, string> = {
  strength: "Strengths",
  weakness: "Weaknesses",
  communication: "Communication",
  preference: "Preferences",
  goal: "Goals",
  project: "Projects",
};

export default function KnowledgeView() {
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState("");

  useEffect(() => {
    api.knowledge(selectedCat || undefined).then(setKnowledge).catch(() => {});
    api.knowledgeCategories().then(setCategories).catch(() => {});
  }, [selectedCat]);

  return (
    <div className="ag-glass  rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <BookOpen size={18} className="text-purple-400" />
        <h2 className="text-lg font-semibold">Knowledge Graph</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories.map((c) => ({ name: CAT_LABELS[c.category] || c.category, value: c.count }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categories.map((c) => (
                    <Cell
                      key={c.category}
                      fill={CAT_COLORS[c.category] || "#6366f1"}
                      stroke="transparent"
                      className="cursor-pointer"
                      onClick={() => setSelectedCat(selectedCat === c.category ? "" : c.category)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,10,26,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map((c) => (
              <button
                key={c.category}
                onClick={() => setSelectedCat(selectedCat === c.category ? "" : c.category)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  selectedCat === c.category
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/70 bg-white/5"
                }`}
              >
                {CAT_LABELS[c.category] || c.category}
                <span className="ml-1.5 text-white/30">{c.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-2 max-h-80 overflow-y-auto pr-1">
          {knowledge.length === 0 ? (
            <div className="text-center py-12 text-white/20">
              <p className="text-sm">No knowledge entries {selectedCat ? `in ${selectedCat}` : ""}</p>
            </div>
          ) : (
            knowledge.map((k, i) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-3 ag-glass-hover rounded-xl p-3"
              >
                <div
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ background: CAT_COLORS[k.category] || "#6366f1" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">
                      {CAT_LABELS[k.category] || k.category}
                    </span>
                    <span className="text-[11px] font-semibold text-white/70 truncate">{k.key}</span>
                    {k.source !== "manual" && k.source !== "seed" && (
                      <span className="text-[9px] text-amber-400/60 uppercase tracking-wider">{k.source}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5 line-clamp-2">{k.value}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
