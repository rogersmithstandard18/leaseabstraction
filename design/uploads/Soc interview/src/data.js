// Stratum SecOps — shared data layer
// Roles, altitudes, incidents, controls, detections, IT signals.

// ─── ALTITUDE LADDER ──────────────────────────────────────────────────────
// 0 Ground (analyst) → 1 Lead → 2 Manager → 3 Director → 4 SrDirector → 5 Exec → 6 CEO
window.ROLES = [
  { id: "t1",          label: "Tier 1 SOC Analyst",        short: "T1 Analyst",  altitude: 0, dept: "soc",     initials: "MR", name: "Maya Reyes",      tz: "EST" },
  { id: "sr_analyst",  label: "Sr. SOC Analyst (T2/T3)",   short: "Sr Analyst",  altitude: 0, dept: "soc",     initials: "DK", name: "Devon Kim",       tz: "EST" },
  { id: "shift_lead",  label: "SOC Shift Lead",            short: "Shift Lead",  altitude: 1, dept: "soc",     initials: "AO", name: "Aisha Okafor",    tz: "EST" },
  { id: "ir_lead",     label: "IR / Forensics Lead",       short: "IR Lead",     altitude: 1, dept: "ir",      initials: "JT", name: "Jordan Tan",      tz: "EST" },
  { id: "det_eng",     label: "Detection Engineering Lead",short: "DetEng Lead", altitude: 1, dept: "deteng",  initials: "PV", name: "Priya Venkat",    tz: "PST" },
  { id: "it_ops",      label: "IT Operations Lead",        short: "IT Ops",      altitude: 1, dept: "itops",   initials: "RB", name: "Ricardo Bauer",   tz: "CST" },
  { id: "grc",         label: "Compliance & GRC Director", short: "GRC Director",altitude: 3, dept: "grc",     initials: "EM", name: "Elena Marsh",     tz: "EST" },
  { id: "soc_manager", label: "SOC Manager",               short: "SOC Manager", altitude: 2, dept: "soc",     initials: "HN", name: "Henry Nakamura",  tz: "EST" },
  { id: "dir_secops",  label: "Director, Security Ops",    short: "Director",    altitude: 3, dept: "exec",    initials: "SC", name: "Sarah Chen",      tz: "EST" },
  { id: "sr_dir",      label: "Sr. Director, Cyber Defense",short: "Sr Director",altitude: 4, dept: "exec",    initials: "MA", name: "Marcus Adeyemi",  tz: "EST" },
  { id: "ciso",        label: "CISO",                      short: "CISO",        altitude: 5, dept: "exec",    initials: "LP", name: "Lena Petrova",    tz: "EST" },
  { id: "cto",         label: "CTO",                       short: "CTO",         altitude: 5, dept: "exec",    initials: "RS", name: "Raj Sundaram",    tz: "EST" },
  { id: "ceo",         label: "CEO",                       short: "CEO",         altitude: 6, dept: "exec",    initials: "VW", name: "Victoria Wexler", tz: "EST" },
];

window.ALTITUDE_LABELS = ["Ground", "Lead", "Manager", "Director", "Sr Director", "Executive", "C-Suite"];

window.DEPARTMENTS = {
  soc:    { label: "Security Operations Center", color: "#2563EB", head: 47, openIncidents: 31 },
  ir:     { label: "Incident Response & Forensics", color: "#7C3AED", head: 12, openIncidents: 4 },
  deteng: { label: "Detection Engineering", color: "#0F7C42", head: 9, openIncidents: 0 },
  grc:    { label: "Compliance & GRC", color: "#D97706", head: 16, openIncidents: 0 },
  itops:  { label: "IT Operations", color: "#0891B2", head: 84, openIncidents: 6 },
  exec:   { label: "Executive Leadership", color: "#0A0A0A", head: 8, openIncidents: 0 },
};

