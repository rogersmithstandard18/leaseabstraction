import { useState, useEffect, useRef } from "react";

const ROLES = [
  { id: "t1", label: "Tier 1 — Junior Analyst", color: "#1D9E75", bg: "#E1F5EE", border: "#5DCAA5", desc: "Triage & escalation decisions" },
  { id: "t2", label: "Tier 2 — Investigator", color: "#185FA5", bg: "#E6F1FB", border: "#85B7EB", desc: "Correlation & containment" },
  { id: "t3", label: "Tier 3 — Threat Hunter", color: "#7B3FA8", bg: "#F3EBF9", border: "#C49EE0", desc: "Hunt & proactive defense" },
];

const SATO = [
  { id: "situation", label: "Situation", placeholder: "What is happening? What system, user, alert type fired?", hint: "Be specific — name the host, user, and what the SIEM rule detected." },
  { id: "action", label: "Action", placeholder: "What is your first concrete step?", hint: "No vague verbs. What exactly are you doing first?" },
  { id: "tool", label: "Tool / Log / Event ID", placeholder: "What specific tool, Event ID, or data source are you using?", hint: "Name it exactly — Event ID 4688, EDR telemetry, firewall ACL, etc." },
  { id: "outcome", label: "Outcome / Decision", placeholder: "What do you decide and why?", hint: "Escalate, isolate, close, revoke — and your specific reasoning." },
];

