// Folio — shared data layer for the lease abstraction platform.
// Roles, altitudes, leases (the "incidents"), extraction templates, controls, pipeline signals.

// ─── ALTITUDE LADDER ──────────────────────────────────────────────────────
// 0 Ground (abstractor)  1 Lead  2 Manager  3 Director  4 SrDir  5 Exec  6 CEO
window.ROLES = [
  { id: "abstractor",    label: "Lease Abstractor (T1)",         short: "Abstractor",   altitude: 0, dept: "ops",   initials: "MR", name: "Mira Reyes",       tz: "EST" },
  { id: "sr_abstractor", label: "Sr. Lease Abstractor (QA)",     short: "Sr Abstractor",altitude: 0, dept: "ops",   initials: "DV", name: "Diana Voss",       tz: "EST" },
  { id: "pipeline_lead", label: "Pipeline Lead (ML/Data)",       short: "Pipeline Lead",altitude: 1, dept: "ml",    initials: "PV", name: "Priya Venkat",     tz: "PST" },
  { id: "legal_reviewer",label: "Legal Reviewer (counsel)",       short: "Legal Review", altitude: 1, dept: "legal", initials: "JT", name: "Jordan Tan, Esq.", tz: "EST" },
  { id: "qa_lead",       label: "QA & Accuracy Lead",            short: "QA Lead",      altitude: 1, dept: "ops",   initials: "AO", name: "Aisha Okafor",     tz: "EST" },
  { id: "platform_eng",  label: "Platform Engineering Lead",     short: "Platform Eng", altitude: 1, dept: "eng",   initials: "RB", name: "Ricardo Bauer",    tz: "CST" },
  { id: "ops_manager",   label: "Abstraction Ops Manager",       short: "Ops Manager",  altitude: 2, dept: "ops",   initials: "HN", name: "Henry Nakamura",   tz: "EST" },
  { id: "grc",           label: "Lease Compliance Director",     short: "Compliance",   altitude: 3, dept: "grc",   initials: "EM", name: "Elena Marsh",      tz: "EST" },
  { id: "dir_portfolio", label: "Director, Portfolio Intelligence", short: "Director",  altitude: 3, dept: "exec",  initials: "SC", name: "Sarah Chen",       tz: "EST" },
  { id: "vp_tenant",     label: "VP, Tenant Operations",         short: "VP Tenant Ops",altitude: 4, dept: "exec",  initials: "MA", name: "Marcus Adeyemi",   tz: "EST" },
  { id: "coo",           label: "COO",                            short: "COO",          altitude: 5, dept: "exec",  initials: "LP", name: "Lena Petrova",     tz: "EST" },
  { id: "cdo",           label: "Chief Data Officer",            short: "CDO",          altitude: 5, dept: "exec",  initials: "RS", name: "Raj Sundaram",     tz: "EST" },
  { id: "ceo",           label: "CEO",                            short: "CEO",          altitude: 6, dept: "exec",  initials: "VW", name: "Victoria Wexler",  tz: "EST" },
];

window.ALTITUDE_LABELS = ["Ground", "Lead", "Manager", "Director", "Sr Director", "Executive", "C-Suite"];

window.DEPARTMENTS = {
  ops:   { label: "Abstraction Operations", color: "#1A1714", head: 38, openJobs: 47 },
  legal: { label: "Legal Review",           color: "#8B3A1F", head: 6,  openJobs: 9 },
  ml:    { label: "ML / Data Platform",     color: "#2A4E8F", head: 11, openJobs: 0 },
  eng:   { label: "Platform Engineering",   color: "#2F4C2A", head: 14, openJobs: 2 },
  grc:   { label: "Compliance & Audit",     color: "#B5651D", head: 8,  openJobs: 1 },
  exec:  { label: "Executive Leadership",   color: "#1A1714", head: 7,  openJobs: 0 },
};

// ─── NAV ──────────────────────────────────────────────────────────────────
window.NAV_BY_ALTITUDE = {
  0: ["home", "queue", "templates", "training"],
  1: ["home", "queue", "templates", "pipeline", "training"],
  2: ["home", "queue", "altitude", "templates", "compliance", "pipeline", "training"],
  3: ["home", "altitude", "queue", "templates", "compliance", "pipeline", "reports"],
  4: ["home", "altitude", "queue", "compliance", "reports"],
  5: ["home", "altitude", "compliance", "reports"],
  6: ["home", "altitude", "reports"],
};

window.PAGE_META = {
  home:       { label: "Home",                icon: "home" },
  queue:      { label: "Abstraction Queue",   icon: "inbox" },
  altitude:   { label: "Altitude View",       icon: "layers" },
  templates:  { label: "Templates & Schemas", icon: "shield" },
  compliance: { label: "Compliance & Audit",  icon: "scale" },
  pipeline:   { label: "Pipeline Ops",        icon: "server" },
  training:   { label: "QA & Golden Corpus",  icon: "target" },
  reports:    { label: "Portfolio Reports",   icon: "chart" },
};

