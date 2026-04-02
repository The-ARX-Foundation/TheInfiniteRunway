#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════
 *  PROJECT COMMAND — CLI / Claude Code Integration
 * ═══════════════════════════════════════════════════════════════════
 *
 *  USAGE (standalone):
 *    node pc.js list                         # list all tasks
 *    node pc.js list --status todo           # filter by status
 *    node pc.js list --priority 1            # filter by priority
 *    node pc.js list --tag security          # filter by tag
 *    node pc.js add "Task text" --section "Security" --priority 1 --tag security,hipaa
 *    node pc.js done <task-id>               # mark done
 *    node pc.js update <task-id> --status in-progress --notes "Started working"
 *    node pc.js inbox                        # list pending inbox files
 *    node pc.js consume                      # merge inbox into sections
 *    node pc.js push <file.json>             # push a JSON file to inbox
 *    node pc.js health                       # server health check
 *    node pc.js export                       # dump all data as JSON
 *
 *  USAGE (Claude Code scheduled script):
 *    This script can be called from a cron job or Claude Code hook.
 *    Example cron: */30 * * * * node /path/to/pc.js consume
 *
 *  ENV:
 *    PC_API=http://localhost:3780/api    # override API base URL
 *
 * ═══════════════════════════════════════════════════════════════════
 */

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const API = process.env.PC_API || "http://localhost:3780/api";

// ── HTTP helper ─────────────────────────────────────────────────
function request(urlPath, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const full = API + urlPath;
    const u = new URL(full);
    const mod = u.protocol === "https:" ? https : http;
    const opts = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method,
      headers: { "Content-Type": "application/json" },
    };
    const req = mod.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ── Helpers ──────────────────────────────────────────────────────
function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      flags[key] = val;
    } else {
      positional.push(argv[i]);
    }
  }
  return { flags, positional };
}

const PRIORITY_LABELS = { 1: "P1 CRIT", 2: "P2 HIGH", 3: "P3 MED", 4: "P4 LOW" };
const STATUS_ICONS = { backlog: "○", todo: "◻", "in-progress": "◐", review: "◑", done: "✓", blocked: "⊘" };

function formatTask(t, verbose = false) {
  const icon = STATUS_ICONS[t.status] || "?";
  const pri = PRIORITY_LABELS[t.priority] || "P?";
  const tags = (t.tags || []).join(",");
  const due = t.due ? ` due:${t.due}` : "";
  let line = `  ${icon} [${pri}] ${t.id}  ${t.text}${due}${tags ? ` [${tags}]` : ""}`;
  if (t.status === "done") line = `  \x1b[2m${line}\x1b[0m`;
  else if (t.priority === 1) line = `  \x1b[31m${line}\x1b[0m`;
  else if (t.status === "blocked") line = `  \x1b[33m${line}\x1b[0m`;
  if (verbose && t.notes) line += `\n      Notes: ${t.notes.slice(0, 120)}${t.notes.length > 120 ? "..." : ""}`;
  return line;
}

// ── Commands ────────────────────────────────────────────────────
async function cmdList(flags) {
  const tasks = await request("/tasks");
  if (!Array.isArray(tasks)) { console.error("Failed to fetch tasks"); process.exit(1); }

  let filtered = tasks;
  if (flags.status) filtered = filtered.filter(t => t.status === flags.status);
  if (flags.priority) filtered = filtered.filter(t => t.priority === Number(flags.priority));
  if (flags.tag) filtered = filtered.filter(t => (t.tags || []).includes(flags.tag));
  if (flags.section) filtered = filtered.filter(t => t.sectionTitle.toLowerCase().includes(flags.section.toLowerCase()));

  // Group by section
  const groups = {};
  for (const t of filtered) {
    const key = t.sectionTitle || "Unsorted";
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }

  const total = filtered.length;
  const done = filtered.filter(t => t.status === "done").length;
  console.log(`\n  PROJECT COMMAND — ${total} tasks (${done} done)\n`);

  for (const [section, items] of Object.entries(groups)) {
    console.log(`\n  ── ${section} (${items.length}) ──`);
    for (const t of items) console.log(formatTask(t, flags.verbose));
  }
  console.log("");
}