const FALLBACKS = {
  t1: {
    incidentId: "INC-4471", severity: "High",
    siemAlert: { ruleName: "Multiple Failed Logins Followed by Success", ruleType: "Behavioral", firedAt: "2026-05-05 23:14:32 UTC", host: "CORP-WKS-042", ip: "10.0.1.42", user: "jsmith", rawLog: "2026-05-05 23:11:14 UTC EventID=4625 host=CORP-WKS-042 user=jsmith src_ip=185.220.101.42 status=FAILED logon_type=3\n2026-05-05 23:11:31 UTC EventID=4625 host=CORP-WKS-042 user=jsmith src_ip=FAILED logon_type=3\n2026-05-05 23:14:32 UTC EventID=4624 host=CORP-WKS-042 user=jsmith src_ip=185.220.101.42 status=SUCCESS logon_type=3" },
    mitre: "T1078 — Valid Accounts", cve: null,
    playbookSOP: { title: "Credential Stuffing Response SOP", steps: ["Validate source IP reputation via AbuseIPDB or VirusTotal", "Confirm if source IP is a Tor exit node or known VPN provider", "Review auth log window — count failed attempts, note logon type and timing", "Check asset criticality and whether user has elevated privileges", "If confirmed malicious: reset password, push MFA, escalate to T2 for lateral movement check"] },
    workbook: { assetOwner: "Finance Department", assetCriticality: "High", lastPatchDate: "2026-04-01", openPorts: ["445/SMB", "3389/RDP"], recentChanges: "User jsmith granted temporary admin rights on 2026-04-28 — not yet revoked" },
    additionalData: { authEvents: "23:11:14 EventID=4625 jsmith FAILED from 185.220.101.42\n23:11:31 EventID=4625 jsmith FAILED from 185.220.101.42\n23:14:32 EventID=4624 jsmith SUCCESS from 185.220.101.42 logon_type=3", networkConnections: "23:14:45 CORP-WKS-042 → 185.220.101.42:443 ESTABLISHED\n23:15:02 CORP-WKS-042 → 10.0.1.1:445 SYN\n23:15:18 CORP-WKS-042 → 10.0.1.55:3389 SYN", processTree: "svchost.exe → cmd.exe → net.exe user /domain" },
    options: [
      { id: "a", label: "Escalate to T2 immediately", action: "Flag true positive, document indicators, notify T2 for lateral movement check", correct: true, explanation: "Correct. Tor exit node + off-hours + failed-then-success + unrevoked temp admin = high confidence true positive requiring lateral movement investigation." },
      { id: "b", label: "Close as false positive", action: "Mark benign, no further action", correct: false, explanation: "Never close a high-severity credential alert without checking source IP and correlating telemetry. SMB and RDP probes confirm this is active." },
      { id: "c", label: "Reset password only, close ticket", action: "Force password reset on jsmith, close incident", correct: false, explanation: "Incomplete. Password reset is correct but closing without investigating lateral movement leaves blast radius unknown." },
      { id: "d", label: "Monitor and observe", action: "Set watch alert, no immediate action", correct: false, explanation: "Incorrect. Active network connections to adjacent hosts are visible. Observing while the attacker moves laterally increases dwell time." }
    ],
    expectedTerms: ["Event ID 4624", "Event ID 4625", "Tor", "logon_type", "lateral movement", "escalate", "T2", "admin rights", "MFA", "AbuseIPDB"],
    afterActionReport: { whatHappened: "A threat actor used credential stuffing from a Tor exit node to authenticate as jsmith after 2 failed attempts. Once in, they immediately began probing adjacent hosts via SMB and RDP.", redTeamTTP: "Attacker purchased credentials from a breach database, routed through Tor, and leveraged unrevoked temp admin rights to begin lateral movement.", lessonsLearned: "Temporary privilege grants must have automatic expiration. Unrevoked admin rights turned a credential stuffing attempt into a potential domain compromise.", keyTerms: ["T1078", "Credential Stuffing", "Event ID 4624/4625", "Tor Exit Node", "Lateral Movement", "Temp Admin Rights"] }
  },
  t2: {
    incidentId: "INC-7823", severity: "Critical",
    siemAlert: { ruleName: "Suspicious Process Spawn on Domain Controller", ruleType: "Behavioral", firedAt: "2026-05-05 02:31:07 UTC", host: "DC-PROD-01", ip: "10.0.0.5", user: "SYSTEM", rawLog: "2026-05-05 02:31:07 UTC EventID=4688 host=DC-PROD-01 parent=services.exe child=cmd.exe cmdline=\"cmd.exe /c whoami && net user /domain\"\n2026-05-05 02:31:09 UTC EventID=4688 host=DC-PROD-01 parent=cmd.exe child=net.exe\n2026-05-05 02:31:22 UTC EventID=5145 host=DC-PROD-01 share=ADMIN$ access=WRITE src_host=CORP-WKS-019" },
    mitre: "T1021.002 — SMB/Windows Admin Shares", cve: "CVE-2017-0144",
    playbookSOP: { title: "Lateral Movement via SMB / Suspicious DC Process SOP", steps: ["Confirm services.exe → cmd.exe chain via EDR — critical process injection indicator", "Pull Event ID 5145 — identify which hosts are writing to ADMIN$ on the DC", "Check network telemetry: how many hosts are initiating SMB connections to DC-PROD-01?", "Assess patch status against CVE-2017-0144 (EternalBlue)", "Isolate originating host CORP-WKS-019, notify IR lead, preserve memory before reboot"] },
    workbook: { assetOwner: "IT Infrastructure — Domain Services", assetCriticality: "Critical", lastPatchDate: "2025-11-14", openPorts: ["445/SMB", "389/LDAP", "88/Kerberos"], recentChanges: "No change tickets logged for DC-PROD-01 in last 30 days" },
    additionalData: { authEvents: "02:31:05 EventID=4624 CORP-WKS-019→DC-PROD-01 logon_type=3 user=svc_backup NTLM\n02:31:06 EventID=4672 Special privileges assigned svc_backup on DC-PROD-01\n02:31:07 EventID=4688 services.exe spawned cmd.exe", networkConnections: "02:31:07 CORP-WKS-019:49201 → DC-PROD-01:445 ESTABLISHED\n02:31:22 DC-PROD-01:445 → CORP-WKS-031:445 SYN\n02:31:28 DC-PROD-01:445 → CORP-WKS-044:445 SYN", processTree: "services.exe → cmd.exe → net.exe user /domain\ncmd.exe → powershell.exe -enc SQBFAFgA..." },
    options: [
      { id: "a", label: "Isolate CORP-WKS-019 immediately", action: "Network isolate originating host, preserve memory, notify IR lead, block C2 at firewall", correct: true, explanation: "Correct. services.exe → cmd.exe on a DC with outbound SMB spread = active lateral movement. Isolate the source, not the DC — DC isolation breaks org-wide auth." },
      { id: "b", label: "Isolate DC-PROD-01", action: "Pull the domain controller off the network", correct: false, explanation: "Too aggressive. Isolating a DC breaks authentication for the entire organization. Isolate the originating host first." },
      { id: "c", label: "Monitor and gather more data", action: "Continue observing before acting", correct: false, explanation: "Incorrect. Active SMB spread to multiple hosts is happening right now. Every minute increases blast radius." },
      { id: "d", label: "Reset svc_backup credentials only", action: "Rotate the service account password", correct: false, explanation: "Insufficient. Credential rotation does not stop active lateral movement already in progress." }
    ],
    expectedTerms: ["Event ID 4688", "Event ID 5145", "services.exe", "cmd.exe", "ADMIN$", "CORP-WKS-019", "isolate", "IR lead", "SMB", "EternalBlue", "svc_backup"],
    afterActionReport: { whatHappened: "Attacker compromised CORP-WKS-019, used svc_backup via NTLM pass-the-hash to authenticate to the DC, and executed commands via SMB Admin Share. The DC began spreading the payload to adjacent workstations.", redTeamTTP: "EternalBlue-style SMB exploitation using an unmonitored service account. DC used as pivot to spread laterally across the domain.", lessonsLearned: "Service accounts with domain admin rights must be audited regularly. NTLM auth to DCs from workstations should trigger immediate alerts.", keyTerms: ["T1021.002", "Event ID 4688", "services.exe spawn", "Pass-the-Hash", "ADMIN$", "SMB Lateral Movement"] }
  },
  t3: {
    incidentId: "INC-9201", severity: "Critical",
    siemAlert: { ruleName: "Encoded PowerShell C2 Beacon Detected", ruleType: "Behavioral", firedAt: "2026-05-05 09:02:44 UTC", host: "EXEC-LAPTOP-07", ip: "10.0.2.88", user: "ceo_assistant", rawLog: "2026-05-05 09:02:44 EventID=4104 host=EXEC-LAPTOP-07 ScriptBlockText=\"powershell.exe -enc SQBFAFgA...\"\n2026-05-05 09:02:51 Sysmon EventID=3 process=powershell.exe dst_ip=94.130.88.12 dst_port=443\n2026-05-05 09:03:24 Sysmon EventID=3 beacon_interval=47s jitter=12s dst_ip=94.130.88.12" },
    mitre: "T1059.001 — PowerShell / T1071.001 — C2 over HTTPS", cve: "CVE-2021-34527",
    playbookSOP: { title: "APT PowerShell C2 / PrintNightmare Response SOP", steps: ["Decode base64 PS payload: [System.Text.Encoding]::Unicode.GetString([Convert]::FromBase64String('...'))", "Map beacon interval + jitter via Sysmon Event ID 3 — confirm C2 pattern", "Check spoolsv.exe DLL load history for PrintNightmare indicator (user-writable UNC path)", "Determine dwell time: search 30-day logs for first contact with 94.130.88.12", "Revoke tokens, isolate host, block C2 IP at perimeter, engage full IR team"] },
    workbook: { assetOwner: "Executive Office", assetCriticality: "Critical", lastPatchDate: "2025-12-02", openPorts: ["443/HTTPS", "445/SMB"], recentChanges: "spoolsv.exe loaded PrintConfig.dll from \\\\10.0.9.44\\share\\PrintConfig.dll on 2026-04-29 — no change ticket" },
    additionalData: { authEvents: "2026-04-29 11:14:02 EventID=4624 ceo_assistant→FILE-SRV-03 SUCCESS\n2026-04-29 11:14:18 spoolsv.exe loaded DLL from \\\\10.0.9.44\\share\\PrintConfig.dll\n2026-05-05 09:02:44 EventID=4104 Encoded PowerShell execution", networkConnections: "09:02:51 EXEC-LAPTOP-07→94.130.88.12:443 ESTABLISHED\n09:03:38 EXEC-LAPTOP-07→94.130.88.12:443 ESTABLISHED interval=47s\n09:04:25 EXEC-LAPTOP-07→94.130.88.12:443 ESTABLISHED interval=47s", processTree: "spoolsv.exe → rundll32.exe PrintConfig.dll\nrundll32.exe → powershell.exe -enc SQBFAFgA...\npowershell.exe → net.exe user /domain" },
    options: [
      { id: "a", label: "Revoke tokens, isolate host, block C2", action: "Revoke OAuth/SSO tokens for ceo_assistant, isolate EXEC-LAPTOP-07, block 94.130.88.12 at firewall, page IR lead", correct: true, explanation: "Correct. 6-day dwell + custom jitter + PrintNightmare DLL hijack = skilled APT. Token revocation stops re-auth on other systems. Isolation stops exfil. Firewall block cuts C2." },
      { id: "b", label: "Reset password and monitor", action: "Force password reset, watch for further beaconing", correct: false, explanation: "Insufficient. Attacker uses token-based C2 — password reset does not revoke active OAuth tokens. Beacon continues." },
      { id: "c", label: "Block C2 IP only", action: "Add 94.130.88.12 to firewall blocklist, close ticket", correct: false, explanation: "Incomplete. Implant is still installed. Sophisticated actor will switch to backup C2 domain. Host must be isolated and reimaged." },
      { id: "d", label: "Fully decode payload first, then decide", action: "Spend time decoding PowerShell before any containment", correct: false, explanation: "Too slow. Beacon is live — exfiltration may be in progress. Contain first, analyze in parallel on a separate system." }
    ],
    expectedTerms: ["Event ID 4104", "Sysmon", "beacon", "jitter", "spoolsv.exe", "PrintNightmare", "dwell time", "token revocation", "isolate", "C2", "94.130.88.12", "base64"],
    afterActionReport: { whatHappened: "APT exploited CVE-2021-34527 (PrintNightmare) 6 days ago to load a malicious DLL via spoolsv.exe. Implant established PS-based C2 beacon with jitter to evade detection on an executive laptop.", redTeamTTP: "Initial access via PrintNightmare DLL hijack. Persistence via encoded PS loader. C2 over HTTPS with jitter to blend into normal traffic. 6-day dwell = patient APT.", lessonsLearned: "Print Spooler loading DLLs from UNC paths should be an immediate alert. Behavioral beacon analysis — not signature detection — is required to catch C2 jitter.", keyTerms: ["T1059.001", "PrintNightmare", "CVE-2021-34527", "Event ID 4104", "C2 Jitter", "Token Revocation", "Dwell Time"] }
  },

  // ===== DEDICATED CONSOLE-VIEW SCENARIO 1: DC / AD ATTACK (ntdsutil IFM) =====
  dc: {
    incidentId: "INC-DC-3310", severity: "Critical",
    label: "DC / AD Attack — ntdsutil IFM",
    siemAlert: { ruleName: "Suspicious Administrative Tool Execution on Tier-0 Asset", ruleType: "Behavioral", firedAt: "2026-05-06 03:42:11 UTC", host: "DC-PROD-02", ip: "10.0.0.6", user: "svc_helpdesk", rawLog: "2026-05-06 03:42:11 UTC EventID=4688 host=DC-PROD-02 parent=lsass.exe child=cmd.exe\n2026-05-06 03:42:14 UTC EventID=4688 host=DC-PROD-02 parent=cmd.exe child=ntdsutil.exe cmdline=\"ntdsutil.exe \\\"ac i ntds\\\" \\\"ifm\\\" \\\"create full C:\\\\temp\\\" q q\"\n2026-05-06 03:42:51 UTC EventID=4663 host=DC-PROD-02 object=C:\\temp\\Active Directory\\ntds.dit access=WRITE" },
    mitre: "T1003.003 — OS Credential Dumping: NTDS / TA0006 Credential Access", cve: null,
    playbookSOP: { title: "NTDS.dit Exfiltration / DCSync Response SOP", steps: ["Confirm the lsass.exe → cmd.exe parent-child chain — lsass should NEVER spawn a shell", "Decode the ntdsutil command arguments — 'ifm' (Install From Media) copies the full AD database", "Check whether ntds.dit was written to an unapproved path (C:\\temp) and whether it was exfiltrated off-host", "Identify the account (svc_helpdesk) — does it have DC logon rights it shouldn't?", "Isolate the DC's outbound path WITHOUT killing auth, force enterprise-wide krbtgt double-reset, engage IR immediately"] },
    workbook: { assetOwner: "IT Infrastructure — Domain Services", assetCriticality: "Critical (Tier-0)", lastPatchDate: "2026-03-30", openPorts: ["445/SMB", "389/LDAP", "88/Kerberos", "636/LDAPS"], recentChanges: "svc_helpdesk added to 'Server Operators' group 2026-05-04 — change ticket references a closed Jira that doesn't exist" },
    additionalData: { authEvents: "03:41:58 EventID=4624 svc_helpdesk→DC-PROD-02 logon_type=3\n03:42:00 EventID=4672 Special privileges assigned svc_helpdesk\n03:42:14 EventID=4688 ntdsutil.exe spawned (ifm create full)\n03:42:51 EventID=4663 ntds.dit written to C:\\temp", networkConnections: "03:43:10 DC-PROD-02 → 45.83.220.19:443 ESTABLISHED 412MB outbound\n03:43:10 (45.83.220.19 = unattributed VPS, Bulgaria)", processTree: "lsass.exe → cmd.exe → ntdsutil.exe (ifm create full C:\\temp)\ncmd.exe → 7z.exe a ntds.7z C:\\temp\\* " },
    consoleView: {
      processTree: [
        { proc: "lsass.exe", note: "Local Security Authority — handles credentials/tokens", flag: null, depth: 0 },
        { proc: "cmd.exe", note: "CRITICAL: lsass.exe should NEVER spawn a command shell — anomalous parent-child on a Tier-0 asset", flag: "critical", depth: 1 },
        { proc: "ntdsutil.exe", note: "AD database management tool — invoked with 'ifm' (Install From Media)", flag: "warn", depth: 2 },
        { proc: "7z.exe a ntds.7z", note: "Compressing the copied AD database for exfiltration", flag: "warn", depth: 2 }
      ],
      insights: [
        { trigger: "ntdsutil.exe \"ac i ntds\" \"ifm\" \"create full C:\\temp\"", insight: "ntdsutil.exe is a legitimate Active Directory database management tool. The 'ifm' (Install From Media) arguments copy the entire AD database (ntds.dit) — containing ALL enterprise password hashes — to an unapproved temp directory. This is credential dumping, not maintenance." },
        { trigger: "lsass.exe → cmd.exe", insight: "lsass.exe handles user credentials and tokens. It should never be the parent of a command prompt. This parent-child relationship is a hallmark of process injection / token theft on a Domain Controller." }
      ],
      networkAlerts: [
        { name: "Tier-0 Outbound Data Transfer", detail: "DC-PROD-02 transferred 412MB to 45.83.220.19 (unattributed VPS, Bulgaria) immediately after ntds.dit was written. Domain Controllers should not initiate large outbound transfers to external IPs." },
        { name: "Anomalous Privilege Assignment", detail: "svc_helpdesk was added to 'Server Operators' 48h ago via a change ticket referencing a non-existent Jira — likely attacker-staged privilege escalation." }
      ],
      threatIntel: { fileName: "ntdsutil.exe (legitimate binary, malicious use)", sha256: "(signed Microsoft binary — LotL abuse, not a malicious file)", reputation: "Clean file / Malicious behavior", attribution: "TTP overlaps with FIN6 and several ransomware affiliates who exfil ntds.dit pre-encryption" },
      mitreTactics: [ { id: "TA0006", name: "Credential Access" }, { id: "T1003.003", name: "OS Credential Dumping: NTDS" }, { id: "TA0010", name: "Exfiltration" } ]
    },
    options: [
      { id: "a", label: "Block DC outbound, force krbtgt double-reset, engage IR", action: "Cut DC-PROD-02's outbound path to 45.83.220.19 at the firewall (without isolating auth), force enterprise-wide krbtgt double-reset, revoke svc_helpdesk, page IR lead — treat ntds.dit as exfiltrated", correct: true, explanation: "Correct. The 412MB outbound after ntds.dit write means the hash database is gone — every enterprise credential is now compromised, including krbtgt. A krbtgt double-reset is mandatory to invalidate golden-ticket forging. You block outbound and revoke the account WITHOUT fully isolating the DC (which breaks org-wide auth). This is the Tier-0 nightmare scenario and the response is enterprise-wide, not host-scoped." },
      { id: "b", label: "Isolate DC-PROD-02 from the network", action: "Pull the domain controller offline", correct: false, explanation: "Breaks authentication for the entire enterprise. And it's too late — the data already left. Block the specific outbound path instead, and pivot to credential invalidation (krbtgt) since the hashes are already exfiltrated." },
      { id: "c", label: "Delete C:\\temp\\ntds.dit and close", action: "Remove the copied database, close ticket", correct: false, explanation: "Catastrophic under-response. The 412MB already left the host — deleting the local copy does nothing. Every hash is compromised; this requires enterprise credential invalidation, not file cleanup." },
      { id: "d", label: "Reset svc_helpdesk password only", action: "Rotate the one account", correct: false, explanation: "Wildly insufficient. With ntds.dit exfiltrated, the attacker has every hash including krbtgt — they can forge golden tickets as any user. One password reset is meaningless." }
    ],
    expectedTerms: ["ntdsutil", "ifm", "ntds.dit", "lsass.exe", "parent-child", "Tier-0", "krbtgt", "golden ticket", "DCSync", "Server Operators", "exfiltration", "LotL", "credential dumping", "Living off the Land"],
    afterActionReport: { whatHappened: "An attacker who had pre-staged privilege (svc_helpdesk added to Server Operators) used the legitimate ntdsutil.exe tool with 'ifm' arguments to copy the entire Active Directory database (ntds.dit) — every enterprise password hash — then compressed and exfiltrated it 412MB to a Bulgarian VPS. The lsass→cmd chain indicated token theft to obtain the DC session.", redTeamTTP: "Living off the Land (LotL) credential dumping. Used a signed Microsoft binary (ntdsutil) so no malicious file hash would trip signature detection. Pre-staged privilege via a fake change ticket. This is the standard precursor to a domain-wide ransomware deployment.", lessonsLearned: "Tier-0 assets need behavioral detection on parent-child anomalies (lsass spawning a shell) and on LotL tool arguments (ifm), because the binaries themselves are clean. Once ntds.dit is exfiltrated, the only real remediation is enterprise-wide credential invalidation including a krbtgt double-reset.", keyTerms: ["ntds.dit Exfiltration", "ntdsutil IFM", "LotL", "krbtgt Double-Reset", "Tier-0 Compromise", "Golden Ticket Risk"] }
  },

  // ===== DEDICATED CONSOLE-VIEW SCENARIO 2: ENDPOINT LotL (lsass dump) =====
  lotl: {
    incidentId: "INC-EP-2255", severity: "High",
    label: "Endpoint LotL — Credential Dump",
    siemAlert: { ruleName: "Suspicious Process Masquerading + Credential Access", ruleType: "Behavioral", firedAt: "2026-05-06 14:08:33 UTC", host: "FIN-WKS-118", ip: "10.0.4.118", user: "rkhan", rawLog: "2026-05-06 14:08:33 UTC EventID=4688 host=FIN-WKS-118 process=svchost.exe path=C:\\Users\\Public\\svchost.exe\n2026-05-06 14:08:35 UTC EventID=10 (Sysmon) SourceImage=C:\\Users\\Public\\svchost.exe TargetImage=lsass.exe GrantedAccess=0x1410\n2026-05-06 14:08:40 UTC EventID=11 (Sysmon) FileCreate C:\\Users\\Public\\lsass.dmp" },
    mitre: "T1003.001 — LSASS Memory / T1036 — Masquerading", cve: null,
    playbookSOP: { title: "LSASS Credential Dump Response SOP", steps: ["Verify the binary path — svchost.exe should run from System32, NOT C:\\Users\\Public", "Confirm the handle access to lsass.exe (GrantedAccess 0x1410 = read memory for dumping)", "Check for an lsass.dmp file creation — the dumped credential file", "Pull the file hash and check global reputation", "Isolate the endpoint, force password reset for all accounts that logged into this host, engage IR"] },
    workbook: { assetOwner: "Finance Department", assetCriticality: "High", lastPatchDate: "2026-04-18", openPorts: ["445/SMB"], recentChanges: "User rkhan opened an invoice attachment from an external sender 12 minutes before the alert" },
    additionalData: { authEvents: "14:08:33 EventID=4688 svchost.exe from C:\\Users\\Public\n14:08:35 Sysmon EventID=10 handle to lsass.exe GrantedAccess=0x1410\n14:08:40 Sysmon EventID=11 lsass.dmp created", networkConnections: "14:09:02 FIN-WKS-118 → 91.219.236.14:443 ESTABLISHED\n14:09:05 lsass.dmp uploaded (2.1MB)", processTree: "winword.exe → svchost.exe (C:\\Users\\Public) → lsass.exe (memory read)\nsvchost.exe → rundll32.exe comsvcs.dll MiniDump" },
    consoleView: {
      processTree: [
        { proc: "winword.exe", note: "Word — opened an external invoice attachment", flag: null, depth: 0 },
        { proc: "svchost.exe (C:\\Users\\Public)", note: "CRITICAL: svchost.exe running from C:\\Users\\Public instead of C:\\Windows\\System32 — masquerading malware", flag: "critical", depth: 1 },
        { proc: "lsass.exe [memory read]", note: "Process opened a handle to lsass with GrantedAccess 0x1410 — reading credential memory", flag: "critical", depth: 2 },
        { proc: "rundll32.exe comsvcs.dll MiniDump", note: "comsvcs.dll MiniDump is a known LotL technique to dump lsass without external tools", flag: "warn", depth: 2 }
      ],
      insights: [
        { trigger: "svchost.exe path=C:\\Users\\Public\\svchost.exe", insight: "The real svchost.exe only ever runs from C:\\Windows\\System32. A svchost.exe in C:\\Users\\Public is malware masquerading as a system process to blend into the process list — a classic Masquerading (T1036) technique." },
        { trigger: "GrantedAccess=0x1410 to lsass.exe + lsass.dmp created", insight: "0x1410 is the access mask for reading process memory. Combined with the lsass.dmp file, this is a textbook LSASS credential dump — the attacker is harvesting every cached credential on this host." }
      ],
      networkAlerts: [
        { name: "Credential Dump Exfiltration", detail: "lsass.dmp (2.1MB) was uploaded to 91.219.236.14 within seconds of creation. The dumped credentials are now in attacker hands." }
      ],
      threatIntel: { fileName: "svchost.exe (masquerading — running from C:\\Users\\Public)", sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", reputation: "Malicious (72/75 engines on VirusTotal)", attribution: "Associated with known ransomware deployment groups (e.g., LockBit)" },
      mitreTactics: [ { id: "TA0006", name: "Credential Access" }, { id: "T1003.001", name: "LSASS Memory" }, { id: "T1036", name: "Masquerading" } ]
    },
    options: [
      { id: "a", label: "Isolate host, reset all accounts that logged in here, engage IR", action: "Network-isolate FIN-WKS-118, force password reset for every account with a session on this host (lsass.dmp captured them all), block 91.219.236.14, engage IR", correct: true, explanation: "Correct. The lsass.dmp was exfiltrated — every credential cached on this host is compromised, not just rkhan's. Isolate the endpoint, reset all accounts that ever logged into it, and treat the dumped credentials as burned. The masquerading svchost from C:\\Users\\Public plus the 72/75 VirusTotal hit confirm this is active malware, likely ransomware pre-staging." },
      { id: "b", label: "Kill the svchost.exe process and close", action: "Terminate the malicious process", correct: false, explanation: "Too late and too narrow. The credentials were already dumped and exfiltrated. Killing the process doesn't un-dump the credentials or address the other accounts cached on this host." },
      { id: "c", label: "Reset rkhan's password only", action: "Rotate the one user", correct: false, explanation: "Insufficient. lsass.dmp contains EVERY credential cached on FIN-WKS-118 — service accounts, admins who logged in, cached domain creds. All of them are compromised, not just rkhan." },
      { id: "d", label: "Run a full AV scan first", action: "Scan before acting", correct: false, explanation: "Too slow. The credentials are already exfiltrated and the host is confirmed-malicious (72/75 VT). Contain first — the scan can run after isolation." }
    ],
    expectedTerms: ["lsass", "lsass.dmp", "masquerading", "svchost", "C:\\Users\\Public", "GrantedAccess 0x1410", "comsvcs.dll", "MiniDump", "credential dump", "VirusTotal", "isolate", "LockBit", "cached credentials"],
    afterActionReport: { whatHappened: "A malicious Word attachment dropped a masquerading svchost.exe in C:\\Users\\Public, which opened a memory-read handle to lsass.exe, dumped credentials to lsass.dmp using the comsvcs.dll MiniDump LotL technique, and exfiltrated the 2.1MB dump to an external IP — harvesting every credential cached on the host.", redTeamTTP: "Phishing-delivered loader → masquerading binary (svchost from Public) → LSASS memory dump via living-off-the-land comsvcs.dll → credential exfil. Standard ransomware-affiliate credential-harvesting playbook (LockBit-associated hash).", lessonsLearned: "Two cheap, high-fidelity detections catch this: (1) any system-process name running from a non-System32 path, and (2) any non-LSASS process opening a memory-read handle to lsass.exe. Once lsass is dumped and exfiltrated, every credential on the host is burned — response must cover all cached accounts, not just the logged-in user.", keyTerms: ["LSASS Dump", "Masquerading", "comsvcs MiniDump", "LotL", "Cached Credential Compromise", "LockBit"] }
  }
};

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: prompt }] })
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  const text = data.content?.find(b => b.type === "text")?.text || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ===================================================================
// CICIDS / ZEEK SCENARIO GENERATOR
// bundled seed (CICIDS CSV row OR Zeek conn.log line)
//   -> normalizeSeed() -> one seed schema
//   -> generateScenarioFromSeed(seed) via callClaude()
//   -> validateScenario() -> object in THIS version's scenario shape
// The raw flow record is NEVER shown to the user. Network/perimeter only.
// ===================================================================