// ─── NAV ──────────────────────────────────────────────────────────────────
// Which pages each altitude sees in their sidebar (in order)
window.NAV_BY_ALTITUDE = {
  0: ["home", "queue", "training"],
  1: ["home", "queue", "detection", "itops", "training"],
  2: ["home", "queue", "altitude", "detection", "compliance", "itops", "training"],
  3: ["home", "altitude", "queue", "detection", "compliance", "itops", "reports"],
  4: ["home", "altitude", "queue", "compliance", "reports"],
  5: ["home", "altitude", "compliance", "reports"],
  6: ["home", "altitude", "reports"],
};

window.PAGE_META = {
  home:       { label: "Home",                  icon: "home" },
  queue:      { label: "Incident Queue",        icon: "inbox" },
  altitude:   { label: "Altitude View",         icon: "layers" },
  detection:  { label: "Detection Engineering", icon: "shield" },
  compliance: { label: "Compliance & GRC",      icon: "scale" },
  itops:      { label: "IT Operations",         icon: "server" },
  training:   { label: "Training & Drills",     icon: "target" },
  reports:    { label: "Board Reports",         icon: "chart" },
};

// ─── INCIDENTS ────────────────────────────────────────────────────────────
// "kind" drives icon/category. The signature incident is INC-9201.
window.INCIDENTS = [
  {
    id: "INC-9201", title: "Encoded PowerShell C2 beacon on executive laptop",
    kind: "c2", severity: "Critical", status: "Containment", dept: "soc",
    asset: "EXEC-LAPTOP-07 · ceo_assistant", assignee: "Devon Kim (Sr T3)",
    openedAt: "2026-05-22 09:02 UTC", mttdMin: 4, ageMin: 142,
    mitre: "T1059.001 · T1071.001", cve: "CVE-2021-34527",
    source: "EDR — Sysmon EventID 3", confidence: 96,
    fintechTags: ["Insider exec context", "PrintNightmare", "C2 jitter"],
    blastRadius: { hosts: 1, accounts: 1, services: 0, customers: 0 },
    dollarsAtRisk: 8_400_000,
    sla: { ack: "ok", contain: "at-risk", resolve: "ok" },
    summary: "Encoded PS loader with 47s±12s jitter beaconing to 94.130.88.12. PrintNightmare DLL hijack via spoolsv.exe staged 6 days ago.",
    timeline: [
      { t: "09:02:44", who: "SIEM", what: "Rule R-2103 fired: Encoded PowerShell C2 Beacon" },
      { t: "09:03:01", who: "Maya R. (T1)", what: "Acknowledged. Pulled Sysmon EID 3 for host." },
      { t: "09:06:18", who: "Maya R. (T1)", what: "Escalated to T3 — confirmed jitter pattern, exec asset." },
      { t: "09:11:40", who: "Devon K. (T3)", what: "Started memory acquisition. Notified IR Lead." },
      { t: "09:14:09", who: "Jordan T. (IR)", what: "Engaged. Token revocation queued for ceo_assistant." },
      { t: "09:17:22", who: "Jordan T. (IR)", what: "Firewall block applied to 94.130.88.12 at edge." },
      { t: "09:28:55", who: "Aisha O. (Lead)", what: "Briefed SOC Manager. CISO informed via incident channel." },
    ],
  },
  {
    id: "INC-9197", title: "SWIFT wire anomaly — $4.2M to first-time beneficiary",
    kind: "fraud", severity: "Critical", status: "Hunting", dept: "ir",
    asset: "SWIFT-GW-02 · payment ops", assignee: "Jordan Tan (IR)",
    openedAt: "2026-05-22 07:48 UTC", mttdMin: 1, ageMin: 218,
    mitre: "T1565.001", cve: null,
    source: "Fraud rules — F-104", confidence: 88,
    fintechTags: ["SWIFT MT103", "Round-dollar amount", "Off-hours"],
    blastRadius: { hosts: 0, accounts: 2, services: 1, customers: 0 },
    dollarsAtRisk: 4_200_000,
    sla: { ack: "ok", contain: "ok", resolve: "ok" },
    summary: "MT103 message to a beneficiary first seen 11 minutes prior. Originator approved via expired hardware token reuse pattern.",
  },
  {
    id: "INC-9193", title: "DC compromise — ntdsutil IFM on tier-0 DC-PROD-02",
    kind: "ad", severity: "Critical", status: "Eradicating", dept: "ir",
    asset: "DC-PROD-02 · forest root", assignee: "Jordan Tan (IR)",
    openedAt: "2026-05-22 03:42 UTC", mttdMin: 6, ageMin: 504,
    mitre: "T1003.003", cve: null,
    source: "EDR — process telemetry", confidence: 99,
    fintechTags: ["Tier-0", "krbtgt at risk", "Forest-wide blast"],
    blastRadius: { hosts: 1, accounts: 31_400, services: 6, customers: 0 },
    dollarsAtRisk: 240_000_000,
    sla: { ack: "ok", contain: "ok", resolve: "at-risk" },
    summary: "ntds.dit exfiltrated (412MB) to Bulgarian VPS. Enterprise krbtgt double-reset in flight. Forest-wide credential invalidation.",
  },
  {
    id: "INC-9188", title: "Card-not-present fraud burst — 1,847 attempts in 90s",
    kind: "fraud", severity: "High", status: "Mitigating", dept: "soc",
    asset: "card-auth-prod · gateway", assignee: "Maya Reyes (T1)",
    openedAt: "2026-05-22 06:21 UTC", mttdMin: 2, ageMin: 305,
    mitre: "T1110.004", cve: null,
    source: "Fraud rules — F-088", confidence: 82,
    fintechTags: ["CNP", "BIN range targeted", "Velocity rule"],
    blastRadius: { hosts: 0, accounts: 312, services: 2, customers: 312 },
    dollarsAtRisk: 86_000,
    sla: { ack: "ok", contain: "ok", resolve: "ok" },
    summary: "BIN-range card testing from rotating residential proxies. 312 cards bypassed initial velocity rule. Step-up auth rolled to gateway.",
  },
  {
    id: "INC-9181", title: "Edge DDoS — 84 Gbps SYN flood on api.bank.com",
    kind: "ddos", severity: "High", status: "Mitigating", dept: "itops",
    asset: "edge-cdn · api.bank.com", assignee: "Ricardo Bauer (IT Ops)",
    openedAt: "2026-05-22 04:55 UTC", mttdMin: 1, ageMin: 391,
    mitre: "T1498.001", cve: null,
    source: "CDN telemetry", confidence: 99,
    fintechTags: ["Customer-facing", "Trading hours", "Vendor escalation"],
    blastRadius: { hosts: 0, accounts: 0, services: 1, customers: 14_800 },
    dollarsAtRisk: 0,
    sla: { ack: "ok", contain: "ok", resolve: "ok" },
    summary: "Sustained 84 Gbps SYN from 12k IPs across 38 ASNs. CDN absorbing 100%; origin not impacted. Vendor confirmed ongoing.",
  },
  {
    id: "INC-9176", title: "Brute-force on Citrix gateway — 4,200 attempts on svc_finance",
    kind: "bruteforce", severity: "High", status: "Triage", dept: "soc",
    asset: "citrix-gw-01 · perimeter", assignee: "Maya Reyes (T1)",
    openedAt: "2026-05-22 05:30 UTC", mttdMin: 3, ageMin: 356,
    mitre: "T1110.001", cve: null,
    source: "Auth logs", confidence: 91,
    fintechTags: ["Service account", "External", "FTP-Patator pattern"],
    blastRadius: { hosts: 0, accounts: 1, services: 1, customers: 0 },
    dollarsAtRisk: 0,
    sla: { ack: "ok", contain: "ok", resolve: "ok" },
    summary: "4,200 auth attempts on svc_finance from rotating proxies. Account locked, IP block deployed, password rotation queued.",
  },
  {
    id: "INC-9170", title: "LotL credential dump — svchost from Public dir",
    kind: "lotl", severity: "High", status: "Eradicating", dept: "ir",
    asset: "FIN-WKS-118 · rkhan", assignee: "Jordan Tan (IR)",
    openedAt: "2026-05-22 14:08 UTC", mttdMin: 1, ageMin: 17,
    mitre: "T1003.001 · T1036", cve: null,
    source: "EDR — Sysmon EID 10", confidence: 98,
    fintechTags: ["LockBit hash", "Phishing precursor", "Cached creds burned"],
    blastRadius: { hosts: 1, accounts: 14, services: 0, customers: 0 },
    dollarsAtRisk: 1_200_000,
    sla: { ack: "ok", contain: "ok", resolve: "ok" },
    summary: "Masquerading svchost (C:\\Users\\Public) opened 0x1410 handle to lsass. lsass.dmp exfiltrated 2.1MB to 91.219.236.14.",
  },
  {
    id: "INC-9165", title: "Credential stuffing — Tor exit + temp admin not revoked",
    kind: "cred", severity: "Medium", status: "Closed", dept: "soc",
    asset: "CORP-WKS-042 · jsmith", assignee: "Maya Reyes (T1)",
    openedAt: "2026-05-21 23:14 UTC", mttdMin: 2, ageMin: 1100,
    mitre: "T1078", cve: null,
    source: "Auth logs", confidence: 90,
    fintechTags: ["Tor", "Off-hours", "Stale privilege"],
    blastRadius: { hosts: 1, accounts: 1, services: 0, customers: 0 },
    dollarsAtRisk: 0,
    sla: { ack: "ok", contain: "ok", resolve: "ok" },
    summary: "Failed-then-success from Tor exit, unrevoked temp admin. Password rotated, MFA pushed, lateral movement check clean.",
  },
  {
    id: "INC-9159", title: "Suspicious AWS console login from new geo — root account",
    kind: "cloud", severity: "Medium", status: "Triage", dept: "soc",
    asset: "aws · root account", assignee: "Devon Kim (Sr T3)",
    openedAt: "2026-05-22 11:14 UTC", mttdMin: 1, ageMin: 30,
    mitre: "T1078.004", cve: null,
    source: "CloudTrail", confidence: 70,
    fintechTags: ["Root account", "New geo", "MFA challenged"],
    blastRadius: { hosts: 0, accounts: 1, services: 0, customers: 0 },
    dollarsAtRisk: 0,
    sla: { ack: "ok", contain: "ok", resolve: "ok" },
    summary: "AWS root console login from São Paulo. MFA challenged + passed. Travel pattern unusual; awaiting user confirmation.",
  },
  {
    id: "INC-9152", title: "CDN cache poisoning attempt — host header injection",
    kind: "web", severity: "Medium", status: "Triage", dept: "itops",
    asset: "edge-cdn · marketing.bank.com", assignee: "Ricardo Bauer (IT Ops)",
    openedAt: "2026-05-22 02:01 UTC", mttdMin: 7, ageMin: 565,
    mitre: "T1659", cve: null,
    source: "WAF logs", confidence: 65,
    fintechTags: ["Public-facing", "Marketing site"],
    blastRadius: { hosts: 0, accounts: 0, services: 1, customers: 0 },
    dollarsAtRisk: 0,
    sla: { ack: "ok", contain: "ok", resolve: "ok" },
    summary: "Repeated host header injection probing. WAF rule W-301 blocking. No origin contamination detected.",
  },
  {
    id: "INC-9144", title: "Phishing — finance team, invoice lure (no exec)",
    kind: "phish", severity: "Low", status: "Closed", dept: "soc",
    asset: "email · 14 finance recipients", assignee: "Maya Reyes (T1)",
    openedAt: "2026-05-21 18:00 UTC", mttdMin: 11, ageMin: 1400,
    mitre: "T1566.001", cve: null,
    source: "Email gateway", confidence: 99,
    fintechTags: ["Invoice lure", "Finance dept"],
    blastRadius: { hosts: 0, accounts: 0, services: 0, customers: 0 },
    dollarsAtRisk: 0,
    sla: { ack: "ok", contain: "ok", resolve: "ok" },
    summary: "14 emails quarantined pre-delivery. 0 clicks. Domain added to blocklist. Awareness ping sent to finance team.",
  },
];

