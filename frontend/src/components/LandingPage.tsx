"use client";

interface Props {
  onLaunch: () => void;
}

export default function LandingPage({ onLaunch }: Props) {
  return (
    <div id="landing" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-logo-icon">⚡</div>
          Synth
        </div>
        <div className="nav-links">
          <a href="#">Features</a>
          <a href="#">How it works</a>
          <a href="#">Examples</a>
        </div>
        <div className="nav-right">
          <button className="btn-ghost">Sign in</button>
          <button className="btn-primary" onClick={onLaunch}>Try Synth</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Multi-agent AI research · Powered by LangGraph
        </div>
        <h1 className="hero-title">
          Research that thinks,<br />
          <span className="grad">not just retrieves</span>
        </h1>
        <p className="hero-sub">
          Synth orchestrates four specialized AI agents — Search, Reader, Writer, and Critic — to
          deliver structured, cited research reports in minutes.
        </p>
        <div className="hero-ctas">
          <button className="btn-lg btn-blue" onClick={onLaunch}>
            Start researching →
          </button>
          <button className="btn-lg btn-outline">See an example</button>
        </div>

        {/* FLOW VIZ */}
        <div className="flow-viz">
          {[
            { icon: "🔍", label: "Search Agent" },
            { icon: "📖", label: "Reader Agent" },
            { icon: "✍️", label: "Writer Chain" },
            { icon: "🎯", label: "Critic Chain" },
          ].map((node, i, arr) => (
            <span key={node.label} style={{ display: "flex", alignItems: "center" }}>
              <span className="flow-node">
                <span className="flow-node-icon">{node.icon}</span>
                <span className="flow-node-label">{node.label}</span>
              </span>
              {i < arr.length - 1 && <span className="flow-arrow">→</span>}
            </span>
          ))}
        </div>

        {/* STATS */}
        <div className="hero-stats" style={{ marginTop: 48 }}>
          {[
            { num: "4", lbl: "Specialized agents" },
            { num: "< 60s", lbl: "Avg. research time" },
            { num: "5+", lbl: "Sources per report" },
            { num: "10/10", lbl: "Quality scoring" },
          ].map((s) => (
            <div className="stat" key={s.lbl}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <section className="section">
          <div className="section-head">
            <div className="section-eyebrow">Capabilities</div>
            <div className="section-title">Everything a research analyst does,<br />automated</div>
            <div className="section-sub">
              Each agent is purpose-built for its role in the pipeline. No hallucinations — only
              verified sources.
            </div>
          </div>
          <div className="features-grid">
            {[
              { icon: "🔍", title: "Web Search", desc: "Tavily-powered search finds the most recent and relevant sources for any topic, filtering noise automatically." },
              { icon: "📖", title: "Deep Reading", desc: "BeautifulSoup scrapes full page content — not just snippets — giving the writer real context to work with." },
              { icon: "✍️", title: "Structured Writing", desc: "GPT-based writer chain produces introduction, key findings, analysis, conclusion, and cited sources." },
              { icon: "🎯", title: "Critic Review", desc: "A separate critic chain scores the report 1–10 and gives actionable improvement suggestions." },
              { icon: "⚡", title: "LangGraph Orchestration", desc: "Agents run as a reactive graph — each step's output feeds the next with zero manual wiring." },
              { icon: "📎", title: "Source Tracking", desc: "Every URL is captured and displayed with title, favicon, and snippet for full transparency." },
            ].map((f) => (
              <div className="feat-card" key={f.title}>
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ display: "flex", justifyContent: "center", background: "var(--bg2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <section className="section">
          <div className="section-head">
            <div className="section-eyebrow">Process</div>
            <div className="section-title">How Synth works</div>
          </div>
          <div className="timeline">
            {[
              { step: "step_01", title: "You enter a topic", desc: "Type any research question — a market, technology, concept, or competitive landscape. Synth handles everything from here." },
              { step: "step_02", title: "Search Agent queries the web", desc: "The Search Agent calls Tavily to find up to 5 fresh, reliable sources. It returns structured results: titles, URLs, and content snippets." },
              { step: "step_03", title: "Reader Agent extracts content", desc: "Synth scrapes the most relevant URL for full-page content — headings, paragraphs, data — cleaned of navigation and ads." },
              { step: "step_04", title: "Writer Chain composes the report", desc: "The Writer Chain synthesizes search results and scraped content into a structured report with introduction, key findings, and conclusion." },
              { step: "step_05", title: "Critic Chain scores the output", desc: "A separate Critic Chain reviews the report for accuracy, depth, and structure — giving a score and specific improvement notes." },
            ].map((item, i) => (
              <div className="timeline-item" key={item.step}>
                <div className="timeline-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="timeline-content">
                  <div className="timeline-step">{item.step}</div>
                  <div className="timeline-title">{item.title}</div>
                  <div className="timeline-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="nav-logo-icon" style={{ width: 22, height: 22, fontSize: 10 }}>⚡</div>
          <span className="footer-copy">© 2025 Synth. Built on LangChain + Groq</span>
        </div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
