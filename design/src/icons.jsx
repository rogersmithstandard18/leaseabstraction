// Stratum SecOps — tiny SVG icon set (stroke-based, 16px).
// Add icons sparingly; the design leans on typography, not iconography.

function Icon({ name, size = 16, ...rest }) {
  const stroke = "currentColor";
  const props = { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke, strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", ...rest };
  switch (name) {
    case "home":   return <svg {...props}><path d="M2.5 7L8 2.5L13.5 7V13a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V7z"/></svg>;
    case "inbox":  return <svg {...props}><path d="M2 9.5l1.5-5h9L14 9.5V13a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 2 13V9.5z"/><path d="M2 9.5h3.5l1 1.5h3l1-1.5H14"/></svg>;
    case "layers": return <svg {...props}><path d="M8 2L2 5l6 3l6-3L8 2z"/><path d="M2 8l6 3l6-3"/><path d="M2 11l6 3l6-3"/></svg>;
    case "shield": return <svg {...props}><path d="M8 2L3 4v4c0 3.2 2.2 5.4 5 6c2.8-.6 5-2.8 5-6V4L8 2z"/></svg>;
    case "scale":  return <svg {...props}><path d="M8 2v12M3 5h10M3 5l-1.5 4h3L3 5zm10 0l-1.5 4h3L13 5z"/></svg>;
    case "server": return <svg {...props}><rect x="2.5" y="3" width="11" height="4" rx="1"/><rect x="2.5" y="9" width="11" height="4" rx="1"/><circle cx="5" cy="5" r=".5" fill="currentColor"/><circle cx="5" cy="11" r=".5" fill="currentColor"/></svg>;
    case "target": return <svg {...props}><circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="2.5"/><circle cx="8" cy="8" r=".5" fill="currentColor"/></svg>;
    case "chart":  return <svg {...props}><path d="M2.5 13h11M4 11V8m3 3V5m3 6V7m3 4V3"/></svg>;
    case "search": return <svg {...props}><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>;
    case "bell":   return <svg {...props}><path d="M4 7a4 4 0 1 1 8 0v2.5l1 2H3l1-2V7z"/><path d="M6.5 13a1.5 1.5 0 0 0 3 0"/></svg>;
    case "settings": return <svg {...props}><circle cx="8" cy="8" r="2"/><path d="M8 1.5v2M8 12.5v2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M1.5 8h2M12.5 8h2M3.5 12.5l1.4-1.4M11.1 4.9l1.4-1.4"/></svg>;
    case "chev":   return <svg {...props}><path d="M5 6l3 3l3-3"/></svg>;
    case "chevR":  return <svg {...props}><path d="M6 4l3 4l-3 4"/></svg>;
    case "filter": return <svg {...props}><path d="M2 4h12l-4.5 5v4l-3-1.5V9L2 4z"/></svg>;
    case "external": return <svg {...props}><path d="M9 3h4v4M13 3l-5 5M11 9v3.5H3.5V5h3"/></svg>;
    case "dot":    return <svg {...props}><circle cx="8" cy="8" r="2.5" fill="currentColor" stroke="none"/></svg>;
    case "check":  return <svg {...props}><path d="M3 8l3.5 3.5L13 5"/></svg>;
    case "x":      return <svg {...props}><path d="M4 4l8 8M12 4l-8 8"/></svg>;
    case "plus":   return <svg {...props}><path d="M8 3v10M3 8h10"/></svg>;
    default:       return <svg {...props}><circle cx="8" cy="8" r="3"/></svg>;
  }
}

window.Icon = Icon;