// ─── SIGNATURE: ALTITUDE VIEW (INC-9201 across all altitudes) ─────────────
// What does the SAME incident look like at each tier?
window.ALTITUDE_VIEWS = {
  "INC-9201": {
    t1: {
      title: "Triage Workbench",
      headline: "Encoded PowerShell C2 beacon — EXEC-LAPTOP-07",
      framing: "What you do next, by the book.",
      keyMetric: { label: "Time-on-task", value: "00:04:17", note: "SLA: ack ≤5m" },
      lens: "Single-incident detail. Raw logs, process tree, SOP next step.",
      callout: "Run step 3 of the SOP: confirm beacon interval via Sysmon EID 3.",
      decisions: [
        "Acknowledge & start the timer",
        "Pull the SOP for encoded PS C2",
        "Decode the base64 payload safely (sandbox)",
        "Escalate to T3 if jitter pattern confirmed",
      ],
    },
    sr_analyst: {
      title: "Investigator Console",
      headline: "T1059.001 + PrintNightmare DLL hijack — confirmed APT pattern",
      framing: "Correlate, scope, decide on containment.",
      keyMetric: { label: "Dwell time", value: "6 days", note: "From first DLL load" },
      lens: "Across-host correlation. MITRE chain, threat intel pivot.",
      callout: "Pivot on 94.130.88.12 — 2 other hosts contacted it in last 24h.",
      decisions: [
        "Build the kill chain across hosts",
        "Pull memory before reboot",
        "Recommend isolate + token revoke",
        "Hand off to IR with the chain",
      ],
    },
    shift_lead: {
      title: "Shift Floor",
      headline: "Critical exec incident — Devon on it, IR engaged",
      framing: "Keep the floor moving. Reassign if needed.",
      keyMetric: { label: "Open Sev-1s", value: "3 of 31", note: "Shift load: 87%" },
      lens: "Queue health, who's on what, who's free, escalation hygiene.",
      callout: "Maya escalated correctly in 3m17s — protocol clean. Watch INC-9176 SLA.",
      decisions: [
        "Confirm IR engagement at +9 min",
        "Move INC-9176 to Marcus to free Maya",
        "Page on-call CISO if scope expands",
        "Log shift handoff to APAC at 19:00",
      ],
    },
    soc_manager: {
      title: "Operations Overview",
      headline: "1 critical in containment · MTTD 4m · within target",
      framing: "Capacity, performance, exposure.",
      keyMetric: { label: "MTTD this week", value: "5m 11s", note: "Target ≤7m · ↓18% w/w" },
      lens: "All incidents at once. MTTD/MTTR, SLA breaches, staffing.",
      callout: "Headcount tight: 2 of 47 on PTO, weekend on-call gap Sat 02–06.",
      decisions: [
        "Approve overtime for IR weekend shift",
        "Brief Director at the 10:00 standup",
        "Flag exec-laptop pattern to DetEng",
        "Submit Q3 capacity ask for 2 additional T3s",
      ],
    },
    dir_secops: {
      title: "Program Health",
      headline: "Active critical in containment · zero customer impact",
      framing: "Where are we leaking? What needs investment?",
      keyMetric: { label: "MTTR (Sev-1, 30d)", value: "47m", note: "Target 60m · 4 of 9 under target" },
      lens: "Program-level: trend, top miss, control performance.",
      callout: "3rd PrintNightmare-derived incident in 90 days. DetEng to rebuild rule R-2103.",
      decisions: [
        "Greenlight rule R-2103 v2 sprint",
        "Add PrintNightmare to next tabletop",
        "Review exec-asset hardening posture",
        "Budget ask: $1.2M EDR refresh",
      ],
    },
    sr_dir: {
      title: "Defense Posture",
      headline: "Posture stable · 1 critical contained without escalation",
      framing: "Initiatives, risk register, leadership narrative.",
      keyMetric: { label: "Risk score", value: "62 / 100", note: "Last quarter 68 · ↓6" },
      lens: "Initiative tracking, audit-readiness, peer benchmark.",
      callout: "On-track for SOX evidence by Jul 15. Exec-asset hardening behind by 2 weeks.",
      decisions: [
        "Approve PrintNightmare retrospective",
        "Move exec-laptop hardening into next sprint",
        "Briefing pack for CISO weekly",
        "Sign off on quarterly board narrative",
      ],
    },
    ciso: {
      title: "Risk Posture",
      headline: "Active critical, contained · $8.4M at risk, $0 realized · controls held",
      framing: "What's our exposure and is the program working?",
      keyMetric: { label: "Realized loss YTD", value: "$0.4M", note: "Budget $4.8M · 8% utilization" },
      lens: "Risk dollars, control coverage, regulatory exposure.",
      callout: "Control C-117 (privileged session monitoring) prevented exec-laptop scope expansion.",
      decisions: [
        "Approve emergency comms to CEO",
        "Confirm regulatory non-reportable",
        "Sign off on $1.2M EDR refresh",
        "Board talking points for Thursday",
      ],
    },
    cto: {
      title: "Engineering & Reliability",
      headline: "Security event isolated to one endpoint · zero infra impact",
      framing: "Are we shipping, is the platform stable, what's blocked?",
      keyMetric: { label: "Platform availability", value: "99.987%", note: "30-day · SLO 99.95%" },
      lens: "Engineering uptime overlay, eng on-call load, dependency risk.",
      callout: "Edge DDoS absorbed at CDN — origin healthy. No customer-facing impact this morning.",
      decisions: [
        "No engineering action required",
        "Confirm with Lena on regulatory posture",
        "Greenlight CDN vendor contract renewal",
      ],
    },
    ceo: {
      title: "Today",
      headline: "All systems operating. One critical security event, fully contained.",
      framing: "Trust, money, regulators, customers.",
      keyMetric: { label: "Customer impact", value: "Zero", note: "0 customers affected, 0 funds moved" },
      lens: "Three numbers. One sentence. One thing to know.",
      callout: "An executive laptop was compromised this morning. It is contained, no data left the company, no customer was affected. Lena is briefing the audit committee on Thursday.",
      decisions: [
        "Acknowledge briefing from Lena",
        "No external comms required",
        "Continue scheduled programming",
      ],
    },
  },
};

