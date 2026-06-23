const BASE = "/api";

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

export interface Stats {
  insights: number;
  patterns: number;
  knowledge: number;
  interactions: number;
  chat_messages: number;
  reflection_runs: number;
}

export interface Insight {
  id: string;
  type: string;
  summary: string;
  detail: string;
  confidence: number;
  categories: string[];
  agent_id: string;
  created_at: string;
}

export interface Pattern {
  id: number;
  name: string;
  description: string;
  frequency: number;
  last_seen: string;
  created_at: string;
}

export interface Knowledge {
  id: number;
  category: string;
  key: string;
  value: string;
  confidence: number;
  source: string;
  updated_at: string;
}

export interface KnowledgeCategory {
  category: string;
  count: number;
}

export interface ChatMessage {
  id: number;
  agent_id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface ChatTimeline {
  day: string;
  count: number;
  users: number;
  assistants: number;
  systems: number;
}

export interface ReflectionRun {
  id: number;
  type: string;
  n_interactions?: number;
  n_insights?: number;
  n_shifts?: number;
  topics?: string[];
  created_at: string;
}

export interface SystemInfo {
  embed_model: string;
  reflect_model: string;
  vector_dim: number;
  vector_db: string;
  structured_db: string;
}

export const api = {
  stats: () => fetchJSON<Stats>("/stats"),
  insights: (query?: string) =>
    fetchJSON<Insight[]>(`/insights${query ? `?query=${encodeURIComponent(query)}` : ""}`),
  patterns: () => fetchJSON<Pattern[]>("/patterns"),
  knowledge: (category?: string) =>
    fetchJSON<Knowledge[]>(`/knowledge${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  knowledgeCategories: () => fetchJSON<KnowledgeCategory[]>("/knowledge/categories"),
  recentChat: (limit?: number) =>
    fetchJSON<ChatMessage[]>(`/chat/recent${limit ? `?limit=${limit}` : ""}`),
  chatTimeline: () => fetchJSON<ChatTimeline[]>("/chat/timeline"),
  reflectionHistory: () => fetchJSON<ReflectionRun[]>("/reflection/history"),
  system: () => fetchJSON<SystemInfo>("/system"),
};
