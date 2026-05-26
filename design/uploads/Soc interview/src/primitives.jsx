// Stratum SecOps — small reusable display primitives.
const { useState: uS, useMemo: uM } = React;

function SevChip({ sev }) {
  return <span className={`chip sev-${sev}`}><span className="chip-dot" style={{background:"currentColor"}}/>{sev}</span>;
}
function StatusChip({ status }) {
  const meta = window.STATUS_META[status] || { color: "var(--text-3)" };
  return <span className="chip" style={{ background: "transparent", border: "1px solid var(--border)", color: meta.color }}>
    <span className="chip-dot" style={{ background: meta.color }} />{status}
  </span>;
}
function KindGlyph({ kind, size = 22 }) {
  const m = window.KIND_META[kind] || { color: "#6B7280", glyph: "•" };
  return (
    <span style={{
      display: "inline-grid", placeItems: "center",
      width: size, height: size, borderRadius: 6,
      background: m.color + "14", color: m.color,
      fontFamily: "var(--font-mono)", fontSize: size * 0.55, fontWeight: 700, lineHeight: 1,
    }}>{m.glyph}</span>
  );
}

function Sparkline({ points, color = "var(--text-2)", height = 36, fill = false }) {
  const w = 100;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const path = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = height - 4 - ((v - min) / range) * (height - 8);
    return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
  const area = `${path} L${w} ${height} L0 ${height} Z`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      {fill && <path d={area} fill={color} opacity="0.12" />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function MiniBar({ value, total = 100, color = "var(--accent)" }) {
  const pct = Math.max(0, Math.min(100, (value / total) * 100));
  return (
    <div className="severity-bar">
      <span style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function Dollars({ amount, compact = true }) {
  if (amount == null) return "—";
  if (!compact) return "$" + amount.toLocaleString();
  if (amount >= 1_000_000) return "$" + (amount / 1_000_000).toFixed(amount >= 10_000_000 ? 0 : 1) + "M";
  if (amount >= 1_000)     return "$" + (amount / 1_000).toFixed(0) + "K";
  return "$" + amount;
}

function TimeAgo({ minutes }) {
  if (minutes < 1)  return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`;
  return `${Math.floor(minutes / (60 * 24))}d ago`;
}

function Section({ title, sub, right, children, style }) {
  return (
    <section style={style}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "-0.005em" }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

Object.assign(window, { SevChip, StatusChip, KindGlyph, Sparkline, MiniBar, Dollars, TimeAgo, Section });
