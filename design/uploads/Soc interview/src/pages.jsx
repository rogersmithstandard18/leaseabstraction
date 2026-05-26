// Stratum SecOps — Detection Engineering, Compliance & GRC, IT Ops, Training, Reports.

const { useState: dS, useMemo: dM } = React;

// ═════ DETECTION ENGINEERING ═════
function DetectionPage({ role }) {
  const [stage, setStage] = dS("all");
  const filtered = dM(() => {
    const rows = window.DETECTIONS.filter(d => stage === "all" || d.stage === stage);
    return rows;
  }, [stage]);

  const stats = dM(() => {
    const all = window.DETECTIONS;
    return {
      total: all.length,
      prod: all.filter(d => d.stage === "production").length,
      noisy: all.filter(d => d.health === "noisy").length,
      promote: all.filter(d => d.health === "promote").length,
      coverage: Math.round(window.MITRE_COVERAGE.reduce((s, c) => s + c.covered, 0) / window.MITRE_COVERAGE.length),
    };
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Detection engineering</h1>
          <div className="page-sub">Detection-as-code pipeline. {stats.prod} rules in production. {stats.noisy} flagged noisy. {stats.promote} ready to promote.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Run backtest</button>
          <button className="btn btn-primary">+ New rule</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Rules in production" value={stats.prod} note={`${stats.total - stats.prod} in pipeline`} />
        <KpiCard label="MITRE coverage" value={stats.coverage + "%"} note="12 of 14 tactics" tone="good" />
        <KpiCard label="False-positive rate" value="4.1%" note="↓0.3 w/w" tone="good" delta="down" />
        <KpiCard label="True positives · 7d" value="11" note="across 9 rules" />
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-h"><h3>MITRE ATT&CK coverage</h3><span className="h-sub">% of techniques with at least one production rule</span></div>
        <MitreCoverage />
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Detection rules</h3>
          <SegPicker value={stage} onChange={setStage} options={[
            ["all","All"],["production","Production"],["staging","Staging"],["dev","Dev"]
          ]} />
        </div>
        <table className="table">
          <thead><tr><th>Rule</th><th>Owner</th><th>Stage</th><th>MITRE</th><th style={{textAlign:"right"}}>FP rate</th><th style={{textAlign:"right"}}>TP · 7d</th><th>Last tuned</th><th>Health</th></tr></thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{d.name}</div>
                  <div className="muted mono" style={{ fontSize: 11.5, marginTop: 2 }}>{d.id}</div>
                </td>
                <td className="muted" style={{ fontSize: 12.5 }}>{d.owner}</td>
                <td>
                  <span className="chip" style={{
                    background: d.stage === "production" ? "var(--good-bg)" : d.stage === "staging" ? "var(--info-bg)" : "var(--bg-sub)",
                    color: d.stage === "production" ? "var(--good)" : d.stage === "staging" ? "var(--info)" : "var(--text-3)",
                  }}>{d.stage}</span>
                </td>
                <td className="mono muted" style={{ fontSize: 12 }}>{d.mitre}</td>
                <td className="num" style={{ textAlign:"right", color: d.fpRate > 5 ? "var(--warn)" : "var(--text)" }}>{d.fpRate.toFixed(1)}%</td>
                <td className="num" style={{ textAlign:"right" }}>{d.tpLastWeek}</td>
                <td className="muted mono" style={{ fontSize: 12 }}>{d.lastTuned}</td>
                <td>
                  <span className={"chip health-" + d.health} style={{ background: "transparent", border: "1px solid var(--border)" }}>
                    {d.health}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MitreCoverage() {
  const max = Math.max(...window.MITRE_COVERAGE.map(c => c.covered));
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap: 10 }}>
      {window.MITRE_COVERAGE.map(c => {
        const tone = c.covered >= 80 ? "var(--good)" : c.covered >= 60 ? "var(--warn)" : "var(--bad)";
        return (
          <div key={c.tactic} style={{ padding: 12, borderRadius: 8, background: "var(--bg-sub)" }}>
            <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{c.tactic}</div>
            <div className="mono" style={{ fontSize: 20, fontWeight: 500, marginTop: 4, color: tone }}>{c.covered}<span style={{ fontSize: 11, color: "var(--text-3)" }}>%</span></div>
            <div style={{ marginTop: 6 }}><MiniBar value={c.covered} color={tone} /></div>
          </div>
        );
      })}
    </div>
  );
}

