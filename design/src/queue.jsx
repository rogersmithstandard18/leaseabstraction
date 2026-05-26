// Folio — Abstraction queue + lease detail view.
// The lease detail is the page where chunking + schema-guided extraction is visible.

const { useState: qS, useMemo: qM } = React;

function QueuePage({ role, openIncident, openAltitude }) {
  const [filter, setFilter] = qS("all");
  const [search, setSearch] = qS("");

  const rows = qM(() => {
    return window.INCIDENTS.filter(i => {
      if (filter === "critical" && i.severity !== "Critical") return false;
      if (filter === "open" && i.status === "Abstracted")     return false;
      if (filter === "mine") {
        const first = role.name.split(" ")[0].toLowerCase();
        if (!i.assignee.toLowerCase().includes(first)) return false;
      }
      if (search && !(`${i.title} ${i.id} ${i.asset} ${i.template}`.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [filter, search, role.id]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Abstraction queue</h1>
          <div className="page-sub">
            {window.INCIDENTS.filter(i => i.status !== "Abstracted").length} open · 3 critical · 1 estoppel batch tied to Thursday refi close.
          </div>
        </div>
        <div className="page-actions">
          <button className="btn">Export</button>
          <button className="btn btn-primary">+ Upload lease</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border-2)" }}>
          {[
            ["all", "All", window.INCIDENTS.length],
            ["open", "Open", window.INCIDENTS.filter(i => i.status !== "Abstracted").length],
            ["critical", "Critical", window.INCIDENTS.filter(i => i.severity === "Critical").length],
            ["mine", "Mine", window.INCIDENTS.filter(i => i.assignee.toLowerCase().includes(role.name.split(" ")[0].toLowerCase())).length],
          ].map(([k, l, n]) => (
            <button key={k} className={"btn btn-sm" + (filter === k ? "" : " btn-ghost")} onClick={() => setFilter(k)} style={filter === k ? { background: "var(--accent-soft)", borderColor: "var(--border-3)", color: "var(--text)" } : null}>
              {l} <span className="muted mono" style={{ marginLeft: 4 }}>{n}</span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by lease id, tenant, address, template…"
            style={{
              padding: "5px 10px", fontSize: 12.5,
              background: "var(--bg-sub)", border: "1px solid var(--border-2)",
              borderRadius: 7, minWidth: 280, color: "var(--text)", fontFamily: "inherit"
            }}
          />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>Lease</th>
              <th>Tenant / asset</th>
              <th>Stage</th>
              <th>Template</th>
              <th style={{ textAlign: "right" }}>Conf.</th>
              <th style={{ textAlign: "right" }}>Age</th>
              <th style={{ textAlign: "right" }}>ARR</th>
              <th style={{ textAlign: "right" }}>SLA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(i => (
              <tr key={i.id} onClick={() => openIncident(i)}>
                <td><KindGlyph kind={i.kind} /></td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SevChip sev={i.severity} />
                    <span style={{ fontWeight: 500 }}>{i.title}</span>
                  </div>
                  <div className="muted mono" style={{ fontSize: 11, marginTop: 2 }}>{i.id} · {i.assignee}</div>
                </td>
                <td className="muted" style={{ fontSize: 12.5 }}>{i.asset}</td>
                <td><StatusChip status={i.status} /></td>
                <td className="mono" style={{ fontSize: 12 }}>{i.template}</td>
                <td className="num" style={{ textAlign: "right", color: i.confidence < 80 ? "var(--warn)" : "var(--text)" }}>{i.confidence}%</td>
                <td className="num muted" style={{ textAlign: "right" }}><TimeAgo minutes={i.ageMin} /></td>
                <td className="num" style={{ textAlign: "right", fontWeight: 500 }}><Dollars amount={i.dollarsAtRisk} /></td>
                <td style={{ textAlign: "right" }}><SlaIcons sla={i.sla} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Lease detail page ─────────────────────────────────────────
function IncidentPage({ incident: inc, role, back, openAltitude }) {
  const [tab, setTab] = qS("clauses");

  return (
    <>
      <div className="page-header" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <button className="btn btn-sm btn-ghost" style={{ marginBottom: 10, padding: "0 6px 0 0" }} onClick={back}>← Back to queue</button>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
            <KindGlyph kind={inc.kind} size={22} />
            <SevChip sev={inc.severity} />
            <StatusChip status={inc.status} />
            <span className="mono muted" style={{ fontSize: 12 }}>{inc.id}</span>
            <span className="muted" style={{ fontSize: 12 }}>· template <span className="mono">{inc.template}</span></span>
          </div>
          <h1 className="page-title">{inc.title}</h1>
          <div className="page-sub">{inc.summary}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ConfidenceRing value={inc.confidence} size={52} />
          <div className="page-actions">
            <button className="btn">Open document</button>
            <button className="btn btn-primary" onClick={() => openAltitude(inc.id)}>Altitude view →</button>
          </div>
        </div>
      </div>

      {/* Pipeline ribbon — visible across all tabs */}
      <div className="pipeline" style={{ marginBottom: 18 }}>
        {[
          ["Ingest",   "187 pp", "OCR · 98.4%", "active"],
          ["Chunk",    "1,242",  "article-aware · v3.0", "active"],
          ["Embed",    "1,242",  "→ pgvector",            "active"],
          ["Extract",  "73 fields", "OFFICE-NNN-2024 · 12-shot", "active"],
          ["Validate", "4 flags", "§17.4 §22 §31 Ex-D",  "flag"],
        ].map(([n, big, sub, st]) => (
          <div key={n} className={"pipe-stage" + (st === "active" ? " active" : st === "flag" ? " flag" : "")}>
            <div className="pipe-stage-name">{n}</div>
            <div className="pipe-stage-val">{big}</div>
            <div className="pipe-stage-note">{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border-2)", marginBottom: 16 }}>
        {[
          ["clauses",  "Clauses & extraction"],
          ["schema",   "Schema (JSON)"],
          ["timeline", "Pipeline timeline"],
          ["audit",    "Audit & provenance"],
        ].map(([k, l]) => (
          <button key={k}
            className="btn btn-ghost btn-sm"
            onClick={() => setTab(k)}
            style={{
              borderRadius: 0,
              borderBottom: "2px solid " + (tab === k ? "var(--accent)" : "transparent"),
              color: tab === k ? "var(--text)" : "var(--text-3)",
              fontWeight: tab === k ? 500 : 400,
              padding: "0 12px 8px",
              height: "auto",
            }}
          >{l}</button>
        ))}
      </div>

      {tab === "clauses"  && <ClausesView inc={inc} />}
      {tab === "schema"   && <SchemaView inc={inc} />}
      {tab === "timeline" && <TimelineView inc={inc} />}
      {tab === "audit"    && <AuditView inc={inc} />}
    </>
  );
}

function ClausesView({ inc }) {
  return (
    <div className="row row-21">
      <div>
        <div className="card" style={{ padding: 0, marginBottom: 14 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>Flagged clauses · 4 of 73 fields</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Each carries the source chunk + the few-shot precedents that informed the extraction.</div>
              </div>
              <div className="muted mono" style={{ fontSize: 11 }}>OFFICE-NNN-2024 · 12-shot</div>
            </div>
          </div>
          <ClauseCard
            section="§17.4 — Rent Escalation"
            fieldName="rent_escalation"
            confidence={71}
            chunk={`17.4 Annual Adjustment. Commencing on the first anniversary of the Rent Commencement Date and on each anniversary thereafter, the Annual Base Rent shall be adjusted by an amount equal to the greater of (i) three percent (3%), or (ii) the percentage increase in the Consumer Price Index ("CPI") for All Urban Consumers, U.S. City Average, All Items, as published by the United States Bureau of Labor Statistics, measured against the Index in effect on the Rent Commencement Date; provided, however, that in no event shall the annual adjustment exceed six percent (6%) ("CPI-Floor Escalator").`}
            highlights={["greater of", "three percent (3%)", "Consumer Price Index", "exceed six percent (6%)"]}
            precedents={[
              ["Acme 2017 master", "0.07 cosine", "CPI-floor 3%, no ceiling"],
              ["Sunfield 2019",    "0.11 cosine", "CPI-floor 3.5%, ceiling 7%"],
              ["Beacon 2021",      "0.13 cosine", "CPI-floor 2.5%, ceiling 6%"],
            ]}
            extracted={{
              method: "greater_of",
              floor_pct: 3.0,
              ceiling_pct: 6.0,
              index: "CPI-U US City Avg",
              base_year_method: "rent_commencement"
            }}
          />
          <ClauseCard
            section="§22 — Subordination, Non-Disturbance & Attornment"
            fieldName="snda"
            confidence={61}
            chunk={`22.1 Subordination. This Lease shall be subordinate to any present or future mortgage on the Premises, provided that the holder of such mortgage shall execute and deliver to Tenant a Subordination, Non-Disturbance and Attornment Agreement on a form reasonably acceptable to Tenant ("SNDA") which shall, at a minimum, confirm Tenant's right to occupy the Premises pursuant to this Lease so long as Tenant is not in default beyond applicable cure periods.`}
            highlights={["reasonably acceptable to Tenant", "not in default beyond applicable cure periods"]}
            precedents={[
              ["Acme 2017",        "0.09 cosine", "Tenant-friendly form required"],
              ["Bedford SNDA",     "0.18 cosine", "Lender form, 3 carve-outs"],
            ]}
            extracted={{
              required: true,
              form_control: "tenant_reasonable",
              cure_period_days: 30,
              attornment: true
            }}
          />
        </div>
      </div>

      <div>
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-h"><h3>Field confidence</h3><span className="h-sub">73 fields</span></div>
          <FieldConfidence />
        </div>
        <div className="card">
          <div className="card-h"><h3>Tenant context</h3></div>
          <table className="table">
            <tbody>
              {[
                ["Tenant",         "Acme Corporation"],
                ["Tenant tier",    "Top-5 · #4"],
                ["Total ARR",      "$312M across 9 leases"],
                ["Largest lease",  "1245 Park Ave (this)"],
                ["Industry",       "Asset management"],
                ["Owner",          "S. Chen (Director)"],
                ["Renewal cycle",  "Opens Nov 2027"],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td className="muted" style={{ fontSize: 12.5, width: 110 }}>{k}</td>
                  <td style={{ fontSize: 13, fontWeight: 500 }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ClauseCard({ section, fieldName, confidence, chunk, highlights, precedents, extracted }) {
  // Apply <span class="hi"> around highlight phrases
  const highlighted = qM(() => {
    let html = chunk;
    highlights.forEach(h => {
      html = html.split(h).join(`<span class="hi">${h}</span>`);
    });
    return html;
  }, [chunk, highlights]);

  return (
    <div style={{ padding: 18, borderBottom: "1px solid var(--border-2)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{section}</div>
          <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>field <b>{fieldName}</b> · {confidence}% confidence · flagged for review</div>
        </div>
        <ConfidenceRing value={confidence} />
      </div>

      <div className="doc-strip" dangerouslySetInnerHTML={{ __html: highlighted }}>
      </div>
      <div className="doc-strip" style={{ display: "none" }}></div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Few-shot precedents loaded</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {precedents.map(([t, d, n]) => (
              <div key={t} style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: 8, padding: "6px 10px", background: "var(--bg-sub)", borderRadius: 6, fontSize: 12.5 }}>
                <span style={{ fontWeight: 500 }}>{t}</span>
                <span className="mono" style={{ color: "var(--text-3)" }}>{d}</span>
                <span className="muted">{n}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Extracted value</div>
          <div className="schema">
{`{
  `}{Object.entries(extracted).map(([k, v], i) => (
            <span key={k}>
              <span className="k">"{k}"</span>: {typeof v === "number"
                ? <span className="n">{v}</span>
                : typeof v === "boolean"
                  ? <span className="b">{String(v)}</span>
                  : <span className="s">"{v}"</span>}
              {i < Object.keys(extracted).length - 1 ? "," : ""}{"\n  "}
            </span>
          ))}{`
}`}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
            <button className="btn btn-sm">Accept</button>
            <button className="btn btn-sm">Override</button>
            <button className="btn btn-sm btn-ghost">Re-prompt</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldConfidence() {
  // 73 fields. Render a sparkbar showing distribution by confidence band.
  const fields = [
    ["Premises & use",          12, [98,99,99,97,99,98,99,98,99,99,98,99]],
    ["Term & commencement",     8,  [99,99,99,99,99,99,99,99]],
    ["Base rent + escalation",  6,  [99,99,71,98,99,97]],
    ["Operating exp / CAM",     9,  [94,92,96,93,91,94,93,95,92]],
    ["Renewal options",         5,  [98,97,99,98,96]],
    ["Assignment & sublease",   4,  [89,87,91,92]],
    ["Default / remedies",      6,  [91,89,87,90,92,88]],
    ["Insurance / indemnity",   7,  [93,94,91,92,93,95,90]],
    ["Surrender / holdover",    4,  [86,84,88,87]],
    ["Special rights (ROFR)",   3,  [82,79,84]],
    ["SNDA / estoppel",         3,  [61,84,88]],
    ["Exhibits",                6,  [93,84,91,89,92,87]],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {fields.map(([name, n, vals]) => {
        const minV = Math.min(...vals);
        const avg  = vals.reduce((a,b) => a+b, 0) / vals.length;
        const tone = minV < 75 ? "var(--bad)" : minV < 85 ? "var(--warn)" : "var(--good)";
        return (
          <div key={name} style={{ display: "grid", gridTemplateColumns: "1fr 40px", gap: 8, alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ fontWeight: 500 }}>{name}</span>
                <span className="muted mono" style={{ fontSize: 11 }}>{n} fields · min {minV}%</span>
              </div>
              <div style={{ display: "flex", gap: 1, marginTop: 4 }}>
                {vals.map((v, i) => (
                  <div key={i} title={`${v}%`} style={{
                    flex: 1, height: 14,
                    background: v < 75 ? "var(--bad)" : v < 85 ? "var(--warn)" : v < 95 ? "var(--info)" : "var(--good)",
                    opacity: 0.85, borderRadius: 1,
                  }} />
                ))}
              </div>
            </div>
            <div className="mono" style={{ fontSize: 11, textAlign: "right", color: tone, fontWeight: 500 }}>{avg.toFixed(0)}%</div>
          </div>
        );
      })}
    </div>
  );
}

function SchemaView({ inc }) {
  return (
    <div className="row row-2">
      <div className="card">
        <div className="card-h"><h3>Extraction schema</h3><span className="h-sub">{inc.template} · pinned for this job</span></div>
        <div className="schema">
{`{
  `}<span className="c">// OFFICE-NNN-2024 · 73 fields · schema v4.2</span>{`
  `}<span className="k">"$id"</span>: <span className="s">"folio://schemas/OFFICE-NNN-2024@v4.2"</span>,
  <span className="k">"template_match_score"</span>: <span className="n">0.91</span>,
  <span className="k">"few_shot_corpus"</span>: <span className="s">"OFFICE-NNN-2024-shots@v4.2"</span> <span className="c">// 12 exemplars</span>,

  <span className="k">"premises"</span>: {`{`}
    <span className="k">"address"</span>: <span className="s">"1245 Park Avenue, New York, NY 10128"</span>,
    <span className="k">"floors"</span>: [<span className="n">17</span>,<span className="n">18</span>,<span className="n">19</span>,<span className="n">20</span>,<span className="n">21</span>,<span className="n">22</span>],
    <span className="k">"rsf"</span>: <span className="n">287400</span>,
    <span className="k">"usf"</span>: <span className="n">258660</span>,
    <span className="k">"lease_type"</span>: <span className="s">"NNN"</span>
  {`},`}
  <span className="k">"term"</span>: {`{`}
    <span className="k">"commencement"</span>: <span className="s">"2026-07-01"</span>,
    <span className="k">"expiration"</span>: <span className="s">"2038-06-30"</span>,
    <span className="k">"renewal_options"</span>: [{`{`}<span className="k">"years"</span>:<span className="n">5</span>,<span className="k">"count"</span>:<span className="n">2</span>{`}]`}
  {`},`}
  <span className="k">"base_rent"</span>: {`{`}
    <span className="k">"year_1_psf"</span>: <span className="n">168.00</span>,
    <span className="k">"annual_rent"</span>: <span className="n">48283200</span>,
    <span className="k">"escalation"</span>: <span className="flag">{`{ /* §17.4 — flagged, 71% conf */ }`}</span>
  {`},`}
  <span className="k">"operating_expenses"</span>: {`{`}
    <span className="k">"method"</span>: <span className="s">"NNN"</span>,
    <span className="k">"base_year"</span>: <span className="b">null</span>,
    <span className="k">"caps"</span>: {`{`}<span className="k">"controllable"</span>:<span className="n">5.0</span>,<span className="k">"non_controllable"</span>:<span className="b">null</span>{`}`}
  {`},`}
  <span className="k">"snda"</span>: <span className="flag">{`{ /* §22 — flagged, 61% conf */ }`}</span>,
  <span className="k">"rofr"</span>: <span className="flag">{`{ /* §31 — flagged, 78% conf */ }`}</span>,
  <span className="k">"exhibits"</span>: {`{`}
    <span className="k">"parking"</span>: <span className="flag">{`{ /* Ex-D — base year mismatch */ }`}</span>,
    <span className="k">"work_letter"</span>: {`{ /* Ex-B */ }`},
    <span className="k">"rules_regs"</span>: {`{ /* Ex-A */ }`}
  {`}
}`}
        </div>
      </div>
      <div className="card">
        <div className="card-h"><h3>Schema validators</h3><span className="h-sub">that must pass before sign-off</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["Required-fields presence",          "passing", "73/73 required fields present"],
            ["Type & enum conformance",            "passing", "All fields conform to declared types"],
            ["Cross-clause consistency",           "warn",    "§17.4 base year ≠ Ex-D base year"],
            ["Citation present (every field)",     "passing", "73/73 fields cite a chunk"],
            ["Confidence floor (all ≥ 70%)",       "warn",    "§22 SNDA = 61% (below floor)"],
            ["Hallucination guard (cite-or-decline)","passing","No field returned without a citation"],
            ["ASC 842 lease classification",       "passing", "Operating lease (no purchase option)"],
          ].map(([k, st, note]) => {
            const c = st === "passing" ? "var(--good)" : st === "warn" ? "var(--warn)" : "var(--bad)";
            return (
              <div key={k} style={{ padding: "10px 12px", borderRadius: 8, background: "var(--bg-sub)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
                  <span style={{ fontWeight: 500 }}>{k}</span>
                  <span className="mono" style={{ color: c, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{st}</span>
                </div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 3 }}>{note}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TimelineView({ inc }) {
  return (
    <div className="card">
      <div className="card-h"><h3>Pipeline timeline</h3><span className="h-sub">end-to-end · {inc.timeline?.length || 0} events</span></div>
      {(inc.timeline || []).map((t, i) => (
        <div key={i} className="timeline-row">
          <div className="timeline-t">{t.t}</div>
          <div className="timeline-w">
            <span className="who mono">{t.who}</span>
            {t.what}
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditView({ inc }) {
  return (
    <div className="row row-2">
      <div className="card">
        <div className="card-h"><h3>Audit trail · per-field provenance</h3><span className="h-sub">every field cites a source chunk + reviewer</span></div>
        <table className="table">
          <thead><tr><th>Field</th><th>Source chunk</th><th>Confidence</th><th>Reviewer</th></tr></thead>
          <tbody>
            {[
              ["premises.rsf",            "§1.2 ¶3",  99, "auto"],
              ["term.commencement",       "§3.1",      99, "auto"],
              ["base_rent.year_1_psf",    "§4.1 Tbl A",99, "auto"],
              ["base_rent.escalation",    "§17.4",     71, "Mira R."],
              ["snda.form_control",       "§22.1",     61, "Jordan T."],
              ["rofr.exercise_window",    "§31.2",     78, "Diana V."],
              ["exhibits.parking.rate",   "Ex-D ¶7",   84, "Diana V."],
              ["operating_expenses.caps", "§6.3",      94, "auto"],
            ].map(([f, src, c, r]) => (
              <tr key={f}>
                <td className="mono" style={{ fontSize: 12 }}>{f}</td>
                <td className="muted mono" style={{ fontSize: 11.5 }}>{src}</td>
                <td className="num" style={{ color: c < 80 ? "var(--warn)" : "var(--text)" }}>{c}%</td>
                <td className="muted" style={{ fontSize: 12.5 }}>{r}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="card-h"><h3>Controls applied</h3></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {window.CONTROLS.slice(0, 6).map(c => (
            <div key={c.id} style={{ padding: 10, borderRadius: 8, background: "var(--bg-sub)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{c.id} · {c.title}</div>
                <span className="mono" style={{
                  fontSize: 11, color: c.status === "passing" ? "var(--good)" : c.status === "failing" ? "var(--bad)" : "var(--warn)",
                  fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em",
                }}>{c.status}</span>
              </div>
              <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>{c.frameworks.join(" · ")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { QueuePage, IncidentPage });
