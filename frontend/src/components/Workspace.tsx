"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import AgentNode, { AgentState } from "./AgentNode";
import { runResearch, ResearchResult } from "@/lib/api";
import { markdownToHtml, extractScore } from "@/lib/markdown";

interface Props {
  onHome: () => void;
}

type Mode = "quick" | "deep" | "report";

interface Activity {
  id: number;
  icon: string;
  text: string;
  badge?: string;
  badgeClass?: string;
  time: string;
}

interface AgentStates {
  search: AgentState;
  reader: AgentState;
  writer: AgentState;
  critic: AgentState;
}

interface AgentStatuses {
  search: string;
  reader: string;
  writer: string;
  critic: string;
}

const AGENT_DEFS = [
  { id: "search" as const, icon: "🔍", name: "Search Agent" },
  { id: "reader" as const, icon: "📖", name: "Reader Agent" },
  { id: "writer" as const, icon: "✍️", name: "Writer Chain" },
  { id: "critic" as const, icon: "🎯", name: "Critic Chain" },
];

const CHIPS = [
  "AI agent frameworks comparison 2025",
  "Electric vehicle market trends India 2025",
  "Best practices for LLM prompt engineering",
  "Startup fundraising landscape Series A 2025",
  "Quantum computing commercial applications",
];