// ─── DETECTIONS (Detection Engineering page) ──────────────────────────────
window.DETECTIONS = [
  { id: "R-2103", name: "Encoded PowerShell C2 Beacon",        stage: "production", owner: "Priya V.",   fpRate: 2.1, tpLastWeek: 1, mitre: "T1059.001 · T1071.001", lastTuned: "2026-05-08", health: "review" },
  { id: "R-1118", name: "ntdsutil IFM on Tier-0 DC",            stage: "production", owner: "Priya V.",   fpRate: 0.0, tpLastWeek: 1, mitre: "T1003.003", lastTuned: "2026-04-22", health: "healthy" },
  { id: "R-3041", name: "svchost from non-System32",            stage: "production", owner: "Kai L.",     fpRate: 1.4, tpLastWeek: 1, mitre: "T1036.005", lastTuned: "2026-03-30", health: "healthy" },
  { id: "F-088",  name: "CNP velocity — BIN burst",             stage: "production", owner: "Priya V.",   fpRate: 4.8, tpLastWeek: 3, mitre: "T1110.004", lastTuned: "2026-05-12", health: "noisy" },
  { id: "F-104",  name: "SWIFT MT103 first-time-bene + round-$",stage: "production", owner: "Kai L.",     fpRate: 3.1, tpLastWeek: 1, mitre: "T1565.001", lastTuned: "2026-05-19", health: "healthy" },
  { id: "R-2210", name: "C2 beacon jitter (47±12s pattern)",    stage: "staging",    owner: "Priya V.",   fpRate: 0.4, tpLastWeek: 0, mitre: "T1071.001", lastTuned: "2026-05-20", health: "promote" },
  { id: "R-1842", name: "AWS root login + new geo",             stage: "production", owner: "Kai L.",     fpRate: 9.2, tpLastWeek: 0, mitre: "T1078.004", lastTuned: "2026-02-14", health: "noisy" },
  { id: "R-3500", name: "Edge SYN flood baseline-aware",        stage: "production", owner: "Sam O.",     fpRate: 0.2, tpLastWeek: 1, mitre: "T1498.001", lastTuned: "2026-05-01", health: "healthy" },
  { id: "R-4011", name: "lsass handle 0x1410 from non-svc",     stage: "production", owner: "Priya V.",   fpRate: 0.0, tpLastWeek: 1, mitre: "T1003.001", lastTuned: "2026-05-18", health: "healthy" },
  { id: "R-4090", name: "Citrix gateway brute-force",           stage: "production", owner: "Sam O.",     fpRate: 2.6, tpLastWeek: 2, mitre: "T1110.001", lastTuned: "2026-04-29", health: "healthy" },
  { id: "R-5550", name: "Card-not-present anomaly (Zeek conn)", stage: "dev",        owner: "Kai L.",     fpRate: 0.0, tpLastWeek: 0, mitre: "T1110.004", lastTuned: "2026-05-21", health: "drafting" },
];