// ─── LEASE ABSTRACTION JOBS ───────────────────────────────────────────────
// The signature lease is LEASE-A-2491.
window.INCIDENTS = [
  {
    id: "LEASE-A-2491", title: "Acme Corporation — 1245 Park Ave, Floors 17–22",
    kind: "office_nnn", severity: "Critical", status: "Reviewing", dept: "ops",
    asset: "1245 Park Ave · 287,400 RSF · NNN", assignee: "Diana Voss (Sr QA)",
    openedAt: "2026-05-22 09:02 UTC", mttdMin: 4, ageMin: 142,
    template: "OFFICE-NNN-2024", clauseFlags: "§17.4 · §22 · Ex-D",
    source: "Tenant portal upload · 187pp", confidence: 94,
    fintechTags: ["Top-5 tenant", "CPI floor language", "$48.2M ARR"],
    blastRadius: { properties: 1, floors: 6, fields: 73, exhibits: 23 },
    dollarsAtRisk: 48_200_000,
    sla: { ingest: "ok", extract: "at-risk", validate: "ok" },
    summary: "Master office lease, 12-yr initial term + (2)×5-yr options. §17.4 rent escalation uses CPI-with-floor language the model has not seen in training corpus; 4 fields require human review.",
    timeline: [
      { t: "09:02:44", who: "Ingest",        what: "PDF received · 187 pages · OCR queued" },
      { t: "09:04:11", who: "Chunker",       what: "Segmented to 28 sections + 23 exhibits. Article structure detected." },
      { t: "09:06:18", who: "Embedder",      what: "1,242 chunks embedded · stored to pgvector (lease_chunks_2026)" },
      { t: "09:11:40", who: "Extractor",    what: "OFFICE-NNN-2024 template matched (cosine 0.91). 73 fields extracted." },
      { t: "09:14:09", who: "Validator",     what: "4 fields flagged: §17.4 escalation, §22 SNDA, §31 ROFR, Ex-D parking allocation." },
      { t: "09:17:22", who: "Mira R. (T1)",  what: "Acknowledged. Pulled §17.4 source chunk + 3 few-shot precedents from corpus." },
      { t: "09:28:55", who: "Diana V. (QA)", what: "Escalated CPI floor — uncommon clause, needs Legal sign-off." },
    ],
  },
  {
    id: "LEASE-A-2487", title: "Westfield Galleria · Anchor Sears Replacement — Macy's",
    kind: "retail_anchor", severity: "Critical", status: "Extracting", dept: "ops",
    asset: "Westfield Galleria · 142,000 RSF anchor", assignee: "Jordan Tan (Legal)",
    openedAt: "2026-05-22 07:48 UTC", mttdMin: 1, ageMin: 218,
    template: "RETAIL-ANCHOR-2024", clauseFlags: "§6 Exclusive · §11 Co-tenancy",
    source: "Tenant counsel · 94pp", confidence: 88,
    fintechTags: ["Co-tenancy trigger", "Exclusive use", "Percentage rent"],
    blastRadius: { properties: 1, floors: 2, fields: 81, exhibits: 11 },
    dollarsAtRisk: 14_400_000,
    sla: { ingest: "ok", extract: "ok", validate: "ok" },
    summary: "Anchor lease with kick-out tied to 60% co-tenancy floor; percentage rent breakpoint $42M, escalator 102%/yr.",
  },
  {
    id: "LEASE-A-2483", title: "DC Industrial Park · Building 4 ground lease",
    kind: "ground", severity: "Critical", status: "Validating", dept: "legal",
    asset: "DC Industrial Park · 18.4 acres", assignee: "Jordan Tan (Legal)",
    openedAt: "2026-05-22 03:42 UTC", mttdMin: 6, ageMin: 504,
    template: "GROUND-LEASE-2024", clauseFlags: "§24 Reversion · §29 Leasehold Mortgage",
    source: "Counsel · 142pp + 18 amendments", confidence: 99,
    fintechTags: ["99-year term", "Leasehold mortgage rights", "Reversion clause"],
    blastRadius: { properties: 1, floors: 0, fields: 96, exhibits: 18 },
    dollarsAtRisk: 240_000_000,
    sla: { ingest: "ok", extract: "ok", validate: "at-risk" },
    summary: "99-year ground lease originated 1987 + 18 amendments. ntds-style fan-out: every amendment cascades into base terms. Validator reconciling Amendment 14 (rent reset) against §4.2 base.",
  },
  {
    id: "LEASE-A-2478", title: "Card-CityCenter Retail — 1,847 SF inline kiosks bulk batch",
    kind: "retail_inline", severity: "High", status: "Extracting", dept: "ops",
    asset: "CityCenter · 18 inline tenants", assignee: "Mira Reyes (T1)",
    openedAt: "2026-05-22 06:21 UTC", mttdMin: 2, ageMin: 305,
    template: "RETAIL-INLINE-2024", clauseFlags: "—",
    source: "Property mgr batch · 18 docs", confidence: 82,
    fintechTags: ["Bulk batch", "Standardized form", "Velocity threshold"],
    blastRadius: { properties: 1, floors: 1, fields: 312, exhibits: 0 },
    dollarsAtRisk: 8_600_000,
    sla: { ingest: "ok", extract: "ok", validate: "ok" },
    summary: "Bulk batch of 18 inline retail leases on landlord's standard form. Model confidence 82% across batch; 312 fields, 11 require review.",
  },
  {
    id: "LEASE-A-2472", title: "Maple Tower · Q2 rent roll re-abstraction (84 units)",
    kind: "multifamily", severity: "High", status: "Extracting", dept: "ops",
    asset: "Maple Tower · 84 multifamily units", assignee: "Ricardo Bauer (Platform)",
    openedAt: "2026-05-22 04:55 UTC", mttdMin: 1, ageMin: 391,
    template: "MULTIFAMILY-2024", clauseFlags: "—",
    source: "Yardi export · CSV+PDF", confidence: 99,
    fintechTags: ["Standardized", "Customer-facing", "Acquisition closing"],
    blastRadius: { properties: 1, floors: 12, fields: 1480, exhibits: 0 },
    dollarsAtRisk: 0,
    sla: { ingest: "ok", extract: "ok", validate: "ok" },
    summary: "Acquisition diligence: 84 units, 12 floors, $2.4M monthly GPR. Yardi export reconciled against PDFs; 100% match.",
  },
  {
    id: "LEASE-A-2466", title: "Sublease batch · WeFloor co-working — 14 desks",
    kind: "sublease", severity: "High", status: "Ingesting", dept: "ops",
    asset: "350 Mission · 14 desk subleases", assignee: "Mira Reyes (T1)",
    openedAt: "2026-05-22 05:30 UTC", mttdMin: 3, ageMin: 356,
    template: "SUBLEASE-2024", clauseFlags: "Sublandlord consent",
    source: "Brokerage upload · 14 docs", confidence: 91,
    fintechTags: ["Sublandlord chain", "Consent letter", "Short-form"],
    blastRadius: { properties: 1, floors: 1, fields: 196, exhibits: 0 },
    dollarsAtRisk: 0,
    sla: { ingest: "ok", extract: "ok", validate: "ok" },
    summary: "Short-form coworking sublease batch. Sublandlord chain verified, consent letters attached. Standard pattern.",
  },
  {
    id: "LEASE-A-2458", title: "Estoppel — Goldman Tower (refinance closing Thu)",
    kind: "estoppel", severity: "High", status: "Validating", dept: "legal",
    asset: "Goldman Tower · 41 estoppels", assignee: "Jordan Tan (Legal)",
    openedAt: "2026-05-22 14:08 UTC", mttdMin: 1, ageMin: 17,
    template: "ESTOPPEL-2024", clauseFlags: "Defaults disclosed · TI receivable",
    source: "Lender request · 41 docs", confidence: 98,
    fintechTags: ["Closing dependent", "Lender requirement", "Default disclosure"],
    blastRadius: { properties: 1, floors: 32, fields: 574, exhibits: 0 },
    dollarsAtRisk: 1_200_000,
    sla: { ingest: "ok", extract: "ok", validate: "ok" },
    summary: "41 tenant estoppel certificates for $312M refinance. Cross-reconciled against base leases. 2 disclose outstanding TI receivables; flagged for borrower.",
  },
  {
    id: "LEASE-A-2451", title: "Amendment 7 — Northshore Industrial expansion",
    kind: "amendment", severity: "Medium", status: "Abstracted", dept: "ops",
    asset: "Northshore Industrial · +120k SF", assignee: "Mira Reyes (T1)",
    openedAt: "2026-05-21 23:14 UTC", mttdMin: 2, ageMin: 1100,
    template: "AMENDMENT-2024", clauseFlags: "—",
    source: "Tenant counsel · 14pp", confidence: 90,
    fintechTags: ["Expansion", "Term extension", "Rent reset"],
    blastRadius: { properties: 1, floors: 0, fields: 24, exhibits: 1 },
    dollarsAtRisk: 0,
    sla: { ingest: "ok", extract: "ok", validate: "ok" },
    summary: "Expansion amendment + 5-yr extension. Rent reset to fair market with cap. Reconciled to base lease (LEASE-2014-0419).",
  },
  {
    id: "LEASE-A-2444", title: "SNDA — Bedford office refi (regional bank)",
    kind: "snda", severity: "Medium", status: "Extracting", dept: "legal",
    asset: "Bedford office · 1 SNDA", assignee: "Jordan Tan (Legal)",
    openedAt: "2026-05-22 11:14 UTC", mttdMin: 1, ageMin: 30,
    template: "SNDA-2024", clauseFlags: "Non-disturbance",
    source: "Lender · 6pp", confidence: 70,
    fintechTags: ["Lender form", "Non-standard"],
    blastRadius: { properties: 1, floors: 0, fields: 18, exhibits: 0 },
    dollarsAtRisk: 0,
    sla: { ingest: "ok", extract: "ok", validate: "ok" },
    summary: "Lender-provided SNDA, non-standard form. Three carve-outs to non-disturbance that depart from market.",
  },
  {
    id: "LEASE-A-2438", title: "Office gross — Bradford Building 3rd-floor admin",
    kind: "office_gross", severity: "Medium", status: "Ingesting", dept: "ops",
    asset: "Bradford Building · 4,200 RSF", assignee: "Ricardo Bauer (Platform)",
    openedAt: "2026-05-22 02:01 UTC", mttdMin: 7, ageMin: 565,
    template: "OFFICE-GROSS-2024", clauseFlags: "—",
    source: "Broker upload · 38pp", confidence: 65,
    fintechTags: ["Small footprint", "Gross with expense stop"],
    blastRadius: { properties: 1, floors: 1, fields: 52, exhibits: 2 },
    dollarsAtRisk: 0,
    sla: { ingest: "ok", extract: "ok", validate: "ok" },
    summary: "Modified gross with $8.40/sf expense stop. OCR quality medium (scanned); awaiting redo at 600dpi.",
  },
  {
    id: "LEASE-A-2429", title: "Letter of Intent — Berlin coffee chain expansion (advisory)",
    kind: "loi", severity: "Low", status: "Abstracted", dept: "ops",
    asset: "Pre-lease · LOI only", assignee: "Mira Reyes (T1)",
    openedAt: "2026-05-21 18:00 UTC", mttdMin: 11, ageMin: 1400,
    template: "LOI-2024", clauseFlags: "—",
    source: "Brokerage · 4pp", confidence: 99,
    fintechTags: ["Non-binding", "Advisory"],
    blastRadius: { properties: 0, floors: 0, fields: 14, exhibits: 0 },
    dollarsAtRisk: 0,
    sla: { ingest: "ok", extract: "ok", validate: "ok" },
    summary: "Standard non-binding LOI. Auto-extracted, no review needed.",
  },
];

