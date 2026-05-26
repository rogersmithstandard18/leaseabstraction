// Stratum SecOps — Home page. Renders a different dashboard per altitude.

const { useMemo: hMemo, useState: hState, useEffect: hEffect } = React;

function HomePage({ role, setPage, openIncident, openAltitude }) {
  switch (role.altitude) {
    case 0: return <AnalystHome role={role} setPage={setPage} openIncident={openIncident} />;
    case 1: return <LeadHome role={role} setPage={setPage} openIncident={openIncident} openAltitude={openAltitude} />;
    case 2: return <ManagerHome role={role} setPage={setPage} openIncident={openIncident} openAltitude={openAltitude} />;
    case 3: return <DirectorHome role={role} setPage={setPage} openIncident={openIncident} openAltitude={openAltitude} />;
    case 4: return <SrDirectorHome role={role} openIncident={openIncident} openAltitude={openAltitude} />;
    case 5: return role.id === "cto"
      ? <CTOHome role={role} openIncident={openIncident} openAltitude={openAltitude} />
      : <CISOHome role={role} openIncident={openIncident} openAltitude={openAltitude} />;
    case 6: return <CEOHome role={role} openAltitude={openAltitude} />;
    default: return null;
  }
}

// ─── Personal load row ─────────────────────────────────────────
function MyLoadCard({ role, openIncident }) {
  const mine = window.INCIDENTS.filter(i =>
    i.assignee.toLowerCase().includes(role.name.split(" ")[0].toLowerCase()) && i.status !== "Closed"
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
          <thead>
            <tr><th style={{width:36}}></th><th>Incident</th><th>Asset</th><th>Status</th><th style={{textAlign:"right"}}>Age</th><th style={{textAlign:"right"}}>SLA</th></tr>
          </thead>
          <tbody>
            {mine.map(i => (
              <tr key={i.id} onClick={() => openIncident(i)}>
                <td><KindGlyph kind={i.kind} /></td>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <SevChip sev={i.severity} />
                    <span style={{ fontWeight: 500 }}>{i.title}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2, fontFamily: "var(--font-mono)" }}>{i.id} · {i.mitre}</div>
                </td>
                <td className="muted" style={{ fontSize: 12.5 }}>{i.asset}</td>
                <td><StatusChip status={i.status} /></td>
                <td className="num muted" style={{ textAlign:"right" }}><TimeAgo minutes={i.ageMin} /></td>
                <td style={{ textAlign:"right" }}>
                  <SlaIcons sla={i.sla} />
                </td>
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
      {["ack","contain","resolve"].map(k => (
        <span key={k} title={`${k}: ${sla[k]}`} style={{ color: map[sla[k]]?.color || "var(--text-4)" }}>{map[sla[k]]?.ch || "○"}</span>
      ))}
    </span>
  );
}

// ─── ANALYST HOME (altitude 0) ─────────────────────────────────
function AnalystHome({ role, openIncident }) {
  const greeting = useGreeting(role);
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {role.name.split(" ")[0]}.</h1>
          <div className="page-sub">3 unassigned in queue. Maya's shift ends 19:00 ET — APAC handoff to Ananya at 18:45.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Take next</button>
          <button className="btn btn-primary">+ New investigation</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="My open" value="3" note="2 Critical · 1 High" />
        <KpiCard label="Acked today" value="14" note="MTTA 1m 41s" tone="good" />
        <KpiCard label="SLA at-risk" value="1" note="INC-9201 contain ≤30m" tone="warn" />
        <KpiCard label="Shift" value="06:00 → 19:00" note="EST · Floor 87% load" />
      </div>

      <MyLoadCard role={role} openIncident={openIncident} />

      <div className="row row-12" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-h"><h3>Unassigned queue</h3><span className="h-sub">Pick by oldest · click to claim</span></div>
          <table className="table">
            <thead><tr><th>Incident</th><th>Source</th><th style={{textAlign:"right"}}>Age</th></tr></thead>
            <tbody>
              {window.INCIDENTS.filter(i => i.status === "Triage" && i.severity !== "Low").slice(0, 4).map(i => (
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
          <div className="card-h"><h3>Drill reminder</h3></div>
          <div style={{ fontSize: 13, lineHeight: 1.55, color: "var(--text-2)" }}>
            You haven't run a drill in 9 days. <span className="muted">Recommended:</span>
          </div>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <DrillRow title="PrintNightmare C2 beacon" mitre="T1059.001" />
            <DrillRow title="ntdsutil IFM on DC" mitre="T1003.003" />
            <DrillRow title="CNP card-testing burst" mitre="T1110.004" />
          </div>
          <button className="btn btn-sm" style={{ marginTop: 12, width: "100%" }}>Open Training & Drills →</button>
        </div>
      </div>
    </>
  );
}

function DrillRow({ title, mitre }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding: "8px 10px", borderRadius: 6, background:"var(--bg-sub)" }}>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 11, color:"var(--text-3)", fontFamily:"var(--font-mono)", marginTop:1 }}>{mitre}</div>
      </div>
      <span style={{ fontSize: 11, color: "var(--text-3)" }}>≈12 min</span>
    </div>
  );
}