function nowTime() {
  return new Date().toLocaleTimeString("en", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function escHtml(s: string) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Module-level counter — avoids nested setState calls that cause flicker
let _activityId = 0;

export default function Workspace({ onHome }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mode, setMode] = useState<Mode>("quick");
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<"search" | "researching" | "done">("search");
  const [progress, setProgressVal] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Initializing agents...");
  const [agentStates, setAgentStates] = useState<AgentStates>({ search: "waiting", reader: "waiting", writer: "waiting", critic: "waiting" });
  const [agentStatuses, setAgentStatuses] = useState<AgentStatuses>({ search: "Waiting", reader: "Waiting", writer: "Waiting", critic: "Waiting" });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [researchTopic, setResearchTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const activityLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activityLogRef.current) {
      activityLogRef.current.scrollTop = activityLogRef.current.scrollHeight;
    }
  }, [activities]);

  // Single setState call — no nesting, no flicker
  const addActivity = useCallback((icon: string, text: string, badge?: string, badgeClass?: string) => {
    const id = ++_activityId;
    setActivities((prev) => [...prev, { id, icon, text, badge, badgeClass, time: nowTime() }]);
  }, []);

  const setAgent = useCallback((id: keyof AgentStates, state: AgentState, status: string) => {
    setAgentStates((prev) => ({ ...prev, [id]: state }));
    setAgentStatuses((prev) => ({ ...prev, [id]: status }));
  }, []);

  const setProgress = useCallback((pct: number, label: string) => {
    setProgressVal(pct);
    setProgressLabel(label);
  }, []);

  const resetSearch = useCallback(() => {
    _activityId = 0;
    setQuery("");
    setPhase("search");
    setResult(null);
    setResearchTopic("");
    setLoading(false);
    setProgressVal(0);
    setProgressLabel("Initializing agents...");
    setAgentStates({ search: "waiting", reader: "waiting", writer: "waiting", critic: "waiting" });
    setAgentStatuses({ search: "Waiting", reader: "Waiting", writer: "Waiting", critic: "Waiting" });
    setActivities([]);
  }, []);

  const startResearch = useCallback(async () => {
    const q = query.trim();
    if (!q || loading) return;

    setResearchTopic(q);
    setPhase("researching");
    setLoading(true);
    setResult(null);
    setActivities([]);
    setProgress(20, "Running research pipeline...");
    setAgent("search", "active", "Running");
    addActivity("🔍", "Running Search Agent");

    try {
      const data = await runResearch(q);

      setAgent("search", "done", "Completed");
      addActivity("✅", "Search complete", "done", "badge-green");

      setAgent("reader", "active", "Scraping");
      addActivity("📖", "Running Reader Agent");
      setProgress(50, "Scraping content...");

      // Small delay so user sees reader agent animate
      await new Promise((r) => setTimeout(r, 400));

      setAgent("reader", "done", "Completed");
      addActivity("✅", "Content extracted", "done", "badge-green");

      setAgent("writer", "active", "Writing");
      addActivity("✍️", "Running Writer Chain");
      setProgress(75, "Writing report...");

      await new Promise((r) => setTimeout(r, 400));

      setAgent("writer", "done", "Completed");
      addActivity("✅", "Report written", "done", "badge-green");

      setAgent("critic", "active", "Reviewing");
      addActivity("🎯", "Running Critic Chain");
      setProgress(90, "Reviewing report...");

      await new Promise((r) => setTimeout(r, 400));

      setAgent("critic", "done", "Completed");
      addActivity("✅", "Critic review done", "done", "badge-green");

      setProgress(100, "Research Complete");
      setResult(data);
      setPhase("done");
      addActivity("🎉", "Research complete", undefined, undefined);
    } catch (err: any) {
      addActivity("❌", err.message ?? "Unknown error", "error", "badge-amber");
      setProgress(0, "Error — please try again");
      setAgentStates({ search: "waiting", reader: "waiting", writer: "waiting", critic: "waiting" });
      setAgentStatuses({ search: "Waiting", reader: "Waiting", writer: "Waiting", critic: "Waiting" });
      setPhase("search");
    } finally {
      setLoading(false);
    }
  }, [query, loading, addActivity, setAgent, setProgress]);

  const copyReport = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.report);
      addActivity("📋", "Report copied to clipboard", "done", "badge-green");
    } catch {
      alert("Could not copy — please select the text manually.");
    }
  };

  const exportReport = () => {
    if (!result) return;
    const blob = new Blob([result.report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "research-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const score = result ? extractScore(result.feedback) : "N/A";
  const scoreClass = parseFloat(score) >= 7 ? "score-high" : "score-mid";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", flexDirection: "row" }}>
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">⚡</div>
            {!sidebarCollapsed && <span>Synth</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed((v) => !v)} title="Toggle sidebar">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          <button className="sidebar-new" onClick={resetSearch} style={{ margin: "8px 0 16px", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: "1px solid var(--border2)", borderRadius: "var(--radius)", color: "var(--text2)", fontSize: 13, transition: "all .2s", whiteSpace: "nowrap", overflow: "hidden", width: "100%" }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            {!sidebarCollapsed && <span>New research</span>}
          </button>
          {!sidebarCollapsed && (
            <>
              <div className="sidebar-section">Recents</div>
              {["Current research", "AI market landscape 2025", "Rust vs Go performance", "Series A fundraising guide"].map((item, i) => (
                <div key={item} className={`sidebar-item ${i === 0 ? "active" : ""}`}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item}</span>
                </div>
              ))}
              <div className="sidebar-section" style={{ marginTop: 12 }}>Tools</div>
              <div className="sidebar-item">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                <span>Templates</span>
              </div>
            </>
          )}
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-avatar">
            <div className="sidebar-avatar-circle">U</div>
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>User</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>Pro plan</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {/* TOPBAR */}
        <div className="topbar">
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text2)" }}>
            {phase === "search" ? "Research workspace" : researchTopic || "Research workspace"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="topbar-btn" onClick={onHome}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
              Home
            </button>
            {phase === "done" && (
              <button className="topbar-btn" onClick={exportReport}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Export
              </button>
            )}
          </div>
        </div>

        {/* SEARCH PANEL */}
        {phase === "search" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: 40, textAlign: "center" }}>
            <h2 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.8px", marginBottom: 8 }}>
              What would you like to <span className="grad">research</span>?
            </h2>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 36 }}>
              Powered by multi-agent AI — search, scrape, analyze, and report.
            </p>
            <div className="search-box">
              <textarea
                className="search-textarea"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a research topic, question, or market you want to explore..."
                rows={3}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) startResearch(); }}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {(["quick", "deep", "report"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      className={`mode-btn ${mode === m ? "active" : ""}`}
                      onClick={() => setMode(m)}
                    >
                      {m === "quick" && <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>}
                      {m === "deep" && <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>}
                      {m === "report" && <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
                      {m === "quick" ? "Quick" : m === "deep" ? "Deep research" : "Report only"}
                    </button>
                  ))}
                </div>
                <button className="send-btn" onClick={startResearch} disabled={loading || !query.trim()}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                  Research
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24, maxWidth: 680, justifyContent: "center" }}>
              {CHIPS.map((chip) => (
                <div key={chip} className="chip" onClick={() => setQuery(chip)}>
                  {chip.length > 35 ? chip.slice(0, 35) + "…" : chip}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESEARCH / DONE PANEL */}
        {(phase === "researching" || phase === "done") && (
          <div style={{ display: "flex", flex: 1, overflow: "hidden", flexDirection: "row" }}>
            {/* MAIN OUTPUT */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", padding: 24 }}>
              {/* Topic + score */}
              <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Research topic</div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.3px" }}>{researchTopic}</h2>
                </div>
                {phase === "done" && (
                  <span className={`score-badge ${scoreClass}`}>✓ Score: {score}</span>
                )}
              </div>

              {/* SKELETON while loading */}
              {phase === "researching" && (
                <div style={{ marginBottom: 16 }}>
                  <div className="report-card">
                    <div style={{ marginBottom: 16 }}>
                      <div className="skeleton" style={{ height: 24, width: "60%", marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 14, width: "40%" }} />
                    </div>
                    {[100, 85, 92, 70].map((w, i) => (
                      <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, marginBottom: 6 }} />
                    ))}
                  </div>
                </div>
              )}

              {/* REPORT */}
              {phase === "done" && result && (
                <>
                  <div className="report-card">
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.3px" }}>{researchTopic}</div>
                        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
                          Generated · 4 agents · {result.sources.length} sources
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="report-action-btn" onClick={copyReport}>
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                          Copy
                        </button>
                        <button className="report-action-btn" onClick={exportReport}>
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                          Export
                        </button>
                      </div>
                    </div>
                    <div className="report-toc">
                      <div className="report-toc-title">Contents</div>
                      {["Introduction", "Key Findings", "Analysis", "Conclusion", "Sources"].map((s, i) => (
                        <div key={s} className="report-toc-item">
                          <span className="report-toc-num">{i + 1}</span>{s}
                        </div>
                      ))}
                    </div>
                    <div className="report-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(result.report) }} />
                  </div>

                  {/* CRITIC CARD */}
                  <div className="report-card">
                    <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--text3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Critic review</div>
                    <CriticBody feedback={result.feedback} score={score} />
                  </div>

                  {/* SOURCES */}
                  <div style={{ marginTop: 0 }}>
                    <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--text3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Sources collected</div>
                    {result.sources.map((s, i) => {
                      let domain = "";
                      try { domain = new URL(s.url).hostname; } catch {}
                      return (
                        <div key={i} className="source-card">
                          <div className="source-fav">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`}
                              width={16} height={16}
                              alt=""
                              onError={(e) => { (e.currentTarget.parentNode as HTMLElement).textContent = "🌐"; }}
                              style={{ borderRadius: 2 }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title || domain}</div>
                            <div style={{ fontSize: 10, color: "var(--text3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "var(--mono)" }}>{s.url}</div>
                            <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 4, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>{s.snippet}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* RIGHT PANEL */}
            <div style={{ width: 320, minWidth: 320, borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* PROGRESS */}
              <div className="progress-bar-wrap">
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text2)" }}>
                  <span>{progressLabel}</span>
                  <span style={{ fontFamily: "var(--mono)" }}>{progress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* AGENT GRAPH */}
              <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--text3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Agent graph</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {AGENT_DEFS.map((a) => (
                    <AgentNode key={a.id} icon={a.icon} name={a.name} state={agentStates[a.id]} status={agentStatuses[a.id]} />
                  ))}
                </div>
              </div>

              {/* ACTIVITY LOG */}
              <div ref={activityLogRef} style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--text3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>Live activity</div>
                {activities.map((a) => (
                  <div key={a.id} className="activity-item">
                    <div className="activity-icon">{a.icon}</div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
                        {a.text}
                        {a.badge && <span className={`activity-badge ${a.badgeClass ?? "badge-blue"}`} style={{ marginLeft: 6 }}>{a.badge}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--mono)", marginTop: 2 }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── CRITIC BODY ─── */
function CriticBody({ feedback, score }: { feedback: string; score: string }) {
  const num = parseFloat(score);
  const scoreClass = num >= 7 ? "score-high" : "score-mid";
  const lines = feedback.split("\n");

  const parts: JSX.Element[] = [
    <div key="score-row" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span className={`score-badge ${scoreClass}`}>Score: {score}</span>
    </div>,
  ];

  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length) {
      parts.push(
        <ul key={key} style={{ paddingLeft: 18, fontSize: 13, color: "var(--text2)", lineHeight: 1.8, marginBottom: 12 }}>
          {listItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const l = line.trim();
    if (!l) { flushList(`flush-${idx}`); return; }
    if (l.startsWith("Score:")) return;
    if (l.startsWith("Strengths:") || l.startsWith("Areas to Improve:") || l.startsWith("One line verdict:")) {
      flushList(`flush-${idx}`);
      parts.push(<p key={idx} style={{ marginBottom: 8 }}><strong>{l}</strong></p>);
    } else if (l.startsWith("- ")) {
      listItems.push(l.slice(2));
    } else {
      flushList(`flush-${idx}`);
      parts.push(<p key={idx} style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic", paddingTop: 10, borderTop: "1px solid var(--border)" }}>{l}</p>);
    }
  });
  flushList("final");

  return <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8 }}>{parts}</div>;
}