// ═════ COMPLIANCE & GRC ═════
function CompliancePage({ role }) {
  const [tab, setTab] = dS("frameworks");
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance & GRC</h1>
          <div className="page-sub">7 frameworks tracked. {window.CONTROLS.filter(c => c.status==="failing").length} control failing · {window.CONTROLS.filter(c => c.status==="at-risk").length} at risk. SOX ITGC audit in 54 days.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Evidence pack</button>
          <button className="btn btn-primary">+ Finding</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Frameworks" value="7" note="all in scope" />
        <KpiCard label="Avg coverage" value="92%" note="↑1 q/q" tone="good" />
        <KpiCard label="Failing controls" value="1" note="C-119 · remediation Jun 4" tone="bad" />
        <KpiCard label="Days to next audit" value="54" note="SOX · Jul 15" />
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 14, borderBottom: "1px solid var(--border-2)" }}>
        {[
          ["frameworks", "Frameworks"],
          ["controls", "Controls"],
          ["evidence", "Evidence"],
          ["findings", "Open findings"],
        ].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{
              padding: "8px 14px", background: "transparent", border: 0,
              fontSize: 13, color: tab === k ? "var(--text)" : "var(--text-3)",
              fontWeight: tab === k ? 500 : 400, borderBottom: tab === k ? "2px solid var(--text)" : "2px solid transparent",
              marginBottom: "-1px", cursor: "pointer", fontFamily: "inherit"
            }}>{l}</button>
        ))}
      </div>

      {tab === "frameworks" && <div className="card"><FrameworkTable /></div>}
      {tab === "controls" && <div className="card" style={{ padding: 0 }}><ControlsTable /></div>}
      {tab === "evidence" && <EvidencePack />}
      {tab === "findings" && <OpenFindings />}
    </>
  );
}