async function cmdAdd(text, flags) {
  if (!text) { console.error("Usage: pc.js add \"Task text\" [--section ...] [--priority ...] [--tag ...]"); process.exit(1); }

  // Find section by name
  let sectionId = null;
  if (flags.section) {
    const sections = await request("/sections");
    const match = sections.find(s => s.title.toLowerCase().includes(flags.section.toLowerCase()));
    if (match) sectionId = match.id;
    else {
      // Create section
      const created = await request("/sections", "POST", { title: flags.section });
      sectionId = created.id;
      console.log(`  Created section: ${flags.section}`);
    }
  }

  const task = {
    text,
    status: flags.status || "todo",
    priority: flags.priority ? Number(flags.priority) : 3,
    tags: flags.tag ? flags.tag.split(",") : [],
    due: flags.due || "",
    notes: flags.notes || "",
    owner: flags.owner || "landon",
  };
  if (sectionId) task.sectionId = sectionId;

  const result = await request("/tasks", "POST", task);
  if (result.id) console.log(`  ✓ Added: ${result.id} — ${text}`);
  else console.error("  ✗ Failed to add task", result);
}

async function cmdDone(taskId) {
  if (!taskId) { console.error("Usage: pc.js done <task-id>"); process.exit(1); }
  const result = await request(`/tasks/${encodeURIComponent(taskId)}`, "PATCH", { status: "done" });
  if (result.ok) console.log(`  ✓ Marked done: ${taskId}`);
  else console.error("  ✗ Failed", result);
}

async function cmdUpdate(taskId, flags) {
  if (!taskId) { console.error("Usage: pc.js update <task-id> --status ... --notes ..."); process.exit(1); }
  const patch = {};
  if (flags.status) patch.status = flags.status;
  if (flags.priority) patch.priority = Number(flags.priority);
  if (flags.notes) patch.notes = flags.notes;
  if (flags.due) patch.due = flags.due;
  if (flags.owner) patch.owner = flags.owner;
  if (flags.tag) patch.tags = flags.tag.split(",");
  if (flags.text) patch.text = flags.text;

  const result = await request(`/tasks/${encodeURIComponent(taskId)}`, "PATCH", patch);
  if (result.ok) console.log(`  ✓ Updated: ${taskId}`);
  else console.error("  ✗ Failed", result);
}

async function cmdInbox() {
  const files = await request("/inbox");
  if (!Array.isArray(files) || files.length === 0) { console.log("  No inbox files pending."); return; }
  console.log(`\n  📥 ${files.length} inbox file(s):\n`);
  for (const f of files) {
    const items = f.data?.items?.length || (Array.isArray(f.data) ? f.data.reduce((a, s) => a + (s.items?.length || 0), 0) : 1);
    console.log(`    ${f.filename}  (${items} item${items !== 1 ? "s" : ""})  modified: ${new Date(f.modified).toLocaleString()}`);
  }
  console.log("");
}

async function cmdConsume() {
  const result = await request("/inbox/consume", "POST");
  if (result.consumed !== undefined) {
    console.log(`  ✓ Consumed ${result.consumed} file(s), merged ${result.items} item(s)`);
  } else {
    console.error("  ✗ Failed", result);
  }
}

async function cmdPush(filePath) {
  if (!filePath) { console.error("Usage: pc.js push <file.json>"); process.exit(1); }
  const data = JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
  const result = await request("/inbox", "POST", data);
  if (result.ok) console.log(`  ✓ Pushed to inbox: ${result.filename}`);
  else console.error("  ✗ Failed", result);
}

async function cmdHealth() {
  const result = await request("/health");
  console.log("\n  Server Health:");
  console.log(`    Status:        ${result.status || "unknown"}`);
  console.log(`    Data dir:      ${result.dataDir || "?"}`);
  console.log(`    Inbox pending: ${result.inboxPending ?? "?"}`);
  console.log(`    Uptime:        ${result.uptime ? Math.round(result.uptime) + "s" : "?"}`);
  console.log("");
}

async function cmdExport() {
  const data = await request("/state");
  console.log(JSON.stringify(data, null, 2));
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const cmd = positional[0];

  try {
    switch (cmd) {
      case "list": case "ls": return cmdList(flags);
      case "add": return cmdAdd(positional.slice(1).join(" "), flags);
      case "done": return cmdDone(positional[1]);
      case "update": return cmdUpdate(positional[1], flags);
      case "inbox": return cmdInbox();
      case "consume": return cmdConsume();
      case "push": return cmdPush(positional[1]);
      case "health": return cmdHealth();
      case "export": return cmdExport();
      default:
        console.log(`
  Project Command CLI

  Commands:
    list [--status X] [--priority N] [--tag X] [--section X] [--verbose]
    add "text" [--section X] [--priority N] [--tag x,y] [--due YYYY-MM-DD]
    done <task-id>
    update <task-id> [--status X] [--priority N] [--notes X] [--tag x,y]
    inbox           — list pending inbox files
    consume         — merge inbox into sections
    push <file>     — push a JSON file to inbox
    health          — server health check
    export          — dump all data as JSON

  Env: PC_API=http://localhost:3780/api
        `);
    }
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`);
    process.exit(1);
  }
}

main();
