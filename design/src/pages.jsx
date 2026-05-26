// Folio — secondary pages: Templates, Compliance, Pipeline Ops, Training, Reports.

const { useState: pS, useMemo: pM } = React;

// ─── TEMPLATES & SCHEMAS ───────────────────────────────────────
// "Template" = JSON extraction schema + few-shot example corpus stored in pgvector.
function DetectionPage() {
  const [pick, setPick] = pS("OFFICE-NNN-2024");
  const tpl = window.DETECTIONS.find(d => d.id === pick) || window.DETECTIONS[0];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Templates & schemas</h1>
          <div className="page-sub">
            A template is a <b>JSON extraction schema</b> plus a few-shot example corpus stored in the vector store.
            The container orchestrates the pipeline — the template carries the knowledge.
          </div>
        </div>
        <div className="page-actions">
          <button className="btn">Import golden set</button>
          <button className="btn btn-primary">+ New template</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Templates · production" value="11" note="2 in staging · 1 dev" />
        <KpiCard label="Few-shot corpus size" value="2,418" note="exemplars · 84M total chunks indexed" />
        <KpiCard label="Schema versions tracked" value="47" note="pinned per job for audit" />
        <KpiCard label="Coverage · clause taxonomy" value="93%" note="11 of 12 categories" tone="good" />
      </div>

      <div className="row row-12" style={{ marginBottom: 14 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>Template library</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{window.DETECTIONS.length} templates · click to inspect</div>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Template</th>
                <th>Stage</th>
                <th>Owner</th>
                <th style={{textAlign:"right"}}>Hallucination %</th>
                <th style={{textAlign:"right"}}>Used (7d)</th>
                <th>Hot field</th>
                <th>Last tuned</th>
                <th>Health</th>
              </tr>
            </thead>
            <tbody>
              {window.DETECTIONS.map(d => (
                <tr key={d.id} onClick={() => setPick(d.id)} style={pick === d.id ? { background: "var(--accent-soft)" } : null}>
                  <td>
                    <div className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{d.id}</div>
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{d.name}</div>
                  </td>
                  <td><span className={`mono health-${d.health}`} style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{d.stage}</span></td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{d.owner}</td>
                  <td className="num" style={{ textAlign:"right", color: d.fpRate > 3 ? "var(--warn)" : "var(--text)" }}>{d.fpRate.toFixed(1)}%</td>
                  <td className="num" style={{ textAlign:"right" }}>{d.tpLastWeek}</td>
                  <td className="muted mono" style={{ fontSize: 11.5 }}>{d.mitre}</td>
                  <td className="muted mono" style={{ fontSize: 11.5 }}>{d.lastTuned}</td>
                  <td><span className={`mono health-${d.health}`} style={{ fontSize: 11 }}>● {d.health}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-h"><h3>{tpl.id}</h3><span className="h-sub">{tpl.stage} · v4.2</span></div>
            <div style={{ fontSize: 13, lineHeight: 1.55, marginBottom: 12 }}>{tpl.name}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <StatBox label="Hallucination" value={tpl.fpRate.toFixed(1) + "%"} tone={tpl.fpRate > 3 ? "warn" : "good"} />
              <StatBox label="Used (7d)" value={tpl.tpLastWeek} />
              <StatBox label="Owner" value={tpl.owner} />
              <StatBox label="Last tuned" value={tpl.lastTuned} />
            </div>
            <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: "var(--bg-sub)", fontSize: 11.5, lineHeight: 1.6, color: "var(--text-2)" }}>
              <b>Schema:</b> <span className="mono">folio://schemas/{tpl.id}@v4.2</span><br/>
              <b>Corpus:</b> <span className="mono">{tpl.id}-shots@v4.2</span> · 12 exemplars · pgvector
            </div>
          </div>
          <div className="card">
            <div className="card-h"><h3>Clause coverage</h3><span className="h-sub">across all templates</span></div>
            <ClauseCoverage />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3>Few-shot exemplar corpus · {tpl.id}</h3><span className="h-sub">vector-indexed examples loaded at inference</span></div>
        <FewShotCorpus tpl={tpl} />
      </div>
    </>
  );
}

function StatBox({ label, value, tone }) {
  const c = { good: "var(--good)", warn: "var(--warn)" }[tone] || "var(--text)";
  return (
    <div style={{ padding: 10, borderRadius: 8, background: "var(--bg-sub)" }}>
      <div style={{ fontSize: 11, color: "var(--text-3)" }}>{label}</div>
      <div className="mono" style={{ fontSize: 14, fontWeight: 500, marginTop: 3, color: c }}>{value}</div>
    </div>
  );
}

function ClauseCoverage() {
  return (
    <div className="cov-grid">
      {window.MITRE_COVERAGE.map(t => {
        const tone = t.covered >= 90 ? "var(--good)" : t.covered >= 75 ? "var(--info)" : t.covered >= 60 ? "var(--warn)" : "var(--bad)";
        return (
          <div key={t.tactic} className="cov-cell" style={{ gridColumn: "span 3", background: tone, color: "#fff", opacity: 0.92 }}>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 10 }}>{t.tactic}</span>
            <span className="mono" style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{t.covered}%</span>
          </div>
        );
      })}
    </div>
  );
}