const SEED_POOL = [
  // CICIDS2017-style CSV rows (real CICFlowMeter column names)
  { format: "cicids",
    header: "Flow ID,Source IP,Source Port,Destination IP,Destination Port,Protocol,Flow Duration,Total Fwd Packets,Total Backward Packets,Total Length of Fwd Packets,Flow Bytes/s,Flow Packets/s,SYN Flag Count,ACK Flag Count,RST Flag Count,Label",
    row: "172.16.0.5-192.168.10.50-43821-80-6,172.16.0.5,43821,192.168.10.50,80,6,812000,14211,12,8943210,11013805,17501,14211,3,0,DDoS" },
  { format: "cicids",
    header: "Flow ID,Source IP,Source Port,Destination IP,Destination Port,Protocol,Flow Duration,Total Fwd Packets,Total Backward Packets,Total Length of Fwd Packets,Flow Bytes/s,Flow Packets/s,SYN Flag Count,ACK Flag Count,RST Flag Count,Label",
    row: "172.16.0.11-192.168.10.50-52144-21-6,172.16.0.11,52144,192.168.10.50,21,6,4920000,3187,3120,210384,42760,1281,1602,1580,12,FTP-Patator" },
  { format: "cicids",
    header: "Flow ID,Source IP,Source Port,Destination IP,Destination Port,Protocol,Flow Duration,Total Fwd Packets,Total Backward Packets,Total Length of Fwd Packets,Flow Bytes/s,Flow Packets/s,SYN Flag Count,ACK Flag Count,RST Flag Count,Label",
    row: "172.16.0.11-192.168.10.50-50331-22-6,172.16.0.11,50331,192.168.10.50,22,6,6310000,4021,3998,488110,77354,1271,2010,1990,8,SSH-Patator" },
  { format: "cicids",
    header: "Flow ID,Source IP,Source Port,Destination IP,Destination Port,Protocol,Flow Duration,Total Fwd Packets,Total Backward Packets,Total Length of Fwd Packets,Flow Bytes/s,Flow Packets/s,SYN Flag Count,ACK Flag Count,RST Flag Count,Label",
    row: "172.16.0.14-192.168.10.50-0-0-6,172.16.0.14,0,192.168.10.50,0,6,118000,1985,4,0,0,16822,1985,0,1981,PortScan" },
  { format: "cicids",
    header: "Flow ID,Source IP,Source Port,Destination IP,Destination Port,Protocol,Flow Duration,Total Fwd Packets,Total Backward Packets,Total Length of Fwd Packets,Flow Bytes/s,Flow Packets/s,SYN Flag Count,ACK Flag Count,RST Flag Count,Label",
    row: "192.168.10.15-52.14.88.3-49677-8080-6,192.168.10.15,49677,52.14.88.3,8080,6,300120000,842,838,52410,174,5,420,418,2,Bot" },
  // Zeek conn.log-style lines: ts uid src sport dst dport proto service duration orig_bytes resp_bytes conn_state orig_pkts resp_pkts label
  { format: "zeek", log: "1493742185.123456\tCabc123\t172.16.0.5\t43990\t192.168.10.50\t80\ttcp\thttp\t0.812\t8943210\t512\tS0\t14211\t0\tDDoS" },
  { format: "zeek", log: "1493744001.998877\tCdef456\t172.16.0.11\t52144\t192.168.10.50\t21\ttcp\tftp\t4.920\t210384\t198044\tSF\t3187\t3120\tFTP-Patator" },
  { format: "zeek", log: "1493750020.114433\t192.168.10.15\t49677\t52.14.88.3\t8080\ttcp\thttp\t300.120\t52410\t49920\tSF\t842\t838\tBot" }
];