window.MITRE_COVERAGE = [
  // 14 MITRE tactics, sketched
  { tactic: "Initial Access",        covered: 87 },
  { tactic: "Execution",             covered: 92 },
  { tactic: "Persistence",           covered: 78 },
  { tactic: "Privilege Escalation",  covered: 81 },
  { tactic: "Defense Evasion",       covered: 64 },
  { tactic: "Credential Access",     covered: 88 },
  { tactic: "Discovery",             covered: 71 },
  { tactic: "Lateral Movement",      covered: 79 },
  { tactic: "Collection",            covered: 55 },
  { tactic: "Command & Control",     covered: 84 },
  { tactic: "Exfiltration",          covered: 49 },
  { tactic: "Impact",                covered: 60 },
];

// ─── COMPLIANCE & GRC ─────────────────────────────────────────────────────
window.FRAMEWORKS = [
  { id: "sox",  label: "SOX ITGC",            coverage: 94, controls: 142, gaps: 9,  cadence: "Quarterly",   nextAudit: "2026-07-15", risk: "medium" },
  { id: "pci",  label: "PCI-DSS v4.0",        coverage: 89, controls: 312, gaps: 21, cadence: "Annual",      nextAudit: "2026-09-30", risk: "medium" },
  { id: "nydfs",label: "NYDFS Part 500",      coverage: 97, controls: 23,  gaps: 1,  cadence: "Annual",      nextAudit: "2027-03-01", risk: "low" },
  { id: "ffiec",label: "FFIEC CAT",           coverage: 91, controls: 494, gaps: 38, cadence: "Annual",      nextAudit: "2026-11-04", risk: "medium" },
  { id: "iso",  label: "ISO 27001:2022",      coverage: 86, controls: 93,  gaps: 12, cadence: "Surveillance",nextAudit: "2026-08-20", risk: "medium" },
  { id: "glba", label: "GLBA Safeguards",     coverage: 95, controls: 47,  gaps: 2,  cadence: "Continuous",  nextAudit: "—",         risk: "low" },
  { id: "soc2", label: "SOC 2 Type II",       coverage: 92, controls: 64,  gaps: 5,  cadence: "Annual",      nextAudit: "2026-10-12", risk: "low" },
];