// ─── SIGNATURE: ALTITUDE VIEW (LEASE-A-2491 across all altitudes) ─────────
// What does the SAME lease abstraction look like at each tier?
window.ALTITUDE_VIEWS = {
  "LEASE-A-2491": {
    abstractor: {
      title: "Abstractor Console",
      headline: "§17.4 Rent Escalation — CPI-with-floor, model uncertain",
      framing: "What you do next, with the source chunk pinned and three precedents loaded.",
      keyMetric: { label: "Time-on-clause", value: "00:04:17", note: "SLA: review ≤8m / clause" },
      lens: "One clause at a time. Source chunk pinned to extracted JSON, with the few-shot precedents that matched.",
      callout: "Accept the model's escalator (3.0%) or override with CPI+floor logic. Three precedents loaded — Acme 2017, Sunfield 2019, Beacon 2021.",
      decisions: [
        "Confirm escalator method (CPI vs fixed vs greater-of)",
        "Set CPI floor (3.0%) and CPI ceiling (6.0%)",
        "Choose base year (lease year 1 vs commencement)",
        "Escalate to Sr QA if precedent set splits 2-1",
      ],
    },
    sr_abstractor: {
      title: "QA Console",
      headline: "OFFICE-NNN-2024 template fit 0.91 cosine · 4 of 73 fields flagged",
      framing: "Pattern across the doc. Where is the model confidently wrong, and where uncertain-but-right?",
      keyMetric: { label: "Field confidence floor", value: "84%", note: "Min across 73 fields · target ≥90%" },
      lens: "Whole-document review. Field-level confidence map + cross-clause consistency (§17.4 + Ex-D agree).",
      callout: "Cross-check §17.4 (escalator) against Ex-D (parking allocation rent). Both reference base year — model used different bases.",
      decisions: [
        "Reconcile §17.4 vs Ex-D base year",
        "Promote new clause pattern to corpus if CPI-floor recurs",
        "Sign off, send to Legal for §22 SNDA",
        "Open a template note: 'CPI floor pattern'",
      ],
    },
    pipeline_lead: {
      title: "Pipeline Floor",
      headline: "1,242 chunks · 73 fields · OFFICE-NNN-2024 won by 0.18 over OFFICE-GROSS",
      framing: "Did the pipeline behave? Where did confidence drop and why?",
      keyMetric: { label: "Cosine to nearest template", value: "0.91", note: "OFFICE-NNN-2024 · next 0.73 OFFICE-GROSS" },
      lens: "Pipeline-level: chunker boundaries, embedder version, template-match scores, prompt token usage.",
      callout: "Chunker hit on Article 17 → 17.4 boundary cleanly. §17.4 chunk contained the CPI-floor clause + 3 sentences of context — sufficient for extraction but model still hedged. Worth a few-shot.",
      decisions: [
        "Add CPI-floor exemplar to OFFICE-NNN-2024 corpus (vector)",
        "Promote chunker v3.1 to prod (boundary recall +2.3%)",
        "Lock embedding model version for Q3 audit",
        "Investigate §22 SNDA confidence dip (0.61)",
      ],
    },
    ops_manager: {
      title: "Operations Overview",
      headline: "1 critical in review · throughput 4.1 leases/day · SLA on target",
      framing: "Capacity, accuracy, exposure.",
      keyMetric: { label: "Accuracy this week", value: "99.2%", note: "Target ≥99% · ↑0.4 w/w" },
      lens: "All jobs at once. Throughput, accuracy by template, queue depth, capacity.",
      callout: "Capacity tight: 2 of 38 abstractors on PTO. Acme batch is 1 of 7 active critical jobs. Goldman estoppels close Thu — protected slot.",
      decisions: [
        "Approve overtime for Goldman estoppel sprint",
        "Brief Director at the 10:00 standup",
        "Flag CPI-floor pattern to Templates team",
        "Submit Q3 capacity ask for 4 additional T1 abstractors",
      ],
    },
    dir_portfolio: {
      title: "Portfolio Intelligence",
      headline: "Acme = $312M ARR across 9 leases · this abstraction lights up 4 portfolio queries",
      framing: "What does this lease tell us about the portfolio?",
      keyMetric: { label: "Acme ARR · portfolio", value: "$312M", note: "9 leases · 4.1% of book" },
      lens: "Portfolio-level: tenant concentration, clause-pattern incidence, vector-similar leases.",
      callout: "pgvector returns 7 other leases with similar CPI-floor clauses (Sunfield, Beacon, …). If Acme renews under same terms, $89M ARR shifts to floor-protected.",
      decisions: [
        "Open portfolio query: CPI-floor exposure",
        "Tag Acme as renewal-watch (18mo out)",
        "Greenlight OFFICE-NNN-2024 v2 sprint",
        "Brief VP Tenant Ops at QBR",
      ],
    },
    vp_tenant: {
      title: "Tenant Operations",
      headline: "Top-5 tenant lease re-abstracted clean · zero downstream re-billing",
      framing: "Initiatives, tenant risk, leadership narrative.",
      keyMetric: { label: "Top-10 tenant ARR", value: "$1.84B", note: "Acme #4 · stable" },
      lens: "Initiative tracking, audit-readiness, tenant-relationship narrative.",
      callout: "Acme renewal cycle opens Nov. CPI-floor language reads as floor for them — ceiling for us. Quietly bring forward to QBR.",
      decisions: [
        "Approve OFFICE-NNN-2024 template refresh",
        "Move Acme renewal into proactive workstream",
        "Briefing pack for COO weekly",
        "Sign off on Q3 portfolio narrative",
      ],
    },
    grc: {
      title: "Compliance Posture",
      headline: "Lease abstracted to ASC 842 standard · audit trail intact · 4 human overrides logged",
      framing: "Is the abstraction audit-defensible? What's our regulatory and accounting exposure?",
      keyMetric: { label: "Audit trail coverage", value: "100%", note: "every field · source chunk + reviewer" },
      lens: "Control coverage, audit defensibility, ASC 842 / IFRS 16 conformance.",
      callout: "Control C-117 (clause-level provenance) prevented a hallucinated escalator from reaching the GL. Every field has a source chunk and a reviewer.",
      decisions: [
        "Approve evidence pack for Acme audit file",
        "Confirm ASC 842 reportable change · none",
        "Sign off on accuracy attestation for Q2",
        "Update SOX walkthrough script",
      ],
    },
    coo: {
      title: "Operating Posture",
      headline: "Top-tenant lease through the pipeline clean · $48M ARR locked correctly",
      framing: "Is the platform working? Is the team running well?",
      keyMetric: { label: "Realized error YTD", value: "$0", note: "Budget $4.8M · 0% utilization" },
      lens: "Dollars under management, accuracy attestation, ops health.",
      callout: "C-117 (provenance) held. We caught a CPI-floor pattern Kira-style competitors would have missed. Worth a customer story.",
      decisions: [
        "Approve emergency comms to Acme (none required)",
        "Confirm renewal cycle handoff to VP Tenant Ops",
        "Sign off on $1.2M model refresh budget",
        "Board talking points for Thursday",
      ],
    },
    cdo: {
      title: "Data & Model Health",
      headline: "Template match clean · 4 corpus-worthy patterns identified",
      framing: "Are the model, corpus, and platform earning their keep?",
      keyMetric: { label: "Model accuracy · 30d", value: "99.2%", note: "Hallucination rate 0.04% · ↓0.01" },
      lens: "Model quality, corpus growth, embedding cost, vendor exposure.",
      callout: "Section-level chunking is the win — token-arbitrary chunking would have split §17.4 mid-clause and the floor language would be lost. The architecture is doing what we said it would.",
      decisions: [
        "Lock OFFICE-NNN-2024 corpus version for Q3 audit",
        "Greenlight pgvector cluster scale to 14M chunks",
        "Confirm embedding-model contract renewal",
      ],
    },
    ceo: {
      title: "Today",
      headline: "Portfolio is healthy. One top-5 tenant lease abstracted, every field auditable.",
      framing: "Trust, money, regulators, customers.",
      keyMetric: { label: "Realized abstraction error YTD", value: "Zero", note: "$0 disputed · 0 customers affected" },
      lens: "Three numbers. One sentence. One thing to know.",
      callout: "A complex top-tenant lease came in this morning. Our system abstracted it correctly, flagged the four clauses worth a human eye, and logged a source citation for every number. Lena will mention it to the audit committee Thursday.",
      decisions: [
        "Acknowledge briefing from Lena",
        "No external comms required",
        "Continue scheduled programming",
      ],
    },
  },
};

