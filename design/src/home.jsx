// Folio — Home page. A different dashboard per altitude.
const { useMemo: hMemo, useState: hState } = React;

function HomePage({ role, setPage, openIncident, openAltitude }) {
  switch (role.altitude) {
    case 0: return <AbstractorHome role={role} setPage={setPage} openIncident={openIncident} />;
    case 1: return <LeadHome role={role} setPage={setPage} openIncident={openIncident} openAltitude={openAltitude} />;
    case 2: return <OpsManagerHome role={role} setPage={setPage} openIncident={openIncident} openAltitude={openAltitude} />;
    case 3: return <DirectorHome role={role} setPage={setPage} openIncident={openIncident} openAltitude={openAltitude} />;
    case 4: return <VPHome role={role} openAltitude={openAltitude} />;
    case 5: return role.id === "cdo"
      ? <CDOHome role={role} openAltitude={openAltitude} />
      : <COOHome role={role} openAltitude={openAltitude} />;
    case 6: return <CEOHome role={role} openAltitude={openAltitude} />;
    default: return null;
  }
}

// ─── Personal load card (used at ground / lead) ────────────────
function MyLoadCard({ role, openIncident }) {
  const mine = window.INCIDENTS.filter(i =>
    i.assignee.toLowerCase().includes(role.name.split(" ")[0].toLowerCase()) && i.status !== "Abstracted"
  ).slice(0, 6);
  return (
    <div className="card" style={{ gridColumn: "1 / -1" }}>
      <div className="card-h">
        <h3>Your active queue</h3>
        <span className="h-sub">{mine.length} assigned · oldest {mine[0]?.ageMin || 0}m</span>
      </div>
      {mine.length === 0 ? (
        <div className="muted" style={{ padding: 8 }}>Nothing assigned. Take from the unassigned queue.</div>
      ) : (
        <table className="table">
          <thead><tr><th style={{width:36}}></th><th>Lease</th><th>Asset</th><th>Stage</th><th style={{textAlign:"right"}}>Age</th><th style={{textAlign:"right"}}>SLA</th></tr></thead>
          <tbody>
            {mine.map(i => (
              <tr key={i.id} onClick={() => openIncident(i)}>
                <td><KindGlyph kind={i.kind} /></td>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <SevChip sev={i.severity} />
                    <span style={{ fontWeight: 500 }}>{i.title}</span>
                  </div>
                  <div className="muted mono" style={{ fontSize: 11, marginTop: 2 }}>{i.id} · {i.template}</div>
                </td>
                <td className="muted" style={{ fontSize: 12.5 }}>{i.asset}</td>
                <td><StatusChip status={i.status} /></td>
                <td className="num muted" style={{ textAlign:"right" }}><TimeAgo minutes={i.ageMin} /></td>
                <td style={{ textAlign:"right" }}><SlaIcons sla={i.sla} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function SlaIcons({ sla }) {
  const map = { ok: { color: "var(--good)", ch: "●" }, "at-risk": { color: "var(--warn)", ch: "●" }, breach: { color: "var(--bad)", ch: "●" } };
  return (
    <span style={{ display:"inline-flex", gap: 4, fontFamily: "var(--font-mono)", fontSize: 11 }}>
      {["ingest","extract","validate"].map(k => (
        <span key={k} title={`${k}: ${sla[k]}`} style={{ color: map[sla[k]]?.color || "var(--text-4)" }}>{map[sla[k]]?.ch || "○"}</span>
      ))}
    </span>
  );
}

// ─── ABSTRACTOR HOME (altitude 0) ──────────────────────────────
function AbstractorHome({ role, openIncident }) {
  const greeting = useGreeting();
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {role.name.split(" ")[0]}.</h1>
          <div className="page-sub">3 unassigned in the queue. Your shift ends 19:00 ET — APAC handoff to Ananya at 18:45.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Take next</button>
          <button className="btn btn-primary">+ Upload lease</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Assigned" value="3" note="2 Critical · 1 High" />
        <KpiCard label="Abstracted today" value="14" note="Avg 7m / clause" tone="good" />
        <KpiCard label="Accuracy · 7d" value="99.4%" note="Field-level, your work" tone="good" />
        <KpiCard label="Shift" value="06:00 → 19:00" note="EST · floor 81% utilized" />
      </div>

      <MyLoadCard role={role} openIncident={openIncident} />

      <div className="row row-12" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-h"><h3>Unassigned · pick by oldest</h3><span className="h-sub">click to claim</span></div>
          <table className="table">
            <thead><tr><th>Lease</th><th>Source</th><th style={{textAlign:"right"}}>Age</th></tr></thead>
            <tbody>
              {window.INCIDENTS.filter(i => i.status === "Ingesting" || i.status === "Extracting").slice(0, 4).map(i => (
                <tr key={i.id} onClick={() => openIncident(i)}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <KindGlyph kind={i.kind} size={20} />
                      <SevChip sev={i.severity} />
                      <span style={{ fontWeight: 500 }}>{i.title}</span>
                    </div>
                  </td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{i.source}</td>
                  <td className="num muted" style={{ textAlign:"right" }}><TimeAgo minutes={i.ageMin} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-h"><h3>Drill of the day</h3></div>
          <div style={{ fontSize: 13, lineHeight: 1.55, color: "var(--text-2)" }}>
            You haven't run a QA drill in 9 days. <span className="muted">Today's golden set:</span>
          </div>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <DrillRow title="CPI-floor escalation pattern" tag="§17 · OFFICE-NNN" />
            <DrillRow title="Co-tenancy kick-out triggers" tag="§11 · RETAIL-ANCHOR" />
            <DrillRow title="Amendment cascade to base" tag="GROUND-LEASE" />
          </div>
          <button className="btn btn-sm" style={{ marginTop: 12, width: "100%" }}>Open QA & Golden Corpus →</button>
        </div>
      </div>
    </>
  );
}

function DrillRow({ title, tag }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding: "8px 10px", borderRadius: 6, background:"var(--bg-sub)" }}>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{title}</div>
        <div className="mono" style={{ fontSize: 11, color:"var(--text-3)", marginTop:1 }}>{tag}</div>
      </div>
      <span style={{ fontSize: 11, color: "var(--text-3)" }}>≈12 min</span>
    </div>
  );
}

// ─── LEAD HOME (altitude 1) ────────────────────────────────────
function LeadHome({ role, openIncident, openAltitude }) {
  const greeting = useGreeting();
  const isPipeline = role.id === "pipeline_lead";
  const isLegal = role.id === "legal_reviewer";
  const isPlatform = role.id === "platform_eng";
  const isQA = role.id === "qa_lead";

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {greeting}, {role.name.split(" ")[0]}. {isPipeline ? "Pipeline is moving." : isLegal ? "Three docs on your desk." : "The floor is steady."}
          </h1>
          <div className="page-sub">
            {isPipeline && "Chunker v3.1 in staging — boundary recall +2.3%. Embedding cost trending flat. Acme batch (LEASE-A-2491) is the day's most interesting trace."}
            {isLegal && "LEASE-A-2491 (§22 SNDA carve-outs), LEASE-A-2444 (lender SNDA, non-standard), LEASE-A-2483 (Amendment 14 cascade) — all sitting at Validate."}
            {isQA && "Field-level accuracy 99.2% w/w (↑0.4). One template (GROUND-LEASE) is the long tail — recommend retune."}
            {isPlatform && "pgvector at 84M chunks, p95 142ms. OFW ingest queue stable. Vendor RFP for embedding redundancy in flight."}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn">Page on-call</button>
          <button className="btn btn-primary" onClick={() => openAltitude("LEASE-A-2491")}>Altitude view</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Open criticals" value="3" note="all in review" tone="bad" />
        <KpiCard label="Floor load" value="81%" note="38 abstractors · 2 PTO" tone="warn" />
        <KpiCard label="Mean confidence" value="91.4%" note="across active jobs" tone="good" />
        <KpiCard label="SLA at-risk" value="2" note="LEASE-A-2491, LEASE-A-2483" tone="warn" />
      </div>

      <div className="row row-12" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-h">
            <h3>Active critical abstractions</h3>
            <button className="btn btn-sm btn-ghost" onClick={() => openAltitude("LEASE-A-2491")}>Open altitude · LEASE-A-2491 →</button>
          </div>
          <table className="table">
            <thead><tr><th>Lease</th><th>Owner</th><th>Stage</th><th style={{textAlign:"right"}}>Age</th><th style={{textAlign:"right"}}>$ at stake</th></tr></thead>
            <tbody>
              {window.INCIDENTS.filter(i => i.severity === "Critical" && i.status !== "Abstracted").map(i => (
                <tr key={i.id} onClick={() => openIncident(i)}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <KindGlyph kind={i.kind} size={20} />
                      <span style={{ fontWeight: 500 }}>{i.title}</span>
                    </div>
                    <div className="muted mono" style={{ fontSize: 11, marginTop: 2 }}>{i.id}</div>
                  </td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{i.assignee}</td>
                  <td><StatusChip status={i.status} /></td>
                  <td className="num muted" style={{ textAlign:"right" }}><TimeAgo minutes={i.ageMin} /></td>
                  <td className="num" style={{ textAlign:"right", fontWeight: 500 }}><Dollars amount={i.dollarsAtRisk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-h"><h3>Floor right now</h3></div>
          <FloorStaff />
        </div>
      </div>

      <div className="row row-2">
        <div className="card">
          <div className="card-h"><h3>Document mix · last 24h</h3><span className="h-sub">312 documents · 88% auto-completed</span></div>
          <Sparkline points={[12,15,9,18,11,16,22,14,9,11,18,28,16,14,12,9,11,15,22,18,14,11,8,10]} color="var(--accent)" height={48} fill />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginTop: 10 }}>
            {[["Office", 84],["Retail", 47],["Industrial", 39],["Multifam", 84],["Other", 58]].map(([k,v]) => (
              <div key={k} style={{ padding: "8px 10px", borderRadius: 6, background:"var(--bg-sub)" }}>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{k}</div>
                <div className="mono" style={{ fontSize: 16, fontWeight: 500, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>Shift handoff brief</h3><span className="h-sub">EST → APAC at 18:45</span></div>
          <ol style={{ paddingLeft: 20, fontSize: 13, lineHeight: 1.7, color: "var(--text-2)", margin: 0 }}>
            <li><b>LEASE-A-2491</b> — Diana owns through EOD; APAC monitors §22 SNDA + §31 ROFR final review.</li>
            <li><b>LEASE-A-2483</b> — Amendment 14 base-year reconciliation runs overnight; Jordan briefed APAC Legal.</li>
            <li><b>LEASE-A-2458</b> — Goldman estoppel closing Thursday; 39 of 41 cleared, last 2 with reviewer.</li>
            <li><b>LEASE-A-2478</b> — CityCenter bulk batch; standard form, expected auto-clear by 22:00.</li>
          </ol>
        </div>
      </div>
    </>
  );
}

function FloorStaff() {
  const staff = [
    { who: "Mira R.",  role: "T1",  load: 80, on: "LEASE-A-2478, +2", tone: "warn" },
    { who: "Diana V.", role: "QA",  load: 95, on: "LEASE-A-2491, LEASE-A-2444", tone: "bad" },
    { who: "Jordan T.",role: "Legal",load:90, on: "LEASE-A-2483, LEASE-A-2487, LEASE-A-2458", tone: "bad" },
    { who: "Marcus A.",role: "T2",  load: 45, on: "LEASE-A-2438", tone: "good" },
    { who: "Sam O.",   role: "T2",  load: 60, on: "LEASE-A-2466", tone: "good" },
    { who: "Lin H.",   role: "T1",  load: 30, on: "—", tone: "good" },
  ];
  const tone = (t) => ({good:"var(--good)", warn:"var(--warn)", bad:"var(--bad)"}[t]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {staff.map(s => (
        <div key={s.who} style={{ display: "grid", gridTemplateColumns: "1fr 60px", gap: 10, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.who} <span style={{ color: "var(--text-3)", fontWeight: 400 }}>· {s.role}</span></div>
            <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{s.on}</div>
          </div>
          <div>
            <MiniBar value={s.load} color={tone(s.tone)} />
            <div className="mono" style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 3, textAlign: "right" }}>{s.load}%</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── OPS MANAGER HOME (altitude 2) — mirrors the SOC reference manager layout
function OpsManagerHome({ role, openAltitude }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Abstraction operations · today</h1>
          <div className="page-sub">3 criticals all in review. Throughput up 12% w/w. Capacity tight: 2 of 38 abstractors on PTO, Goldman estoppel closes Thu — protected slot held.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Schedule</button>
          <button className="btn btn-primary" onClick={() => openAltitude("LEASE-A-2491")}>Altitude view · LEASE-A-2491</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Throughput · 7d" value="4.1 / day" note="target ≥3.8 · ↑12% w/w" tone="good" />
        <KpiCard label="Accuracy · 30d" value="99.2%" note="target ≥99% · ↑0.4" tone="good" />
        <KpiCard label="Open criticals" value="3" note="0 SLA breach" tone="bad" />
        <KpiCard label="$ ARR under review" value="$314M" note="$0 disputed today" tone="warn" />
      </div>

      <div className="row row-12" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-h"><h3>Pipeline mix · 7d trend</h3><span className="h-sub">stacked by stage</span></div>
          <StackedPipelineChart />
        </div>
        <div className="card">
          <div className="card-h"><h3>SLA scorecard</h3></div>
          <SlaScorecard />
        </div>
      </div>

      <div className="row row-2">
        <div className="card">
          <div className="card-h">
            <h3>Top recurring uncertain clauses · 30d</h3>
            <span className="h-sub">patterns to invest the corpus against</span>
          </div>
          <table className="table">
            <thead><tr><th>Pattern</th><th style={{textAlign:"right"}}>Count</th><th style={{textAlign:"right"}}>Confidence</th></tr></thead>
            <tbody>
              {[
                ["CPI-floor rent escalation (§17)", 8, 71, "Templates owns OFFICE-NNN v2"],
                ["Anchor co-tenancy kick-outs (§11)", 14, 84, "RETAIL-ANCHOR retune"],
                ["Holdover with multiplier (§28)", 11, 89, "stable"],
                ["Ground lease amendment cascade", 4, 76, "long tail — re-prompt"],
                ["SNDA non-standard carve-outs", 6, 81, "stable, route to Legal"],
              ].map(([name, n, c, note]) => (
                <tr key={name}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{name}</div>
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{note}</div>
                  </td>
                  <td className="num" style={{ textAlign:"right" }}>{n}</td>
                  <td className="num" style={{ textAlign:"right", color: c < 80 ? "var(--warn)" : "var(--text)" }}>{c}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-h"><h3>Capacity & on-call</h3></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <CapBlock label="T1 / T2 abstractors" filled={11} total={14} note="weekday daytime" />
            <CapBlock label="QA / Sr Abstractors" filled={4} total={6} note="9% utilization headroom" />
            <CapBlock label="Legal reviewers" filled={3} total={4} note="rotating w/ counsel" />
            <CapBlock label="Weekend on-call" filled={1} total={2} note="Sat 02–06 gap" tone="warn" />
          </div>
          <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: "var(--warn-bg)", color: "var(--warn)", fontSize: 12.5, lineHeight: 1.5 }}>
            <b>Capacity ask Q3:</b> +4 T1 abstractors. CityCenter-style bulk batches growing 20% q/q.
          </div>
        </div>
      </div>
    </>
  );
}

function CapBlock({ label, filled, total, note, tone }) {
  return (
    <div style={{ padding: 10, borderRadius: 8, background: "var(--bg-sub)" }}>
      <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{label}</div>
      <div className="mono" style={{ fontSize: 17, fontWeight: 500, marginTop: 4 }}>
        {filled} <span style={{ color: "var(--text-4)", fontSize: 13 }}>/ {total}</span>
      </div>
      <div style={{ fontSize: 11, color: tone === "warn" ? "var(--warn)" : "var(--text-3)", marginTop: 2 }}>{note}</div>
    </div>
  );
}

function StackedPipelineChart() {
  const days = ["Thu","Fri","Sat","Sun","Mon","Tue","Wed"];
  // by stage: ingest, extract, validate, review
  const data = [
    { ingest: 22, extract: 38, validate: 14, review: 8 },
    { ingest: 24, extract: 42, validate: 18, review: 9 },
    { ingest: 14, extract: 27, validate: 12, review: 6 },
    { ingest: 18, extract: 31, validate: 14, review: 7 },
    { ingest: 28, extract: 48, validate: 26, review: 11 },
    { ingest: 32, extract: 52, validate: 31, review: 14 },
    { ingest: 27, extract: 46, validate: 28, review: 12 },
  ];
  const colors = { ingest: "var(--info)", extract: "var(--accent)", validate: "var(--warn)", review: "var(--accent-2)" };
  const labels = { ingest: "Ingest", extract: "Extract", validate: "Validate", review: "Review" };
  const max = Math.max(...data.map(d => d.ingest + d.extract + d.validate + d.review));
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${days.length}, 1fr)`, gap: 12, height: 160, alignItems: "end" }}>
        {data.map((d, i) => {
          const total = d.ingest + d.extract + d.validate + d.review;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "stretch", height: "100%", justifyContent:"flex-end" }}>
              <div style={{ display:"flex", flexDirection:"column", height: `${(total/max)*100}%`, borderRadius: 4, overflow:"hidden" }}>
                {Object.entries(d).map(([k,v]) => (
                  <div key={k} style={{ background: colors[k], height: `${(v/total)*100}%` }} title={`${labels[k]} ${v}`}/>
                ))}
              </div>
              <div className="muted mono" style={{ fontSize: 10.5, textAlign:"center", marginTop: 6 }}>{days[i]}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display:"flex", gap: 14, marginTop: 14, fontSize: 11.5, color: "var(--text-3)" }}>
        {Object.entries(labels).map(([k,v]) => (
          <span key={k} style={{ display:"inline-flex", alignItems:"center", gap: 5 }}>
            <span style={{ width:8, height:8, borderRadius:2, background: colors[k] }} />{v}
          </span>
        ))}
      </div>
    </div>
  );
}

function SlaScorecard() {
  const rows = [
    ["Ingest ≤4h",                "98%", "good"],
    ["Extract ≤8h",               "94%", "good"],
    ["Validate flagged ≤24h",     "86%", "warn"],
    ["Critical clearance ≤48h",   "92%", "good"],
    ["Estoppel batch (refi) ≤72h","99%", "good"],
    ["Bulk batch (≥10 docs) ≤5d", "96%", "good"],
  ];
  const c = { good:"var(--good)", warn:"var(--warn)", bad:"var(--bad)" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {rows.map(([k,v,t]) => (
        <div key={k} style={{ display:"grid", gridTemplateColumns:"1fr 50px", gap: 10, alignItems:"center" }}>
          <div style={{ fontSize: 12.5 }}>{k}</div>
          <div className="mono" style={{ fontSize: 13, textAlign: "right", color: c[t], fontWeight: 500 }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

// ─── DIRECTOR HOME (altitude 3) ────────────────────────────────
function DirectorHome({ role, openAltitude }) {
  const isGRC = role.dept === "grc";
  if (isGRC) return <ComplianceDirectorHome role={role} />;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Portfolio intelligence · {role.short}</h1>
          <div className="page-sub">Acme batch reveals CPI-floor exposure across 7 vector-similar leases. $89M ARR shifts from open to floor-protected. Worth a board talking point.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Weekly export</button>
          <button className="btn btn-primary" onClick={() => openAltitude("LEASE-A-2491")}>Altitude view</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Leases under mgmt" value="6,412" note="$14.8B ARR" tone="good" />
        <KpiCard label="Template coverage" value="93%" note="of clause taxonomy · 11 of 12" tone="good" />
        <KpiCard label="Realized error YTD" value="$0" note="of $4.8M envelope" tone="good" />
        <KpiCard label="Open initiatives" value="11" note="2 amber · 0 red" />
      </div>

      <div className="row row-2" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-h"><h3>30-day program trend</h3></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16 }}>
            <TrendBlock title="Accuracy" series={[98.2,98.5,98.7,98.6,98.8,98.9,99.0,99.0,99.1,99.1,99.2,99.2,99.3,99.2,99.2]} unit="%" color="var(--good)" />
            <TrendBlock title="Throughput (leases/day)" series={[3.2,3.4,3.6,3.5,3.7,3.8,3.8,3.9,4.0,4.0,4.1,4.0,4.1,4.1,4.1]} unit="" color="var(--info)" />
            <TrendBlock title="Hallucination rate" series={[0.12,0.11,0.10,0.09,0.08,0.08,0.07,0.06,0.06,0.05,0.05,0.04,0.04,0.04,0.04]} unit="%" color="var(--good)" />
            <TrendBlock title="Cost / lease" series={[6.40,6.20,6.10,5.90,5.80,5.70,5.60,5.50,5.40,5.30,5.30,5.20,5.10,5.10,5.00]} unit="$" color="var(--good)" />
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>Initiatives</h3><span className="h-sub">Q2 program</span></div>
          {[
            ["OFFICE-NNN-2024 v2 (CPI-floor support)", 72, "on-track", "$0 cost"],
            ["pgvector cluster scale to 14M",          88, "on-track", "platform"],
            ["GROUND-LEASE amend. cascade fix",        41, "amber", "long tail"],
            ["ASC 842 audit pack automation",          96, "on-track", "audit-ready"],
            ["Embedding-model second source RFP",      58, "on-track", "Q3 GA"],
            ["Tabletop · adversarial clause",          100,"done", "complete"],
          ].map(([name, pct, st, note]) => (
            <div key={name} style={{ padding: "8px 0", borderBottom: "1px dashed var(--border-2)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize: 12.5 }}>
                <span style={{ fontWeight: 500 }}>{name}</span>
                <span className="muted">{note}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 36px", gap: 8, alignItems:"center", marginTop: 5 }}>
                <MiniBar value={pct} color={st==="amber" ? "var(--warn)" : st==="done" ? "var(--good)" : "var(--accent)"} />
                <div className="mono" style={{ fontSize: 11, textAlign:"right", color:"var(--text-3)" }}>{pct}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3>Portfolio query · CPI-floor exposure</h3><span className="h-sub">pgvector nearest-neighbour on §17 escalation chunks</span></div>
        <PortfolioCpiTable />
      </div>
    </>
  );
}

function PortfolioCpiTable() {
  const rows = [
    ["LEASE-A-2491", "Acme Corp · 1245 Park Ave",       0.00, 48.2, "CPI-floor 3.0%",   "renewal Nov 2027"],
    ["LEASE-A-1872", "Sunfield Holdings · 88 Spring",   0.07, 14.6, "CPI-floor 3.5%",   "renewal Mar 2026"],
    ["LEASE-A-1991", "Beacon Capital · Two Pier",       0.08, 22.1, "CPI-floor 2.5%",   "renewal Aug 2028"],
    ["LEASE-A-2114", "Crest Energy · Bay Tower",        0.11, 8.4,  "CPI-floor 3.0%",   "stable"],
    ["LEASE-A-2056", "Mariner Logistics · Pier 4",      0.13, 6.2,  "CPI-floor 2.0%",   "stable"],
    ["LEASE-A-1734", "Northwind LP · 510 Hudson",       0.14, 11.8, "CPI-floor 2.5%",   "renewal May 2026"],
    ["LEASE-A-1668", "Greenmark Inc · One Beacon",      0.16, 5.4,  "CPI-floor (rare)", "stable"],
  ];
  return (
    <table className="table">
      <thead><tr><th>Lease</th><th>Tenant · property</th><th style={{textAlign:"right"}}>Cosine dist</th><th style={{textAlign:"right"}}>ARR ($M)</th><th>Clause</th><th>Status</th></tr></thead>
      <tbody>
        {rows.map(([id, t, d, arr, cl, st]) => (
          <tr key={id}>
            <td className="mono" style={{ fontSize: 12 }}>{id}</td>
            <td style={{ fontWeight: 500 }}>{t}</td>
            <td className="num" style={{ textAlign:"right" }}>{d === 0 ? "(self)" : d.toFixed(2)}</td>
            <td className="num" style={{ textAlign:"right" }}>{arr}</td>
            <td className="mono muted" style={{ fontSize: 12 }}>{cl}</td>
            <td className="muted" style={{ fontSize: 12 }}>{st}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ComplianceDirectorHome() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance posture · today</h1>
          <div className="page-sub">7 frameworks tracked. SOX walkthrough in 54 days. C-119 (reviewer access expiry) failed yesterday — remediation owner assigned.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Evidence pack</button>
          <button className="btn btn-primary">Open finding</button>
        </div>
      </div>
      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Overall coverage" value="92%" note="across 7 frameworks" tone="good" />
        <KpiCard label="Failing controls" value="1" note="C-119 · reviewer expiry" tone="bad" />
        <KpiCard label="At-risk controls" value="1" note="C-441 · amend. reconcile" tone="warn" />
        <KpiCard label="Days to next audit" value="54" note="ASC 842 + SOX · Jul 15" />
      </div>
      <div className="card">
        <div className="card-h"><h3>Framework status</h3></div>
        <FrameworkTable />
      </div>
    </>
  );
}

function FrameworkTable() {
  return (
    <table className="table">
      <thead><tr><th>Framework</th><th>Controls</th><th>Coverage</th><th>Open gaps</th><th>Next audit</th><th style={{textAlign:"right"}}>Risk</th></tr></thead>
      <tbody>
        {window.FRAMEWORKS.map(f => (
          <tr key={f.id}>
            <td><span style={{ fontWeight: 500 }}>{f.label}</span></td>
            <td className="num">{f.controls}</td>
            <td>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 38px", gap: 8, alignItems:"center" }}>
                <MiniBar value={f.coverage} color={f.coverage > 90 ? "var(--good)" : "var(--warn)"} />
                <span className="mono" style={{ fontSize: 12 }}>{f.coverage}%</span>
              </div>
            </td>
            <td className="num">{f.gaps}</td>
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
  );
}

function TrendBlock({ title, series, unit, color }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{title}</div>
      <div className="mono" style={{ fontSize: 18, fontWeight: 500, marginTop: 2 }}>
        {unit === "$" && "$"}{series[series.length-1]}{unit !== "$" && unit}
      </div>
      <div style={{ marginTop: 4 }}><Sparkline points={series} color={color} fill /></div>
    </div>
  );
}

// ─── VP TENANT OPS HOME (altitude 4) ───────────────────────────
function VPHome({ openAltitude }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tenant operations · posture</h1>
          <div className="page-sub">Top-10 tenants account for $1.84B ARR. Acme renewal opens Nov 2027 — CPI-floor pattern surfaced today shapes the negotiation.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Briefing pack</button>
          <button className="btn btn-primary" onClick={() => openAltitude("LEASE-A-2491")}>Altitude view</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Top-10 tenant ARR" value="$1.84B" note="12.4% of book · stable" tone="good" />
        <KpiCard label="Renewals · 12mo" value="187" note="$412M ARR · 23 critical" />
        <KpiCard label="Tenant disputes (open)" value="0" note="zero unresolved" tone="good" />
        <KpiCard label="Initiatives on-track" value="9 of 11" note="2 amber · 0 red" tone="good" />
      </div>

      <div className="row row-2" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-h"><h3>Tenant risk register · top 5</h3><span className="h-sub">by ARR exposure × renewal risk</span></div>
          <RiskRegister />
        </div>
        <div className="card">
          <div className="card-h"><h3>Peer benchmark</h3><span className="h-sub">vs anonymized REIT cohort (n=14)</span></div>
          <PeerBenchmark />
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3>Renewal pipeline · next 12 months</h3></div>
        <table className="table">
          <thead><tr><th>Tenant</th><th>Property</th><th>ARR</th><th>Notice deadline</th><th>Owner</th><th style={{textAlign:"right"}}>Posture</th></tr></thead>
          <tbody>
            {[
              ["Acme Corporation",     "1245 Park Ave",      "$48.2M", "May 2026 (18mo)", "S. Chen",    "proactive"],
              ["Sunfield Holdings",     "88 Spring St",       "$14.6M", "Sep 2025 (4mo)",  "S. Chen",    "engaged"],
              ["Beacon Capital",        "Two Pier",            "$22.1M","Feb 2028 (32mo)", "S. Chen",    "monitor"],
              ["Northwind LP",          "510 Hudson",         "$11.8M", "Nov 2025 (6mo)",  "M. Adeyemi", "engaged"],
              ["Mariner Logistics",     "Pier 4",              "$6.2M", "Aug 2028 (38mo)", "M. Adeyemi", "monitor"],
              ["Crest Energy",          "Bay Tower",           "$8.4M", "Jan 2027 (20mo)", "S. Chen",    "monitor"],
            ].map(([t,p,arr,d,o,post]) => (
              <tr key={t}>
                <td style={{ fontWeight: 500 }}>{t}</td>
                <td className="muted" style={{ fontSize: 12.5 }}>{p}</td>
                <td className="num">{arr}</td>
                <td className="muted mono" style={{ fontSize: 12 }}>{d}</td>
                <td className="muted" style={{ fontSize: 12.5 }}>{o}</td>
                <td style={{ textAlign: "right" }}>
                  <span className="chip" style={{
                    background: post === "proactive" ? "var(--good-bg)" : post === "engaged" ? "var(--info-bg)" : "var(--bg-sub)",
                    color: post === "proactive" ? "var(--good)" : post === "engaged" ? "var(--info)" : "var(--text-3)"
                  }}>{post}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function RiskRegister() {
  const rows = [
    ["Acme renewal · CPI-floor exposure",      "high",   "$48M ARR · 18mo out"],
    ["Sunfield renewal · 4mo notice deadline", "high",   "$14.6M ARR · engage now"],
    ["Goldman Tower · 41 tenants · refi pinch", "medium", "estoppel sprint closing Thu"],
    ["Ground lease cascades · 4 amendments",    "medium", "GROUND-LEASE template long tail"],
    ["Coworking exit risk · 14 desks",          "low",    "minor exposure"],
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
      {rows.map(([r,t,n]) => (
        <div key={r} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px dashed var(--border-2)" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{r}</div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{n}</div>
          </div>
          <span className="chip" style={{
            background: t === "high" ? "var(--bad-bg)" : t === "medium" ? "var(--warn-bg)" : "var(--bg-sub)",
            color: t === "high" ? "var(--bad)" : t === "medium" ? "var(--warn)" : "var(--text-3)",
          }}>{t}</span>
        </div>
      ))}
    </div>
  );
}

function PeerBenchmark() {
  const rows = [
    ["Accuracy · field-level",  "99.2%",   "p15", "good"],
    ["Throughput / abstractor", "4.1/d",   "p20", "good"],
    ["Cost / lease",            "$5.10",   "p25", "good"],
    ["Hallucination rate",      "0.04%",   "p10", "good"],
    ["Audit defensibility",     "100%",    "p05", "good"],
    ["Abstractors / $1B AUM",   "2.6",     "p55", "warn"],
  ];
  return (
    <table className="table">
      <thead><tr><th>Metric</th><th>You</th><th style={{textAlign:"right"}}>Cohort rank</th></tr></thead>
      <tbody>
        {rows.map(([k,v,p,t]) => (
          <tr key={k}>
            <td>{k}</td>
            <td className="mono">{v}</td>
            <td style={{ textAlign:"right", color: t === "good" ? "var(--good)" : "var(--warn)", fontWeight: 500 }} className="mono">{p}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── COO HOME (altitude 5, ops-flavored exec) ──────────────────
function COOHome({ role, openAltitude }) {
  const m = window.EXEC_METRICS;
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Operating posture · {role.label}</h1>
          <div className="page-sub">Active critical in review. $314M ARR under abstraction today. Controls held. Audit committee briefed Thursday.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Audit pack</button>
          <button className="btn btn-primary" onClick={() => openAltitude("LEASE-A-2491")}>Altitude view</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Realized error YTD" value="$0" note="of $4.8M envelope · 0%" tone="good" />
        <KpiCard label="ARR under mgmt" value="$14.8B" note="6,412 leases · stable" tone="good" />
        <KpiCard label="Critical in flight" value={m.openCriticals} note={`${m.contained} in review · ${m.inFlight} stuck`} tone="warn" />
        <KpiCard label="Regulatory" value="None" note="reportable today" tone="good" />
      </div>

      <div className="row row-21" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-h"><h3>Talking points for Thursday</h3><span className="h-sub">audit committee · 10:00 ET</span></div>
          <BoardTalkingPoints />
        </div>
        <div className="card">
          <div className="card-h"><h3>Today's brief</h3></div>
          <div style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--text-2)" }}>
            A top-5 tenant master lease came in this morning — Acme Corp, 287k RSF, $48.2M ARR. The pipeline correctly flagged four clauses for human review, including a CPI-floor rent escalation pattern we hadn't catalogued. Control <b>C-117</b> (clause-level provenance) prevented a hallucinated escalator from reaching the GL. <span className="muted">Audit-defensible.</span>
          </div>
          <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: "var(--bg-sub)", fontSize: 12.5, lineHeight: 1.5 }}>
            <b style={{ display: "block", marginBottom: 4 }}>What I'm asking the org</b>
            Model refresh ($1.2M, in-budget) — accelerate to Q3 close. Adds CPI-floor and ground-lease cascade as first-class patterns, ~70% confidence lift on the long tail.
          </div>
        </div>
      </div>

      <div className="row row-2">
        <div className="card">
          <div className="card-h"><h3>Control coverage by framework</h3></div>
          <FrameworkTable />
        </div>
        <div className="card">
          <div className="card-h"><h3>Error budget · YTD</h3><span className="h-sub">vs board-approved envelope</span></div>
          <ErrorBudget />
        </div>
      </div>
    </>
  );
}

function BoardTalkingPoints() {
  const items = [
    { headline: "We held the line on accuracy.", body: "$0 disputed YTD against a board-approved $4.8M envelope. The program is operating at 0% of envelope." },
    { headline: "Our chunking architecture is paying off.", body: "Section-level chunking caught a CPI-floor clause on Acme's master lease that token-arbitrary chunking would have split mid-sentence. We surfaced exposure across 7 portfolio leases." },
    { headline: "One control failed; remediation owned.", body: "C-119 (reviewer access auto-expiry) failed in test. Engineering owns fix by Jun 4, before SOX walkthrough." },
    { headline: "We need to fund the model refresh now.", body: "Long-tail patterns (CPI-floor, ground-lease cascades) sit at 71–76% confidence. Refresh ($1.2M, in budget) closes ~70% of that gap." },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 12 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display:"grid", gridTemplateColumns:"22px 1fr", gap: 10 }}>
          <div className="mono" style={{ fontSize: 11.5, color: "var(--text-4)", paddingTop: 2 }}>0{i+1}</div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{it.headline}</div>
            <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 3, lineHeight: 1.55 }}>{it.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorBudget() {
  const used = 0, total = 4800;
  const pct = (used/total)*100;
  const bands = [["Q1", 0.0], ["Q2", 0.0], ["Q3", 0], ["Q4", 0]];
  return (
    <div>
      <div style={{ position:"relative", height: 26, background: "var(--bg-sub)", borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ position:"absolute", inset:"0 auto 0 0", width: `${pct}%`, background: "var(--good)", opacity: 0.85 }} />
        <div style={{ position:"absolute", right: 8, top: "50%", transform:"translateY(-50%)", fontSize: 11.5, color: "var(--text)", fontFamily: "var(--font-mono)" }}>
          $0 / $4.8M
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap: 8 }}>
        {bands.map(([q,v]) => (
          <div key={q} style={{ padding: 8, borderRadius: 6, background: "var(--bg-sub)" }}>
            <div style={{ fontSize: 11, color:"var(--text-3)" }}>{q}</div>
            <div className="mono" style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>${v.toFixed(1)}M</div>
          </div>
        ))}
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 10, lineHeight: 1.5 }}>
        Envelope refreshes annually. Zero dollars charged YTD — provenance + reviewer attestation caught every edge case before it reached the GL.
      </div>
    </div>
  );
}

// ─── CDO HOME (altitude 5, data-flavored exec) ─────────────────
function CDOHome({ role, openAltitude }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Data & model health · today</h1>
          <div className="page-sub">Pipeline nominal at 4.1 leases/hr. Hallucination rate 0.04% (↓0.01 w/w). One template (GROUND-LEASE) is the long tail — refresh in flight.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Model card</button>
          <button className="btn btn-primary" onClick={() => openAltitude("LEASE-A-2491")}>Altitude view</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Pipeline availability · 30d" value="99.987%" note="SLO 99.95% · ✓" tone="good" />
        <KpiCard label="Hallucination rate · 30d" value="0.04%" note="↓0.01 w/w" tone="good" />
        <KpiCard label="Chunks indexed (pgvector)" value="84M" note="312GB · ivfflat lists=1000" />
        <KpiCard label="Cost / lease" value="$5.10" note="↓$0.30 w/w · trending right" tone="good" />
      </div>

      <div className="row row-12" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-h"><h3>Subsystem health</h3></div>
          <SubsystemGrid />
        </div>
        <div className="card">
          <div className="card-h"><h3>What lands in eng this week</h3></div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-2)" }}>
            Three things from Lena's side reach the platform team:
          </div>
          <div style={{ marginTop: 10, display:"flex", flexDirection:"column", gap: 10 }}>
            {[
              ["OFFICE-NNN-2024 v2 ship", "CPI-floor + ceiling subfields added to schema; few-shot corpus loaded with 12 exemplars. ~3 eng-days."],
              ["pgvector cluster scale", "84M → 14M target. ivfflat lists=4000, index rebuild window Sat 02-06."],
              ["Embedding-model failover", "Second-source contract close; failover playbook + dual-write spike. ~2 weeks."],
            ].map(([t,d], i) => (
              <div key={i} style={{ padding: 10, borderRadius: 8, background: "var(--bg-sub)" }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t}</div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 3, lineHeight: 1.5 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row row-2">
        <div className="card">
          <div className="card-h"><h3>Pipeline trace · LEASE-A-2491</h3><span className="h-sub">end-to-end stage timing</span></div>
          <PipelineTrace />
        </div>
        <div className="card">
          <div className="card-h"><h3>Vendor concentration risk</h3></div>
          <VendorRisk />
        </div>
      </div>
    </>
  );
}

function SubsystemGrid() {
  return (
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
            {s.note && <div className="muted" style={{ fontSize: 11.5, marginTop: 3, lineHeight: 1.4 }}>{s.note}</div>}
          </div>
        );
      })}
    </div>
  );
}

function PipelineTrace() {
  const stages = [
    ["Ingest",   "1.4s", "OCR pass-1 first-pass 98.4%"],
    ["Chunk",    "2.1s", "1,242 chunks · article-aware"],
    ["Embed",    "4.7s", "1,242 × 1536-d · pgvector"],
    ["Extract",  "11.3s","73 fields · 4 low-confidence"],
    ["Validate", "0.8s", "cross-clause + schema"],
    ["Review",   "—",    "human-in-loop · pending"],
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
      {stages.map(([n,t,d], i) => (
        <div key={n} style={{ display: "grid", gridTemplateColumns: "16px 100px 1fr 60px", gap: 12, alignItems: "center" }}>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--text-4)" }}>{String(i+1).padStart(2,"0")}</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{n}</div>
          <div className="muted" style={{ fontSize: 12.5 }}>{d}</div>
          <div className="mono" style={{ fontSize: 12, textAlign: "right", color: t === "—" ? "var(--text-4)" : "var(--text)" }}>{t}</div>
        </div>
      ))}
    </div>
  );
}

function VendorRisk() {
  return (
    <div>
      {[
        ["Embedding · single provider",  78, "warn", "RFP in flight"],
        ["LLM · primary",                72, "warn", "Failover spike scheduled"],
        ["pgvector · self-hosted",       40, "ok",   "Internal, no concentration"],
        ["S3 audit-log storage",         60, "ok",   "Standard, geo-redundant"],
      ].map(([n, p, t, note]) => (
        <div key={n} style={{ padding: "8px 0", borderBottom: "1px dashed var(--border-2)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize: 12.5 }}>
            <span style={{ fontWeight: 500 }}>{n}</span>
            <span className="muted">{note}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 36px", gap: 8, alignItems:"center", marginTop: 5 }}>
            <MiniBar value={p} color={t === "warn" ? "var(--warn)" : "var(--good)"} />
            <span className="mono" style={{ fontSize: 11, textAlign:"right" }}>{p}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CEO HOME (altitude 6) ─────────────────────────────────────
function CEOHome({ openAltitude }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Today.</h1>
          <div className="page-sub">Portfolio is healthy. One top-5 tenant lease abstracted today, with every field auditable.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Last week's brief</button>
          <button className="btn btn-primary" onClick={() => openAltitude("LEASE-A-2491")}>See the lease</button>
        </div>
      </div>

      <div className="card" style={{ padding: 40, marginBottom: 18, background: "var(--bg-elev)" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 40 }}>
          <CeoStat label="Customers affected today" value="0" sub="0 leases disputed · 0 re-bills" />
          <CeoStat label="Pipeline availability" value="99.987%" sub="30 days · target 99.95%" />
          <CeoStat label="Realized error YTD" value="$0" sub="of $4.8M envelope · 0%" />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-h"><h3>What you need to know</h3><span className="h-sub">in plain language</span></div>
        <div style={{ fontSize: 16, lineHeight: 1.7, color: "var(--text)", maxWidth: 760, fontFamily: "var(--font-serif)" }}>
          A top-five tenant filed a complex new master lease this morning — Acme Corp,
          $48 million a year in rent. <b>Our system abstracted it correctly.</b> It
          flagged four clauses worth a human eye, including a rent-escalation pattern
          we hadn't seen before. Every number we wrote down carries a citation to the
          exact paragraph it came from.
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-2)", marginTop: 12, maxWidth: 760 }}>
          Lena will brief the audit committee on Thursday. Raj's team has no
          engineering action. We are not required to disclose.
        </div>
      </div>

      <div className="row row-2">
        <div className="card">
          <div className="card-h"><h3>This week's questions</h3></div>
          <ol style={{ paddingLeft: 18, fontSize: 14, lineHeight: 1.8, color: "var(--text-2)", margin: 0 }}>
            <li>Do we accelerate the model refresh by one quarter? Lena recommends yes.</li>
            <li>Are we ready for the SOX walkthrough on July 15? One control needs remediation.</li>
            <li>Is our single-vendor embedding risk acceptable? RFP in flight.</li>
          </ol>
        </div>
        <div className="card">
          <div className="card-h"><h3>People to thank</h3></div>
          <div style={{ display:"flex", flexDirection:"column", gap: 10 }}>
            {[
              ["Mira Reyes", "Abstractor", "Caught the CPI-floor pattern and pulled three precedents before escalating."],
              ["Diana Voss", "Sr QA",      "Reconciled §17.4 against Ex-D parking rent — same base year, no drift."],
              ["Jordan Tan, Esq.", "Legal", "Signed off on §22 SNDA carve-outs cleanly before close of business."],
            ].map(([n, r, what]) => (
              <div key={n} style={{ padding: 10, borderRadius: 8, background: "var(--bg-sub)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                  <span style={{ fontWeight: 500, fontSize: 13.5 }}>{n}</span>
                  <span className="muted" style={{ fontSize: 11.5 }}>{r}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 3, lineHeight: 1.5 }}>{what}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function CeoStat({ label, value, sub }) {
  return (
    <div>
      <div style={{ fontSize: 12.5, color: "var(--text-3)", marginBottom: 6, fontWeight: 500, letterSpacing: "0.01em" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 64, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1, fontFeatureSettings: "'tnum'" }}>{value}</div>
      <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 8 }}>{sub}</div>
    </div>
  );
}

// ─── Shared KPI card ───────────────────────────────────────────
function KpiCard({ label, value, note, tone }) {
  const tones = { good: "var(--good)", warn: "var(--warn)", bad: "var(--bad)" };
  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="kpi">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value" style={tone ? { color: tones[tone] } : undefined}>{value}</div>
        {note && <div className="kpi-note">{note}</div>}
      </div>
    </div>
  );
}

function useGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Late shift";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

Object.assign(window, { HomePage, KpiCard, SlaIcons });