window.CONTROLS = [
  { id: "C-117", title: "Privileged session monitoring (PAM)",         frameworks: ["SOX", "PCI", "NYDFS"], status: "passing", lastTest: "2026-05-15", evidence: 14 },
  { id: "C-203", title: "Multi-factor on production access",            frameworks: ["SOX", "PCI", "NYDFS", "FFIEC"], status: "passing", lastTest: "2026-05-17", evidence: 28 },
  { id: "C-411", title: "EDR on all endpoints",                         frameworks: ["NYDFS", "FFIEC"], status: "passing", lastTest: "2026-05-19", evidence: 9 },
  { id: "C-218", title: "Quarterly user access review (privileged)",    frameworks: ["SOX"], status: "passing", lastTest: "2026-05-12", evidence: 5 },
  { id: "C-330", title: "SWIFT alliance access — 4-eyes approval",      frameworks: ["NYDFS"], status: "passing", lastTest: "2026-05-20", evidence: 11 },
  { id: "C-602", title: "Card data tokenization at gateway",            frameworks: ["PCI"], status: "passing", lastTest: "2026-05-10", evidence: 22 },
  { id: "C-119", title: "Privileged temp-access auto-expiry",           frameworks: ["SOX", "NYDFS"], status: "failing", lastTest: "2026-05-21", evidence: 3, finding: "INC-9165: temp admin not revoked after 14d" },
  { id: "C-441", title: "Domain controller binary integrity",            frameworks: ["NYDFS", "FFIEC"], status: "at-risk", lastTest: "2026-05-22", evidence: 1, finding: "INC-9193: ntdsutil IFM run, attestation gap" },
  { id: "C-512", title: "DDoS mitigation at edge — 100 Gbps committed", frameworks: ["FFIEC"], status: "passing", lastTest: "2026-05-22", evidence: 17 },
  { id: "C-707", title: "Card-not-present velocity rules",              frameworks: ["PCI"], status: "passing", lastTest: "2026-05-22", evidence: 6 },
];