// ─── TEMPLATES (Detection Engineering → Templates & Schemas) ──────────────
// "Template" = JSON extraction schema + few-shot example corpus (vectorized).
window.DETECTIONS = [
  { id: "OFFICE-NNN-2024",   name: "Office · NNN (industry standard)",        stage: "production", owner: "Priya V.", fpRate: 1.1, tpLastWeek: 14, mitre: "47 fields · §17 escalation hot", lastTuned: "2026-05-08", health: "review" },
  { id: "OFFICE-GROSS-2024", name: "Office · Modified Gross + expense stop",  stage: "production", owner: "Priya V.", fpRate: 0.4, tpLastWeek: 9,  mitre: "41 fields · §6 expense stop hot", lastTuned: "2026-04-22", health: "prod" },
  { id: "RETAIL-ANCHOR-2024",name: "Retail · Anchor (co-tenancy, exclusives)",stage: "production", owner: "Kai L.",   fpRate: 1.4, tpLastWeek: 3,  mitre: "58 fields · §11 co-tenancy hot", lastTuned: "2026-03-30", health: "prod" },
  { id: "RETAIL-INLINE-2024",name: "Retail · Inline (landlord standard form)",stage: "production", owner: "Priya V.", fpRate: 0.8, tpLastWeek: 23, mitre: "32 fields · standard form", lastTuned: "2026-05-12", health: "prod" },
  { id: "INDUSTRIAL-NNN-2024",name:"Industrial · NNN warehouse/logistics",   stage: "production", owner: "Kai L.",   fpRate: 0.6, tpLastWeek: 11, mitre: "39 fields · §3 use restriction", lastTuned: "2026-05-19", health: "prod" },
  { id: "OFFICE-NNN-CPI-V2", name: "Office NNN · CPI-floor variant (staging)",stage: "staging",    owner: "Priya V.", fpRate: 0.3, tpLastWeek: 0,  mitre: "+ §17 floor/ceiling subfields", lastTuned: "2026-05-20", health: "staging" },
  { id: "GROUND-LEASE-2024", name: "Ground lease (long-term, amendments)",    stage: "production", owner: "Kai L.",   fpRate: 4.2, tpLastWeek: 2,  mitre: "84 fields · amend. cascade", lastTuned: "2026-02-14", health: "noisy" },
  { id: "MULTIFAMILY-2024",  name: "Multifamily standard (Yardi-compatible)",  stage: "production", owner: "Sam O.",   fpRate: 0.2, tpLastWeek: 84, mitre: "22 fields · CSV reconcile", lastTuned: "2026-05-01", health: "prod" },
  { id: "SUBLEASE-2024",     name: "Sublease (consent + chain)",                stage: "production", owner: "Priya V.", fpRate: 0.0, tpLastWeek: 6,  mitre: "26 fields · short-form", lastTuned: "2026-05-18", health: "prod" },
  { id: "ESTOPPEL-2024",     name: "Estoppel certificate (lender / refi)",     stage: "production", owner: "Sam O.",   fpRate: 0.5, tpLastWeek: 41, mitre: "14 fields · defaults flag", lastTuned: "2026-04-29", health: "prod" },
  { id: "SNDA-2024",         name: "SNDA (Subordination/Non-disturbance)",     stage: "production", owner: "Kai L.",   fpRate: 2.6, tpLastWeek: 4,  mitre: "9 fields · carve-outs varied", lastTuned: "2026-04-29", health: "prod" },
  { id: "AMENDMENT-2024",    name: "Amendment (reconcile to base lease)",      stage: "production", owner: "Priya V.", fpRate: 1.2, tpLastWeek: 8,  mitre: "delta-style · cascades", lastTuned: "2026-05-21", health: "prod" },
  { id: "LOI-2024",          name: "LOI (non-binding, term sheet)",            stage: "production", owner: "Sam O.",   fpRate: 0.1, tpLastWeek: 31, mitre: "14 fields · advisory only", lastTuned: "2026-05-21", health: "prod" },
  { id: "OFFICE-LIFE-SCI",   name: "Office · Life-sciences specials (draft)",  stage: "dev",        owner: "Kai L.",   fpRate: 0.0, tpLastWeek: 0,  mitre: "+ lab buildout, vent specs", lastTuned: "2026-05-21", health: "draft" },
];

