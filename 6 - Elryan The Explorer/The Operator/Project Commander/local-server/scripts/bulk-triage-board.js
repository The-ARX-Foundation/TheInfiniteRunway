#!/usr/bin/env node
/**
 * One-shot triage: move noise to backlog, map string "owners" to member ids.
 * Run from repo: node scripts/bulk-triage-board.js [--dry-run]
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "data");
const sectionsPath = path.join(DATA, "sections.json");
const configPath = path.join(DATA, "config.json");

const DRY = process.argv.includes("--dry-run");

const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
const memberIds = new Set(cfg.members.map((m) => m.id));
const membersByName = {};
for (const m of cfg.members) {
  membersByName[m.name.toLowerCase()] = m.id;
  membersByName[m.name.split("(")[0].trim().toLowerCase()] = m.id;
}

const ROLE_OWNER = {
  "systems admin": "landon",
  "ceo / founder": "peter",
  ceo: "peter",
  founder: "peter",
  "hr / people ops": "amanda",
  "project manager": "amanda",
  "bob nimon": "bob",
  "bob n.": "bob",
  "frontend developer": "matthew",
  "qa engineer": "yash",
  "backend developer": "david",
  "pipeline engineer": "landon",
  "data analyst": "landon",
  "product manager": "peter",
  designer: "matthew",
};

function isNameOnlyArtifact(text) {
  const t = (text || "").trim();
  if (/\(\d{1,2}:\d{2}\)/.test(t)) return false;
  if (t.length > 140) return false;
  return /^\*[^*\n]+\*+\s*$/.test(t);
}

function isFirefliesSection(sec) {
  return (
    sec.id.startsWith("sec-ff-") ||
    (sec.title && sec.title.includes("Fireflies"))
  );
}

function isDelegateSection(sec) {
  return sec.title && sec.title.includes("Delegate");
}

function protectItem(sec, it) {
  if (sec.id === "sec-week-landon-202604") return true;
  if (sec.id === "sec-security") {
    if (it.status === "done" || it.status === "backlog") return true;
    if (it.priority <= 2) return true;
  }
  if (sec.id === "sec-inbox") return true;
  return false;
}

function extractAssignedLine(notes, text) {
  const blob = `${notes || ""}\n${text || ""}`;
  const m = blob.match(/Assigned:\s*([^\n]+)/i);
  return m ? m[1].trim() : "";
}

function resolveOwnerFromText(assigned, notes, text) {
  const blob = `${assigned} ${notes || ""} ${text || ""}`.toLowerCase();
  const role = assigned.toLowerCase();
  if (ROLE_OWNER[role]) return ROLE_OWNER[role];
  for (const [k, v] of Object.entries(ROLE_OWNER)) {
    if (role.includes(k) || blob.includes(k)) return v;
  }
  for (const m of cfg.members) {
    const ln = m.name.toLowerCase();
    if (assigned.toLowerCase().includes(ln) || blob.includes(ln)) return m.id;
    const first = ln.split(/\s+/)[0];
    if (first.length > 2 && blob.includes(first)) return m.id;
  }
  return null;
}

function shouldBacklog(sec, it) {
  if (it.status === "done" || it.status === "backlog") return false;
  if (protectItem(sec, it)) return false;

  if (isNameOnlyArtifact(it.text)) return "name-only";

  if (isDelegateSection(sec) && it.status === "todo") return "delegate-queue";

  if (isFirefliesSection(sec)) {
    if (it.status === "todo" && it.priority >= 4) return "fireflies-p4+";
    if (it.status === "todo" && it.priority === 3) {
      const len = (it.text || "").length;
      if (len < 100) return "fireflies-short-p3";
    }
    if (it.status === "review" && it.priority >= 3) return "fireflies-stale-review";
  }

  if (String(it.id || "").startsWith("ol_") && it.status === "todo" && it.priority >= 3)
    return "ollama-low";

  return false;
}

let sections = JSON.parse(fs.readFileSync(sectionsPath, "utf8"));

const stats = {
  backlog: {},
  ownerFixed: 0,
  ownerUnmapped: [],
};

for (const sec of sections) {
  for (const it of sec.items || []) {
    if (protectItem(sec, it)) continue;

    const reason = shouldBacklog(sec, it);
    if (reason) {
      stats.backlog[reason] = (stats.backlog[reason] || 0) + 1;
      if (!DRY) {
        it.status = "backlog";
        const tag = `[Backlog triage: ${reason}]`;
        it.notes = it.notes ? `${it.notes}\n${tag}` : tag;
      }
    }
  }
}

for (const sec of sections) {
  for (const it of sec.items || []) {
    if (protectItem(sec, it)) continue;
    const oid = (it.owner || "").trim();
    if (oid && memberIds.has(oid)) continue;

    const assigned = extractAssignedLine(it.notes, it.text);
    const resolved =
      resolveOwnerFromText(assigned, it.notes, it.text) ||
      (oid ? resolveOwnerFromText(oid, it.notes, it.text) : null);

    if (resolved) {
      if (!DRY) it.owner = resolved;
      stats.ownerFixed++;
    } else if (oid || assigned) {
      stats.ownerUnmapped.push({
        sec: sec.title.slice(0, 40),
        owner: oid || assigned,
        text: (it.text || "").slice(0, 50),
      });
    } else if (!oid) {
      if (!DRY) it.owner = "landon";
      stats.ownerFixed++;
    }
  }
}

console.log(JSON.stringify({ dryRun: DRY, backlogByReason: stats.backlog, ownerFixed: stats.ownerFixed, ownerUnmappedSample: stats.ownerUnmapped.slice(0, 15), ownerUnmappedCount: stats.ownerUnmapped.length }, null, 2));

if (!DRY) {
  fs.writeFileSync(sectionsPath, JSON.stringify(sections, null, 2) + "\n", "utf8");
  console.log("Wrote", sectionsPath);
}
