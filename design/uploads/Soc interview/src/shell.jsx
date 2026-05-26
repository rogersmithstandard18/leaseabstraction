// Stratum SecOps — app shell: sidebar, topbar, role switcher.

const { useState, useEffect, useRef, useMemo } = React;

function Sidebar({ tweaks, role, page, setPage, openRoleSwitcher }) {
  const altitude = role.altitude;
  const navIds = window.NAV_BY_ALTITUDE[altitude] || ["home"];
  const counts = useMemo(() => {
    const open = window.INCIDENTS.filter(i => i.status !== "Closed").length;
    const crits = window.INCIDENTS.filter(i => i.severity === "Critical" && i.status !== "Closed").length;
    return { queue: open, crits };
  }, []);

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-brand-mark" style={{ background: tweaks.brandColor }}>{tweaks.brandLetter}</div>
        <div>
          <div className="sb-brand-name">{tweaks.brandName}</div>
          <div className="sb-brand-sub">SecOps platform</div>
        </div>
      </div>

      <div className="sb-section">
        <div className="sb-section-label">Operate</div>
      </div>
      <nav className="sb-nav">
        {navIds.map(id => {
          const meta = window.PAGE_META[id];
          const badge = id === "queue" ? counts.queue : null;
          return (
            <button key={id} className={"sb-link" + (page === id ? " active" : "")} onClick={() => setPage(id)}>
              <Icon name={meta.icon} />
              <span>{meta.label}</span>
              {badge != null && <span className="badge">{badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sb-section" style={{ marginTop: 22 }}>
        <div className="sb-section-label">Status</div>
      </div>
      <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 4 }}>
        <MiniStat label="Open Sev-1" value={counts.crits} tone="bad" />
        <MiniStat label="Open total" value={counts.queue} tone="muted" />
        <MiniStat label="Shift load" value="87%" tone="warn" />
      </div>

      <div className="sb-foot">
        <div className="sb-user" onClick={openRoleSwitcher} title="Switch role">
          <div className="sb-avatar">{role.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sb-user-name" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{role.name}</div>
            <div className="sb-user-role" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{role.short}</div>
          </div>
          <span className="sb-user-chev"><Icon name="chev" /></span>
        </div>
      </div>
    </aside>
  );
}

function MiniStat({ label, value, tone }) {
  const colors = { good: "var(--good)", bad: "var(--bad)", warn: "var(--warn)", muted: "var(--text-2)" };
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 10px", fontSize: 12 }}>
      <span style={{ color: "var(--text-3)" }}>{label}</span>
      <span style={{ color: colors[tone] || "var(--text-2)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function Topbar({ role, page, setPage, onIncidentOpen, focusedIncident }) {
  const pageMeta = window.PAGE_META[page];
  const altLabel = window.ALTITUDE_LABELS[role.altitude];

  return (
    <div className="topbar">
      <div className="topbar-crumbs">
        <span>Stratum</span>
        <span style={{ opacity: 0.5 }}>/</span>
        <span>{altLabel}</span>
        <span style={{ opacity: 0.5 }}>/</span>
        <span className="crumb-page">{pageMeta?.label || "Home"}</span>
        {focusedIncident && <>
          <span style={{ opacity: 0.5 }}>/</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{focusedIncident.id}</span>
        </>}
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-pill" title="Operational status">
        <span className="dot" />
        <span>All sub-systems nominal</span>
      </div>
      <div className="topbar-search" onClick={() => alert("Cmd-K (mock)")}>
        <Icon name="search" />
        <span>Search incidents, controls, hosts…</span>
        <kbd>⌘K</kbd>
      </div>
      <button className="topbar-icon-btn"><Icon name="bell" /></button>
      <button className="topbar-icon-btn"><Icon name="settings" /></button>
    </div>
  );
}

function RoleSwitcher({ currentRole, onPick, onClose }) {
  const grouped = useMemo(() => {
    const g = {};
    window.ROLES.forEach(r => {
      const k = window.ALTITUDE_LABELS[r.altitude];
      (g[k] = g[k] || []).push(r);
    });
    return g;
  }, []);
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div style={{ fontSize: 14, fontWeight: 600 }}>Switch role</div>
          <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 4 }}>
            The same incident data, rendered at the altitude this person operates at.
          </div>
        </div>
        <div className="modal-body">
          {Object.entries(grouped).map(([k, list]) => (
            <div key={k} style={{ padding: "8px 4px" }}>
              <div style={{ fontSize: 10.5, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "6px 12px 4px", fontWeight: 500 }}>{k}</div>
              {list.map(r => (
                <div key={r.id} className={"role-row" + (currentRole.id === r.id ? " current" : "")} onClick={() => { onPick(r); onClose(); }}>
                  <div className="role-row-avatar">{r.initials}</div>
                  <div>
                    <div className="role-row-name">{r.label}</div>
                    <div className="role-row-sub">{r.name} · {window.DEPARTMENTS[r.dept].label}</div>
                  </div>
                  <div className="role-row-alt">Alt {r.altitude}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, RoleSwitcher, MiniStat });
