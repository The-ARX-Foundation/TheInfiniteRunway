# Project Command — ARX local server

Forked from InsightAlly `03-Ops/company-files/project-command`. Same API and UI as the reference server; **default port is `3780`** so it does not collide with the company instance on **`3700`**.

## Run

```bat
cd local-server
npm start
```

Or double-click **`start-arx.cmd`** (logs to `server.log`). Optional: `start-arx.cmd 3890` for another port.

Override port via env: `set PC_PORT=3890` then `node server.js`, or `node server.js --port 3890`.

## URLs

| | |
|---|---|
| Dashboard | http://localhost:3780 |
| Status GUI | http://localhost:3780/health |
| API | http://localhost:3780/api |

CLI helper: `scripts/pc.js` — set `PC_API=http://localhost:3780/api` if you change the port.

## Data

`./data/` holds `config.json` and `sections.json` (created on first use from defaults). No employer data was copied from OneDrive.
