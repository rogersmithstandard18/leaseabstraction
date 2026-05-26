// Stratum SecOps — SIGNATURE: Altitude View.
// One incident, every altitude. Side-by-side scroll through the org chart.

const { useState: aS, useMemo: aM } = React;

function AltitudePage({ incidentId, role, back, setRole }) {
  const inc = aM(() => window.INCIDENTS.find(i => i.id === incidentId), [incidentId]);
  const views = window.ALTITUDE_VIEWS[incidentId];
  if (!views || !inc) return <div className="muted">No altitude view for {incidentId}.</div>;

  const order = ["t1","sr_analyst","shift_lead","soc_manager","dir_secops","sr_dir","ciso","cto","ceo"];
  const orderedRoles = order.map(id => window.ROLES.find(r => r.id === id)).filter(Boolean);

  return (
    <>
      <div className="page-header" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <button className="btn btn-sm btn-ghost" style={{ marginBottom: 10, padding: "0 6px 0 0" }} onClick={back}>← Back</button>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
            <span className="chip" style={{ background: "var(--accent)", color: "var(--bg-elev)", fontWeight: 500 }}>Altitude view</span>
            <KindGlyph kind={inc.kind} size={22} />
            <SevChip sev={inc.severity} />
            <span className="mono muted" style={{ fontSize: 12 }}>{inc.id}</span>
          </div>
          <h1 className="page-title">{inc.title}</h1>
          <div className="page-sub">
            The same incident rendered at every altitude — from the analyst who acknowledged at 09:03:01 to the CEO who's briefed at the audit committee Thursday.
          </div>
        </div>
        <div className="page-actions">
          <button className="btn">Export brief</button>
          <button className="btn btn-primary">Open incident</button>
        </div>
      </div>

      <AltitudeLedger inc={inc} />

      <div style={{ marginTop: 24, marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "-0.005em" }}>Up the chain</div>
        <div style={{ flex: 1, height: 1, background: "var(--border-2)" }} />
        <div className="muted" style={{ fontSize: 12 }}>Click a row to step into that role</div>
      </div>

      <div className="alt-stack">
        {orderedRoles.map((r, i) => {
          const view = views[r.id];
          if (!view) return null;
          const active = role.id === r.id;
          return <AltitudeRow key={r.id} role={r} view={view} active={active} setRole={setRole} index={i} total={orderedRoles.length} />;
        })}
      </div>
    </>
  );
}

function AltitudeLedger({ inc }) {
  // The "facts" of the incident, presented once, factually — then each altitude reads them differently.
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap: 24 }}>
        <Fact label="Detected" value="09:02:44 UTC" />
        <Fact label="Acknowledged" value="+17s" />
        <Fact label="Contained" value="+14m 38s" />
        <Fact label="MITRE" value={inc.mitre} mono />
        <Fact label="Realized loss" value="$0" tone="good" />
        <Fact label="Customers" value="0 affected" tone="good" />
      </div>
      <div style={{ height: 1, background: "var(--border-2)", margin: "20px 0" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        <div>
          <div style={{ fontSize: 11.5, color: "var(--text-3)", marginBottom: 6 }}>The facts</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            Encoded PowerShell loader with 47±12s jitter beaconing to <span className="mono">94.130.88.12</span>.
            PrintNightmare DLL hijack staged six days ago via <span className="mono">spoolsv.exe</span>.
            Target: <b>EXEC-LAPTOP-07</b> · principal <span className="mono">ceo_assistant</span>.
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11.5, color: "var(--text-3)", marginBottom: 6 }}>How it was caught</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            Detection rule <span className="mono">R-2103</span> (encoded PS C2 beacon, behavioural).
            Fired on Sysmon EventID 3 with jitter signature. <span className="muted">DetEng owner: Priya V.</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11.5, color: "var(--text-3)", marginBottom: 6 }}>Response chain</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            Maya (T1) <span className="muted">→</span> Devon (Sr T3) <span className="muted">→</span> Jordan (IR Lead) <span className="muted">→</span> Ricardo (IT Ops, edge block) <span className="muted">→</span> Aisha (Shift Lead) <span className="muted">→</span> Henry (SOC Mgr) <span className="muted">→</span> Lena (CISO).
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value, mono, tone }) {
  const tones = { good: "var(--good)", warn: "var(--warn)", bad: "var(--bad)" };
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4, fontFamily: mono ? "var(--font-mono)" : "inherit", color: tone ? tones[tone] : "var(--text)" }}>{value}</div>
    </div>
  );
}

function AltitudeRow({ role, view, active, setRole, index, total }) {
  const altLabel = window.ALTITUDE_LABELS[role.altitude];
  // Visual cue: as altitude increases, type gets a bit larger / more spacious
  const fontWeight = role.altitude >= 5 ? 500 : 400;
  return (
    <div className={"alt-row" + (active ? " active" : "")} onClick={() => setRole(role)} style={{ cursor: "pointer" }}>
      <div className="alt-rail">
        <div className="alt-tier-label">Alt {role.altitude} · {altLabel}</div>
        <div className="alt-role-name">{role.short}</div>
        <div className="alt-role-sub">{role.name}</div>
        <div className="alt-role-sub muted" style={{ marginTop: 6, fontSize: 11, fontFamily: "var(--font-mono)" }}>{view.title}</div>
        <div className="alt-bar" style={{ background: active ? "var(--accent)" : "var(--border-3)" }} />
      </div>
      <div className="alt-body">
        <h4 className="alt-headline" style={{ fontSize: role.altitude >= 5 ? 17 : role.altitude >= 3 ? 16 : 15, fontWeight: role.altitude >= 5 ? 600 : 500 }}>{view.headline}</h4>
        <div className="alt-framing">{view.framing}</div>

        <div className="alt-grid">
          <div>
            <div className="alt-callout">{view.callout}</div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>What they'll decide</div>
              <div className="alt-decisions">
                {view.decisions.map((d, i) => (
                  <div key={i} className="alt-decision">{d}</div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div style={{ padding: 16, borderRadius: 10, background: "var(--bg-sub)" }}>
              <div style={{ fontSize: 11, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{view.keyMetric.label}</div>
              <div className="mono" style={{ fontSize: 28, fontWeight: 500, marginTop: 4, letterSpacing: "-0.01em" }}>{view.keyMetric.value}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{view.keyMetric.note}</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--text-3)", lineHeight: 1.5 }}>
              <span style={{ fontWeight: 500, color: "var(--text-2)" }}>Lens:</span> {view.lens}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AltitudePage });