// ─── IT OPERATIONS ────────────────────────────────────────────────────────
window.IT_SIGNALS = [
  { id: "edge",  name: "Edge CDN · api.bank.com",     status: "degraded", value: "84 Gbps mitigated", note: "DDoS ongoing · origin unaffected" },
  { id: "ad",    name: "Active Directory · forest",    status: "at-risk",  value: "krbtgt reset 1/2",  note: "Double-reset in flight from INC-9193" },
  { id: "swift", name: "SWIFT gateway",                status: "healthy",  value: "MT103 throughput nominal", note: "4-eyes enforced" },
  { id: "auth",  name: "Customer auth · prod",         status: "healthy",  value: "p95 142ms",         note: "Step-up auth deployed at 06:24" },
  { id: "core",  name: "Core ledger · prod",           status: "healthy",  value: "p99 38ms",          note: "" },
  { id: "ach",   name: "ACH gateway",                  status: "healthy",  value: "batch on schedule", note: "" },
  { id: "card",  name: "Card processing",              status: "healthy",  value: "+2.1% volume vs typical", note: "" },
  { id: "vpn",   name: "Citrix gateway",               status: "watch",    value: "brute-force IP blocked", note: "INC-9176 mitigation active" },
];

// ─── EXEC METRICS (CEO, board) ────────────────────────────────────────────
window.EXEC_METRICS = {
  customersAffectedToday: 0,
  fundsMovedFraudulently: 0,
  systemAvailability30d: 99.987,
  riskScore: 62,
  riskScoreDelta: -6,
  realizedLossYTD: 400_000,
  realizedLossBudget: 4_800_000,
  openCriticals: 3,
  contained: 3,
  inFlight: 0,
  regulatoryExposure: "None reportable",
  nextBoardBrief: "Thu, May 28 · 10:00 ET",
};

