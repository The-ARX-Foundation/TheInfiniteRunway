/**
 * share-links.js — Cloudflare Worker for dynamic share link generation
 *
 * Routes:
 *   POST /api/share           → create a share link (admin only)
 *   DELETE /api/share/:id     → revoke a share link (admin only)
 *   GET  /api/share/:id       → get share metadata (admin only)
 *   GET  /share/:token        → resolve a share link (public)
 *   GET  /admin               → admin panel HTML (Access-protected)
 *
 * Environment bindings required (set in wrangler.toml):
 *   SHARES_KV    → Cloudflare KV namespace binding
 *   JWT_SECRET   → Secret string for signing tokens (set as Worker secret)
 *   ADMIN_TOKEN  → Simple token for /api routes if not using CF Access
 *
 * KV schema:
 *   share:<shareId>  → JSON { notePath, domain, expiresAt, createdAt, revokedAt? }
 */

const DOMAINS = {
  arx:     "thearxfoundation.md",
  abysmal: "hopefullyabysmal.md",
  landon:  "landondahle.md",
  elryan:  "elryantheexplorer.md",
};

// ---------------------------------------------------------------------------
// Crypto helpers (Web Crypto API — available in CF Workers)
// ---------------------------------------------------------------------------

async function hmacSign(secret, data) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function hmacVerify(secret, data, signature) {
  const expected = await hmacSign(secret, data);
  return expected === signature;
}

function generateId(length = 16) {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    .slice(0, length);
}

// Simple token format: <shareId>.<expiry_epoch>.<hmac>
async function createToken(shareId, expiresAt, secret) {
  const payload = `${shareId}.${expiresAt}`;
  const sig = await hmacSign(secret, payload);
  return `${payload}.${sig}`;
}

async function validateToken(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [shareId, expiresAtStr, sig] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return null;
  const valid = await hmacVerify(secret, `${shareId}.${expiresAt}`, sig);
  if (!valid) return null;
  return { shareId, expiresAt };
}

// ---------------------------------------------------------------------------
// KV helpers
// ---------------------------------------------------------------------------

