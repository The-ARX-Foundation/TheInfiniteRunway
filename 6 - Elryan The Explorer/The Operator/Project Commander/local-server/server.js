#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════
 *  PROJECT COMMAND — Local Server
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Serves the dashboard UI and provides a JSON API for external
 *  tools (Claude Code, cron scripts, etc.) to read/write tasks.
 *
 *  USAGE:
 *    node server.js                  # starts on :3780 (ARX default; avoids :3700 InsightAlly instance)
 *    node server.js --port 8080      # custom port
 *    node server.js --data ./mydata  # custom data dir
 *
 *  DATA DIRECTORY:
 *    ./data/
 *      config.json      — workspace config (team, statuses, tags)
 *      sections.json    — all sections + tasks
 *      inbox/*.json     — drop zone for external inputs (auto-consumed)
 *
 *  API ENDPOINTS:
 *    GET    /api/state              — full state (config + sections)
 *    PUT    /api/state              — replace full state
 *    GET    /api/sections           — all sections
 *    POST   /api/sections           — add a section
 *    GET    /api/tasks              — all tasks (flat, with sectionId)
 *    POST   /api/tasks              — add task to a section
 *    PATCH  /api/tasks/:id          — update a task
 *    DELETE /api/tasks/:id          — delete a task
 *    POST   /api/inbox              — drop items into inbox (bulk)
 *    GET    /api/inbox              — list pending inbox files
 *    POST   /api/inbox/consume      — merge inbox into sections
 *    GET    /api/health             — health check (JSON); browsers redirect to /health
 *    GET    /health                 — status page (GUI)
 *    POST   /api/tasks/bulk-priority-by-tag — set priority for all tasks with a tag
 *
 * ═══════════════════════════════════════════════════════════════════
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

// ── CLI Args ────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (flag, fallback) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
};

const PORT = parseInt(process.env.PC_PORT || getArg("--port", "3780"), 10);
// Anchor to this folder so `node /path/to/server.js` works from any cwd (InsightAlly used ./data from project root).
const DATA_DIR = path.resolve(getArg("--data", path.join(__dirname, "data")));
const PUBLIC_DIR = path.resolve(getArg("--public", path.join(__dirname, "public")));
const INBOX_DIR = path.join(DATA_DIR, "inbox");

// ── Ensure dirs ─────────────────────────────────────────────────
[DATA_DIR, INBOX_DIR].forEach((d) => fs.mkdirSync(d, { recursive: true }));

// ── Default data ────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  teamName: "The ARX Foundation",
  statuses: [
    { key: "backlog", label: "Backlog", icon: "○", color: "#5c7370" },
    { key: "todo", label: "To Do", icon: "◻", color: "#7a9e8c" },
    { key: "in-progress", label: "In Progress", icon: "◐", color: "#40916c" },
    { key: "review", label: "Review / Waiting", icon: "◑", color: "#52b788" },
    { key: "done", label: "Done", icon: "✓", color: "#2d6a4f" },
    { key: "blocked", label: "Blocked", icon: "⊘", color: "#c1121f" },
  ],
  members: [
    { id: "elryan", name: "Elryan", initials: "E", color: "#40916c" },
  ],
  tags: [
    { key: "vault", label: "Vault / Quartz", color: "#2d6a4f" },
    { key: "forge", label: "Forge / Git", color: "#40916c" },
    { key: "infra", label: "Infra / DevOps", color: "#ee9b00" },
    { key: "outreach", label: "Outreach", color: "#52b788" },
    { key: "linux", label: "Linux Setup", color: "#1b4332" },
    { key: "ops", label: "Ops / Admin", color: "#6b9080" },
    { key: "sovereignty", label: "Sovereignty", color: "#95d5b2" },
    { key: "blocked-ext", label: "Blocked External", color: "#f97316" },
  ],
};

const DEFAULT_SECTIONS = [];

// ── File I/O ────────────────────────────────────────────────────
const configPath = path.join(DATA_DIR, "config.json");
const sectionsPath = path.join(DATA_DIR, "sections.json");

function loadJSON(fp, fallback) {
  try {
    return JSON.parse(fs.readFileSync(fp, "utf8"));
  } catch {
    return fallback;
  }
}

function saveJSON(fp, data) {
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf8");
}

function getConfig() {
  return loadJSON(configPath, DEFAULT_CONFIG);
}
function getSections() {
  return loadJSON(sectionsPath, DEFAULT_SECTIONS);
}
function saveConfig(c) {
  saveJSON(configPath, c);
}
function saveSections(s) {
  saveJSON(sectionsPath, s);
}

// ── Helpers ─────────────────────────────────────────────────────
let _uid = Date.now();
const uid = (prefix = "id") => `${prefix}-${++_uid}-${Math.random().toString(36).slice(2, 6)}`;

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function json(res, data, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function notFound(res) {
  json(res, { error: "Not found" }, 404);
}

// ── MIME types ───────────────────────────────────────────────────
const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

function serveStatic(req, res) {
  let fp = path.join(PUBLIC_DIR, req.url === "/" ? "/index.html" : req.url);
  fp = path.normalize(fp);
  if (!fp.startsWith(PUBLIC_DIR)) return notFound(res);

  fs.readFile(fp, (err, data) => {
    if (err) return notFound(res);
    const ext = path.extname(fp);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
}

// ── Inbox ───────────────────────────────────────────────────────
function listInbox() {
  try {
    return fs
      .readdirSync(INBOX_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({
        filename: f,
        data: loadJSON(path.join(INBOX_DIR, f), null),
        modified: fs.statSync(path.join(INBOX_DIR, f)).mtime,
      }))
      .filter((f) => f.data !== null)
      .sort((a, b) => a.modified - b.modified);
  } catch {
    return [];
  }
}

function consumeInbox() {
  const files = listInbox();
  if (files.length === 0) return { consumed: 0, items: [] };

  const sections = getSections();
  let totalItems = 0;

  for (const file of files) {
    const payload = file.data;

    // Support multiple formats:
    // 1. Array of sections (full import)
    // 2. { section: "name", items: [...] }
    // 3. { items: [...] } — goes to "Inbox" section
    // 4. Single task object — goes to "Inbox" section

    if (Array.isArray(payload) && payload[0]?.items) {
      // Format 1: array of sections
      for (const incoming of payload) {
        let target = sections.find(
          (s) => s.title.toLowerCase() === (incoming.title || "").toLowerCase()
        );
        if (!target) {
          target = {
            id: uid("sec"),
            title: incoming.title || "Imported",
            order: sections.length + 1,
            items: [],
          };
          sections.push(target);
        }
        const newItems = (incoming.items || []).map((it) => ({
          ...it,
          id: it.id || uid("t"),
          created: it.created || Date.now(),
        }));
        target.items.push(...newItems);
        totalItems += newItems.length;
      }
    } else if (payload.section && payload.items) {
      // Format 2: named section + items
      let target = sections.find(
        (s) => s.title.toLowerCase() === payload.section.toLowerCase()
      );
      if (!target) {
        target = {
          id: uid("sec"),
          title: payload.section,
          order: sections.length + 1,
          items: [],
        };
        sections.push(target);
      }
      const newItems = payload.items.map((it) => ({
        ...it,
        id: it.id || uid("t"),
        created: it.created || Date.now(),
      }));
      target.items.push(...newItems);
      totalItems += newItems.length;
    } else if (payload.items) {
      // Format 3: items only → Inbox
      let inbox = sections.find((s) => s.title === "📥 Inbox");
      if (!inbox) {
        inbox = {
          id: uid("sec"),
          title: "📥 Inbox",
          order: 0,
          items: [],
        };
        sections.unshift(inbox);
      }
      const newItems = payload.items.map((it) => ({
        ...it,
        id: it.id || uid("t"),
        created: it.created || Date.now(),
      }));
      inbox.items.push(...newItems);
      totalItems += newItems.length;
    } else if (payload.text) {
      // Format 4: single task
      let inbox = sections.find((s) => s.title === "📥 Inbox");
      if (!inbox) {
        inbox = {
          id: uid("sec"),
          title: "📥 Inbox",
          order: 0,
          items: [],
        };
        sections.unshift(inbox);
      }
      inbox.items.push({
        ...payload,
        id: payload.id || uid("t"),
        status: payload.status || "todo",
        priority: payload.priority || 3,
        tags: payload.tags || [],
        subtasks: payload.subtasks || [],
        created: payload.created || Date.now(),
      });
      totalItems += 1;
    }

    // Remove consumed file
    try {
      fs.unlinkSync(path.join(INBOX_DIR, file.filename));
    } catch {}
  }

  saveSections(sections);
  return { consumed: files.length, items: totalItems };
}

// ── Router ──────────────────────────────────────────────────────
async function handleAPI(req, res, pathname) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  try {
    // GET/HEAD /api/health — JSON for scripts; GET + text/html Accept → /health GUI
    if (pathname === "/api/health") {
      if (req.method === "HEAD" || req.method === "GET") {
        if (req.method === "GET") {
          const accept = (req.headers.accept || "").toLowerCase();
          if (
            accept.includes("text/html") &&
            !accept.includes("application/json")
          ) {
            res.writeHead(302, { Location: "/health" });
            return res.end();
          }
        }
        const payload = {
          status: "ok",
          dataDir: DATA_DIR,
          inboxPending: listInbox().length,
          uptime: process.uptime(),
        };
        const body = JSON.stringify(payload);
        if (req.method === "HEAD") {
          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Length": Buffer.byteLength(body),
            "Access-Control-Allow-Origin": "*",
          });
          return res.end();
        }
        return json(res, payload);
      }
      return json(res, { error: "Method not allowed" }, 405);
    }

    // GET/PUT /api/state
    if (pathname === "/api/state") {
      if (req.method === "GET") {
        return json(res, {
          config: getConfig(),
          sections: getSections(),
        });
      }
      if (req.method === "PUT") {
        const body = await readBody(req);
        if (body.config) saveConfig(body.config);
        if (body.sections) saveSections(body.sections);
        return json(res, { ok: true });
      }
    }

    // GET/POST /api/sections
    if (pathname === "/api/sections") {
      if (req.method === "GET") return json(res, getSections());
      if (req.method === "POST") {
        const body = await readBody(req);
        const sections = getSections();
        const sec = {
          id: body.id || uid("sec"),
          title: body.title || "New Section",
          order: body.order || sections.length + 1,
          items: body.items || [],
        };
        sections.push(sec);
        saveSections(sections);
        return json(res, sec, 201);
      }
    }

    // GET/POST /api/tasks
    if (pathname === "/api/tasks") {
      if (req.method === "GET") {
        const sections = getSections();
        const flat = sections.flatMap((s) =>
          s.items.map((it) => ({
            ...it,
            sectionId: s.id,
            sectionTitle: s.title,
          }))
        );
        return json(res, flat);
      }
      if (req.method === "POST") {
        const body = await readBody(req);
        const sections = getSections();
        const secId =
          body.sectionId ||
          body.section_id ||
          (sections[0] ? sections[0].id : null);
        const sec = sections.find((s) => s.id === secId);
        if (!sec) return json(res, { error: "Section not found" }, 404);
        const task = {
          id: body.id || uid("t"),
          text: body.text || "Untitled task",
          status: body.status || "todo",
          owner: body.owner || "landon",
          priority: body.priority || 3,
          tags: body.tags || [],
          due: body.due || "",
          notes: body.notes || "",
          subtasks: body.subtasks || [],
          created: body.created || Date.now(),
        };
        sec.items.push(task);
        saveSections(sections);
        return json(res, task, 201);
      }
    }

    // POST /api/tasks/bulk-priority-by-tag
    if (pathname === "/api/tasks/bulk-priority-by-tag" && req.method === "POST") {
      const body = await readBody(req);
      const tag = String(body.tag || "").trim();
      const priority = Number(body.priority);
      const includeDone = Boolean(body.includeDone);
      if (!tag || !Number.isFinite(priority) || priority < 1 || priority > 4) {
        return json(
          res,
          { error: "Body needs tag (string) and priority (1–4)" },
          400
        );
      }
      const sections = getSections();
      let updated = 0;
      for (const sec of sections) {
        for (const it of sec.items) {
          if (!includeDone && it.status === "done") continue;
          const tags = Array.isArray(it.tags) ? it.tags : [];
          if (!tags.includes(tag)) continue;
          it.priority = priority;
          updated++;
        }
      }
      saveSections(sections);
      return json(res, { ok: true, updated, tag, priority, includeDone });
    }

    // PATCH/DELETE /api/tasks/:id
    const taskMatch = pathname.match(/^\/api\/tasks\/(.+)$/);
    if (taskMatch) {
      const taskId = decodeURIComponent(taskMatch[1]);
      const sections = getSections();

      if (req.method === "PATCH") {
        const body = await readBody(req);
        let found = false;
        for (const sec of sections) {
          const idx = sec.items.findIndex((it) => it.id === taskId);
          if (idx !== -1) {
            sec.items[idx] = { ...sec.items[idx], ...body };
            found = true;
            break;
          }
        }
        if (!found) return json(res, { error: "Task not found" }, 404);
        saveSections(sections);
        return json(res, { ok: true, id: taskId });
      }

      if (req.method === "DELETE") {
        let found = false;
        for (const sec of sections) {
          const idx = sec.items.findIndex((it) => it.id === taskId);
          if (idx !== -1) {
            sec.items.splice(idx, 1);
            found = true;
            break;
          }
        }
        if (!found) return json(res, { error: "Task not found" }, 404);
        saveSections(sections);
        return json(res, { ok: true, deleted: taskId });
      }
    }

    // GET/POST /api/inbox
    if (pathname === "/api/inbox") {
      if (req.method === "GET") return json(res, listInbox());
      if (req.method === "POST") {
        const body = await readBody(req);
        const filename = `inbox-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.json`;
        saveJSON(path.join(INBOX_DIR, filename), body);
        return json(res, { ok: true, filename }, 201);
      }
    }

    // POST /api/inbox/consume
    if (pathname === "/api/inbox/consume" && req.method === "POST") {
      const result = consumeInbox();
      return json(res, result);
    }

    return json(res, { error: "Unknown endpoint" }, 404);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    if (msg === "Invalid JSON") {
      return json(res, { error: "Invalid JSON" }, 400);
    }
    return json(res, { error: msg }, 500);
  }
}

// ── Server ──────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  const pathname = parsed.pathname;

  if (pathname.startsWith("/api/")) {
    handleAPI(req, res, pathname);
  } else if (pathname === "/health" || pathname === "/health/") {
    const fp = path.join(PUBLIC_DIR, "health.html");
    fs.readFile(fp, (err, data) => {
      if (err) return notFound(res);
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      res.end(data);
    });
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  // Initialize data files if missing
  if (!fs.existsSync(configPath)) saveConfig(DEFAULT_CONFIG);
  if (!fs.existsSync(sectionsPath)) saveSections(DEFAULT_SECTIONS);

  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║          PROJECT COMMAND — Running            ║
  ╠═══════════════════════════════════════════════╣
  ║                                               ║
  ║   Dashboard:  http://localhost:${PORT}           ║
  ║   Status GUI: http://localhost:${PORT}/health    ║
  ║   API:        http://localhost:${PORT}/api       ║
  ║   Health JSON: http://localhost:${PORT}/api/health ║
  ║                                               ║
  ║   Data dir:   ${DATA_DIR.length > 35 ? "..." + DATA_DIR.slice(-32) : DATA_DIR.padEnd(35)}║
  ║   Inbox dir:  ${INBOX_DIR.length > 35 ? "..." + INBOX_DIR.slice(-32) : INBOX_DIR.padEnd(35)}║
  ║                                               ║
  ║   Drop .json files into data/inbox/ or POST   ║
  ║   to /api/inbox — then consume via dashboard  ║
  ║   or POST /api/inbox/consume                  ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `);
});