function mapAttackType(label) {
  const L = String(label || "").trim().toLowerCase();
  if (L.includes("ddos") || L === "dos") return "DDoS";
  if (L.includes("portscan") || L.includes("port scan")) return "PortScan";
  if (L.includes("ftp")) return "FTP-Patator";
  if (L.includes("ssh")) return "SSH-Patator";
  if (L.includes("bot")) return "Bot";
  if (L.includes("brute")) return "BruteForce";
  return "SuspiciousFlow";
}

const PROTO_MAP = { "6": "TCP", "17": "UDP", "1": "ICMP", tcp: "TCP", udp: "UDP", icmp: "ICMP" };

function normalizeSeed(raw) {
  if (raw.format === "cicids") {
    const cols = raw.header.split(",").map(c => c.trim());
    const vals = raw.row.split(",").map(v => v.trim());
    const m = {}; cols.forEach((c, i) => { m[c] = vals[i]; });
    const fwd = parseInt(m["Total Fwd Packets"] || "0", 10);
    const bwd = parseInt(m["Total Backward Packets"] || "0", 10);
    const syn = parseInt(m["SYN Flag Count"] || "0", 10);
    const ack = parseInt(m["ACK Flag Count"] || "0", 10);
    const rst = parseInt(m["RST Flag Count"] || "0", 10);
    const flags = [];
    if (syn) flags.push(`SYN:${syn}`); if (ack) flags.push(`ACK:${ack}`); if (rst) flags.push(`RST:${rst}`);
    return {
      src_ip: m["Source IP"], dst_ip: m["Destination IP"],
      src_port: parseInt(m["Source Port"] || "0", 10), dst_port: parseInt(m["Destination Port"] || "0", 10),
      protocol: PROTO_MAP[m["Protocol"]] || m["Protocol"] || "TCP",
      duration: +((parseInt(m["Flow Duration"] || "0", 10)) / 1e6).toFixed(3),
      bytes: parseInt(m["Total Length of Fwd Packets"] || "0", 10),
      packets: fwd + bwd, flags: flags.join(" ") || "none",
      attack_type: mapAttackType(m["Label"]), confidence: 0.9
    };
  }
  const f = raw.log.split("\t");
  // Zeek conn.log fields. Two sample shapes: with uid (15 fields) or without (14).
  // With uid:    ts uid src sport dst dport proto service dur ob rb conn_state op rp label
  // Without uid: ts     src sport dst dport proto service dur ob rb conn_state op rp label
  let src_ip, src_port, dst_ip, dst_port, proto, dur, ob, cs, op, rp, label;
  if (f.length >= 15) {
    [, , src_ip, src_port, dst_ip, dst_port, proto, , dur, ob, , cs, op, rp, label] = f;
  } else {
    [, src_ip, src_port, dst_ip, dst_port, proto, , dur, ob, , cs, op, rp, label] = f;
  }
  return {
    src_ip, dst_ip,
    src_port: parseInt(src_port || "0", 10), dst_port: parseInt(dst_port || "0", 10),
    protocol: PROTO_MAP[(proto || "tcp").toLowerCase()] || "TCP",
    duration: parseFloat(dur || "0"),
    bytes: parseInt(ob || "0", 10),
    packets: parseInt(op || "0", 10) + parseInt(rp || "0", 10),
    flags: `conn_state=${cs || "OTH"}`,
    attack_type: mapAttackType(label), confidence: 0.85
  };
}

