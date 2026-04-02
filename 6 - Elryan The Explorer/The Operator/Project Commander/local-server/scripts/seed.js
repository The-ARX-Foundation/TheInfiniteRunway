#!/usr/bin/env node
/**
 * Run this once to seed data/config.json and data/sections.json
 * with Landon's current backlog (extracted from Claude conversations).
 *
 * Usage: node scripts/seed.js
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
fs.mkdirSync(path.join(DATA_DIR, "inbox"), { recursive: true });

const config = {
  teamName: "Landon's Backlog",
  statuses: [
    { key: "backlog", label: "Backlog", icon: "○", color: "#64748b" },
    { key: "todo", label: "To Do", icon: "◻", color: "#94a3b8" },
    { key: "in-progress", label: "In Progress", icon: "◐", color: "#6366f1" },
    { key: "review", label: "Review / Waiting", icon: "◑", color: "#a78bfa" },
    { key: "done", label: "Done", icon: "✓", color: "#22c55e" },
    { key: "blocked", label: "Blocked", icon: "⊘", color: "#ef4444" },
  ],
  members: [
    { id: "landon", name: "Landon", initials: "LD", color: "#6366f1" },
    { id: "peter", name: "Peter", initials: "PB", color: "#10b981" },
    { id: "yash", name: "Yash", initials: "YS", color: "#f59e0b" },
    { id: "ernie", name: "Ernie", initials: "ER", color: "#ef4444" },
    { id: "syscon", name: "Syscon", initials: "SC", color: "#64748b" },
  ],
  tags: [
    { key: "security", label: "Security", color: "#ef4444" },
    { key: "infra", label: "Infra / DevOps", color: "#f59e0b" },
    { key: "corporate", label: "Corporate Platform", color: "#8b5cf6" },
    { key: "email", label: "Email / Comms", color: "#3b82f6" },
    { key: "linux", label: "Linux Setup", color: "#10b981" },
    { key: "hipaa", label: "HIPAA / PHI", color: "#dc2626" },
    { key: "client", label: "Client Work", color: "#ec4899" },
    { key: "ops", label: "Ops / Admin", color: "#64748b" },
    { key: "blocked-ext", label: "Blocked External", color: "#f97316" },
  ],
};

const now = Date.now();
const sections = [
  {
    id: "sec-security", title: "🔒 Security & Compliance", order: 1,
    items: [
      { id: "t-psa-circulate", text: "Circulate PHI Security PSA to global announcements", status: "todo", owner: "landon", priority: 1, tags: ["security", "hipaa"], due: "", notes: "Doc is ready (docx + md). Post to global announcements channel. 48hr compliance deadline once posted. https://claude.ai/chat/23b92fca-d486-457b-91ea-f906bd2fcd84", subtasks: [{ id: "st1", text: "Post to global announcements", done: false }, { id: "st2", text: "Follow up non-responses after 48hrs", done: false }], created: now - 600000 },
      { id: "t-psa-confirm", text: "Confirm team compliance with PHI PSA (passwords + 2FA)", status: "backlog", owner: "landon", priority: 1, tags: ["security", "hipaa"], due: "", notes: "Track acknowledgments. Non-compliant → off PHI projects.", subtasks: [], created: now - 500000 },
      { id: "t-compass-ciso", text: "Email Compass CISO — security methods approval + management handoff", status: "todo", owner: "landon", priority: 1, tags: ["security", "hipaa", "email"], due: "", notes: "Draft ready. Syscon vs Compass ownership is open. Share PHI PSA doc. https://claude.ai/chat/23b92fca-d486-457b-91ea-f906bd2fcd84", subtasks: [{ id: "st2a", text: "Send email to Compass CISO", done: false }, { id: "st2b", text: "Attach PHI PSA doc", done: false }, { id: "st2c", text: "Schedule meeting", done: false }], created: now - 490000 },
      { id: "t-norton-email", text: "Email Amanda/Lisa — endpoint protection (Norton Windows only, CrowdStrike/ESET for Linux)", status: "todo", owner: "landon", priority: 2, tags: ["security", "email", "linux"], due: "", notes: "Norton 360 does NOT support Linux. Draft ready — amended. https://claude.ai/chat/4c02c0a6-5303-4fdb-ac20-728286594f4c", subtasks: [], created: now - 480000 },
      { id: "t-linux-endpoint", text: "Install Linux endpoint protection on Bazzite + Arch", status: "backlog", owner: "landon", priority: 2, tags: ["security", "linux"], due: "", notes: "CrowdStrike Falcon or ESET. Bazzite immutable — may need Distrobox.", subtasks: [{ id: "st3a", text: "Get approval from Amanda/Lisa", done: false }, { id: "st3b", text: "Install on Bazzite", done: false }, { id: "st3c", text: "Install on Arch", done: false }], created: now - 470000 },
      { id: "t-pentest", text: "Run pen test on all 3 devices (Nmap + OpenVAS + Lynis)", status: "backlog", owner: "landon", priority: 2, tags: ["security", "linux"], due: "", notes: "Full checklist in prep doc. Export PDF reports for CISO meeting. https://claude.ai/chat/4c02c0a6-5303-4fdb-ac20-728286594f4c", subtasks: [{ id: "st4a", text: "Document all 3 devices", done: false }, { id: "st4b", text: "Update all systems", done: false }, { id: "st4c", text: "Nmap scans", done: false }, { id: "st4d", text: "OpenVAS scans", done: false }, { id: "st4e", text: "Lynis audit", done: false }, { id: "st4f", text: "Remediate Critical/High", done: false }, { id: "st4g", text: "Compile report PDF", done: false }], created: now - 460000 },
      { id: "t-whitelist", text: "Send email whitelist to Syscon (quarantine bypass)", status: "todo", owner: "landon", priority: 3, tags: ["ops", "email"], due: "", notes: "Domains: smartsheet.com, sharepointonline.com, mail.anthropic.com. Draft ready. https://claude.ai/chat/b3881b9e-ca31-48c2-9d9a-a4796a16b972", subtasks: [], created: now - 300000 },
    ],
  },
  {
    id: "sec-zradar", title: "📡 Z-Radar / Linux Device Access", order: 2,
    items: [
      { id: "t-michele-reply", text: "Reply to Michele — request CISO-to-CISO meeting for Linux device registration", status: "todo", owner: "landon", priority: 1, tags: ["email", "security", "client"], due: "", notes: "Draft ready. Error 53003 — Conditional Access blocks Linux. https://claude.ai/chat/4c02c0a6-5303-4fdb-ac20-728286594f4c", subtasks: [], created: now - 440000 },
      { id: "t-winboat-bazzite", text: "Install WinBoat + Podman on Bazzite desktop", status: "todo", owner: "landon", priority: 2, tags: ["linux", "infra"], due: "", notes: "WinBoat runs Windows in Podman container. Bazzite has Podman pre-installed. Win11 IoT LTSC, 4-6 cores, 8GB RAM.", subtasks: [{ id: "st5a", text: "Install podman-compose", done: false }, { id: "st5b", text: "Download WinBoat RPM", done: false }, { id: "st5c", text: "Install Teams in container", done: false }, { id: "st5d", text: "Test Teams login", done: false }], created: now - 430000 },
      { id: "t-winboat-arch", text: "Install WinBoat + Podman on Arch laptop", status: "todo", owner: "landon", priority: 2, tags: ["linux", "infra"], due: "", notes: "pacman -S podman podman-compose. AppImage. Fallback: QEMU/KVM.", subtasks: [{ id: "st6a", text: "Install podman", done: false }, { id: "st6b", text: "Download WinBoat", done: false }, { id: "st6c", text: "Install Teams", done: false }, { id: "st6d", text: "Test login", done: false }], created: now - 420000 },
      { id: "t-ciso-meeting", text: "Attend CISO meeting — present security posture, get Linux approval", status: "backlog", owner: "landon", priority: 1, tags: ["security", "client", "blocked-ext"], due: "", notes: "Blocked on: pen test report + Michele scheduling response.", subtasks: [], created: now - 410000 },
    ],
  },
  {
    id: "sec-corporate", title: "🏗️ Corporate Platform Buildout", order: 3,
    items: [
      { id: "t-roadmap-smartsheet", text: "Upload roadmap CSV to Smartsheet for Peter", status: "review", owner: "peter", priority: 1, tags: ["corporate", "ops"], due: "", notes: "9 phases, 42+ features. Add item 9.06 (Compass CISO governance). https://claude.ai/chat/5dfcf46e-c5c3-435d-9bfa-45d968693db4", subtasks: [], created: now - 700000 },
      { id: "t-sniffer-editor", text: "Build sniffer editor UI (Phase 2)", status: "backlog", owner: "landon", priority: 1, tags: ["corporate"], due: "", notes: "Custom instructions, version history, A/B testing. Mockup done.", subtasks: [], created: now - 690000 },
      { id: "t-card-builder", text: "Build card builder — JSON + React (Phase 4)", status: "backlog", owner: "landon", priority: 1, tags: ["corporate"], due: "", notes: "JSON arrays + React pointers + HTML. Mockup done.", subtasks: [], created: now - 680000 },
      { id: "t-chat-routing", text: "Wire file context into live chat responses (Phase 1 critical path)", status: "backlog", owner: "landon", priority: 1, tags: ["corporate"], due: "", notes: "Pipeline partially exists. Most critical path item.", subtasks: [], created: now - 670000 },
      { id: "t-github-sync", text: "GitHub sync for RAG mass data upload (Phase 3)", status: "backlog", owner: "landon", priority: 2, tags: ["corporate"], due: "", notes: "Needed for Devin-style chat-with-codebase.", subtasks: [], created: now - 660000 },
      { id: "t-graph-api", text: "Check with Yash on Microsoft Graph API integration", status: "review", owner: "yash", priority: 2, tags: ["corporate", "email"], due: "", notes: "Email draft ready (congrats on baby). Affects Phases 6.03 + 7.03. Also check Syscon for existing App Registration. https://claude.ai/chat/b3881b9e-ca31-48c2-9d9a-a4796a16b972", subtasks: [{ id: "st8a", text: "Send email to Yash", done: false }, { id: "st8b", text: "Check Syscon on App Registration", done: false }], created: now - 650000 },
      { id: "t-powerautomate", text: "Power Automate — pull meeting transcripts (Firefly → Corporate → KB)", status: "backlog", owner: "landon", priority: 2, tags: ["corporate"], due: "", notes: "Phase 6.03. Depends on Graph API.", subtasks: [], created: now - 640000 },
      { id: "t-scheduled-agents", text: "Scheduled Agent Tasks / Cron Jobs (novel)", status: "backlog", owner: "landon", priority: 3, tags: ["corporate"], due: "", notes: "Recurring AI tasks. ChatGPT + MS Teams have this.", subtasks: [], created: now - 630000 },
      { id: "t-sniffer-versioning", text: "Prompt/Sniffer Versioning & A/B Testing (novel)", status: "backlog", owner: "landon", priority: 3, tags: ["corporate"], due: "", notes: "Git for sniffers. See PromptLayer, Braintrust.", subtasks: [], created: now - 620000 },
      { id: "t-confidence-scoring", text: "Confidence scoring on RAG responses (novel)", status: "backlog", owner: "landon", priority: 3, tags: ["corporate"], due: "", notes: "Critical for healthcare compliance.", subtasks: [], created: now - 610000 },
      { id: "t-workflow-builder", text: "Visual workflow builder — chain sniffers + RAG + actions (novel)", status: "backlog", owner: "landon", priority: 3, tags: ["corporate"], due: "", notes: "n8n/Zapier for internal agent system.", subtasks: [], created: now - 600000 },
    ],
  },
  {
    id: "sec-client", title: "🏥 Client Projects", order: 4,
    items: [
      { id: "t-bundled-keys", text: "Finalize AdmitConnect V1.3.0 bundled target keys", status: "review", owner: "landon", priority: 1, tags: ["client"], due: "", notes: "37 bundles, 181 keys. Need instruction template redraft. https://claude.ai/chat/5a953365-8a49-4e56-ad70-1905ecc1433b", subtasks: [], created: now - 750000 },
      { id: "t-contract-questions", text: "Payer-Facility Contract Questions — finalize + deploy", status: "review", owner: "landon", priority: 2, tags: ["client"], due: "", notes: "96 variables, 14 sections. XLSX ready. https://claude.ai/chat/02a0ba04-0b3b-47d7-9659-4e06f3741acf", subtasks: [], created: now - 740000 },
      { id: "t-patient-template", text: "Patient data template with dynamic variable refs — validate", status: "review", owner: "landon", priority: 2, tags: ["client"], due: "", notes: "JSON with block.DataStore pointers. Needs live validation. https://claude.ai/chat/b21e3c4d-84a8-4633-92d0-caafc8a9bb13", subtasks: [], created: now - 730000 },
      { id: "t-datablock", text: "Add dataBlockParent/dataBlockName to intake forms", status: "done", owner: "landon", priority: 2, tags: ["client"], due: "", notes: "Done. Added chunkSize, dataBlockParent, dataBlockName to ZimmetDemo.", subtasks: [], created: now - 720000 },
    ],
  },
  {
    id: "sec-comms", title: "💬 Team Comms & Organization", order: 5,
    items: [
      { id: "t-careally-team", text: "Convince Ernie to create dedicated CareAlly Team in MS Teams", status: "todo", owner: "landon", priority: 2, tags: ["ops", "email"], due: "", notes: "Pitch drafted (casual + formal). PHI permissioning, scoped channels. https://claude.ai/chat/14740cae-612a-43be-97a0-8a8c9f312ea2", subtasks: [{ id: "st9a", text: "Send pitch to Ernie", done: false }, { id: "st9b", text: "Follow up", done: false }], created: now - 550000 },
      { id: "t-crm-contacts", text: "Extract frequent email contacts + import into CRM", status: "backlog", owner: "landon", priority: 3, tags: ["ops", "corporate"], due: "", notes: "Automate via Power Automate → Graph API. https://claude.ai/chat/b3881b9e-ca31-48c2-9d9a-a4796a16b972", subtasks: [], created: now - 540000 },
    ],
  },
  {
    id: "sec-workstation", title: "🖥️ Workstation & Local Setup", order: 6,
    items: [
      { id: "t-onedrive-migrate", text: "Run OneDrive migration script (38+ folders → 6 top-level)", status: "todo", owner: "landon", priority: 2, tags: ["ops", "infra"], due: "", notes: "PowerShell script + transfer doc ready. Run -DryRun first. https://claude.ai/chat/f93e745a-e338-4e8e-b86d-c39af10a233d", subtasks: [{ id: "st10a", text: "Run -DryRun", done: false }, { id: "st10b", text: "Review output", done: false }, { id: "st10c", text: "Run for real", done: false }, { id: "st10d", text: "Verify + fix orphans", done: false }], created: now - 400000 },
      { id: "t-wifi-split", text: "Submit Starlink Wi-Fi reimbursement (business/personal split)", status: "todo", owner: "landon", priority: 4, tags: ["ops"], due: "", notes: "Rationale doc ready, ~50% split. Need 1 month Windows Data Usage baseline. https://claude.ai/chat/ba2f02bf-b88c-4173-908c-6da189fbcdea", subtasks: [{ id: "st11a", text: "Screenshot Data Usage", done: false }, { id: "st11b", text: "Fill in bill amount", done: false }, { id: "st11c", text: "Submit", done: false }], created: now - 350000 },
      { id: "t-gloves", text: "Get compression gloves for programming", status: "in-progress", owner: "landon", priority: 3, tags: ["ops"], due: "", notes: "Two-pair approach: cooling athletic + Copper Fit. Writer's Glove V3 online.", subtasks: [], created: now - 200000 },
      { id: "t-xm6-fix", text: "Sony XM6 + Teams audio fix", status: "done", owner: "landon", priority: 3, tags: ["infra"], due: "", notes: "Fixed. Disabled HFP headset profile, stereo only + built-in mic.", subtasks: [], created: now - 900000 },
    ],
  },
];

fs.writeFileSync(path.join(DATA_DIR, "config.json"), JSON.stringify(config, null, 2));
fs.writeFileSync(path.join(DATA_DIR, "sections.json"), JSON.stringify(sections, null, 2));

console.log(`  ✓ Seeded ${sections.reduce((a, s) => a + s.items.length, 0)} tasks across ${sections.length} sections`);
console.log(`  ✓ Config: ${path.join(DATA_DIR, "config.json")}`);
console.log(`  ✓ Sections: ${path.join(DATA_DIR, "sections.json")}`);