window.MITRE_COVERAGE = [
  // 12 clause categories, coverage by template corpus.
  { tactic: "Premises & Use",         covered: 96 },
  { tactic: "Term & Commencement",    covered: 99 },
  { tactic: "Base Rent",              covered: 98 },
  { tactic: "Operating Expenses / CAM", covered: 84 },
  { tactic: "Escalation (CPI/fixed)", covered: 78 },
  { tactic: "Renewal Options",        covered: 91 },
  { tactic: "Assignment & Sublease",  covered: 88 },
  { tactic: "Default & Remedies",     covered: 71 },
  { tactic: "Insurance & Indemnity",  covered: 79 },
  { tactic: "Surrender / Holdover",   covered: 55 },
  { tactic: "Special Rights (ROFR/ROFO)", covered: 62 },
  { tactic: "Estoppel / SNDA",        covered: 84 },
];

// ─── COMPLIANCE & AUDIT ───────────────────────────────────────────────────
window.FRAMEWORKS = [
  { id: "asc842", label: "ASC 842 · Lease Accounting",   coverage: 96, controls: 38,  gaps: 2,  cadence: "Quarterly",   nextAudit: "2026-07-15", risk: "low" },
  { id: "ifrs16", label: "IFRS 16 · International",      coverage: 94, controls: 31,  gaps: 3,  cadence: "Annual",      nextAudit: "2026-09-30", risk: "low" },
  { id: "sox",    label: "SOX ITGC (audit trail)",       coverage: 92, controls: 142, gaps: 9,  cadence: "Quarterly",   nextAudit: "2026-07-15", risk: "medium" },
  { id: "soc2",   label: "SOC 2 Type II",                coverage: 93, controls: 64,  gaps: 5,  cadence: "Annual",      nextAudit: "2026-10-12", risk: "low" },
  { id: "iso",    label: "ISO 27001:2022",               coverage: 86, controls: 93,  gaps: 12, cadence: "Surveillance",nextAudit: "2026-08-20", risk: "medium" },
  { id: "gdpr",   label: "GDPR · tenant PII",            coverage: 91, controls: 47,  gaps: 4,  cadence: "Continuous",  nextAudit: "—",          risk: "low" },
  { id: "redi",   label: "REDI · clause taxonomy v3",    coverage: 89, controls: 27,  gaps: 3,  cadence: "Industry",    nextAudit: "—",          risk: "low" },
];