async function generateScenarioFromSeed(seed) {
  const prompt = `You are generating a realistic NETWORK/PERIMETER SOC scenario for an analyst drill, grounded in a real labeled network flow.

GROUND TRUTH (derive everything from these real values — do NOT invent contradicting numbers):
- Source IP: ${seed.src_ip}  Source Port: ${seed.src_port}
- Destination IP: ${seed.dst_ip}  Destination Port: ${seed.dst_port}
- Protocol: ${seed.protocol}
- Flow duration: ${seed.duration} seconds
- Bytes (fwd): ${seed.bytes}
- Total packets: ${seed.packets}
- Flags: ${seed.flags}
- Attack class (label): ${seed.attack_type}

Hard rules:
- NETWORK/PERIMETER only. Do NOT turn this into a cloud/IAM/OAuth scenario.
- The rawLog and siemAlert MUST reflect the real port, protocol, packet volume, duration, and flags above. If it's ${seed.packets} packets over ${seed.duration}s to port ${seed.dst_port}, the log shows that scale and that port — no invented numbers.
- Pick a MITRE technique that fits ${seed.attack_type} (DDoS->T1498, PortScan->T1046, FTP/SSH-Patator->T1110, Bot->T1071).

Return ONLY valid JSON (no markdown) in EXACTLY this shape:
{
  "incidentId": "INC-GEN-<4 digits>",
  "severity": "Critical" | "High" | "Medium",
  "siemAlert": { "ruleName": "...", "ruleType": "Network behavioral", "firedAt": "2026-05-06 HH:MM:SS UTC", "host": "...", "ip": "${seed.dst_ip}", "user": "(network event)", "rawLog": "2-3 log lines reflecting the real flow values" },
  "mitre": "T#### — Name",
  "cve": null,
  "playbookSOP": { "title": "...", "steps": ["s1","s2","s3","s4"] },
  "workbook": { "assetOwner": "...", "assetCriticality": "...", "lastPatchDate": "...", "openPorts": ["${seed.dst_port}/${seed.protocol}"], "recentChanges": "..." },
  "additionalData": { "authEvents": "...", "networkConnections": "lines reflecting ${seed.src_ip} -> ${seed.dst_ip}:${seed.dst_port}", "processTree": "" },
  "expectedTerms": ["8-14 specific network/perimeter terms grounded in this flow"],
  "options": [ {"id":"a","label":"...","action":"...","correct":true,"explanation":"..."}, {"id":"b","label":"...","action":"...","correct":false,"explanation":"..."}, {"id":"c","label":"...","action":"...","correct":false,"explanation":"..."}, {"id":"d","label":"...","action":"...","correct":false,"explanation":"..."} ],
  "afterActionReport": { "whatHappened": "...", "redTeamTTP": "...", "lessonsLearned": "...", "keyTerms": ["t1","t2","t3"] }
}`;
  const obj = await callClaude(prompt);
  return validateScenario(obj, seed);
}

function validateScenario(obj, seed) {
  const o = obj && typeof obj === "object" ? obj : {};
  o.surfaceType = "network";
  o.surfaceLabel = "Network / Perimeter";
  o.incidentId = o.incidentId || `INC-GEN-${1000 + Math.floor(Math.random() * 9000)}`;
  if (!["Critical", "High", "Medium"].includes(o.severity)) o.severity = "High";

  o.siemAlert = o.siemAlert || {};
  const sa = o.siemAlert;
  sa.ruleName = sa.ruleName || `Network anomaly — ${seed.attack_type} pattern`;
  sa.ruleType = sa.ruleType || "Network behavioral";
  sa.firedAt = sa.firedAt || "2026-05-06 12:00:00 UTC";
  sa.host = sa.host || `SRV-${String(seed.dst_ip).split(".").pop()}`;
  sa.ip = sa.ip || seed.dst_ip;
  sa.user = sa.user || "(network event)";
  sa.rawLog = sa.rawLog || `${sa.firedAt} src=${seed.src_ip}:${seed.src_port} dst=${seed.dst_ip}:${seed.dst_port} proto=${seed.protocol} pkts=${seed.packets} dur=${seed.duration}s flags=${seed.flags} label=${seed.attack_type}`;

  o.mitre = o.mitre || "T1046 — Network Service Discovery";
  o.cve = o.cve ?? null;

  o.playbookSOP = o.playbookSOP || {};
  o.playbookSOP.title = o.playbookSOP.title || `${seed.attack_type} Response SOP`;
  if (!Array.isArray(o.playbookSOP.steps) || !o.playbookSOP.steps.length)
    o.playbookSOP.steps = ["Confirm the flow against baseline", "Identify source reputation and scope", "Apply proportionate perimeter control", "Engage network/edge team and document"];

  o.workbook = o.workbook || {};
  o.workbook.assetOwner = o.workbook.assetOwner || "Network / Edge Team";
  o.workbook.assetCriticality = o.workbook.assetCriticality || "High";
  o.workbook.lastPatchDate = o.workbook.lastPatchDate || "2026-04-15";
  if (!Array.isArray(o.workbook.openPorts) || !o.workbook.openPorts.length) o.workbook.openPorts = [`${seed.dst_port}/${seed.protocol}`];
  o.workbook.recentChanges = o.workbook.recentChanges || "No recent change tickets on this asset.";

  o.additionalData = o.additionalData || {};
  o.additionalData.networkConnections = o.additionalData.networkConnections || `${seed.src_ip}:${seed.src_port} → ${seed.dst_ip}:${seed.dst_port} ${seed.protocol} ${seed.packets} pkts / ${seed.duration}s`;
  o.additionalData.authEvents = o.additionalData.authEvents || "(no auth events — network-layer detection)";
  o.additionalData.processTree = o.additionalData.processTree || "";

  let opts = Array.isArray(o.options) ? o.options.slice(0, 4) : [];
  const ids = ["a", "b", "c", "d"];
  while (opts.length < 4) {
    const i = opts.length;
    opts.push({ id: ids[i], label: i === 0 ? "Apply proportionate perimeter control + escalate" : "Take no action", action: "—", correct: i === 0, explanation: i === 0 ? "Default safe action." : "Insufficient given the flow evidence." });
  }
  opts.forEach((op, i) => { op.id = ids[i]; if (typeof op.correct !== "boolean") op.correct = false; });
  if (!opts.some(op => op.correct)) opts[0].correct = true;
  let seen = false;
  opts.forEach(op => { if (op.correct && !seen) seen = true; else if (op.correct) op.correct = false; });
  o.options = opts;

  if (!Array.isArray(o.expectedTerms) || !o.expectedTerms.length)
    o.expectedTerms = [seed.attack_type, `port ${seed.dst_port}`, seed.protocol, "source reputation", "perimeter control", "rate-limit", "network baseline", "edge team"];

  o.afterActionReport = o.afterActionReport || {};
  const aar = o.afterActionReport;
  aar.whatHappened = aar.whatHappened || `A ${seed.attack_type} flow was observed from ${seed.src_ip} to ${seed.dst_ip}:${seed.dst_port}.`;
  aar.redTeamTTP = aar.redTeamTTP || `${seed.attack_type} against an exposed network service.`;
  aar.lessonsLearned = aar.lessonsLearned || "Perimeter detections need proportionate, baseline-aware response.";
  if (!Array.isArray(aar.keyTerms) || !aar.keyTerms.length) aar.keyTerms = [seed.attack_type, "Perimeter control", "Source reputation"];

  o._generated = true;
  return o;
}

async function scoreSATO(sato, incident) {
  const prompt = `You are a SOC panel interviewer evaluating an analyst's structured verbal response to an incident.

Incident: ${incident.incidentId} — ${incident.siemAlert?.ruleName}
MITRE: ${incident.mitre}
Expected technical terms: ${incident.expectedTerms?.join(", ")}
Correct action: ${incident.options?.find(o=>o.correct)?.label} — ${incident.options?.find(o=>o.correct)?.explanation}

Analyst's SATO response:
Situation: ${sato.situation}
Action: ${sato.action}
Tool/Event ID: ${sato.tool}
Outcome: ${sato.outcome}

Score strictly. Penalize vague language, missing Event IDs, missing tool names, and 30000-foot answers.
Return ONLY valid JSON:
{
  "score": 1-10,
  "level": "Ground Level" | "Mid Level" | "30,000 Feet",
  "whatWorked": "1-2 sentences on specific technical details they got right",
  "gapAnalysis": "1-2 sentences on exactly what was too vague or missing",
  "termsHit": ["terms from expectedTerms the analyst used"],
  "termsMissed": ["terms from expectedTerms the analyst missed"],
  "modelSATO": {
    "situation": "model situation sentence",
    "action": "model action sentence with specific first step",
    "tool": "model tool/Event ID answer",
    "outcome": "model outcome/decision sentence"
  }
}`;
  return callClaude(prompt);
}