async function getShare(kv, shareId) {
  const raw = await kv.get(`share:${shareId}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function putShare(kv, shareId, data) {
  await kv.put(`share:${shareId}`, JSON.stringify(data), {
    // TTL: auto-expire from KV after expiresAt + 7 days buffer
    expirationTtl: Math.ceil((data.expiresAt - Date.now()) / 1000) + 604800,
  });
}

async function listShares(kv) {
  const list = await kv.list({ prefix: "share:" });
  const shares = [];
  for (const key of list.keys) {
    const raw = await kv.get(key.name);
    if (raw) {
      try { shares.push({ id: key.name.replace("share:", ""), ...JSON.parse(raw) }); }
      catch { /* skip malformed */ }
    }
  }
  return shares;
}

// ---------------------------------------------------------------------------
// Auth check
// ---------------------------------------------------------------------------

function isAdmin(request, env) {
  // Cloudflare Access sets Cf-Access-Jwt-Assertion header when protecting routes.
  // For local dev / fallback, check Bearer token.
  const auth = request.headers.get("Authorization") || "";
  if (auth === `Bearer ${env.ADMIN_TOKEN}`) return true;
  // CF Access JWT present = Access has already authenticated the user
  if (request.headers.get("Cf-Access-Jwt-Assertion")) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Request handlers
// ---------------------------------------------------------------------------

async function handleCreateShare(request, env) {
  if (!isAdmin(request, env)) {
    return new Response("Unauthorized", { status: 401 });
  }
  let body;
  try { body = await request.json(); } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const { notePath, domain, expiresIn = "7d" } = body;
  if (!notePath || !domain) {
    return new Response("notePath and domain are required", { status: 400 });
  }
  if (!DOMAINS[domain]) {
    return new Response(`Unknown domain: ${domain}`, { status: 400 });
  }

  // Parse expiresIn: "7d", "24h", "30m"
  const durationMs = parseDuration(expiresIn);
  if (!durationMs) return new Response("Invalid expiresIn format", { status: 400 });

  const shareId = generateId();
  const expiresAt = Date.now() + durationMs;
  const token = await createToken(shareId, expiresAt, env.JWT_SECRET);

  const shareData = {
    notePath,
    domain,
    expiresAt,
    createdAt: Date.now(),
  };
  await putShare(env.SHARES_KV, shareId, shareData);

  const hostname = DOMAINS[domain];
  const shareUrl = `https://${hostname}/share/${token}`;

  return Response.json({ shareId, shareUrl, expiresAt: new Date(expiresAt).toISOString() });
}

async function handleRevokeShare(shareId, request, env) {
  if (!isAdmin(request, env)) return new Response("Unauthorized", { status: 401 });
  const share = await getShare(env.SHARES_KV, shareId);
  if (!share) return new Response("Not found", { status: 404 });
  share.revokedAt = Date.now();
  await env.SHARES_KV.put(`share:${shareId}`, JSON.stringify(share));
  return Response.json({ revoked: true, shareId });
}

async function handleGetShare(shareId, request, env) {
  if (!isAdmin(request, env)) return new Response("Unauthorized", { status: 401 });
  const share = await getShare(env.SHARES_KV, shareId);
  if (!share) return new Response("Not found", { status: 404 });
  return Response.json({ shareId, ...share });
}

async function handleResolveShare(token, request, env) {
  const parsed = await validateToken(token, env.JWT_SECRET);
  if (!parsed) {
    return new Response("Invalid or expired share link", { status: 410 });
  }
  const share = await getShare(env.SHARES_KV, parsed.shareId);
  if (!share) return new Response("Share not found", { status: 404 });
  if (share.revokedAt) return new Response("This link has been revoked", { status: 410 });
  if (Date.now() > share.expiresAt) return new Response("Link expired", { status: 410 });

  // Redirect to the actual note path on the appropriate domain
  const hostname = DOMAINS[share.domain];
  const noteUrl = `https://${hostname}${share.notePath}`;
  return Response.redirect(noteUrl, 302);
}

async function handleAdminPanel(request, env) {
  if (!isAdmin(request, env)) return new Response("Unauthorized", { status: 401 });
  const shares = await listShares(env.SHARES_KV);
  const now = Date.now();
  const rows = shares.map(s => `
    <tr class="${s.revokedAt ? 'revoked' : now > s.expiresAt ? 'expired' : ''}">
      <td>${s.id}</td>
      <td>${s.notePath}</td>
      <td>${s.domain}</td>
      <td>${new Date(s.expiresAt).toLocaleString()}</td>
      <td>${s.revokedAt ? 'Revoked' : now > s.expiresAt ? 'Expired' : 'Active'}</td>
      <td>
        ${!s.revokedAt && now <= s.expiresAt
          ? `<button onclick="revoke('${s.id}')">Revoke</button>` : ''}
      </td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html><head><title>Share Link Admin</title>
<style>
  body { font-family: monospace; padding: 2rem; background: #0d0d0d; color: #e0e0e0; }
  table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  th, td { border: 1px solid #333; padding: 0.5rem; text-align: left; }
  th { background: #1a1a1a; }
  .revoked, .expired { opacity: 0.4; }
  input, select, button { background: #1a1a1a; color: #e0e0e0; border: 1px solid #444; padding: 0.4rem; }
  button { cursor: pointer; }
  #create-form { margin: 1rem 0; display: flex; gap: 0.5rem; flex-wrap: wrap; }
</style>
</head><body>
<h1>Share Link Admin</h1>
<div id="create-form">
  <input id="notePath" placeholder="/notes/my-note" style="width:300px">
  <select id="domain">
    <option value="arx">thearxfoundation.md</option>
    <option value="abysmal">hopefullyabysmal.md</option>
    <option value="landon">landondahle.md</option>
    <option value="elryan">elryantheexplorer.md</option>
  </select>
  <input id="expiresIn" placeholder="7d" style="width:60px">
  <button onclick="createShare()">Create Share Link</button>
</div>
<div id="result" style="margin:0.5rem 0;color:#8f8"></div>
<table>
  <thead><tr><th>ID</th><th>Note Path</th><th>Domain</th><th>Expires</th><th>Status</th><th>Action</th></tr></thead>
  <tbody id="tbody">${rows}</tbody>
</table>
<script>
async function createShare() {
  const notePath = document.getElementById('notePath').value;
  const domain = document.getElementById('domain').value;
  const expiresIn = document.getElementById('expiresIn').value || '7d';
  const r = await fetch('/api/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notePath, domain, expiresIn })
  });
  const data = await r.json();
  document.getElementById('result').textContent =
    r.ok ? 'Created: ' + data.shareUrl : 'Error: ' + JSON.stringify(data);
  if (r.ok) location.reload();
}
async function revoke(shareId) {
  if (!confirm('Revoke this share link?')) return;
  await fetch('/api/share/' + shareId, { method: 'DELETE' });
  location.reload();
}
</script>
</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}

// ---------------------------------------------------------------------------
// Duration parser
// ---------------------------------------------------------------------------

function parseDuration(str) {
  const m = str.match(/^(\d+)(m|h|d|w)$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const units = { m: 60000, h: 3600000, d: 86400000, w: 604800000 };
  return n * units[m[2]];
}

// ---------------------------------------------------------------------------
// Main fetch handler
// ---------------------------------------------------------------------------

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // POST /api/share
    if (request.method === "POST" && path === "/api/share") {
      return handleCreateShare(request, env);
    }
    // DELETE /api/share/:id
    if (request.method === "DELETE" && path.startsWith("/api/share/")) {
      return handleRevokeShare(path.slice("/api/share/".length), request, env);
    }
    // GET /api/share/:id
    if (request.method === "GET" && path.startsWith("/api/share/")) {
      return handleGetShare(path.slice("/api/share/".length), request, env);
    }
    // GET /share/:token
    if (request.method === "GET" && path.startsWith("/share/")) {
      return handleResolveShare(path.slice("/share/".length), request, env);
    }
    // GET /admin
    if (request.method === "GET" && path === "/admin") {
      return handleAdminPanel(request, env);
    }

    return new Response("Not found", { status: 404 });
  },
};