window.CONTROLS = [
  { id: "C-117", title: "Clause-level provenance (every field cites a chunk)", frameworks: ["SOX", "ASC 842", "SOC 2"], status: "passing", lastTest: "2026-05-15", evidence: 14 },
  { id: "C-203", title: "Reviewer attestation on flagged fields",              frameworks: ["SOX", "ASC 842"],          status: "passing", lastTest: "2026-05-17", evidence: 28 },
  { id: "C-411", title: "Model + corpus version pinning per job",              frameworks: ["SOC 2", "ISO"],            status: "passing", lastTest: "2026-05-19", evidence: 9 },
  { id: "C-218", title: "Quarterly accuracy attestation (≥99%)",               frameworks: ["SOX"],                     status: "passing", lastTest: "2026-05-12", evidence: 5 },
  { id: "C-330", title: "ASC 842 lease classification check (op vs finance)",  frameworks: ["ASC 842"],                 status: "passing", lastTest: "2026-05-20", evidence: 11 },
  { id: "C-602", title: "PII redaction in tenant docs (SSN/EIN/DOB)",          frameworks: ["GDPR"],                    status: "passing", lastTest: "2026-05-10", evidence: 22 },
  { id: "C-119", title: "Reviewer access auto-expiry (14d, privileged docs)",  frameworks: ["SOX", "SOC 2"],            status: "failing", lastTest: "2026-05-21", evidence: 3, finding: "LEASE-A-2444: reviewer access not revoked after 14d" },
  { id: "C-441", title: "Amendment reconciliation back to base lease",         frameworks: ["ASC 842", "SOX"],          status: "at-risk", lastTest: "2026-05-22", evidence: 1, finding: "LEASE-A-2483: Amendment 14 base-year reconciliation pending" },
  { id: "C-512", title: "Hallucination guard · cite-or-decline policy",        frameworks: ["SOC 2"],                   status: "passing", lastTest: "2026-05-22", evidence: 17 },
  { id: "C-707", title: "Tenant PII access logging (per-clause)",              frameworks: ["GDPR"],                    status: "passing", lastTest: "2026-05-22", evidence: 6 },
];