function ControlsTable() {
  return (
    <table className="table">
      <thead><tr><th>Control</th><th>Frameworks</th><th>Status</th><th>Last test</th><th style={{textAlign:"right"}}>Evidence</th></tr></thead>
      <tbody>
        {window.CONTROLS.map(c => (
          <tr key={c.id}>
            <td>
              <div style={{ fontWeight: 500 }}>{c.title}</div>
              <div className="muted mono" style={{ fontSize: 11.5, marginTop: 2 }}>{c.id}</div>
              {c.finding && <div style={{ fontSize: 11.5, color: "var(--bad)", marginTop: 4 }}>↳ {c.finding}</div>}
            </td>
            <td>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {c.frameworks.map(f => <span key={f} className="chip" style={{ fontSize: 10.5 }}>{f}</span>)}
              </div>
            </td>
            <td>
              <span className="chip" style={{
                background: c.status === "passing" ? "var(--good-bg)" : c.status === "at-risk" ? "var(--warn-bg)" : "var(--bad-bg)",
                color: c.status === "passing" ? "var(--good)" : c.status === "at-risk" ? "var(--warn)" : "var(--bad)",
              }}>{c.status}</span>
            </td>
            <td className="muted mono" style={{ fontSize: 12 }}>{c.lastTest}</td>
            <td className="num" style={{ textAlign: "right" }}>{c.evidence}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EvidencePack() {
  return (
    <div className="row row-2">
      <div className="card">
        <div className="card-h"><h3>Evidence stream · today</h3><span className="h-sub">automated collection · 247 artifacts/day</span></div>
        {[
          ["09:14:09", "Token revocation log — ceo_assistant", "C-117"],
          ["09:17:22", "Firewall change ticket — 94.130.88.12 block", "C-441"],
          ["08:00:00", "Daily PAM session report", "C-117"],
          ["08:00:00", "EDR coverage attestation", "C-411"],
          ["07:30:00", "Quarterly UAR — week 8 of 13", "C-218"],
          ["06:24:00", "Step-up auth deployment audit", "C-203"],
        ].map(([t, what, ctrl], i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 56px", gap: 10, padding: "8px 0", borderBottom: "1px dashed var(--border-2)" }}>
            <span className="mono muted" style={{ fontSize: 11.5 }}>{t}</span>
            <div style={{ fontSize: 12.5 }}>{what}</div>
            <span className="chip mono" style={{ fontSize: 10.5 }}>{ctrl}</span>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-h"><h3>Audit readiness</h3></div>
        {window.FRAMEWORKS.map(f => (
          <div key={f.id} style={{ padding: "8px 0", borderBottom: "1px dashed var(--border-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ fontWeight: 500 }}>{f.label}</span>
              <span className="muted">{f.nextAudit}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 36px", gap: 8, alignItems: "center", marginTop: 5 }}>
              <MiniBar value={f.coverage} color={f.coverage > 92 ? "var(--good)" : "var(--warn)"} />
              <span className="mono" style={{ fontSize: 11.5 }}>{f.coverage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpenFindings() {
  const findings = [
    { id: "F-2026-014", title: "C-119 · privileged temp-access auto-expiry failed", framework: "SOX", severity: "high",   age: "2d", owner: "Sarah Chen",  due: "2026-06-04" },
    { id: "F-2026-013", title: "C-441 · DC binary integrity attestation gap",      framework: "NYDFS", severity: "medium", age: "0d", owner: "Jordan Tan", due: "2026-06-15" },
    { id: "F-2026-009", title: "F-088 false-positive rate exceeds 4.5% threshold", framework: "PCI",   severity: "low",    age: "8d", owner: "Priya V.",   due: "2026-06-30" },
  ];
  return (
    <div className="card" style={{ padding: 0 }}>
      <table className="table">
        <thead><tr><th>Finding</th><th>Framework</th><th>Severity</th><th>Age</th><th>Owner</th><th style={{textAlign:"right", paddingRight:16}}>Due</th></tr></thead>
        <tbody>
          {findings.map(f => (
            <tr key={f.id}>
              <td>
                <div style={{ fontWeight: 500 }}>{f.title}</div>
                <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{f.id}</div>
              </td>
              <td><span className="chip">{f.framework}</span></td>
              <td><span className="chip" style={{
                background: f.severity === "high" ? "var(--bad-bg)" : f.severity === "medium" ? "var(--warn-bg)" : "var(--bg-sub)",
                color: f.severity === "high" ? "var(--bad)" : f.severity === "medium" ? "var(--warn)" : "var(--text-3)",
              }}>{f.severity}</span></td>
              <td className="mono muted" style={{ fontSize: 12 }}>{f.age}</td>
              <td className="muted" style={{ fontSize: 12.5 }}>{f.owner}</td>
              <td className="mono" style={{ textAlign: "right", paddingRight: 16, fontSize: 12.5 }}>{f.due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═════ IT OPERATIONS ═════
function ITOpsPage({ role }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">IT operations</h1>
          <div className="page-sub">Platform 99.987%. Edge absorbing 84 Gbps DDoS. AD krbtgt second reset queued 22:30 ET. Step-up auth deployed at 06:24.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Status page</button>
          <button className="btn btn-primary">Page on-call</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Availability · 30d" value="99.987%" note="SLO 99.95%" tone="good" />
        <KpiCard label="Subsystems healthy" value="6 of 8" note="2 degraded/at-risk" tone="warn" />
        <KpiCard label="P1 in flight" value="2" note="DDoS · krbtgt reset" tone="warn" />
        <KpiCard label="MTTR P1 · 30d" value="38m" note="target 60m" tone="good" />
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-h"><h3>Subsystem grid</h3><span className="h-sub">production · live</span></div>
        <table className="table">
          <thead><tr><th>Subsystem</th><th>Status</th><th>Headline metric</th><th>Note</th><th style={{textAlign:"right"}}>Action</th></tr></thead>
          <tbody>
            {window.IT_SIGNALS.map(s => {
              const tone = s.status === "healthy" ? "var(--good)" : s.status === "watch" ? "var(--info)" : s.status === "degraded" ? "var(--warn)" : "var(--bad)";
              return (
                <tr key={s.id}>
                  <td><span style={{ fontWeight: 500 }}>{s.name}</span></td>
                  <td><span className="chip" style={{ background: "transparent", border: "1px solid var(--border)" }}>
                    <span className="chip-dot" style={{ background: tone }} />{s.status}
                  </span></td>
                  <td className="mono" style={{ fontSize: 12.5, color: tone }}>{s.value}</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{s.note || "—"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-sm">Open</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row row-2">
        <div className="card">
          <div className="card-h"><h3>Edge traffic · last 24h</h3><span className="h-sub">ingress Gbps, DDoS overlay</span></div>
          <Sparkline points={[12,11,13,14,15,18,38,84,82,80,79,75,72,68,64,58,52,44,38,32,26,22,18,16]} color="var(--info)" height={80} fill />
          <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "var(--warn-bg)", fontSize: 12.5, color: "var(--warn)" }}>
            <b>DDoS active:</b> 84 Gbps sustained from 12k IPs (38 ASNs). CDN absorbing 100%. Origin RPS unchanged.
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>Change window · next 7d</h3></div>
          {[
            ["Wed 02:00 ET", "krbtgt 2nd reset · domain forest", "high",  "Jordan Tan"],
            ["Thu 23:00 ET", "EDR agent canary · 200 endpoints", "medium","Devon Kim"],
            ["Sat 04:00 ET", "Edge config push · WAF rules",     "low",   "Ricardo Bauer"],
            ["Sun 08:00 ET", "SWIFT gateway patch window",        "high",  "Ricardo Bauer"],
          ].map(([w, what, r, o], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr 60px", gap: 10, padding: "10px 0", borderBottom: "1px dashed var(--border-2)" }}>
              <span className="mono muted" style={{ fontSize: 11.5 }}>{w}</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{what}</div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{o}</div>
              </div>
              <span className="chip" style={{
                background: r === "high" ? "var(--bad-bg)" : r === "medium" ? "var(--warn-bg)" : "var(--bg-sub)",
                color: r === "high" ? "var(--bad)" : r === "medium" ? "var(--warn)" : "var(--text-3)",
                fontSize: 10.5
              }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ═════ TRAINING & DRILLS ═════
function TrainingPage({ role }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Training & drills</h1>
          <div className="page-sub">Muscle-memory drills built from real incident patterns. Run a scenario, articulate your reasoning, then decide.</div>
        </div>
        <div className="page-actions">
          <button className="btn">My history</button>
          <button className="btn btn-primary">Start a drill</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Drills · this quarter" value="14" note="across 4 categories" />
        <KpiCard label="Avg SATO score" value="7.8 / 10" note="↑0.4 q/q" tone="good" />
        <KpiCard label="Avg decision time" value="3m 22s" />
        <KpiCard label="Streak" value="9 days" note="don't break it" tone="good" />
      </div>

      <div className="row row-2" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-h"><h3>Recommended for you</h3><span className="h-sub">based on your gaps</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { title: "PrintNightmare C2 beacon", mitre: "T1059.001 · T1071.001", level: "T2 / T3", desc: "Encoded PowerShell, jitter pattern, exec asset. The drill version of INC-9201." },
              { title: "ntdsutil IFM credential dump", mitre: "T1003.003", level: "T2 / IR", desc: "Living-off-the-land on a tier-0 DC. ntds.dit exfil. Forest-wide blast." },
              { title: "LSASS memory dump · LotL", mitre: "T1003.001 · T1036", level: "T1 / T2", desc: "svchost masquerading from C:\\Users\\Public. comsvcs MiniDump." },
              { title: "Credential stuffing · Tor", mitre: "T1078", level: "T1", desc: "Failed-then-success + temp admin not revoked. Classic T1 escalation criteria." },
              { title: "CNP card-testing burst", mitre: "T1110.004", level: "T1 / Fraud", desc: "Fintech-specific: BIN-range testing from residential proxies." },
              { title: "Edge SYN flood", mitre: "T1498.001", level: "T1 / IT Ops", desc: "Trading-hours-aware proportionate response. CDN absorbs vs origin." },
            ].map((s, i) => (
              <div key={i} style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border-2)", display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.title}</div>
                    <span className="chip" style={{ fontSize: 10.5 }}>{s.level}</span>
                  </div>
                  <div className="muted mono" style={{ fontSize: 11, marginTop: 2 }}>{s.mitre}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 5, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
                <button className="btn btn-sm">Run drill</button>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>Skills heatmap</h3><span className="h-sub">SATO score by category</span></div>
          <SkillsHeatmap />

          <div style={{ marginTop: 18 }}>
            <div className="card-h"><h3 style={{ fontSize: 12.5 }}>Team leaderboard · q/q</h3></div>
            {[
              ["Devon Kim",  9.1],
              ["Jordan Tan", 8.7],
              ["Marcus A.",  8.2],
              ["Maya Reyes", 7.4],
              ["Sam O.",     7.1],
            ].map(([n, sc], i) => (
              <div key={n} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 40px", gap: 10, padding: "6px 0", fontSize: 12.5, alignItems: "center" }}>
                <span className="mono muted">{i+1}.</span>
                <span>{n}</span>
                <span className="mono" style={{ textAlign: "right", fontWeight: 500 }}>{sc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3>How a drill works</h3></div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 14 }}>
          {[
            ["01", "SIEM fires", "A built-in or AI-generated scenario lands a real-looking alert in front of you."],
            ["02", "Articulate", "Answer Situation / Action / Tool / Outcome before you see the multiple choice."],
            ["03", "Decide", "Pick the response. Wrong answers explain why; right ones show what they'd miss."],
            ["04", "After-action", "Get the model SATO, terms you hit and missed, and an AAR you can save."],
          ].map(([n, t, d]) => (
            <div key={n} style={{ padding: 14, borderRadius: 8, background: "var(--bg-sub)" }}>
              <div className="mono" style={{ fontSize: 11, color: "var(--text-4)" }}>{n}</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>{t}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
        <div className="muted" style={{ marginTop: 14, fontSize: 12, fontStyle: "italic" }}>
          The drill engine lives in <span className="mono">src/legacy/SOC_drill_source.tsx</span> as an embeddable widget — it's the inheritance of this app, kept intact.
        </div>
      </div>
    </>
  );
}

function SkillsHeatmap() {
  const skills = [
    { area: "Endpoint / EDR",       sc: 8.2 },
    { area: "Identity / AD",         sc: 7.9 },
    { area: "Network / Perimeter",   sc: 7.1 },
    { area: "Payments / Fraud",      sc: 6.4 },
    { area: "Cloud / IAM",           sc: 6.8 },
    { area: "Threat hunting",        sc: 7.4 },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap: 8 }}>
      {skills.map(s => {
        const tone = s.sc >= 8 ? "var(--good)" : s.sc >= 7 ? "var(--info)" : "var(--warn)";
        return (
          <div key={s.area} style={{ padding: 10, borderRadius: 8, background: "var(--bg-sub)" }}>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>{s.area}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
              <span className="mono" style={{ fontSize: 18, fontWeight: 500, color: tone }}>{s.sc}</span>
              <span style={{ fontSize: 11, color: "var(--text-4)" }}>/ 10</span>
            </div>
            <div style={{ marginTop: 6 }}><MiniBar value={s.sc * 10} color={tone} /></div>
          </div>
        );
      })}
    </div>
  );
}

// ═════ BOARD REPORTS ═════
function ReportsPage({ role }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Board reports</h1>
          <div className="page-sub">Pre-built narratives for the audit committee, board, and regulators. Pulls live numbers; you write the story.</div>
        </div>
        <div className="page-actions">
          <button className="btn">PDF export</button>
          <button className="btn btn-primary">New report</button>
        </div>
      </div>

      <div className="row row-2" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-h"><h3>Audit Committee · Thursday May 28</h3><span className="h-sub">10:00 ET</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Cover", "One-page summary · risk posture, loss vs envelope, one ask", "ready"],
              ["Today's incident", "INC-9201 narrative · contained · non-reportable", "ready"],
              ["Control coverage", "Framework grid · failing/at-risk surfaced", "ready"],
              ["Loss-event budget", "$0.4M YTD of $4.8M · 8% utilization", "ready"],
              ["Asks", "Accelerate EDR refresh to Q3 close · $1.2M, in budget", "draft"],
              ["Regulatory exposure", "None reportable · NYDFS 72h clock not started", "ready"],
            ].map(([t, d, st]) => (
              <div key={t} style={{ display: "grid", gridTemplateColumns: "30px 1fr 70px", gap: 10, padding: "10px 0", borderBottom: "1px dashed var(--border-2)" }}>
                <span style={{
                  display: "grid", placeItems: "center", width: 18, height: 18, borderRadius: 5,
                  background: st === "ready" ? "var(--good)" : "var(--bg-sub)",
                  border: st === "ready" ? 0 : "1px solid var(--border-3)",
                  color: "white", fontSize: 11
                }}>{st === "ready" ? "✓" : ""}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{d}</div>
                </div>
                <span className="muted" style={{ fontSize: 11.5, textAlign: "right" }}>{st}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>Quarterly board · Q2</h3><span className="h-sub">Jun 12 · 14:00 ET</span></div>
          <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--text-2)" }}>
            Working narrative — three numbers, three stories, two asks.
          </div>
          <ol style={{ paddingLeft: 18, fontSize: 13.5, lineHeight: 1.8, color: "var(--text-2)", marginTop: 10 }}>
            <li><b>Risk score 62</b>, down 6 quarter-over-quarter.</li>
            <li><b>$0.4M realized losses</b> against a $4.8M envelope.</li>
            <li><b>99.987%</b> platform availability — no security-driven downtime.</li>
          </ol>
          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "var(--bg-sub)", fontSize: 12.5, lineHeight: 1.55 }}>
            <b>The two asks:</b><br />
            (1) Accelerate the EDR refresh by one quarter, in-budget.<br />
            (2) Hire two additional T3 analysts in Q3.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3>Past reports</h3></div>
        <table className="table">
          <thead><tr><th>Report</th><th>Audience</th><th>Date</th><th style={{ textAlign: "right" }}>Pages</th></tr></thead>
          <tbody>
            {[
              ["Audit Committee — Q1 retrospective", "Audit Committee", "2026-04-23", 14],
              ["Annual cyber risk posture",          "Full Board",      "2026-03-12", 22],
              ["NYDFS Part 500 attestation",         "Regulator",       "2026-02-28", 9],
              ["SOX ITGC walkthrough — preliminary", "External Audit",  "2026-02-04", 31],
              ["Tabletop · ransomware retrospective","Exec Team",        "2026-01-19", 6],
            ].map(([t, a, d, p]) => (
              <tr key={t}>
                <td style={{ fontWeight: 500 }}>{t}</td>
                <td className="muted" style={{ fontSize: 12.5 }}>{a}</td>
                <td className="mono muted" style={{ fontSize: 12.5 }}>{d}</td>
                <td className="num" style={{ textAlign: "right" }}>{p}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

Object.assign(window, { DetectionPage, CompliancePage, ITOpsPage, TrainingPage, ReportsPage });
