#!/usr/bin/env node
/**
 * Clear notes on Fireflies-imported tasks whose text is only a name line
 * (*First** / *First Last** style artifacts — no actionable task body).
 */
const fs = require("fs");
const path = require("path");

const sectionsPath = path.join(__dirname, "..", "data", "sections.json");
const DRY = process.argv.includes("--dry-run");

function isNameOnlyArtifact(text) {
  const t = (text || "").trim();
  if (/\(\d{1,2}:\d{2}\)/.test(t)) return false;
  if (t.length > 140) return false;
  // *First Last** (Fireflies quirk) or **First Last** (markdown name-only)
  if (/^\*[^*\n]+\*+\s*$/.test(t)) return true;
  if (/^\*\*[^*\n]+\*\*\s*$/.test(t)) return true;
  return false;
}

const sections = JSON.parse(fs.readFileSync(sectionsPath, "utf8"));
let n = 0;

for (const sec of sections) {
  for (const it of sec.items || []) {
    const tags = it.tags || [];
    if (!tags.includes("firefly")) continue;
    if (!isNameOnlyArtifact(it.text)) continue;
    if (!it.notes || !String(it.notes).trim()) continue;
    n++;
    if (!DRY) it.notes = "";
  }
}

console.log(JSON.stringify({ dryRun: DRY, notesCleared: n }, null, 2));

if (!DRY) {
  fs.writeFileSync(sectionsPath, JSON.stringify(sections, null, 2) + "\n", "utf8");
  console.log("Wrote", sectionsPath);
}
