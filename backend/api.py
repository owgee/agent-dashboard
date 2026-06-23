#!/usr/bin/env python3
"""FastAPI backend for the Agent Dashboard."""

import sys
import json
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path.home() / ".my-agents"))
sys.path.insert(0, str(Path.home() / ".my-agents" / "brain"))

import db as agent_db
import knowledge
from memory_store import MemoryStore

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Agent Dashboard", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

memory = MemoryStore()


import re

_TS_RE = re.compile(r"^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}")
_TS_SUFFIX_RE = re.compile(r"[Z+-]")

def _json_safe(obj):
    if isinstance(obj, list):
        return [_json_safe(i) for i in obj]
    if isinstance(obj, dict):
        return {k: _json_safe(v) for k, v in obj.items()}
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, str) and _TS_RE.match(obj) and not _TS_SUFFIX_RE.search(obj, 19):
        return obj.replace(" ", "T") + "Z"
    return obj


@app.get("/api/stats")
def get_stats():
    conn = agent_db.get_connection()
    chat_count = conn.execute("SELECT COUNT(*) as c FROM chat").fetchone()["c"]
    reflection_count = conn.execute(
        "SELECT COUNT(*) as c FROM chat WHERE role='system' AND content LIKE '%reflection%'"
    ).fetchone()["c"]
    conn.close()

    kconn = knowledge.get_connection()
    pattern_count = kconn.execute("SELECT COUNT(*) as c FROM patterns").fetchone()["c"]
    knowledge_count = kconn.execute("SELECT COUNT(*) as c FROM knowledge").fetchone()["c"]
    interaction_count = kconn.execute("SELECT COUNT(*) as c FROM interactions").fetchone()["c"]
    kconn.close()

    return _json_safe({
        "insights": memory.count(),
        "patterns": pattern_count,
        "knowledge": knowledge_count,
        "interactions": interaction_count,
        "chat_messages": chat_count,
        "reflection_runs": reflection_count,
    })


@app.get("/api/insights")
def get_insights(query: str = Query("", description="Search query")):
    if query:
        results = memory.search(query, n_results=50)
    else:
        results = memory.search("", n_results=50)
    return _json_safe(results)


@app.get("/api/patterns")
def get_patterns():
    conn = knowledge.get_connection()
    rows = conn.execute(
        "SELECT * FROM patterns ORDER BY frequency DESC, last_seen DESC"
    ).fetchall()
    conn.close()
    return _json_safe([dict(r) for r in rows])


@app.get("/api/knowledge")
def get_knowledge(category: str = Query("", description="Filter by category")):
    conn = knowledge.get_connection()
    if category:
        rows = conn.execute(
            "SELECT * FROM knowledge WHERE category = ? ORDER BY confidence DESC",
            (category,),
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM knowledge ORDER BY category, confidence DESC").fetchall()
    conn.close()
    return _json_safe([dict(r) for r in rows])


@app.get("/api/knowledge/categories")
def get_knowledge_categories():
    conn = knowledge.get_connection()
    rows = conn.execute(
        "SELECT category, COUNT(*) as count FROM knowledge GROUP BY category ORDER BY count DESC"
    ).fetchall()
    conn.close()
    return _json_safe([dict(r) for r in rows])


@app.get("/api/chat/recent")
def get_recent_chat(limit: int = Query(20, description="Number of messages")):
    conn = agent_db.get_connection()
    rows = conn.execute(
        "SELECT * FROM chat ORDER BY id DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return _json_safe([dict(r) for r in rows])


@app.get("/api/chat/timeline")
def get_chat_timeline():
    conn = agent_db.get_connection()
    rows = conn.execute("""
        SELECT DATE(created_at) as day, COUNT(*) as count,
               SUM(CASE WHEN role='user' THEN 1 ELSE 0 END) as users,
               SUM(CASE WHEN role='assistant' THEN 1 ELSE 0 END) as assistants,
               SUM(CASE WHEN role='system' THEN 1 ELSE 0 END) as systems
        FROM chat GROUP BY DATE(created_at) ORDER BY day ASC LIMIT 30
    """).fetchall()
    conn.close()
    return _json_safe([dict(r) for r in rows])


@app.get("/api/reflection/history")
def get_reflection_history():
    conn = agent_db.get_connection()
    rows = conn.execute(
        "SELECT * FROM chat WHERE role='system' AND content LIKE '%reflection%' ORDER BY id DESC LIMIT 20"
    ).fetchall()
    conn.close()
    parsed = []
    for r in rows:
        try:
            data = json.loads(r["content"])
            data["id"] = r["id"]
            data["created_at"] = r["created_at"]
            parsed.append(data)
        except (json.JSONDecodeError, TypeError):
            pass
    return _json_safe(parsed)


@app.get("/api/system")
def get_system_info():
    return {
        "embed_model": "nomic-embed-text",
        "reflect_model": "gemma4:latest",
        "vector_dim": 768,
        "vector_db": "LanceDB",
        "structured_db": "SQLite (agent.db + knowledge.db)",
    }


if __name__ == "__main__":
    import uvicorn
    print("Starting Agent Dashboard API on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