export default function SOCWorkstation() {
  const [screen, setScreen] = useState("home");
  const [role, setRole] = useState(null);
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [activePanel, setActivePanel] = useState("siem");
  const [viewMode, setViewMode] = useState("raw"); // "raw" | "console"
  const [phase, setPhase] = useState("sato"); // sato | decision | aar
  const [satoStep, setSatoStep] = useState(0);
  const [sato, setSato] = useState({ situation: "", action: "", tool: "", outcome: "" });
  const [satoScore, setSatoScore] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [includeGenerated, setIncludeGenerated] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [stats, setStats] = useState({ total: 0, correct: 0, satoScores: [] });
  const timerRef = useRef(null);

  const loadMsgs = ["Injecting threat...", "Firing SIEM rule...", "Generating telemetry...", "Loading workstation..."];

  useEffect(() => {
    if (timerActive) timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  async function launchIncident(r) {
    setRole(r); setLoading(true); setErrorMsg(null);
    setSato({ situation: "", action: "", tool: "", outcome: "" });
    setSatoScore(null); setSatoStep(0); setSelectedOption(null);
    setPhase("sato"); setActivePanel("siem"); setElapsed(0); setTimerActive(false);
    let i = 0; setLoadMsg(loadMsgs[0]);
    const iv = setInterval(() => { i = (i+1)%loadMsgs.length; setLoadMsg(loadMsgs[i]); }, 700);
    let inc = FALLBACKS[r.id];
    // Live CICIDS/Zeek generation: when enabled, sometimes produce a network/perimeter
    // scenario from a bundled seed instead of the hardcoded one. Transparent to the user.
    if (includeGenerated && Math.random() < 0.4) {
      try {
        const raw = SEED_POOL[Math.floor(Math.random() * SEED_POOL.length)];
        const seed = normalizeSeed(raw);
        inc = await generateScenarioFromSeed(seed);
      } catch(e) { setErrorMsg("Scenario generation failed — loaded built-in scenario."); inc = FALLBACKS[r.id]; }
    } else if (useAI) {
      try {
        const prompt = `Generate a realistic SOC workstation incident for a ${r.label} analyst. Return ONLY valid JSON matching this exact structure with no markdown:\n{"incidentId":"INC-XXXX","severity":"Critical","siemAlert":{"ruleName":"string","ruleType":"Behavioral","firedAt":"2026-05-05 23:14:32 UTC","host":"string","ip":"string","user":"string","rawLog":"3 lines of realistic log"},"mitre":"T####.### — Name","cve":null,"playbookSOP":{"title":"string","steps":["s1","s2","s3","s4"]},"workbook":{"assetOwner":"string","assetCriticality":"High","lastPatchDate":"string","openPorts":["445/SMB"],"recentChanges":"string"},"additionalData":{"authEvents":"3 log lines","networkConnections":"3 log lines","processTree":"parent→child chain"},"expectedTerms":["EventID","tool","technique","decision term — 8-12 specific terms"],"options":[{"id":"a","label":"string","action":"string","correct":true,"explanation":"string"},{"id":"b","label":"string","action":"string","correct":false,"explanation":"string"},{"id":"c","label":"string","action":"string","correct":false,"explanation":"string"},{"id":"d","label":"string","action":"string","correct":false,"explanation":"string"}],"afterActionReport":{"whatHappened":"string","redTeamTTP":"string","lessonsLearned":"string","keyTerms":["t1","t2","t3"]}}`;
        inc = await callClaude(prompt);
      } catch(e) { setErrorMsg("AI generation failed — loaded built-in scenario."); }
    }
    clearInterval(iv);
    setViewMode(inc && inc.consoleView ? "console" : "raw");
    setIncident(inc); setLoading(false);
    setScreen("workstation"); setTimerActive(true);
  }

  async function submitSATO() {
    setLoading(true); setLoadMsg("Scoring your answer...");
    try {
      const score = await scoreSATO(sato, incident);
      setSatoScore(score);
      setStats(prev => ({ ...prev, satoScores: [...prev.satoScores, score.score] }));
    } catch(e) {
      setSatoScore({ score: 0, level: "Error", whatWorked: "Scoring unavailable.", gapAnalysis: "Could not reach API.", termsHit: [], termsMissed: incident.expectedTerms || [], modelSATO: { situation: "", action: "", tool: "", outcome: "" } });
    }
    setLoading(false); setTimerActive(false); setPhase("decision");
  }

  function submitDecision() {
    if (!selectedOption) return;
    const correct = incident.options.find(o => o.id === selectedOption)?.correct;
    setStats(prev => ({ total: prev.total+1, correct: prev.correct+(correct?1:0), satoScores: prev.satoScores }));
    setPhase("aar");
  }

  const levelColor = l => ({ "Ground Level": "#1D9E75", "Mid Level": "#E8840A", "30,000 Feet": "#E24B4A" }[l] || "#666");
  const levelBg = l => ({ "Ground Level": "#E1F5EE", "Mid Level": "#FEF3E2", "30,000 Feet": "#FCEBEB" }[l] || "#f5f5f5");
  const sevColor = s => ({ Critical: "#E24B4A", High: "#E8840A", Medium: "#185FA5" }[s] || "#666");
  const sevBg = s => ({ Critical: "#FCEBEB", High: "#FEF3E2", Medium: "#E6F1FB" }[s] || "#f5f5f5");
  const mono = { fontFamily: "monospace", fontSize: 12, background: "#0d1117", color: "#58d68d", padding: "10px 12px", borderRadius: 8, lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-all" };

  const st = {
    wrap: { fontFamily: "var(--font-sans)", padding: "1rem", maxWidth: 720, margin: "0 auto" },
    card: { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "1rem", marginBottom: 10 },
    btn: { background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "7px 16px", fontSize: 13, cursor: "pointer", color: "var(--color-text-primary)" },
    btnP: c => ({ background: c, border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 14, cursor: "pointer", color: "#fff", fontWeight: 500 }),
    badge: (bg, color) => ({ background: bg, color, fontSize: 11, padding: "2px 8px", borderRadius: 5, display: "inline-block", fontWeight: 600 }),
    tab: (active, color) => ({ padding: "7px 14px", fontSize: 13, cursor: "pointer", border: "none", borderBottom: active ? `2px solid ${color}` : "2px solid transparent", background: "transparent", color: active ? color : "var(--color-text-secondary)", fontWeight: active ? 600 : 400 }),
    lbl: { fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 3, display: "block" },
    metric: { background: "var(--color-background-secondary)", borderRadius: 8, padding: "0.6rem 0.8rem", textAlign: "center" },
    textarea: { width: "100%", minHeight: 80, borderRadius: 8, border: `1.5px solid ${role?.border || "#ccc"}`, background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontSize: 14, padding: "10px 12px", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", lineHeight: 1.6 },
  };

  const panels = viewMode === "console"
    ? [{ id: "siem", label: "🖥 Alert + Insights" }, { id: "playbook", label: "📋 Playbook" }, { id: "workbook", label: "📁 Workbook" }, { id: "telemetry", label: "🌳 Console (Tree / Net / Intel)" }]
    : [{ id: "siem", label: "🖥 SIEM Alert" }, { id: "playbook", label: "📋 Playbook" }, { id: "workbook", label: "📁 Workbook" }, { id: "telemetry", label: "🔍 Telemetry" }];

  if (screen === "home") return (
    <div style={st.wrap}>
      <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 4px" }}>SOC Workstation Simulator</h2>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>SIEM fires → you articulate your reasoning → then you decide.</p>
      <p style={{ fontSize: 13, color: role?.color || "#1D9E75", margin: "0 0 16px", fontWeight: 500 }}>Forces ground-level specificity before you see the answer options.</p>
      {errorMsg && <div style={{ ...st.card, borderLeft: "3px solid #E8840A", fontSize: 13, color: "#7a4a00" }}>⚠ {errorMsg}</div>}
      {stats.total > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
          {[{ l: "Incidents", v: stats.total }, { l: "Decisions Correct", v: `${stats.correct}/${stats.total}` }, { l: "Avg SATO Score", v: stats.satoScores.length ? (stats.satoScores.reduce((a,b)=>a+b,0)/stats.satoScores.length).toFixed(1)+"/10" : "—" }].map(m => (
            <div key={m.l} style={st.metric}><div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 2 }}>{m.l}</div><div style={{ fontSize: 18, fontWeight: 500 }}>{m.v}</div></div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Scenarios:</span>
        <button style={{ ...st.btn, background: !useAI ? "#E1F5EE" : "transparent", color: !useAI ? "#1D9E75" : "var(--color-text-secondary)" }} onClick={() => setUseAI(false)}>📦 Built-in</button>
        <button style={{ ...st.btn, background: useAI ? "#E6F1FB" : "transparent", color: useAI ? "#185FA5" : "var(--color-text-secondary)" }} onClick={() => setUseAI(true)}>🤖 AI Generated</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
        <button
          onClick={() => setIncludeGenerated(v => !v)}
          aria-label="Toggle live CICIDS/Zeek scenarios"
          style={{ width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer", background: includeGenerated ? "#1D9E75" : "var(--color-border-secondary)", position: "relative", flexShrink: 0 }}
        >
          <span style={{ position: "absolute", top: 2, left: includeGenerated ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
        </button>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Include live CICIDS/Zeek scenarios <span style={{ opacity: 0.7 }}>(network/perimeter, grounded in real flows)</span></span>
      </div>
      {ROLES.map(r => (
        <div key={r.id} style={{ ...st.card, borderLeft: `3px solid ${r.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div><span style={st.badge(r.bg, r.color)}>{r.label}</span><p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "4px 0 0" }}>{r.desc}</p></div>
            <button style={st.btnP(r.color)} onClick={() => launchIncident(r)} disabled={loading}>Launch →</button>
          </div>
        </div>
      ))}
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", margin: "14px 0 6px" }}>🖥 EDR / SIEM Console scenarios — toggle raw logs ↔ console view in-incident</div>
      {[
        { id: "dc", label: "DC / AD Attack — ntdsutil IFM", color: "#A32D2D", bg: "#FCEBEB", border: "#E08A8A", desc: "Tier-0: NTDS.dit credential dump via Living-off-the-Land" },
        { id: "lotl", label: "Endpoint LotL — Credential Dump", color: "#185FA5", bg: "#E6F1FB", border: "#85B7EB", desc: "lsass memory dump + masquerading svchost" }
      ].map(r => (
        <div key={r.id} style={{ ...st.card, borderLeft: `3px solid ${r.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div><span style={st.badge(r.bg, r.color)}>{r.label}</span><p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "4px 0 0" }}>{r.desc}</p></div>
            <button style={st.btnP(r.color)} onClick={() => launchIncident(r)} disabled={loading}>Launch →</button>
          </div>
        </div>
      ))}
      <div style={{ ...st.card, background: "var(--color-background-secondary)", marginTop: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 8px" }}>How this works</p>
        {["SIEM fires — review all 4 panels (Alert, Playbook, Workbook, Telemetry)", "Write your answer in Situation → Action → Tool → Outcome format", "AI scores your specificity — did you name Event IDs, tools, decisions?", "Then pick your response action and see the full After Action Report"].map((t,i) => (
          <p key={i} style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 4px", lineHeight: 1.6 }}>{i+1}. {t}</p>
        ))}
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ ...st.wrap, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 340 }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${role?.border || "#ccc"}`, borderTopColor: role?.color, borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 16 }} />
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>{loadMsg}</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (screen === "workstation" && incident) {
    const currentSATO = SATO[satoStep];
    const allFilled = sato.situation && sato.action && sato.tool && sato.outcome;

    return (
      <div style={st.wrap}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <button style={st.btn} onClick={() => { setTimerActive(false); setScreen("home"); }}>← Hub</button>
          <span style={st.badge(sevBg(incident.severity), sevColor(incident.severity))}>⚠ {incident.severity}</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{incident.incidentId}</span>
          <span style={st.badge("#E6F1FB", "#185FA5")}>{incident.mitre?.split("—")[0]?.trim()}</span>
          {incident.cve && <span style={st.badge("#FCEBEB", "#A32D2D")}>{incident.cve}</span>}
          <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 700, color: elapsed > 90 ? "#E24B4A" : elapsed > 60 ? "#E8840A" : "#1D9E75", fontVariantNumeric: "tabular-nums" }}>
            {Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,"0")}
          </span>
        </div>

        {/* Alert banner */}
        <div style={{ background: sevBg(incident.severity), border: `1px solid ${sevColor(incident.severity)}`, borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: sevColor(incident.severity), margin: "0 0 2px" }}>🔔 {incident.siemAlert?.ruleName}</p>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>Host: {incident.siemAlert?.host} · User: {incident.siemAlert?.user} · {incident.siemAlert?.firedAt}</p>
        </div>

        {/* Phase indicator */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {[["1", "Investigate", "sato"], ["2", "Articulate", "sato"], ["3", "Decide", "decision"], ["4", "Debrief", "aar"]].map(([num, label, p], idx) => {
            const phaseIdx = { sato: 0, decision: 2, aar: 3 };
            const currentIdx = phaseIdx[phase] ?? 0;
            const active = idx <= currentIdx;
            return <div key={num} style={{ flex: 1, textAlign: "center", padding: "4px 0", borderRadius: 6, background: active ? role.bg : "var(--color-background-secondary)", border: `1px solid ${active ? role.border : "var(--color-border-tertiary)"}` }}>
              <div style={{ fontSize: 10, color: active ? role.color : "var(--color-text-secondary)", fontWeight: 600 }}>{num}</div>
              <div style={{ fontSize: 11, color: active ? role.color : "var(--color-text-secondary)" }}>{label}</div>
            </div>;
          })}
        </div>

        {/* Panel tabs */}
        {incident.consoleView && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginRight: 2 }}>View:</span>
            <button style={{ ...st.btn, padding: "5px 12px", fontSize: 12, background: viewMode === "console" ? role.bg : "transparent", color: viewMode === "console" ? role.color : "var(--color-text-secondary)", borderColor: viewMode === "console" ? role.border : "var(--color-border-secondary)" }} onClick={() => setViewMode("console")}>🖥 EDR / SIEM Console</button>
            <button style={{ ...st.btn, padding: "5px 12px", fontSize: 12, background: viewMode === "raw" ? role.bg : "transparent", color: viewMode === "raw" ? role.color : "var(--color-text-secondary)", borderColor: viewMode === "raw" ? role.border : "var(--color-border-secondary)" }} onClick={() => setViewMode("raw")}>📄 Raw Event Logs</button>
            <span style={{ fontSize: 11, color: "var(--color-text-secondary)", marginLeft: 4, opacity: 0.8 }}>same incident, two altitudes</span>
          </div>
        )}

        <div style={{ display: "flex", borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: 12, overflowX: "auto" }}>
          {panels.map(p => <button key={p.id} style={st.tab(activePanel === p.id, role.color)} onClick={() => setActivePanel(p.id)}>{p.label}</button>)}
        </div>

        {/* Panel content */}
        {activePanel === "siem" && viewMode === "raw" && (
          <div style={st.card}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              {[["Host", incident.siemAlert?.host], ["IP", incident.siemAlert?.ip], ["User", incident.siemAlert?.user], ["Rule Type", incident.siemAlert?.ruleType]].map(([l,v]) => (
                <div key={l} style={{ background: "var(--color-background-secondary)", borderRadius: 6, padding: "6px 10px" }}>
                  <div style={st.lbl}>{l}</div><div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={st.lbl}>Raw Log</div>
            <div style={mono}>{incident.siemAlert?.rawLog}</div>
          </div>
        )}
        {activePanel === "siem" && viewMode === "console" && incident.consoleView && (
          <div style={st.card}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              {[["Asset", incident.siemAlert?.host], ["Asset Type", incident.workbook?.assetCriticality], ["Account", incident.siemAlert?.user], ["Detection", incident.siemAlert?.ruleType]].map(([l,v]) => (
                <div key={l} style={{ background: "var(--color-background-secondary)", borderRadius: 6, padding: "6px 10px" }}>
                  <div style={st.lbl}>{l}</div><div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ ...st.lbl, marginBottom: 6 }}>MITRE ATT&CK Mapping</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {incident.consoleView.mitreTactics?.map(t => (
                <span key={t.id} style={st.badge("#E6F1FB", "#185FA5")}>{t.id} · {t.name}</span>
              ))}
            </div>
            <div style={{ ...st.lbl, marginBottom: 6 }}>🧠 Platform Insight Translation</div>
            {incident.consoleView.insights?.map((ins, i) => (
              <div key={i} style={{ background: "#FEF3E2", border: "1px solid #E8840A", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "#7a4a00", marginBottom: 6, wordBreak: "break-all" }}>{ins.trigger}</div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>{ins.insight}</div>
              </div>
            ))}
          </div>
        )}
        {activePanel === "playbook" && (
          <div style={st.card}>
            <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px" }}>{incident.playbookSOP?.title}</p>
            {incident.playbookSOP?.steps?.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ minWidth: 24, height: 24, borderRadius: "50%", background: role.bg, color: role.color, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i+1}</div>
                <p style={{ fontSize: 14, margin: 0, lineHeight: 1.6 }}>{step}</p>
              </div>
            ))}
          </div>
        )}
        {activePanel === "workbook" && (
          <div style={st.card}>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 10px" }}>Asset — {incident.siemAlert?.host}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              {[["Owner", incident.workbook?.assetOwner], ["Criticality", incident.workbook?.assetCriticality], ["Last Patch", incident.workbook?.lastPatchDate], ["Open Ports", incident.workbook?.openPorts?.join(", ")]].map(([l,v]) => (
                <div key={l} style={{ background: "var(--color-background-secondary)", borderRadius: 6, padding: "6px 10px" }}>
                  <div style={st.lbl}>{l}</div><div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "var(--color-background-secondary)", borderRadius: 6, padding: "8px 10px" }}>
              <div style={st.lbl}>Recent Changes</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>{incident.workbook?.recentChanges}</div>
            </div>
          </div>
        )}
        {activePanel === "telemetry" && viewMode === "raw" && (
          <div style={st.card}>
            {[["Auth Events", incident.additionalData?.authEvents, { ...mono, color: "#61afef" }], ["Network Connections", incident.additionalData?.networkConnections, mono], ["Process Tree", incident.additionalData?.processTree, { ...mono, color: "#e06c75" }]].map(([label, data, style]) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ ...st.lbl, marginBottom: 6 }}>{label}</div>
                <div style={style}>{data}</div>
              </div>
            ))}
          </div>
        )}
        {activePanel === "telemetry" && viewMode === "console" && incident.consoleView && (
          <div style={st.card}>
            <div style={{ ...st.lbl, marginBottom: 8 }}>Process Tree — reconstructed</div>
            <div style={{ marginBottom: 16 }}>
              {incident.consoleView.processTree?.map((node, i) => {
                const edge = node.flag === "critical" ? "#E24B4A" : node.flag === "warn" ? "#E8840A" : "var(--color-border-tertiary)";
                const bg = node.flag === "critical" ? "#FCEBEB" : node.flag === "warn" ? "#FEF3E2" : "var(--color-background-secondary)";
                const txt = node.flag === "critical" ? "#A32D2D" : node.flag === "warn" ? "#7a4a00" : "var(--color-text-primary)";
                return (
                  <div key={i} style={{ marginLeft: node.depth * 22, marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      {node.depth > 0 && <span style={{ color: "var(--color-text-secondary)", fontFamily: "monospace", fontSize: 13, marginTop: 6 }}>└──►</span>}
                      <div style={{ flex: 1, background: bg, border: `1px solid ${edge}`, borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: txt }}>
                          {node.flag === "critical" ? "🛑 " : node.flag === "warn" ? "⚠ " : ""}{node.proc}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 3, lineHeight: 1.5 }}>{node.note}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ ...st.lbl, marginBottom: 8 }}>Behavioral Network Alerts</div>
            <div style={{ marginBottom: 16 }}>
              {incident.consoleView.networkAlerts?.map((a, i) => (
                <div key={i} style={{ background: "#FCEBEB", border: "1px solid #E08A8A", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#A32D2D", marginBottom: 2 }}>🔔 {a.name}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{a.detail}</div>
                </div>
              ))}
            </div>

            <div style={{ ...st.lbl, marginBottom: 8 }}>Threat Intel & Hash Reputation</div>
            <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px 12px" }}>
              {[["File", incident.consoleView.threatIntel?.fileName], ["SHA-256", incident.consoleView.threatIntel?.sha256], ["Global Reputation", incident.consoleView.threatIntel?.reputation], ["Attribution", incident.consoleView.threatIntel?.attribution]].map(([l,v]) => (
                <div key={l} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", minWidth: 110, fontWeight: 600 }}>{l}</div>
                  <div style={{ fontSize: 12, fontFamily: l === "SHA-256" ? "monospace" : "inherit", wordBreak: "break-all", color: l === "Global Reputation" && /malicious/i.test(v || "") ? "#A32D2D" : "var(--color-text-primary)", fontWeight: l === "Global Reputation" ? 700 : 400 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 1: SATO Input */}
        {phase === "sato" && (
          <div style={{ ...st.card, borderTop: `3px solid ${role.color}`, marginTop: 4 }}>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Articulate your analysis — before you see the options</p>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 12px" }}>Review the panels above first. Then answer each field with specific technical detail — Event IDs, tool names, exact decisions.</p>

            {/* Step tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {SATO.map((s, i) => (
                <button key={s.id} style={{ ...st.btn, borderColor: sato[s.id] ? role.color : "var(--color-border-tertiary)", color: satoStep === i ? role.color : sato[s.id] ? role.color : "var(--color-text-secondary)", background: satoStep === i ? role.bg : "transparent", fontSize: 12 }} onClick={() => setSatoStep(i)}>
                  {i+1}. {s.label} {sato[s.id] ? "✓" : ""}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: role.color, display: "block", marginBottom: 4 }}>{currentSATO.label}</label>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>{currentSATO.hint}</p>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic", margin: "0 0 8px" }}>{currentSATO.placeholder}</p>
              <textarea style={st.textarea} value={sato[currentSATO.id]} onChange={e => setSato(prev => ({ ...prev, [currentSATO.id]: e.target.value }))} rows={3} />
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {satoStep < 3 && sato[currentSATO.id] && <button style={st.btnP(role.color)} onClick={() => setSatoStep(satoStep+1)}>Next field →</button>}
              {satoStep > 0 && <button style={st.btn} onClick={() => setSatoStep(satoStep-1)}>← Back</button>}
              {allFilled && <button style={st.btnP(role.color)} onClick={submitSATO}>Submit & Score My Answer</button>}
            </div>

            {/* Live preview */}
            {(sato.situation || sato.action || sato.tool || sato.outcome) && (
              <div style={{ marginTop: 12, background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px 12px" }}>
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>Your answer preview</p>
                {SATO.map(s => sato[s.id] ? (
                  <p key={s.id} style={{ fontSize: 13, margin: "0 0 6px", lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, color: role.color }}>{s.label}: </span>{sato[s.id]}
                  </p>
                ) : null)}
              </div>
            )}
          </div>
        )}

        {/* PHASE 2: Decision (with SATO score shown) */}
        {phase === "decision" && (
          <div>
            {satoScore && (
              <div style={{ ...st.card, borderLeft: `3px solid ${levelColor(satoScore.level)}`, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={st.badge(levelBg(satoScore.level), levelColor(satoScore.level))}>{satoScore.level}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: levelColor(satoScore.level) }}>{satoScore.score}/10</span>
                  <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Articulation score</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1D9E75", margin: "0 0 3px" }}>What worked</p>
                <p style={{ fontSize: 13, margin: "0 0 10px", lineHeight: 1.6 }}>{satoScore.whatWorked}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#E24B4A", margin: "0 0 3px" }}>Gap</p>
                <p style={{ fontSize: 13, margin: "0 0 10px", lineHeight: 1.6 }}>{satoScore.gapAnalysis}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {satoScore.termsHit?.map(t => <span key={t} style={st.badge("#E1F5EE", "#1D9E75")}>✓ {t}</span>)}
                  {satoScore.termsMissed?.map(t => <span key={t} style={st.badge("#FCEBEB", "#A32D2D")}>✗ {t}</span>)}
                </div>
              </div>
            )}
            <div style={{ ...st.card, borderTop: `3px solid ${role.color}` }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 10px" }}>Now select your response action</p>
              {incident.options?.map(opt => (
                <div key={opt.id} onClick={() => setSelectedOption(opt.id)} style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 8, marginBottom: 8, cursor: "pointer", border: `0.5px solid ${selectedOption === opt.id ? role.color : "var(--color-border-tertiary)"}`, background: selectedOption === opt.id ? role.bg : "var(--color-background-secondary)", transition: "all 0.15s" }}>
                  <div style={{ minWidth: 18, height: 18, borderRadius: "50%", border: `2px solid ${selectedOption === opt.id ? role.color : "var(--color-border-secondary)"}`, background: selectedOption === opt.id ? role.color : "transparent", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 2px", color: selectedOption === opt.id ? role.color : "var(--color-text-primary)" }}>{opt.label}</p>
                    <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>{opt.action}</p>
                  </div>
                </div>
              ))}
              {selectedOption && <button style={{ ...st.btnP(role.color), marginTop: 8 }} onClick={submitDecision}>Submit decision</button>}
            </div>
          </div>
        )}

        {/* PHASE 3: AAR */}
        {phase === "aar" && (
          <div>
            {incident.options?.map(opt => {
              const chosen = opt.id === selectedOption;
              return (
                <div key={opt.id} style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 8, border: `0.5px solid ${opt.correct ? "#1D9E75" : chosen ? "#E24B4A" : "var(--color-border-tertiary)"}`, background: opt.correct ? "#E1F5EE" : chosen ? "#FCEBEB" : "var(--color-background-secondary)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span>{opt.correct ? "✅" : chosen ? "❌" : "○"}</span>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: opt.correct ? "#1D9E75" : chosen ? "#A32D2D" : "var(--color-text-secondary)" }}>{opt.label}</p>
                    {chosen && !opt.correct && <span style={st.badge("#FCEBEB", "#A32D2D")}>Your answer</span>}
                    {opt.correct && <span style={st.badge("#E1F5EE", "#1D9E75")}>Correct</span>}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6 }}>{opt.explanation}</p>
                </div>
              );
            })}

            {/* Model SATO comparison */}
            {satoScore?.modelSATO && (
              <div style={{ ...st.card, borderLeft: `3px solid ${role.border}`, marginTop: 4 }}>
                <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>📊 Ground-Level Model Answer</p>
                {SATO.map(s => (
                  <div key={s.id} style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", margin: "0 0 2px" }}>{s.label}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div style={{ background: "#FCEBEB", borderRadius: 6, padding: "8px 10px" }}>
                        <p style={{ fontSize: 11, color: "#A32D2D", margin: "0 0 3px", fontWeight: 600 }}>You said</p>
                        <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5, color: "#333" }}>{sato[s.id] || "—"}</p>
                      </div>
                      <div style={{ background: "#E1F5EE", borderRadius: 6, padding: "8px 10px" }}>
                        <p style={{ fontSize: 11, color: "#1D9E75", margin: "0 0 3px", fontWeight: 600 }}>Ground level</p>
                        <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5, color: "#333" }}>{satoScore.modelSATO[s.id]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ ...st.card, borderLeft: `3px solid ${role.border}` }}>
              <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>📄 After Action Report</p>
              {[["What happened", incident.afterActionReport?.whatHappened], ["Red Team TTP", incident.afterActionReport?.redTeamTTP], ["Lesson learned", incident.afterActionReport?.lessonsLearned]].map(([l,v]) => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", margin: "0 0 3px" }}>{l}</p>
                  <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>{v}</p>
                </div>
              ))}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {incident.afterActionReport?.keyTerms?.map(t => <span key={t} style={st.badge("#E6F1FB", "#185FA5")}>{t}</span>)}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={st.btnP(role.color)} onClick={() => launchIncident(role)}>Next incident →</button>
              <button style={st.btn} onClick={() => { setTimerActive(false); setScreen("home"); }}>← Hub</button>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
}
