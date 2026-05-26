// Folio — SIGNATURE: Altitude View.
// One lease, every altitude. Side-by-side scroll through the org chart.

const { useMemo: aM } = React;

function AltitudePage({ incidentId, role, back, setRole }) {
  const inc = aM(() => window.INCIDENTS.find(i => i.id === incidentId), [incidentId]);
  const views = window.ALTITUDE_VIEWS[incidentId];
  if (!views || !inc) return <div className="muted">No altitude view for {incidentId}.</div>;

  const order = ["abstractor","sr_abstractor","pipeline_lead","ops_manager","dir_portfolio","vp_tenant","grc","coo","cdo","ceo"];
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
            The same lease, rendered at every altitude — from the abstractor reconciling clause 17.4 against three precedents to the CEO who's briefed at the audit committee Thursday.
          </div>
        </div>
        <div className="page-actions">
          <button className="btn">Export brief</button>
          <button className="btn btn-primary">Open lease detail</button>
        </div>
      </div>

      <AltitudeLedger inc={inc} />

      <div style={{ marginTop: 24, marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "-0.005em" }}>Up the chain</div>
        <div style={{ flex: 1, height: 1, background: "var(--border-2)" }} />
        <div className="muted" style={{ fontSize: 12 }}>Click a row to step into that role</div>
      </div>

      <div className="alt-stack">
        {orderedRoles.map((r) => {
          const view = views[r.id];
          if (!view) return null;
          const active = role.id === r.id;
          return <AltitudeRow key={r.id} role={r} view={view} active={active} setRole={setRole} />;
        })}
      </div>
    </>
  );
}

function AltitudeLedger({ inc }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap: 24 }}>
        <Fact label="Ingested" value="09:02:44 UTC" />
        <Fact label="Template matched" value="+1m 27s" />
        <Fact label="Extracted" value="+9m" />
        <Fact label="Template" value={inc.template} mono />
        <Fact label="ARR at stake" value="$48.2M" />
        <Fact label="Field accuracy" value="94%" tone="warn" />
      </div>
      <div style={{ height: 1, background: "var(--border-2)", margin: "20px 0" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        <div>
          <div style={{ fontSize: 11.5, color: "var(--text-3)", marginBottom: 6 }}>The facts</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            12-year master office lease with (2)×5-year options on <b>1245 Park Ave</b>,
            floors <span className="mono">17–22</span>, <span className="mono">287,400</span> RSF, NNN.
            187 pages + 23 exhibits. <b>4 of 73 fields</b> require human review.
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11.5, color: "var(--text-3)", marginBottom: 6 }}>How it was abstracted</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            Chunked by article (28 sections + 23 exhibits), embedded to <span className="mono">pgvector</span>,
            extracted with <span className="mono">OFFICE-NNN-2024</span> schema + 12-shot corpus.
            <span className="muted"> Template owner: Priya V.</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11.5, color: "var(--text-3)", marginBottom: 6 }}>Review chain</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            Mira (T1) <span className="muted">→</span> Diana (QA) <span className="muted">→</span> Jordan (Legal) <span className="muted">→</span> Priya (Templates) <span className="muted">→</span> Aisha (QA Lead) <span className="muted">→</span> Henry (Ops Mgr) <span className="muted">→</span> Lena (COO).
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
      <div className="serif" style={{ fontSize: 18, fontWeight: 500, marginTop: 4, fontFamily: mono ? "var(--font-mono)" : "var(--font-serif)", color: tone ? tones[tone] : "var(--text)" }}>{value}</div>
    </div>
  );
}

function AltitudeRow({ role, view, active, setRole }) {
  const altLabel = window.ALTITUDE_LABELS[role.altitude];
  return (
    <div className={"alt-row" + (active ? " active" : "")} onClick={() => setRole(role)} style={{ cursor: "pointer" }}>
      <div className="alt-rail">
        <div className="alt-tier-label">Alt {role.altitude} · {altLabel}</div>
        <div className="alt-role-name">{role.short}</div>
        <div className="alt-role-sub">{role.name}</div>
        <div className="alt-role-sub muted mono" style={{ marginTop: 6, fontSize: 11 }}>{view.title}</div>
        <div className="alt-bar" style={{ background: active ? "var(--accent)" : "var(--border-3)" }} />
      </div>
      <div className="alt-body">
        <h4 className="alt-headline" style={{ fontSize: role.altitude >= 5 ? 19 : role.altitude >= 3 ? 17 : 16, fontWeight: 500 }}>{view.headline}</h4>
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
              <div className="serif" style={{ fontSize: 28, fontWeight: 500, marginTop: 4, letterSpacing: "-0.015em" }}>{view.keyMetric.value}</div>
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