// ─── PIPELINE OPS (was IT_SIGNALS) ────────────────────────────────────────
window.IT_SIGNALS = [
  { id: "ingest", name: "Ingest · OCR + PDF normalization",     status: "healthy",  value: "98.4% first-pass OCR", note: "Tesseract+Donut hybrid" },
  { id: "chunk",  name: "Chunker · article / section / exhibit", status: "watch",    value: "1,242 chunks · LEASE-2491", note: "v3.0 in prod · v3.1 in staging" },
  { id: "embed",  name: "Embedder · text-embedding-3 (1536-d)",  status: "healthy",  value: "p95 142ms",            note: "84M chunks indexed" },
  { id: "store",  name: "pgvector · lease_chunks_2026",          status: "healthy",  value: "84M rows · 312GB",     note: "ivfflat lists=1000" },
  { id: "extract",name: "Extractor · schema-guided LLM call",    status: "watch",    value: "0.04% hallucination",  note: "Cite-or-decline policy on" },
  { id: "validate",name:"Validator · schema + cross-clause",     status: "healthy",  value: "4 flags / LEASE-2491",  note: "Human-in-the-loop on flags" },
  { id: "audit",  name: "Audit log · clause provenance",          status: "healthy",  value: "100% citation coverage", note: "Append-only · S3 immutable" },
  { id: "vendor", name: "Model vendor concentration",            status: "watch",    value: "single-provider 78%",   note: "RFP for embedding redundancy" },
];

