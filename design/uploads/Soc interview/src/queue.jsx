// Stratum SecOps — Incident Queue + single incident detail.

const { useState: qS, useMemo: qM } = React;

function QueuePage({ role, openIncident, openAltitude }) {
  const [filterSev, setFilterSev] = qS("all");
  const [filterKind, setFilterKind] = qS("all");
  const [filterDept, setFilterDept] = qS("all");
  const [search, setSearch] = qS("");

  const filtered = qM(() => {
    return window.INCIDENTS.filter(i => {
      if (filterSev !== "all" && i.severity !== filterSev) return false;
      if (filterKind !== "all" && i.kind !== filterKind) return false;
      if (filterDept !== "all" && i.dept !== filterDept) return false;
      if (search && !(`${i.id} ${i.title} ${i.asset}`.toLowerCase()).includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filterSev, filterKind, filterDept, search]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Incident queue</h1>
          <div className="page-sub">All open and recently closed incidents across SOC, IR, and IT Ops. Filter to your scope.</div>
        </div>
        <div className="page-actions">
          <button className="btn">Export CSV</button>
          <button className="btn btn-primary">+ New incident</button>
        </div>
      </div>

      <div className="card" style={{ padding: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search ID, host, title…"
            style={{ flex: "0 1 280px", padding: "7px 10px", border: "1px solid var(--border-2)", borderRadius: 7, background: "var(--bg-sub)", color: "var(--text)", fontFamily: "inherit", fontSize: 13 }}
          />
          <SegPicker value={filterSev} onChange={setFilterSev} options={[
            ["all","All severities"],["Critical","Critical"],["High","High"],["Medium","Medium"],["Low","Low"]
          ]} />
          <SegPicker value={filterDept} onChange={setFilterDept} options={[
            ["all","All depts"],["soc","SOC"],["ir","IR"],["itops","IT Ops"]
          ]} />
          <div style={{ flex: 1 }} />
          <span className="muted" style={{ fontSize: 12.5 }}>{filtered.length} of {window.INCIDENTS.length}</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {[["all","All categories"], ...Object.entries(window.KIND_META).map(([k, m]) => [k, m.label])].map(([k, label]) => (
            <button key={k}
              onClick={() => setFilterKind(k)}
              className={"chip"}
              style={{
                cursor: "pointer", border: "1px solid " + (filterKind === k ? "var(--accent)" : "transparent"),
                background: filterKind === k ? "var(--accent)" : "var(--bg-sub)",
                color: filterKind === k ? "var(--bg-elev)" : "var(--text-2)",
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 36, paddingLeft: 16 }}></th>
              <th>Incident</th>
              <th>Asset · Assignee</th>
              <th>Category</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Age</th>
              <th style={{ textAlign: "right" }}>$ at risk</th>
              <th style={{ textAlign: "right", paddingRight: 16 }}>SLA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} onClick={() => openIncident(i)}>
                <td style={{ paddingLeft: 16 }}><KindGlyph kind={i.kind} size={22} /></td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SevChip sev={i.severity} />
                    <span style={{ fontWeight: 500 }}>{i.title}</span>
                  </div>
                  <div className="muted mono" style={{ fontSize: 11.5, marginTop: 2 }}>{i.id} · {i.mitre}</div>
                </td>
                <td>
                  <div style={{ fontSize: 12.5 }}>{i.asset}</div>
                  <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{i.assignee}</div>
                </td>
                <td className="muted" style={{ fontSize: 12.5 }}>{window.KIND_META[i.kind]?.label}</td>
                <td><StatusChip status={i.status} /></td>
                <td className="num muted" style={{ textAlign: "right" }}><TimeAgo minutes={i.ageMin} /></td>
                <td className="num" style={{ textAlign: "right", fontWeight: 500 }}><Dollars amount={i.dollarsAtRisk} /></td>
                <td style={{ textAlign: "right", paddingRight: 16 }}><SlaIcons sla={i.sla} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SegPicker({ value, onChange, options }) {
  return (
    <div style={{ display: "inline-flex", background: "var(--bg-sub)", borderRadius: 7, border: "1px solid var(--border-2)", padding: 2 }}>
      {options.map(([k, label]) => (
        <button key={k} onClick={() => onChange(k)}
          style={{
            background: value === k ? "var(--bg-elev)" : "transparent",
            color: value === k ? "var(--text)" : "var(--text-3)",
            border: 0, padding: "4px 10px", fontSize: 12, fontWeight: value === k ? 500 : 400,
            borderRadius: 5, cursor: "pointer", boxShadow: value === k ? "var(--shadow-sm)" : "none", fontFamily: "inherit"
          }}>{label}</button>
      ))}
    </div>
  );
}

// ─── Single incident detail ───────────────────────────────────
function IncidentPage({ incident, role, back, openAltitude }) {
  const [tab, setTab] = qS("overview");
  if (!incident) return null;

  return (
    <>
      <div className="page-header" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <button className="btn btn-sm btn-ghost" style={{ marginBottom: 10, padding: "0 6px 0 0" }} onClick={back}>← Queue</button>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <KindGlyph kind={incident.kind} size={28} />
            <SevChip sev={incident.severity} />
            <StatusChip status={incident.status} />
            <span className="mono muted" style={{ fontSize: 12 }}>{incident.id}</span>
          </div>
          <h1 className="page-title" style={{ marginTop: 8 }}>{incident.title}</h1>
          <div className="page-sub">{incident.summary}</div>
        </div>
        <div className="page-actions">
          <button className="btn">Hand off</button>
          <button className="btn">Acquire memory</button>
          <button className="btn btn-primary" onClick={() => openAltitude(incident.id)}>Altitude view</button>
        </div>
      </div>

      <div className="row row-4" style={{ marginBottom: 14 }}>
        <MiniMetric label="MITRE" value={incident.mitre} mono />
        <MiniMetric label="Source" value={incident.source} />
        <MiniMetric label="Confidence" value={incident.confidence + "%"} mono tone={incident.confidence > 90 ? "good" : "warn"} />
        <MiniMetric label="$ at risk" value={incident.dollarsAtRisk ? "$" + (incident.dollarsAtRisk / 1_000_000).toFixed(1) + "M" : "—"} mono />
      </div>

      <div className="row row-12" style={{ marginBottom: 14 }}>
        <div className="card">
          <div style={{ display: "flex", gap: 4, marginBottom: 14, borderBottom: "1px solid var(--border-2)" }}>
            {[
              ["overview", "Overview"],
              ["evidence", "Evidence"],
              ["playbook", "Playbook"],
              ["timeline", "Timeline"],
              ["blast", "Blast radius"],
            ].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                style={{
                  padding: "8px 14px", background: "transparent", border: 0,
                  fontSize: 13, color: tab === k ? "var(--text)" : "var(--text-3)",
                  fontWeight: tab === k ? 500 : 400, borderBottom: tab === k ? "2px solid var(--text)" : "2px solid transparent",
                  marginBottom: "-1px", cursor: "pointer", fontFamily: "inherit"
                }}>{l}</button>
            ))}
          </div>
          {tab === "overview" && <IncidentOverview incident={incident} />}
          {tab === "evidence" && <IncidentEvidence incident={incident} />}
          {tab === "playbook" && <IncidentPlaybook incident={incident} />}
          {tab === "timeline" && <IncidentTimeline incident={incident} />}
          {tab === "blast" && <IncidentBlast incident={incident} />}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-h"><h3>Owner</h3></div>
            <div style={{ display:"flex", gap: 10, alignItems:"center" }}>
              <div className="sb-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{incident.assignee.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase()}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{incident.assignee}</div>
                <div className="muted" style={{ fontSize: 12 }}>{incident.asset}</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-h"><h3>Context</h3></div>
            <div style={{ display:"flex", flexDirection:"column", gap: 6, fontSize: 12.5 }}>
              {incident.fintechTags?.map(t => (
                <div key={t} style={{ display:"flex", gap: 6 }}>
                  <span style={{ color: "var(--text-4)" }}>·</span>
                  <span>{t}</span>
                </div>
              ))}
              {incident.cve && (
                <div style={{ marginTop: 6, padding: "6px 8px", background: "var(--warn-bg)", borderRadius: 6, color: "var(--warn)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  {incident.cve}
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-h"><h3>SLA</h3></div>
            <div style={{ display:"flex", flexDirection:"column", gap: 6 }}>
              {[["Ack ≤5m", incident.sla.ack],["Contain ≤30m", incident.sla.contain],["Resolve ≤4h", incident.sla.resolve]].map(([l, s]) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize: 12.5 }}>
                  <span>{l}</span>
                  <span style={{ color: s === "ok" ? "var(--good)" : s === "at-risk" ? "var(--warn)" : "var(--bad)", fontWeight: 500 }}>
                    {s === "ok" ? "On track" : s === "at-risk" ? "At risk" : "Breach"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-h"><h3>Linked rule</h3></div>
            <div style={{ fontSize: 12.5 }}>
              {window.DETECTIONS.find(d => incident.id === "INC-9201" ? d.id === "R-2103" : d.id === "F-104")?.id || "R-2103"} ·
              <span className="muted"> Detection Engineering</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MiniMetric({ label, value, tone, mono }) {
  const tones = { good: "var(--good)", warn: "var(--warn)", bad: "var(--bad)" };
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4, fontFamily: mono ? "var(--font-mono)" : "inherit", color: tone ? tones[tone] : "var(--text)" }}>{value}</div>
    </div>
  );
}

function IncidentOverview({ incident }) {
  return (
    <div>
      <Section title="What happened">
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>{incident.summary}</div>
      </Section>
      <div style={{ height: 16 }} />
      <Section title="Indicators of compromise">
        <div className="evidence">
{`94.130.88.12       — C2 destination (jitter 47±12s)
EXEC-LAPTOP-07     — host (executive)
ceo_assistant      — compromised principal
\\\\10.0.9.44\\share\\PrintConfig.dll — malicious DLL staged
PrintConfig.dll    — loaded by spoolsv.exe (PrintNightmare)
SHA256: e3b0c4...   — PowerShell loader payload`}
        </div>
      </Section>
      <div style={{ height: 16 }} />
      <Section title="Recommended next step">
        <div style={{ padding: 12, borderRadius: 8, background: "var(--bg-sub)", fontSize: 13.5, lineHeight: 1.55 }}>
          Confirm token revocation propagated to all SSO sessions. Pivot threat intel on 94.130.88.12 across the fleet.
        </div>
      </Section>
    </div>
  );
}

function IncidentEvidence({ incident }) {
  return (
    <div>
      <Section title="SIEM alert raw">
        <div className="evidence">
{`2026-05-22 09:02:44 EventID=4104 host=EXEC-LAPTOP-07 ScriptBlockText="powershell.exe -enc SQBFAFgA..."
2026-05-22 09:02:51 Sysmon EventID=3 process=powershell.exe dst_ip=94.130.88.12 dst_port=443
2026-05-22 09:03:24 Sysmon EventID=3 beacon_interval=47s jitter=12s dst_ip=94.130.88.12
2026-05-22 09:03:38 Sysmon EventID=3 dst_ip=94.130.88.12 ESTABLISHED interval=47s`}
        </div>
      </Section>
      <div style={{ height: 16 }} />
      <Section title="Process tree" sub="spoolsv.exe → PowerShell — PrintNightmare DLL hijack chain">
        <div className="evidence">
{`spoolsv.exe (SYSTEM)
└── rundll32.exe PrintConfig.dll   ← loaded from \\\\10.0.9.44\\share\\
    └── powershell.exe -enc SQBFAFgA...
        ├── net.exe user /domain
        └── beacon → 94.130.88.12:443 (47s ± 12s)`}
        </div>
      </Section>
      <div style={{ height: 16 }} />
      <Section title="Network flows · last hour">
        <div className="evidence">
{`09:02:51  EXEC-LAPTOP-07:49xxx → 94.130.88.12:443  ESTABLISHED
09:03:38  EXEC-LAPTOP-07:49xxx → 94.130.88.12:443  ESTABLISHED   interval=47s
09:04:25  EXEC-LAPTOP-07:49xxx → 94.130.88.12:443  ESTABLISHED   interval=47s
09:05:12  EXEC-LAPTOP-07:49xxx → 94.130.88.12:443  ESTABLISHED   interval=47s
09:17:22  *** firewall block applied → 94.130.88.12 ***`}
        </div>
      </Section>
    </div>
  );
}

function IncidentPlaybook({ incident }) {
  const steps = [
    { done: true,  t: "Acknowledge alert and start timer",       owner: "Maya R.", when: "09:03:01" },
    { done: true,  t: "Pull SOP for encoded PS C2",              owner: "Maya R.", when: "09:03:15" },
    { done: true,  t: "Decode payload in sandbox; confirm jitter",owner: "Devon K.",when: "09:06:18" },
    { done: true,  t: "Escalate to IR Lead — exec asset criteria",owner: "Devon K.",when: "09:08:42" },
    { done: true,  t: "Acquire memory before any host change",   owner: "Jordan T.",when: "09:11:40" },
    { done: true,  t: "Revoke SSO tokens for ceo_assistant",     owner: "Jordan T.",when: "09:14:09" },
    { done: true,  t: "Firewall block 94.130.88.12 at edge",     owner: "Ricardo B.",when: "09:17:22" },
    { done: false, t: "Reimage endpoint; rotate cached creds",   owner: "Jordan T.",when: "queued" },
    { done: false, t: "Pivot IOC across fleet (SHA / IP)",       owner: "Devon K.",when: "queued" },
    { done: false, t: "Tabletop addition + DetEng R-2103 rebuild",owner: "Priya V.", when: "scheduled Wed" },
  ];
  return (
    <div>
      <Section title="PrintNightmare C2 response — SOP">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr auto", gap: 10, padding: "10px 0", borderBottom: i === steps.length - 1 ? 0 : "1px solid var(--border-2)" }}>
              <span style={{
                display: "grid", placeItems: "center",
                width: 18, height: 18, borderRadius: 5,
                background: s.done ? "var(--good)" : "var(--bg-sub)",
                border: s.done ? 0 : "1px solid var(--border-3)",
                color: "white", fontSize: 11, marginTop: 1
              }}>{s.done ? "✓" : ""}</span>
              <div>
                <div style={{ fontSize: 13.5, color: s.done ? "var(--text-2)" : "var(--text)", textDecoration: s.done ? "line-through" : "none", textDecorationColor: "var(--text-4)" }}>{s.t}</div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{s.owner}</div>
              </div>
              <div className="muted mono" style={{ fontSize: 11.5 }}>{s.when}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function IncidentTimeline({ incident }) {
  const tl = incident.timeline || [
    { t: "—", who: "—", what: "(no events recorded yet)" },
  ];
  return (
    <div>
      {tl.map((row, i) => (
        <div key={i} className="timeline-row">
          <div className="timeline-t">{row.t}</div>
          <div className="timeline-w"><span className="who">{row.who}</span>{row.what}</div>
        </div>
      ))}
    </div>
  );
}

function IncidentBlast({ incident }) {
  const b = incident.blastRadius || { hosts: 0, accounts: 0, services: 0, customers: 0 };
  return (
    <div>
      <Section title="Confirmed scope">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[["Hosts", b.hosts],["Accounts", b.accounts],["Services", b.services],["Customers", b.customers]].map(([k,v]) => (
            <div key={k} style={{ padding: 14, borderRadius: 8, background: "var(--bg-sub)" }}>
              <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{k}</div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 500, marginTop: 4 }}>{v.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </Section>
      <div style={{ height: 16 }} />
      <Section title="Dollar exposure" sub="actual loss · zero so far">
        <div style={{ padding: 18, borderRadius: 8, background: "var(--bg-sub)" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "baseline" }}>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>Realized loss</div>
              <div className="mono" style={{ fontSize: 28, fontWeight: 500, color: "var(--good)" }}>$0</div>
            </div>
            <div style={{ width: 1, alignSelf: "stretch", background: "var(--border-2)" }} />
            <div>
              <div className="muted" style={{ fontSize: 12 }}>At risk</div>
              <div className="mono" style={{ fontSize: 28, fontWeight: 500 }}>{(incident.dollarsAtRisk/1_000_000).toFixed(1)}M</div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

Object.assign(window, { QueuePage, IncidentPage, SegPicker });