// ─── KIND ICON + COLOR MAP ────────────────────────────────────────────────
window.KIND_META = {
  c2:         { label: "C2 / Beacon",         color: "#DC2626", glyph: "◉" },
  ad:         { label: "AD / Tier-0",         color: "#7C3AED", glyph: "✦" },
  fraud:      { label: "Fraud · Payments",    color: "#D97706", glyph: "$" },
  ddos:       { label: "DDoS / Edge",         color: "#0891B2", glyph: "≋" },
  bruteforce: { label: "Brute-force",         color: "#B45309", glyph: "∷" },
  lotl:       { label: "LotL · Endpoint",     color: "#BE185D", glyph: "◐" },
  cred:       { label: "Credential",          color: "#2563EB", glyph: "⌭" },
  cloud:      { label: "Cloud / IAM",         color: "#0F7C42", glyph: "☁" },
  web:        { label: "Web / WAF",           color: "#6B7280", glyph: "⌬" },
  phish:      { label: "Phishing",            color: "#9333EA", glyph: "✉" },
};

window.SEV_META = {
  Critical: { color: "#DC2626", bg: "#FEF2F2" },
  High:     { color: "#D97706", bg: "#FFFBEB" },
  Medium:   { color: "#2563EB", bg: "#EFF6FF" },
  Low:      { color: "#6B7280", bg: "#F9FAFB" },
};

window.STATUS_META = {
  Triage:      { color: "#2563EB" },
  Containment: { color: "#D97706" },
  Mitigating:  { color: "#D97706" },
  Hunting:     { color: "#7C3AED" },
  Eradicating: { color: "#BE185D" },
  Closed:      { color: "#6B7280" },
};