// ─── EXEC METRICS ─────────────────────────────────────────────────────────
window.EXEC_METRICS = {
  customersAffectedToday: 0,
  fundsMovedFraudulently: 0,
  systemAvailability30d: 99.987,
  riskScore: 62,
  riskScoreDelta: -6,
  realizedLossYTD: 0,
  realizedLossBudget: 4_800_000,
  openCriticals: 3,
  contained: 3,
  inFlight: 0,
  regulatoryExposure: "None reportable",
  nextBoardBrief: "Thu, May 28 · 10:00 ET",
  totalARR: 14_800_000_000,
  leasesUnderMgmt: 6_412,
};

// ─── KIND ICON + COLOR MAP (lease type) ───────────────────────────────────
window.KIND_META = {
  office_nnn:    { label: "Office · NNN",      color: "#1A1714", glyph: "▤" },
  office_gross:  { label: "Office · Gross",     color: "#4A463F", glyph: "▥" },
  retail_anchor: { label: "Retail · Anchor",    color: "#8B3A1F", glyph: "◧" },
  retail_inline: { label: "Retail · Inline",    color: "#B5651D", glyph: "▢" },
  industrial:    { label: "Industrial · NNN",   color: "#2A4E8F", glyph: "⏛" },
  ground:        { label: "Ground lease",       color: "#2F4C2A", glyph: "▦" },
  sublease:      { label: "Sublease",           color: "#6E6960", glyph: "↪" },
  amendment:     { label: "Amendment",          color: "#9C968B", glyph: "+" },
  estoppel:      { label: "Estoppel",           color: "#2A4E8F", glyph: "§" },
  snda:          { label: "SNDA",               color: "#8B3A1F", glyph: "⚖" },
  multifamily:   { label: "Multifamily",        color: "#2F4C2A", glyph: "▤" },
  loi:           { label: "LOI",                color: "#9C968B", glyph: "·" },
};

window.SEV_META = {
  Critical: { color: "#B0301A", bg: "#FAEEEA", label: "Critical" },
  High:     { color: "#B5651D", bg: "#FCF1E1", label: "High" },
  Medium:   { color: "#2A4E8F", bg: "#ECF0F8", label: "Medium" },
  Low:      { color: "#6E6960", bg: "#F1EEE7", label: "Low" },
};

window.STATUS_META = {
  Ingesting:   { color: "#2A4E8F" },
  Chunking:    { color: "#2A4E8F" },
  Extracting:  { color: "#B5651D" },
  Validating:  { color: "#B5651D" },
  Reviewing:   { color: "#8B3A1F" },
  Abstracted:  { color: "#2F6F3C" },
};