function FewShotCorpus({ tpl }) {
  const shots = [
    ["EX-A1", "Acme 2017 · §17.4 CPI-floor 3.0%",      "Anchor exemplar — same tenant family"],
    ["EX-A2", "Sunfield 2019 · CPI-floor 3.5% + ceil","Variant: with ceiling clause"],
    ["EX-A3", "Beacon 2021 · CPI-floor 2.5%",          "Variant: different index (CPI-W)"],
    ["EX-A4", "Crest 2018 · Fixed 3% (no floor)",      "Negative example — model must distinguish"],
    ["EX-A5", "Northwind 2022 · greater-of language",  "Pattern: greater-of CPI vs fixed"],
    ["EX-A6", "Mariner 2020 · ceiling without floor",  "Pattern: ceiling-only"],
    ["EX-A7", "Greenmark 2019 · index swap allowed",   "Pattern: tenant-elects-index"],
    ["EX-A8", "Bedford 2023 · base year reset",        "Edge case: §17 + Ex-D both reference base year"],
    ["EX-A9", "Vista 2017 · stepped escalator",        "Negative example — stepped, not CPI"],
    ["EX-A10","Riverstone 2021 · greater-of + cap",    "Pattern: greater-of + ceiling"],
    ["EX-A11","Park West 2020 · CPI lookback",         "Pattern: prior-year lookback method"],
    ["EX-A12","Oakwood 2018 · no escalation",          "Negative example — no escalation at all"],
  ];
  return (
    <table className="table">
      <thead>
        <tr><th style={{width:60}}>ID</th><th>Exemplar</th><th>Role</th><th style={{textAlign:"right"}}>Embedding norm</th><th style={{textAlign:"right"}}>Used (30d)</th></tr>
      </thead>
      <tbody>
        {shots.map(([id, name, role], i) => (
          <tr key={id}>
            <td className="mono" style={{ fontSize: 12 }}>{id}</td>
            <td style={{ fontWeight: 500, fontSize: 13 }}>{name}</td>
            <td className="muted" style={{ fontSize: 12.5 }}>{role}</td>
            <td className="num" style={{ textAlign: "right", fontSize: 12 }}>{(0.92 + Math.random() * 0.04).toFixed(3)}</td>
            <td className="num" style={{ textAlign: "right", fontSize: 12 }}>{Math.floor(40 + Math.random() * 80)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── COMPLIANCE ────────────────────────────────────────────────
function CompliancePage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance & audit</h1>
          <div className="page-sub">
            Every abstraction carries clause-level provenance. Every flagged field carries a reviewer attestation. Audit-defensible by design.
          </div>
        </div>
        <div className="page-actions">
          <button className="btn">Evidence pack</button>
          <button className="btn btn-primary">Schedule walkthrough</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Coverage · 7 frameworks" value="92%" note="weighted average" tone="good" />
        <KpiCard label="Failing controls" value="1" note="C-119" tone="bad" />
        <KpiCard label="At-risk controls" value="1" note="C-441" tone="warn" />
        <KpiCard label="Next walkthrough" value="54 d" note="ASC 842 + SOX · Jul 15" />
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-h"><h3>Frameworks</h3></div>
        <table className="table">
          <thead><tr><th>Framework</th><th>Controls</th><th>Coverage</th><th>Open gaps</th><th>Cadence</th><th>Next audit</th><th style={{textAlign:"right"}}>Risk</th></tr></thead>
          <tbody>
            {window.FRAMEWORKS.map(f => (
              <tr key={f.id}>
                <td style={{ fontWeight: 500 }}>{f.label}</td>
                <td className="num">{f.controls}</td>
                <td>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 38px", gap: 8, alignItems:"center" }}>
                    <MiniBar value={f.coverage} color={f.coverage > 90 ? "var(--good)" : "var(--warn)"} />
                    <span className="mono" style={{ fontSize: 12 }}>{f.coverage}%</span>
                  </div>
                </td>
                <td className="num">{f.gaps}</td>
                <td className="muted" style={{ fontSize: 12.5 }}>{f.cadence}</td>
                <td className="muted mono" style={{ fontSize: 12 }}>{f.nextAudit}</td>
                <td style={{ textAlign:"right" }}>
                  <span className="chip" style={{
                    background: f.risk === "low" ? "var(--good-bg)" : f.risk === "medium" ? "var(--warn-bg)" : "var(--bad-bg)",
                    color: f.risk === "low" ? "var(--good)" : f.risk === "medium" ? "var(--warn)" : "var(--bad)",
                  }}>{f.risk}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-h"><h3>Controls</h3></div>
        <table className="table">
          <thead><tr><th>ID</th><th>Title</th><th>Frameworks</th><th>Last test</th><th>Evidence</th><th>Status</th></tr></thead>
          <tbody>
            {window.CONTROLS.map(c => {
              const tone = c.status === "passing" ? "var(--good)" : c.status === "failing" ? "var(--bad)" : "var(--warn)";
              return (
                <tr key={c.id}>
                  <td className="mono" style={{ fontSize: 12 }}>{c.id}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.title}</div>
                    {c.finding && <div style={{ fontSize: 11.5, color: tone, marginTop: 2 }}>{c.finding}</div>}
                  </td>
                  <td className="muted" style={{ fontSize: 12 }}>{c.frameworks.join(" · ")}</td>
                  <td className="muted mono" style={{ fontSize: 12 }}>{c.lastTest}</td>
                  <td className="num">{c.evidence}</td>
                  <td>
                    <span className="mono" style={{ fontSize: 11, color: tone, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>● {c.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── PIPELINE OPS (was IT Operations) ──────────────────────────
function ITOpsPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pipeline operations</h1>
          <div className="page-sub">
            Ingest → Chunk → Embed → Extract → Validate. Each stage owns one responsibility. The container is the orchestrator; the templates carry the knowledge.
          </div>
        </div>
        <div className="page-actions">
          <button className="btn">Open trace explorer</button>
          <button className="btn btn-primary">Page on-call</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Pipeline availability · 30d" value="99.987%" note="SLO 99.95%" tone="good" />
        <KpiCard label="Throughput · today" value="4.1 / hr" note="84M chunks indexed" tone="good" />
        <KpiCard label="p95 extract latency" value="11.3s" note="↓0.4s w/w" tone="good" />
        <KpiCard label="Cost / lease · 7d" value="$5.10" note="↓ trending" tone="good" />
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-h"><h3>End-to-end pipeline</h3><span className="h-sub">live · LEASE-A-2491 highlighted</span></div>
        <div className="pipeline" style={{ marginBottom: 14 }}>
          {[
            ["Ingest",   "187 pp",  "OCR · 98.4% first-pass",  "active"],
            ["Chunk",    "1,242",   "article-aware · v3.0",     "active"],
            ["Embed",    "1,242",   "text-embedding-3 · 1536-d","active"],
            ["Extract",  "73",      "OFFICE-NNN-2024 · 12-shot","active"],
            ["Validate", "4 flags", "§17.4 §22 §31 Ex-D",       "flag"],
          ].map(([n, big, sub, st]) => (
            <div key={n} className={"pipe-stage" + (st === "flag" ? " flag" : " active")}>
              <div className="pipe-stage-name">{n}</div>
              <div className="pipe-stage-val">{big}</div>
              <div className="pipe-stage-note">{sub}</div>
            </div>
          ))}
        </div>
        <div className="muted" style={{ fontSize: 12, lineHeight: 1.55, maxWidth: 760 }}>
          Section-level chunking is the production answer to hallucination. Token-arbitrary chunking would have split §17.4 between
          "...the greater of (i) three percent..." and "...or (ii) the percentage increase in the CPI..." — the floor language would be lost,
          and the extractor would hedge or hallucinate. Article-aware chunking puts the full clause + a sentence of context into one chunk.
        </div>
      </div>

      <div className="row row-12" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-h"><h3>Subsystem health</h3></div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap: 8 }}>
            {window.IT_SIGNALS.map(s => {
              const tone = s.status === "healthy" ? "var(--good)" : s.status === "watch" ? "var(--info)" : s.status === "degraded" ? "var(--warn)" : "var(--bad)";
              return (
                <div key={s.id} style={{ padding: 12, borderRadius: 8, background: "var(--bg-sub)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.name}</div>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: tone }} />
                  </div>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 500, marginTop: 6, color: tone }}>{s.value}</div>
                  {s.note && <div className="muted" style={{ fontSize: 11.5, marginTop: 3 }}>{s.note}</div>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>Hallucination guard</h3><span className="h-sub">cite-or-decline policy</span></div>
          <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--text-2)" }}>
            Every field must cite a source chunk. If the extractor cannot point to a chunk, it returns <span className="mono">null</span> and the validator
            opens a flag. Hallucination rate has held at <b>0.04%</b> for 21 days running.
          </div>
          <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: "var(--bg-sub)" }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.04em", textTransform: "uppercase" }}>30-day rate</div>
            <Sparkline points={[0.12,0.11,0.10,0.10,0.09,0.09,0.08,0.08,0.07,0.07,0.06,0.06,0.05,0.05,0.05,0.04,0.04,0.04,0.04,0.04,0.04]} color="var(--good)" height={48} fill />
            <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>0.04% today · trending right</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3>Vector store · pgvector</h3><span className="h-sub">lease_chunks_2026</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {[
            ["Rows",         "84,212,419"],
            ["Disk",         "312 GB"],
            ["Index",        "ivfflat · lists=1000"],
            ["Embedding",    "text-embedding-3 · 1536-d"],
            ["p95 search",   "142 ms"],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: 12, borderRadius: 8, background: "var(--bg-sub)" }}>
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>{k}</div>
              <div className="mono" style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── TRAINING & GOLDEN CORPUS ──────────────────────────────────
function TrainingPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">QA & golden corpus</h1>
          <div className="page-sub">
            Drills run against held-out exemplars. Every QA cycle adds to the corpus; every override teaches the next template version.
          </div>
        </div>
        <div className="page-actions">
          <button className="btn">Browse corpus</button>
          <button className="btn btn-primary">+ Start drill</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Golden exemplars" value="2,418" note="across 13 templates" />
        <KpiCard label="Drills this month" value="84" note="vs target 60 · ↑40%" tone="good" />
        <KpiCard label="QA pass rate" value="96%" note="field-level on golden set" tone="good" />
        <KpiCard label="Templates exercised" value="11 of 13" note="2 dev templates pending" />
      </div>

      <div className="row row-2" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-h"><h3>Recommended drills</h3><span className="h-sub">based on production confidence dips</span></div>
          {[
            ["CPI-floor escalation set",   "OFFICE-NNN · §17", "12 exemplars · 1 negative", "high"],
            ["Co-tenancy kick-out triggers","RETAIL-ANCHOR · §11","9 exemplars",            "high"],
            ["Amendment cascade walk-through","GROUND-LEASE",      "5 exemplars · long doc",  "medium"],
            ["SNDA non-standard carve-outs","SNDA · lender forms","7 exemplars",            "medium"],
            ["Estoppel default disclosure","ESTOPPEL",          "11 exemplars",             "low"],
          ].map(([t, sub, count, p], i) => (
            <div key={i} style={{ padding: 12, borderRadius: 8, background: "var(--bg-sub)", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t}</div>
                  <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>{sub}</div>
                  <div className="muted" style={{ fontSize: 11.5, marginTop: 3 }}>{count}</div>
                </div>
                <span className="chip" style={{
                  background: p === "high" ? "var(--bad-bg)" : p === "medium" ? "var(--warn-bg)" : "var(--bg-sub)",
                  color: p === "high" ? "var(--bad)" : p === "medium" ? "var(--warn)" : "var(--text-3)",
                  border: "1px solid " + (p === "high" ? "transparent" : "var(--border-2)"),
                }}>{p} priority</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-h"><h3>QA leaderboard · 30d</h3><span className="h-sub">field-level accuracy</span></div>
          <table className="table">
            <thead><tr><th>Abstractor</th><th>Role</th><th style={{textAlign:"right"}}>Reviewed</th><th style={{textAlign:"right"}}>Accuracy</th></tr></thead>
            <tbody>
              {[
                ["Diana Voss",   "QA",     412, 99.8],
                ["Mira Reyes",   "T1",     287, 99.4],
                ["Marcus Adeyemi","T2",    214, 99.1],
                ["Sam Okonkwo",  "T2",     198, 99.0],
                ["Lin Hsieh",    "T1",     108, 98.7],
                ["Ananya Iyer",  "T1 (APAC)",184,98.4],
              ].map(([who, r, n, a]) => (
                <tr key={who}>
                  <td style={{ fontWeight: 500 }}>{who}</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{r}</td>
                  <td className="num" style={{ textAlign:"right" }}>{n}</td>
                  <td className="num" style={{ textAlign:"right", color: a >= 99 ? "var(--good)" : "var(--info)" }}>{a}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── PORTFOLIO REPORTS ─────────────────────────────────────────
function ReportsPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Portfolio reports</h1>
          <div className="page-sub">Board-ready exports. Each report carries a snapshot of the corpus and schema versions used to produce it.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Schedule</button>
          <button className="btn btn-primary">+ New report</button>
        </div>
      </div>

      <div className="row row-3" style={{ marginBottom: 14 }}>
        {[
          ["ASC 842 quarterly attestation",        "Q2 2026", "Ready", "Lena P.",  "good"],
          ["SOX walkthrough evidence pack",         "Jul 15", "Drafting","Elena M.","warn"],
          ["Board narrative · Audit committee",     "May 28", "Ready",  "Lena P.", "good"],
          ["Tenant concentration · top 25",          "Monthly","Ready", "Sarah C.", "good"],
          ["Renewal pipeline · 18 months out",       "Monthly","Ready", "Marcus A.","good"],
          ["Model accuracy attestation",             "Monthly","Ready", "Raj S.",  "good"],
        ].map(([t, when, st, owner, tone]) => (
          <div key={t} className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{t}</div>
              <span className="mono" style={{ fontSize: 11, color: tone === "good" ? "var(--good)" : "var(--warn)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{st}</span>
            </div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>Period: {when} · Owner: {owner}</div>
            <div style={{ marginTop: 14, display: "flex", gap: 6 }}>
              <button className="btn btn-sm">Preview</button>
              <button className="btn btn-sm btn-ghost">Download</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-h"><h3>Portfolio snapshot · today</h3></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 24, padding: "8px 0" }}>
          {[
            ["Leases under mgmt",   "6,412",   "stable"],
            ["ARR",                  "$14.8B",  "stable"],
            ["Top-10 tenant ARR",    "$1.84B",  "12.4% of book"],
            ["Avg lease size",       "$2.3M",   "ARR"],
            ["Avg term remaining",   "6.4 yr",  "weighted by ARR"],
            ["Realized error YTD",   "$0",      "0% of envelope"],
          ].map(([k, v, sub]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
              <div className="serif" style={{ fontSize: 22, fontWeight: 500, marginTop: 4, letterSpacing: "-0.015em" }}>{v}</div>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 3 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { DetectionPage, CompliancePage, ITOpsPage, TrainingPage, ReportsPage });