// ─── LEAD HOME (altitude 1) ────────────────────────────────────
function LeadHome({ role, openIncident, openAltitude }) {
  const greeting = useGreeting(role);
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {role.name.split(" ")[0]}. The floor is moving.</h1>
          <div className="page-sub">3 criticals in flight. Devon (T3) on INC-9201, Jordan (IR) on INC-9193 + INC-9197. Floor at 87% — APAC handoff in 4h.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Page on-call</button>
          <button className="btn btn-primary">Brief manager</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Open criticals" value="3" note="all contained" tone="bad" />
        <KpiCard label="Floor load" value="87%" note="2 of 47 on PTO" tone="warn" />
        <KpiCard label="MTTA today" value="1m 41s" note="target ≤2m · ✓" tone="good" />
        <KpiCard label="SLA at-risk" value="2" note="INC-9201, INC-9193" tone="warn" />
      </div>

      <div className="row row-12" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-h">
            <h3>Active criticals</h3>
            <button className="btn btn-sm btn-ghost" onClick={() => openAltitude("INC-9201")}>Open altitude view →</button>
          </div>
          <table className="table">
            <thead><tr><th>Incident</th><th>Owner</th><th>Phase</th><th style={{textAlign:"right"}}>Age</th><th style={{textAlign:"right"}}>$ at risk</th></tr></thead>
            <tbody>
              {window.INCIDENTS.filter(i => i.severity === "Critical" && i.status !== "Closed").map(i => (
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
          <div className="card-h"><h3>Detection mix · last 24h</h3><span className="h-sub">216 alerts · 87% auto-closed</span></div>
          <Sparkline points={[12,15,9,18,11,16,22,14,9,11,18,28,16,14,12,9,11,15,22,18,14,11,8,10]} color="var(--accent)" height={48} fill />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginTop: 10 }}>
            {[["Auth", 84],["Endpoint", 47],["Network", 39],["Cloud", 28],["Payments", 18]].map(([k,v]) => (
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
            <li><b>INC-9201</b> — Devon owns through EOD; APAC monitors firewall block on 94.130.88.12.</li>
            <li><b>INC-9193</b> — krbtgt 2nd reset window 22:30 ET; Jordan briefed APAC IR.</li>
            <li><b>INC-9176</b> — Citrix gateway monitoring; Maya rotating password on call.</li>
            <li><b>INC-9181</b> — DDoS ongoing; vendor escalation #46821 with Cloudflare.</li>
          </ol>
        </div>
      </div>
    </>
  );
}

function FloorStaff() {
  const staff = [
    { who: "Maya R.", role: "T1", load: 80, on: "INC-9176, +2", tone: "warn" },
    { who: "Devon K.",role: "T3", load: 95, on: "INC-9201, INC-9159", tone: "bad" },
    { who: "Jordan T.",role:"IR", load: 90, on: "INC-9193, INC-9170, INC-9197", tone: "bad" },
    { who: "Marcus A.",role:"T2", load: 45, on: "INC-9152", tone: "good" },
    { who: "Sam O.",  role: "T2", load: 60, on: "INC-9181", tone: "good" },
    { who: "Lin H.",  role: "T1", load: 30, on: "—", tone: "good" },
  ];
  const tone = (t) => ({good:"var(--good)", warn:"var(--warn)", bad:"var(--bad)"}[t]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {staff.map(s => (
        <div key={s.who} style={{ display: "grid", gridTemplateColumns: "1fr 60px", gap: 10, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.who} <span style={{ color: "var(--text-3)", fontWeight: 400 }}>· {s.role}</span></div>
            <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 1 }}>{s.on}</div>
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

// ─── MANAGER HOME (altitude 2) ─────────────────────────────────
function ManagerHome({ role, openAltitude, openIncident }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">SOC operations · today</h1>
          <div className="page-sub">3 criticals all in containment. MTTD this week down 18% w/w. Capacity tight: 2 of 47 on PTO, weekend on-call gap Sat 02–06.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Schedule</button>
          <button className="btn btn-primary" onClick={() => openAltitude("INC-9201")}>Altitude view · INC-9201</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="MTTD · 7d" value="5m 11s" note="target ≤7m · ↓18% w/w" tone="good" delta="down" />
        <KpiCard label="MTTR Sev-1 · 30d" value="47m" note="target 60m · 4 of 9 under" tone="good" />
        <KpiCard label="Open criticals" value="3" note="0 customer impact" tone="bad" />
        <KpiCard label="$ at risk · open" value="$253M" note="$0 realized today" tone="warn" />
      </div>

      <div className="row row-12" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-h"><h3>Queue mix · 7d trend</h3><span className="h-sub">stacked by category</span></div>
          <StackedQueueChart />
        </div>
        <div className="card">
          <div className="card-h"><h3>SLA scorecard</h3></div>
          <SlaScorecard />
        </div>
      </div>

      <div className="row row-2">
        <div className="card">
          <div className="card-h">
            <h3>Top recurring detections · 30d</h3>
            <span className="h-sub">repeat patterns to invest against</span>
          </div>
          <table className="table">
            <thead><tr><th>Pattern</th><th style={{textAlign:"right"}}>Count</th><th style={{textAlign:"right"}}>Detect rate</th></tr></thead>
            <tbody>
              {[
                ["PrintNightmare-derived C2", 3, 96, "DetEng owns rebuild"],
                ["CNP card-testing burst", 11, 82, "F-088 noisy — tune"],
                ["Tor-exit credential stuffing", 7, 91, "stable"],
                ["Citrix gateway brute-force", 4, 89, "stable"],
                ["LotL svchost masquerade", 2, 98, "stable"],
              ].map(([name, n, d, note]) => (
                <tr key={name}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{name}</div>
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{note}</div>
                  </td>
                  <td className="num" style={{ textAlign:"right" }}>{n}</td>
                  <td className="num" style={{ textAlign:"right" }}>{d}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-h"><h3>Capacity & on-call</h3></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <CapBlock label="T1 / T2 floor" filled={11} total={14} note="weekday daytime" />
            <CapBlock label="T3 / Sr Analyst" filled={4} total={6} note="9% utilization headroom" />
            <CapBlock label="IR / Forensics" filled={3} total={4} note="rotating w/ regional" />
            <CapBlock label="Weekend on-call" filled={1} total={2} note="Sat 02–06 gap" tone="warn" />
          </div>
          <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: "var(--warn-bg)", color: "var(--warn)", fontSize: 12.5, lineHeight: 1.5 }}>
            <b>Capacity ask Q3:</b> +2 T3 analysts. Weekend gap and growing CNP volume drive the need.
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

function StackedQueueChart() {
  // Hand-tuned: 7 days, 4 bands
  const days = ["Thu","Fri","Sat","Sun","Mon","Tue","Wed"];
  const data = [
    { auth: 38, ep: 22, net: 14, pay: 8 },
    { auth: 42, ep: 18, net: 10, pay: 9 },
    { auth: 27, ep: 12, net: 8,  pay: 6 },
    { auth: 31, ep: 14, net: 11, pay: 7 },
    { auth: 48, ep: 26, net: 19, pay: 11 },
    { auth: 52, ep: 31, net: 22, pay: 14 },
    { auth: 46, ep: 28, net: 18, pay: 12 },
  ];
  const colors = { auth: "var(--accent)", ep: "var(--info)", net: "var(--good)", pay: "var(--warn)" };
  const labels = { auth: "Auth", ep: "Endpoint", net: "Network", pay: "Payments" };
  const max = Math.max(...data.map(d => d.auth + d.ep + d.net + d.pay));
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${days.length}, 1fr)`, gap: 12, height: 160, alignItems: "end" }}>
        {data.map((d, i) => {
          const total = d.auth + d.ep + d.net + d.pay;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 0, height: "100%", justifyContent:"flex-end" }}>
              <div style={{ display:"flex", flexDirection:"column", gap: 0, height: `${(total/max)*100}%`, borderRadius: 4, overflow:"hidden" }}>
                {Object.entries(d).map(([k,v]) => (
                  <div key={k} style={{ background: colors[k], height: `${(v/total)*100}%` }} title={`${labels[k]} ${v}`}/>
                ))}
              </div>
              <div className="muted" style={{ fontSize: 10.5, textAlign:"center", marginTop: 6, fontFamily:"var(--font-mono)" }}>{days[i]}</div>
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
    ["Sev-1 Ack ≤5m",        "98%", "good"],
    ["Sev-1 Contain ≤30m",   "84%", "warn"],
    ["Sev-1 Resolve ≤4h",    "76%", "warn"],
    ["Sev-2 Ack ≤15m",       "96%", "good"],
    ["Sev-2 Resolve ≤24h",   "91%", "good"],
    ["Phishing triage ≤30m", "99%", "good"],
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
  const dept = role.dept;
  const isGRC = dept === "grc";

  if (isGRC) return <GRCDirectorHome role={role} />;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Program health · {role.short}</h1>
          <div className="page-sub">Active critical contained without customer impact. 3rd PrintNightmare-derived incident in 90d — DetEng rebuilding R-2103. Budget on track at 8% YTD utilization.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Weekly export</button>
          <button className="btn btn-primary" onClick={() => openAltitude("INC-9201")}>Altitude view</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="MTTR Sev-1 · 30d" value="47m" note="target 60m" tone="good" />
        <KpiCard label="Detect coverage" value="78%" note="MITRE tactics · 12 of 14" tone="good" />
        <KpiCard label="Loss YTD" value="$0.4M" note="of $4.8M budget" tone="good" />
        <KpiCard label="Open initiatives" value="11" note="2 amber · 0 red" />
      </div>

      <div className="row row-2" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-h"><h3>30-day program trend</h3></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16 }}>
            <TrendBlock title="MTTD" series={[8.2,7.5,7.9,6.8,7.1,6.4,5.9,5.6,5.4,5.2,5.1,5.0,5.1,5.2,5.1]} unit=" min" color="var(--good)" />
            <TrendBlock title="MTTR Sev-1" series={[62,68,60,55,58,52,49,51,47,46,48,46,47,47,47]} unit=" min" color="var(--info)" />
            <TrendBlock title="Realized loss" series={[0,0,0,0,40,40,40,40,80,80,80,80,400,400,400]} unit="K" color="var(--warn)" />
            <TrendBlock title="False-positive rate" series={[6.1,5.9,6.0,5.7,5.4,5.3,5.1,5.0,4.8,4.6,4.5,4.4,4.3,4.2,4.1]} unit="%" color="var(--good)" />
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>Initiatives</h3><span className="h-sub">Q2 program</span></div>
          {[
            ["EDR refresh — full fleet", 72, "on-track", "$1.2M"],
            ["Detection-as-code rollout", 88, "on-track", "—"],
            ["Exec asset hardening", 41, "amber", "2 wk behind"],
            ["SWIFT 4-eyes attestation", 96, "on-track", "audit-ready"],
            ["Cloud IAM least-privilege", 58, "on-track", "Q3 GA"],
            ["Tabletop · ransomware", 100, "done", "complete"],
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
        <div className="card-h"><h3>Department crosswalk</h3><span className="h-sub">today across all SecOps departments</span></div>
        <DeptCrosswalk />
      </div>
    </>
  );
}

function GRCDirectorHome({ role }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance posture · today</h1>
          <div className="page-sub">7 frameworks tracked. SOX audit in 54 days. C-119 (temp-access expiry) failed yesterday — remediation owner assigned.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Evidence pack</button>
          <button className="btn btn-primary">Open finding</button>
        </div>
      </div>
      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Overall coverage" value="92%" note="across 7 frameworks" tone="good" />
        <KpiCard label="Failing controls" value="1" note="C-119 · privileged expiry" tone="bad" />
        <KpiCard label="At-risk controls" value="1" note="C-441 · DC integrity" tone="warn" />
        <KpiCard label="Days to next audit" value="54" note="SOX ITGC · Jul 15" />
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
      <div className="mono" style={{ fontSize: 18, fontWeight: 500, marginTop: 2 }}>{series[series.length-1]}{unit}</div>
      <div style={{ marginTop: 4 }}><Sparkline points={series} color={color} fill /></div>
    </div>
  );
}

function DeptCrosswalk() {
  const rows = [
    { d: "SOC",           open: 9,  crit: 1, mttd: "5m 11s",  load: 87, lead: "Henry Nakamura" },
    { d: "IR / Forensics",open: 4,  crit: 2, mttd: "—",        load: 90, lead: "Jordan Tan" },
    { d: "Detection Eng", open: 0,  crit: 0, mttd: "FP 4.1%",  load: 62, lead: "Priya Venkat" },
    { d: "Compliance/GRC",open: 1,  crit: 0, mttd: "Audit 54d",load: 71, lead: "Elena Marsh" },
    { d: "IT Operations", open: 6,  crit: 0, mttd: "99.987%",  load: 78, lead: "Ricardo Bauer" },
  ];
  return (
    <table className="table">
      <thead><tr><th>Department</th><th>Lead</th><th>Open</th><th>Critical</th><th>Health metric</th><th>Load</th></tr></thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.d}>
            <td><span style={{ fontWeight: 500 }}>{r.d}</span></td>
            <td className="muted" style={{ fontSize: 12.5 }}>{r.lead}</td>
            <td className="num">{r.open}</td>
            <td className="num" style={{ color: r.crit ? "var(--bad)" : "var(--text-3)" }}>{r.crit || "—"}</td>
            <td className="mono muted" style={{ fontSize: 12 }}>{r.mttd}</td>
            <td>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 36px", gap: 8, alignItems:"center" }}>
                <MiniBar value={r.load} color={r.load > 85 ? "var(--warn)" : "var(--accent)"} />
                <span className="mono" style={{ fontSize: 11.5 }}>{r.load}%</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── SR DIRECTOR HOME (altitude 4) ─────────────────────────────
function SrDirectorHome({ role, openAltitude }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Cyber defense posture</h1>
          <div className="page-sub">Risk score 62 — down 6 quarter-over-quarter. Posture stable. One initiative behind (exec asset hardening, 2 weeks).</div>
        </div>
        <div className="page-actions">
          <button className="btn">Briefing pack</button>
          <button className="btn btn-primary" onClick={() => openAltitude("INC-9201")}>Altitude view</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Risk score" value="62" note="of 100 · ↓6 QoQ" tone="good" delta="down" />
        <KpiCard label="Loss vs budget" value="8%" note="$0.4M of $4.8M" tone="good" />
        <KpiCard label="Audit readiness" value="3 of 7" note="frameworks audit-ready" />
        <KpiCard label="Initiatives on-track" value="9 of 11" note="2 amber · 0 red" tone="good" />
      </div>

      <div className="row row-2" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-h"><h3>Risk register · top 5</h3><span className="h-sub">by realized × likelihood</span></div>
          <RiskRegister />
        </div>
        <div className="card">
          <div className="card-h"><h3>Peer benchmark</h3><span className="h-sub">vs anonymized fintech cohort (n=18)</span></div>
          <PeerBenchmark />
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3>Quarterly initiatives</h3></div>
        <table className="table">
          <thead><tr><th>Initiative</th><th>Owner</th><th>Status</th><th>Progress</th><th>Spend</th><th style={{textAlign:"right"}}>Risk impact</th></tr></thead>
          <tbody>
            {[
              ["EDR refresh — full fleet", "Sarah Chen", "on-track", 72, "$0.9M / $1.2M", "−4"],
              ["Detection-as-code rollout", "Priya V.", "on-track", 88, "—", "−3"],
              ["Exec asset hardening", "Sarah Chen", "amber", 41, "—", "−5 expected"],
              ["SWIFT 4-eyes attestation", "Elena M.", "on-track", 96, "audit-ready", "−2"],
              ["Cloud IAM least-privilege", "Devon K.", "on-track", 58, "—", "−6 expected"],
              ["Tabletop · ransomware", "Jordan T.", "done", 100, "—", "exercise"],
            ].map(([n,o,s,p,sp,ri]) => (
              <tr key={n}>
                <td style={{ fontWeight: 500 }}>{n}</td>
                <td className="muted" style={{ fontSize: 12.5 }}>{o}</td>
                <td><StatusChip status={s === "done" ? "Closed" : s === "amber" ? "Mitigating" : "Triage"} /></td>
                <td>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 36px", gap: 8, alignItems:"center" }}>
                    <MiniBar value={p} color={s==="amber"?"var(--warn)":"var(--accent)"} />
                    <span className="mono" style={{ fontSize: 11.5 }}>{p}%</span>
                  </div>
                </td>
                <td className="muted mono" style={{ fontSize: 12 }}>{sp}</td>
                <td className="num" style={{ textAlign:"right", color: "var(--good)" }}>{ri}</td>
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
    ["Domain admin privilege creep",       "high",   "C-119 failing"],
    ["Executive-asset PrintNightmare",     "high",   "3 incidents 90d"],
    ["CNP card-testing volume growth",     "medium", "F-088 noisy"],
    ["Cloud root account exposure",         "medium", "R-1842 noisy"],
    ["Vendor concentration · CDN",          "medium", "single provider"],
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
            background: t === "high" ? "var(--bad-bg)" : "var(--warn-bg)",
            color: t === "high" ? "var(--bad)" : "var(--warn)",
          }}>{t}</span>
        </div>
      ))}
    </div>
  );
}
function PeerBenchmark() {
  const rows = [
    ["MTTD Sev-1",         "5m 11s",  "p20", "good"],
    ["MTTR Sev-1",         "47m",      "p30", "good"],
    ["Detect coverage",    "78%",      "p25", "good"],
    ["False-positive",     "4.1%",     "p40", "good"],
    ["Realized loss YTD",  "$0.4M",    "p15", "good"],
    ["Headcount/$1B AUM",  "9.4",      "p65", "warn"],
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

// ─── CISO HOME (altitude 5) ────────────────────────────────────
function CISOHome({ role, openAltitude }) {
  const m = window.EXEC_METRICS;
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Risk posture · {role.label}</h1>
          <div className="page-sub">Active critical contained. $8.4M at risk, $0 realized. Controls held. Audit committee briefed Thursday.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Audit pack</button>
          <button className="btn btn-primary" onClick={() => openAltitude("INC-9201")}>Altitude view</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Realized loss YTD" value="$0.4M" note="8% of $4.8M budget" tone="good" />
        <KpiCard label="Risk score" value={m.riskScore} note={`↓${Math.abs(m.riskScoreDelta)} QoQ`} tone="good" delta="down" />
        <KpiCard label="Critical in flight" value={m.openCriticals} note={`${m.contained} contained · ${m.inFlight} open`} tone="warn" />
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
            One executive laptop compromised this morning via a 6-day-old PrintNightmare implant. Contained at 09:17 by token revocation + endpoint isolation. Zero customer or fund impact. Control <b>C-117</b> (PAM session monitoring) prevented scope expansion. <span className="muted">Non-reportable.</span>
          </div>
          <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: "var(--bg-sub)", fontSize: 12.5, lineHeight: 1.5 }}>
            <b style={{ display: "block", marginBottom: 4 }}>What I'm asking the org</b>
            EDR refresh ($1.2M, in-budget) — accelerate to Q3 close. Reduces our PrintNightmare-class exposure by ~70%.
          </div>
        </div>
      </div>

      <div className="row row-2">
        <div className="card">
          <div className="card-h"><h3>Control coverage by framework</h3></div>
          <FrameworkTable />
        </div>
        <div className="card">
          <div className="card-h"><h3>Loss-event budget</h3><span className="h-sub">YTD · vs board-approved envelope</span></div>
          <LossEventBudget />
        </div>
      </div>
    </>
  );
}

function BoardTalkingPoints() {
  const items = [
    { headline: "We held the line on losses.", body: "Realized loss is $0.4M YTD against a board-approved $4.8M envelope. The program is operating at 8% of envelope." },
    { headline: "Our most likely loss class is shifting.", body: "Card-not-present fraud volume is up 22% q/q industry-wide. F-088 velocity rule retuned; step-up auth deployed." },
    { headline: "One control failed; remediation owned.", body: "C-119 (privileged temp-access auto-expiry) failed in test. Engineering owns fix by Jun 4, before SOX audit." },
    { headline: "We need to fund the EDR refresh now.", body: "Three PrintNightmare-derived incidents in 90 days. EDR refresh ($1.2M, in budget) closes ~70% of that class." },
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

function LossEventBudget() {
  const used = 400, total = 4800;
  const pct = (used/total)*100;
  const bands = [["Q1", 0.0], ["Q2", 0.4], ["Q3", 0], ["Q4", 0]];
  return (
    <div>
      <div style={{ position:"relative", height: 26, background: "var(--bg-sub)", borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ position:"absolute", inset:"0 auto 0 0", width: `${pct}%`, background: "var(--good)", opacity: 0.85 }} />
        <div style={{ position:"absolute", right: 8, top: "50%", transform:"translateY(-50%)", fontSize: 11.5, color: "var(--text)", fontFamily: "var(--font-mono)" }}>
          $0.4M / $4.8M
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
        Envelope refreshes annually. Q2 charges driven by one phishing-related ACH event in Feb.
      </div>
    </div>
  );
}

// ─── CTO HOME (altitude 5) ─────────────────────────────────────
function CTOHome({ role, openAltitude }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Engineering & reliability · today</h1>
          <div className="page-sub">Platform 99.987% over 30 days. One security event today, isolated to one endpoint, zero infra impact. CDN absorbing edge DDoS.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Reliability report</button>
          <button className="btn btn-primary" onClick={() => openAltitude("INC-9201")}>Altitude view</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <KpiCard label="Platform availability · 30d" value="99.987%" note="SLO 99.95% · ✓" tone="good" />
        <KpiCard label="Error budget · month" value="68% left" note="11d remaining" tone="good" />
        <KpiCard label="P0/P1 incidents · 7d" value="2" note="both customer-facing avoided" />
        <KpiCard label="On-call load (eng)" value="3.1 / wk" note="pages per primary" />
      </div>

      <div className="row row-12" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-h"><h3>Subsystem health</h3></div>
          <SubsystemGrid />
        </div>
        <div className="card">
          <div className="card-h"><h3>Eng + security crosswalk</h3></div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-2)" }}>
            Three things this week from Lena's side land in eng:
          </div>
          <div style={{ marginTop: 10, display:"flex", flexDirection:"column", gap: 10 }}>
            {[
              ["EDR refresh — Q3 acceleration", "Need 12 eng-weeks for endpoint agent migration. Sched check w/ platform team."],
              ["PrintNightmare hardening", "Apply spooler restrictions to exec-class images. ~2 days work."],
              ["krbtgt double-reset SOP", "Runbook codification — IR-led but needs eng review on automation."],
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
          <div className="card-h"><h3>Edge & origin · 24h</h3></div>
          <EdgeChart />
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
function EdgeChart() {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>Edge ingress · Gbps</div>
      <Sparkline points={[12,11,13,14,15,18,38,84,82,80,79,75,72,68,64,58,52,44,38,32,26,22,18,16]} color="var(--info)" height={64} fill />
      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6, marginTop: 14 }}>Origin RPS</div>
      <Sparkline points={[2100,2050,1980,1920,2080,2150,2200,2050,1980,1920,2010,2100,2080,2050,2120,2080,2010,1950,1980,2010,2080,2100,2080,2050]} color="var(--good)" height={64} fill />
    </div>
  );
}
function VendorRisk() {
  return (
    <div>
      {[
        ["CDN · single provider", 92, "warn", "RFP in flight"],
        ["EDR · single provider", 78, "warn", "Refresh evaluating 2 vendors"],
        ["SWIFT · service bureau", 100, "ok", "Required by network"],
        ["SIEM · cloud vendor", 60, "ok", "Federated"],
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
function CEOHome({ role, openAltitude }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Today.</h1>
          <div className="page-sub">All systems operating. One critical security event, fully contained.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Last week's brief</button>
          <button className="btn btn-primary" onClick={() => openAltitude("INC-9201")}>See the event</button>
        </div>
      </div>

      <div className="card" style={{ padding: 40, marginBottom: 18, background: "var(--bg-elev)" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 40 }}>
          <CeoStat label="Customers affected today" value="0" sub="0 funds moved fraudulently" />
          <CeoStat label="Platform availability" value="99.987%" sub="30 days · target 99.95%" />
          <CeoStat label="Realized loss YTD" value="$0.4M" sub="of $4.8M envelope · 8%" />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-h"><h3>What you need to know</h3><span className="h-sub">in plain language</span></div>
        <div style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text)", maxWidth: 760 }}>
          An executive laptop was compromised this morning by an attacker who had been
          quietly installed for six days. <b>It is contained.</b> No data left the company.
          No customer was affected. No funds were moved.
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-2)", marginTop: 12, maxWidth: 760 }}>
          Lena will brief the audit committee on Thursday. Raj's team has no engineering
          action. We are not required to disclose.
        </div>
      </div>

      <div className="row row-2">
        <div className="card">
          <div className="card-h"><h3>This week's questions</h3></div>
          <ol style={{ paddingLeft: 18, fontSize: 14, lineHeight: 1.8, color: "var(--text-2)", margin: 0 }}>
            <li>Do we accelerate the EDR refresh by one quarter? Lena recommends yes.</li>
            <li>Are we ready for the SOX audit on July 15? One control needs remediation.</li>
            <li>Is our CDN single-vendor risk acceptable? RFP in flight.</li>
          </ol>
        </div>
        <div className="card">
          <div className="card-h"><h3>People to thank</h3></div>
          <div style={{ display:"flex", flexDirection:"column", gap: 10 }}>
            {[
              ["Maya Reyes", "T1 Analyst", "Caught the alert in 17 seconds and escalated correctly."],
              ["Devon Kim", "Sr T3 Analyst", "Confirmed the pattern and called IR before the attacker noticed."],
              ["Jordan Tan", "IR Lead", "Contained without service disruption."],
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
      <div style={{ fontSize: 52, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1, fontFeatureSettings: "'tnum'" }}>{value}</div>
      <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 8 }}>{sub}</div>
    </div>
  );
}

// ─── Shared KPI card ───────────────────────────────────────────
function KpiCard({ label, value, note, tone, delta }) {
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

function useGreeting(role) {
  const h = new Date().getHours();
  if (h < 5)  return "Late shift";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

Object.assign(window, { HomePage, AnalystHome, LeadHome, ManagerHome, DirectorHome, SrDirectorHome, CISOHome, CTOHome, CEOHome, KpiCard, SlaIcons });
