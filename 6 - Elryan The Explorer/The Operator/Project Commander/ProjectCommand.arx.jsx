/**
 * ════════════════════════════════════════════════════════════════════════════
 *  PROJECT COMMAND — ARX Foundation fork (forest / citadel palette)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  Upstream: InsightAlly knowledgebase — 02 - Engineering/Reference/ProjectCommand.jsx
 *  (OneDrive - InsightAlly). Personal / ARX use only — no employer PHI or client data.
 *
 *  Differences from upstream: ARX theming, default workspace name, separate storage key
 *  (`project-command-arx-data`) so Claude artifact sessions do not collide with the
 *  company template. Behavior and feature set match the reference implementation.
 *
 *  FEATURES: (same as reference — list / kanban / timeline, persistence, filters, etc.)
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ── DEFAULTS ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  teamName: "The ARX Foundation",
  statuses: [
    { key: "backlog", label: "Backlog", icon: "○", color: "#5c7370" },
    { key: "todo", label: "To Do", icon: "◻", color: "#7a9e8c" },
    { key: "in-progress", label: "In Progress", icon: "◐", color: "#40916c" },
    { key: "review", label: "Review", icon: "◑", color: "#52b788" },
    { key: "done", label: "Done", icon: "✓", color: "#2d6a4f" },
    { key: "blocked", label: "Blocked", icon: "⊘", color: "#c1121f" },
  ],
  members: [
    { id: "elryan", name: "Elryan", initials: "E", color: "#40916c" },
  ],
  tags: [
    { key: "bug", label: "Bug", color: "#c1121f" },
    { key: "feature", label: "Feature", color: "#2d6a4f" },
    { key: "ops", label: "Ops", color: "#ee9b00" },
    { key: "docs", label: "Docs", color: "#1b4332" },
    { key: "urgent", label: "Urgent", color: "#9d0208" },
    { key: "sovereignty", label: "Sovereignty", color: "#52b788" },
  ],
};

const SAMPLE_SECTIONS = [
  {
    id: "sec-1", title: "ARX · Getting Started", order: 1,
    items: [
      { id: "t1", text: "Rename workspace or add collaborators in ⚙ settings", status: "todo", owner: "elryan", priority: 2, tags: ["ops"], due: "", notes: "Forest theme is the ARX fork default; data key is separate from InsightAlly builds.", subtasks: [], created: Date.now() },
      { id: "t2", text: "Add a section for each active build (vault, forge, outreach…)", status: "todo", owner: "elryan", priority: 2, tags: ["feature"], due: "", notes: "Use '+ Add Section' at the bottom of list view.", subtasks: [], created: Date.now() },
      { id: "t3", text: "Route tasks by persona / workstream in notes or tags", status: "backlog", owner: "elryan", priority: 3, tags: ["docs"], due: "", notes: "See README.md in this folder for lineage.", subtasks: [], created: Date.now() },
      { id: "t4", text: "Shortcuts: / search · n new task · ? help", status: "backlog", owner: "elryan", priority: 4, tags: ["docs"], due: "", notes: "", subtasks: [{ id: "st1", text: "Press / to focus search", done: false }, { id: "st2", text: "Press n for new task", done: false }], created: Date.now() },
    ],
  },
];

// ── THEMES ───────────────────────────────────────────────────────────────────

const THEMES = {
  dark: {
    bg: "#0a1612", bgAlt: "#0d1f17", surface: "#142f24", surface2: "#1b4332",
    surfaceHover: "#1f4d3a", border: "rgba(241,250,245,0.08)", borderHi: "rgba(168,213,186,0.18)",
    text: "#f1faf5", textMd: "#b7d5c8", textDim: "#6b9080", textGhost: "#4a6358",
    input: "#1b4332", inputBorder: "#2d6a4f",
    accent: "#40916c", accentSoft: "rgba(64,145,108,0.14)", accentText: "#a8d5ba",
    green: "#52b788", greenSoft: "rgba(82,183,136,0.12)",
    amber: "#ee9b00", amberSoft: "rgba(238,155,0,0.12)",
    red: "#e63946", redSoft: "rgba(230,57,70,0.12)",
    cyan: "#48cae4", cyanSoft: "rgba(72,202,228,0.1)",
    kanbanCol: "rgba(255,255,255,0.03)",
    shadow: "0 2px 8px rgba(0,0,0,0.35)",
    ring: "0 0 0 2px rgba(64,145,108,0.35)",
    progressBg: "rgba(255,255,255,0.06)",
    scrollThumb: "#2d6a4f",
  },
  light: {
    bg: "#f0f7f4", bgAlt: "#e8f2ec", surface: "#ffffff", surface2: "#f1faf5",
    surfaceHover: "#e2efe6", border: "rgba(27,67,50,0.1)", borderHi: "rgba(27,67,50,0.16)",
    text: "#1b4332", textMd: "#3d5c4f", textDim: "#6b9080", textGhost: "#a8c5b5",
    input: "#f1faf5", inputBorder: "#95d5b2",
    accent: "#2d6a4f", accentSoft: "rgba(45,106,79,0.1)", accentText: "#1b4332",
    green: "#40916c", greenSoft: "rgba(64,145,108,0.1)",
    amber: "#ca6702", amberSoft: "rgba(202,103,2,0.1)",
    red: "#c1121f", redSoft: "rgba(193,18,31,0.08)",
    cyan: "#0077b6", cyanSoft: "rgba(0,119,182,0.08)",
    kanbanCol: "rgba(27,67,50,0.04)",
    shadow: "0 1px 4px rgba(27,67,50,0.08)",
    ring: "0 0 0 2px rgba(45,106,79,0.22)",
    progressBg: "rgba(27,67,50,0.06)",
    scrollThumb: "#95d5b2",
  },
};

// ── HELPERS ──────────────────────────────────────────────────────────────────

let _uid = Date.now();
const uid = (prefix = "id") => `${prefix}-${++_uid}`;

const getSysTheme = () => {
  try { return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark"; } catch { return "dark"; }
};

const isOverdue = (due) => {
  if (!due) return false;
  return new Date(due + "T23:59:59") < new Date();
};

const isDueSoon = (due) => {
  if (!due) return false;
  const d = new Date(due + "T23:59:59");
  const now = new Date();
  const diff = (d - now) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff <= 3;
};

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const fmtDateLong = (d) => {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};

const priorityMeta = {
  1: { label: "Critical", short: "P1", color: "#c1121f", bg: "rgba(193,18,31,0.12)" },
  2: { label: "High", short: "P2", color: "#ee9b00", bg: "rgba(238,155,0,0.12)" },
  3: { label: "Medium", short: "P3", color: "#40916c", bg: "rgba(64,145,108,0.12)" },
  4: { label: "Low", short: "P4", color: "#6b9080", bg: "rgba(107,144,128,0.1)" },
};

const FONT_BODY = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace";

// ── STORAGE LAYER ───────────────────────────────────────────────────────────

const STORAGE_KEY = "project-command-arx-data";

async function loadData() {
  try {
    const result = await window.storage.get(STORAGE_KEY);
    if (result && result.value) return JSON.parse(result.value);
  } catch (e) { /* storage unavailable or key not found */ }
  return null;
}

async function saveData(data) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { /* storage unavailable, silent fail */ }
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ProjectCommand() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [sections, setSections] = useState(SAMPLE_SECTIONS);
  const [mode, setMode] = useState(getSysTheme);
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fOwner, setFOwner] = useState("all");
  const [fPri, setFPri] = useState("all");
  const [fTag, setFTag] = useState("all");
  const [sort, setSort] = useState("default");
  const [expanded, setExpanded] = useState(new Set(SAMPLE_SECTIONS.map(s => s.id)));
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [addingTo, setAddingTo] = useState(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [addingSectionTitle, setAddingSectionTitle] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [focusedTaskIdx, setFocusedTaskIdx] = useState(-1);
  const searchRef = useRef(null);
  const newTaskRef = useRef(null);

  const t = THEMES[mode];
  const memberMap = useMemo(() => Object.fromEntries(config.members.map(m => [m.id, m])), [config.members]);
  const tagMap = useMemo(() => Object.fromEntries(config.tags.map(tg => [tg.key, tg])), [config.tags]);
  const statusMap = useMemo(() => Object.fromEntries(config.statuses.map(s => [s.key, s])), [config.statuses]);

  // ── Load from storage ──
  useEffect(() => {
    (async () => {
      const data = await loadData();
      if (data) {
        if (data.config) setConfig(data.config);
        if (data.sections) {
          setSections(data.sections);
          setExpanded(new Set(data.sections.map(s => s.id)));
        }
        if (data.mode) setMode(data.mode);
        if (data.view) setView(data.view);
      }
      setLoaded(true);
    })();
  }, []);

  // ── Auto-save ──
  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      saveData({ config, sections, mode, view });
    }, 400);
    return () => clearTimeout(timer);
  }, [config, sections, mode, view, loaded]);

  // ── System theme listener ──
  useEffect(() => {
    try {
      const mq = window.matchMedia("(prefers-color-scheme: light)");
      const handler = (e) => setMode(e.matches ? "light" : "dark");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } catch {}
  }, []);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") {
        if (e.key === "Escape") { e.target.blur(); setAddingTo(null); setSearch(""); }
        return;
      }
      if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); }
      else if (e.key === "n") { e.preventDefault(); handleQuickAdd(); }
      else if (e.key === "Escape") { setSelectedTask(null); setShowSettings(false); setShowShortcuts(false); }
      else if (e.key === "?" && !e.shiftKey) { setShowShortcuts(v => !v); }
      else if (e.key === "1") setView("list");
      else if (e.key === "2") setView("kanban");
      else if (e.key === "3") setView("timeline");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sections]);

  // ── Data helpers ──
  const updItem = useCallback((sectionId, itemId, patch) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, items: s.items.map(it => it.id === itemId ? { ...it, ...patch } : it) }
        : s
    ));
  }, []);

  const deleteItem = useCallback((sectionId, itemId) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, items: s.items.filter(it => it.id !== itemId) }
        : s
    ));
    setSelectedTask(null);
  }, []);

  const toggleSection = (id) => setExpanded(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const addTask = (secId) => {
    if (!newTaskText.trim()) { setAddingTo(null); return; }
    setSections(prev => prev.map(s =>
      s.id === secId
        ? {
            ...s, items: [...s.items, {
              id: uid("t"), text: newTaskText.trim(), status: "todo",
              owner: config.members.length === 1 ? config.members[0].id : "unassigned",
              priority: 3, tags: [], due: "", notes: "", subtasks: [], created: Date.now(),
            }]
          }
        : s
    ));
    setNewTaskText(""); setAddingTo(null);
  };

  const addSection = () => {
    if (!addingSectionTitle.trim()) { setShowAddSection(false); return; }
    const id = uid("sec");
    setSections(prev => [...prev, { id, title: addingSectionTitle.trim(), order: prev.length + 1, items: [] }]);
    setExpanded(prev => new Set([...prev, id]));
    setAddingSectionTitle(""); setShowAddSection(false);
  };

  const deleteSection = (secId) => {
    setSections(prev => prev.filter(s => s.id !== secId));
  };

  const handleQuickAdd = () => {
    if (sections.length > 0) {
      const firstSec = sections[0].id;
      setAddingTo(firstSec);
      if (!expanded.has(firstSec)) setExpanded(prev => new Set([...prev, firstSec]));
      setTimeout(() => newTaskRef.current?.focus(), 100);
    }
  };

  // ── Computed data ──
  const allItems = useMemo(() =>
    sections.flatMap(s => s.items.map(it => ({ ...it, sectionId: s.id, sectionTitle: s.title }))),
    [sections]
  );

  const filtered = useMemo(() => {
    let f = allItems;
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(i => i.text.toLowerCase().includes(q) || (i.notes || "").toLowerCase().includes(q));
    }
    if (fStatus !== "all") f = f.filter(i => i.status === fStatus);
    if (fOwner !== "all") f = f.filter(i => i.owner === fOwner);
    if (fPri !== "all") f = f.filter(i => i.priority === Number(fPri));
    if (fTag !== "all") f = f.filter(i => i.tags?.includes(fTag));
    if (sort === "priority") f = [...f].sort((a, b) => a.priority - b.priority);
    else if (sort === "due") f = [...f].sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
    else if (sort === "alpha") f = [...f].sort((a, b) => a.text.localeCompare(b.text));
    else if (sort === "created") f = [...f].sort((a, b) => (b.created || 0) - (a.created || 0));
    return f;
  }, [allItems, search, fStatus, fOwner, fPri, fTag, sort]);

  const totalAll = allItems.length;
  const doneCount = allItems.filter(i => i.status === "done").length;
  const blockedCount = allItems.filter(i => i.status === "blocked").length;
  const overdueCount = allItems.filter(i => isOverdue(i.due) && i.status !== "done").length;
  const pct = totalAll ? Math.round((doneCount / totalAll) * 100) : 0;

  const activeFilters = [fStatus !== "all", fOwner !== "all", fPri !== "all", fTag !== "all", !!search].filter(Boolean).length;

  // ═══════════════════════════════════════════════════════════════════════════
  //  SUB-COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Avatar ──
  const Avatar = ({ memberId, size = 22 }) => {
    const m = memberMap[memberId] || memberMap["elryan"] || { initials: "?", color: "#6b9080" };
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 700, color: "#fff", fontFamily: FONT_MONO, letterSpacing: -0.5, flexShrink: 0 }}>
        {m.initials}
      </div>
    );
  };

  // ── Priority Badge ──
  const PriorityBadge = ({ priority, compact = false }) => {
    const p = priorityMeta[priority] || priorityMeta[3];
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: compact ? "1px 5px" : "2px 7px", borderRadius: 4, background: p.bg, color: p.color, fontSize: compact ? 9 : 10, fontWeight: 700, fontFamily: FONT_MONO, letterSpacing: 0.5, whiteSpace: "nowrap" }}>
        {p.short}
      </span>
    );
  };

  // ── Tag Chip ──
  const TagChip = ({ tagKey }) => {
    const tg = tagMap[tagKey];
    if (!tg) return null;
    return (
      <span style={{ display: "inline-flex", padding: "1px 6px", borderRadius: 3, background: tg.color + "18", color: tg.color, fontSize: 9, fontWeight: 600, fontFamily: FONT_MONO, letterSpacing: 0.3 }}>
        {tg.label}
      </span>
    );
  };

  // ── Status Dot ──
  const StatusDot = ({ status }) => {
    const s = statusMap[status];
    if (!s) return null;
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: s.color, fontWeight: 500 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
        {s.label}
      </span>
    );
  };

  // ── Due Badge ──
  const DueBadge = ({ due, status }) => {
    if (!due || status === "done") return null;
    const overdue = isOverdue(due);
    const soon = isDueSoon(due);
    const color = overdue ? t.red : soon ? t.amber : t.textDim;
    const bg = overdue ? t.redSoft : soon ? t.amberSoft : "transparent";
    return (
      <span style={{ fontSize: 10, fontFamily: FONT_MONO, color, background: bg, padding: "1px 5px", borderRadius: 3, whiteSpace: "nowrap" }}>
        {overdue ? "⚠ " : ""}{fmtDate(due)}
      </span>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  TASK ROW (List View)
  // ═══════════════════════════════════════════════════════════════════════════

  const TaskRow = ({ item }) => {
    const isDone = item.status === "done";
    const subtasksDone = (item.subtasks || []).filter(st => st.done).length;
    const subtasksTotal = (item.subtasks || []).length;

    return (
      <div
        onClick={() => setSelectedTask({ ...item })}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
          background: t.surface, borderBottom: `1px solid ${t.border}`,
          cursor: "pointer", transition: "background 0.15s",
          opacity: isDone ? 0.55 : 1,
        }}
        onMouseEnter={e => e.currentTarget.style.background = t.surfaceHover}
        onMouseLeave={e => e.currentTarget.style.background = t.surface}
      >
        {/* Status quick-toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const statusKeys = config.statuses.map(s => s.key);
            const idx = statusKeys.indexOf(item.status);
            const next = statusKeys[(idx + 1) % statusKeys.length];
            updItem(item.sectionId, item.id, { status: next });
          }}
          style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${statusMap[item.status]?.color || "#64748b"}`, background: isDone ? (statusMap[item.status]?.color || "#22c55e") : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", padding: 0 }}
          title="Cycle status"
        >
          {isDone && "✓"}
        </button>

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: t.text, textDecoration: isDone ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.text}
          </div>
          {subtasksTotal > 0 && (
            <div style={{ fontSize: 10, color: t.textDim, marginTop: 1, fontFamily: FONT_MONO }}>
              ☐ {subtasksDone}/{subtasksTotal} subtasks
            </div>
          )}
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
          {(item.tags || []).slice(0, 2).map(tg => <TagChip key={tg} tagKey={tg} />)}
          {(item.tags || []).length > 2 && <span style={{ fontSize: 9, color: t.textDim }}>+{item.tags.length - 2}</span>}
        </div>

        <PriorityBadge priority={item.priority} compact />
        <DueBadge due={item.due} status={item.status} />
        {config.members.length > 1 && item.owner && item.owner !== "unassigned" && (
          <Avatar memberId={item.owner} size={20} />
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  LIST VIEW
  // ═══════════════════════════════════════════════════════════════════════════

  const ListView = () => {
    const sectionFiltered = sections.map(s => ({
      ...s,
      items: s.items.filter(it => filtered.some(f => f.id === it.id))
    })).filter(s => s.items.length > 0 || activeFilters === 0);

    return (
      <div>
        {sectionFiltered.map(sec => {
          const secItems = sec.items;
          const secDone = secItems.filter(i => i.status === "done").length;
          const secPct = secItems.length ? Math.round((secDone / secItems.length) * 100) : 0;
          const isExpanded = expanded.has(sec.id);

          return (
            <div key={sec.id} style={{ marginBottom: 2 }}>
              {/* Section header */}
              <div
                onClick={() => toggleSection(sec.id)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", background: t.bgAlt,
                  borderBottom: `1px solid ${t.border}`, cursor: "pointer",
                  userSelect: "none", position: "sticky", top: 0, zIndex: 5,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: t.textDim, transition: "transform 0.15s", transform: isExpanded ? "rotate(90deg)" : "rotate(0)" }}>▶</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{sec.title}</span>
                  <span style={{ fontSize: 10, fontFamily: FONT_MONO, color: t.textDim, background: t.surface, padding: "1px 6px", borderRadius: 8 }}>{secItems.length}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 60, height: 3, borderRadius: 2, background: t.progressBg, overflow: "hidden" }}>
                    <div style={{ width: `${secPct}%`, height: "100%", background: secPct >= 75 ? t.green : secPct >= 40 ? t.amber : t.accent, transition: "width 0.3s", borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 10, fontFamily: FONT_MONO, color: t.textDim }}>{secDone}/{secItems.length}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm("Delete this section and all its tasks?")) deleteSection(sec.id); }}
                    style={{ background: "none", border: "none", color: t.textGhost, cursor: "pointer", fontSize: 12, padding: "2px 4px", opacity: 0.5 }}
                    title="Delete section"
                  >✕</button>
                </div>
              </div>

              {/* Tasks */}
              {isExpanded && (
                <div>
                  {secItems.map(it => <TaskRow key={it.id} item={{ ...it, sectionId: sec.id }} />)}

                  {/* Inline add */}
                  {addingTo === sec.id ? (
                    <div style={{ display: "flex", gap: 6, padding: "8px 14px", background: t.surface, borderBottom: `1px solid ${t.border}` }}>
                      <input
                        ref={newTaskRef}
                        value={newTaskText}
                        onChange={e => setNewTaskText(e.target.value)}
                        placeholder="What needs to be done?"
                        style={{ flex: 1, padding: "6px 10px", background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 6, color: t.text, fontSize: 13, fontFamily: FONT_BODY, outline: "none" }}
                        onKeyDown={e => { if (e.key === "Enter") addTask(sec.id); if (e.key === "Escape") setAddingTo(null); }}
                        autoFocus
                      />
                      <button onClick={() => addTask(sec.id)} style={{ padding: "6px 14px", background: t.accent, border: "none", borderRadius: 6, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>Add</button>
                      <button onClick={() => setAddingTo(null)} style={{ padding: "6px 10px", background: "none", border: `1px solid ${t.border}`, borderRadius: 6, color: t.textDim, fontSize: 12, cursor: "pointer" }}>Cancel</button>
                    </div>
                  ) : (
                    <div
                      onClick={() => { setAddingTo(sec.id); setNewTaskText(""); }}
                      style={{ padding: "8px 14px", cursor: "pointer", fontSize: 12, color: t.textDim, background: t.surface, borderBottom: `1px solid ${t.border}` }}
                    >
                      <span style={{ opacity: 0.6 }}>+ Add task</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add section */}
        <div style={{ padding: "12px 14px" }}>
          {showAddSection ? (
            <div style={{ display: "flex", gap: 6 }}>
              <input
                value={addingSectionTitle}
                onChange={e => setAddingSectionTitle(e.target.value)}
                placeholder="Section name..."
                style={{ flex: 1, padding: "6px 10px", background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 6, color: t.text, fontSize: 13, fontFamily: FONT_BODY, outline: "none" }}
                onKeyDown={e => { if (e.key === "Enter") addSection(); if (e.key === "Escape") setShowAddSection(false); }}
                autoFocus
              />
              <button onClick={addSection} style={{ padding: "6px 14px", background: t.accent, border: "none", borderRadius: 6, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Add</button>
              <button onClick={() => setShowAddSection(false)} style={{ padding: "6px 10px", background: "none", border: `1px solid ${t.border}`, borderRadius: 6, color: t.textDim, fontSize: 12, cursor: "pointer" }}>Cancel</button>
            </div>
          ) : (
            <span
              onClick={() => setShowAddSection(true)}
              style={{ fontSize: 12, color: t.accent, cursor: "pointer", fontWeight: 500 }}
            >
              + Add Section
            </span>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  KANBAN VIEW
  // ═══════════════════════════════════════════════════════════════════════════

  const KanbanView = () => {
    const columns = config.statuses.map(st => ({
      ...st,
      items: filtered.filter(it => it.status === st.key),
    }));

    return (
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "4px 0", minHeight: 400, alignItems: "flex-start" }}>
        {columns.map(col => (
          <div key={col.key} style={{ minWidth: 240, maxWidth: 280, flex: "1 1 240px", background: t.kanbanCol, borderRadius: 10, border: `1px solid ${t.border}`, overflow: "hidden" }}>
            {/* Column header */}
            <div style={{ padding: "10px 12px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{col.label}</span>
              </div>
              <span style={{ fontSize: 10, fontFamily: FONT_MONO, color: t.textDim, background: t.surface2, padding: "1px 6px", borderRadius: 8 }}>{col.items.length}</span>
            </div>

            {/* Cards */}
            <div style={{ padding: 6, display: "flex", flexDirection: "column", gap: 4, maxHeight: 500, overflowY: "auto" }}>
              {col.items.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedTask(item)}
                  style={{
                    background: t.surface, borderRadius: 8, padding: "10px 12px",
                    border: `1px solid ${t.border}`, cursor: "pointer",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.borderHi; e.currentTarget.style.boxShadow = t.shadow; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Tags row */}
                  {(item.tags || []).length > 0 && (
                    <div style={{ display: "flex", gap: 3, marginBottom: 6, flexWrap: "wrap" }}>
                      {item.tags.map(tg => <TagChip key={tg} tagKey={tg} />)}
                    </div>
                  )}

                  {/* Title */}
                  <div style={{ fontSize: 13, fontWeight: 500, color: t.text, lineHeight: 1.4, marginBottom: 8 }}>
                    {item.text}
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <PriorityBadge priority={item.priority} compact />
                      <DueBadge due={item.due} status={item.status} />
                    </div>
                    {config.members.length > 1 && item.owner && item.owner !== "unassigned" && (
                      <Avatar memberId={item.owner} size={20} />
                    )}
                  </div>

                  {/* Subtask progress */}
                  {(item.subtasks || []).length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 2, borderRadius: 1, background: t.progressBg, overflow: "hidden" }}>
                        <div style={{ width: `${(item.subtasks.filter(s=>s.done).length / item.subtasks.length) * 100}%`, height: "100%", background: t.accent, borderRadius: 1 }} />
                      </div>
                      <span style={{ fontSize: 9, fontFamily: FONT_MONO, color: t.textDim }}>
                        {item.subtasks.filter(s=>s.done).length}/{item.subtasks.length}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {col.items.length === 0 && (
                <div style={{ padding: 20, textAlign: "center", fontSize: 11, color: t.textGhost }}>
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  TIMELINE VIEW
  // ═══════════════════════════════════════════════════════════════════════════

  const TimelineView = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const groups = [
      { label: "Overdue", items: filtered.filter(i => i.due && isOverdue(i.due) && i.status !== "done"), color: t.red, bg: t.redSoft },
      { label: "Today", items: filtered.filter(i => i.due && new Date(i.due + "T00:00:00").toDateString() === today.toDateString() && i.status !== "done"), color: t.amber, bg: t.amberSoft },
      { label: "Next 7 Days", items: filtered.filter(i => {
        if (!i.due || i.status === "done") return false;
        const d = new Date(i.due + "T00:00:00");
        const diff = (d - today) / (1000*60*60*24);
        return diff > 0 && diff <= 7;
      }), color: t.cyan, bg: t.cyanSoft },
      { label: "Later", items: filtered.filter(i => {
        if (!i.due || i.status === "done") return false;
        const d = new Date(i.due + "T00:00:00");
        const diff = (d - today) / (1000*60*60*24);
        return diff > 7;
      }), color: t.textDim, bg: t.surface2 },
      { label: "No Due Date", items: filtered.filter(i => !i.due && i.status !== "done"), color: t.textGhost, bg: "transparent" },
      { label: "Completed", items: filtered.filter(i => i.status === "done"), color: t.green, bg: t.greenSoft },
    ].filter(g => g.items.length > 0);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {groups.map(group => (
          <div key={group.label}>
            <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, background: group.bg, borderBottom: `1px solid ${t.border}` }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: group.color }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: group.color }}>{group.label}</span>
              <span style={{ fontSize: 10, fontFamily: FONT_MONO, color: t.textDim }}>{group.items.length}</span>
            </div>
            {group.items.map(item => <TaskRow key={item.id} item={item} />)}
          </div>
        ))}
        {groups.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: t.textDim, fontSize: 13 }}>
            No tasks match your filters
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  TASK DETAIL MODAL
  // ═══════════════════════════════════════════════════════════════════════════

  const TaskModal = () => {
    if (!selectedTask) return null;
    const task = selectedTask;
    const [localNotes, setLocalNotes] = useState(task.notes || "");
    const [newSubtask, setNewSubtask] = useState("");
    const [localDue, setLocalDue] = useState(task.due || "");

    const saveField = (field, value) => {
      updItem(task.sectionId, task.id, { [field]: value });
      setSelectedTask(prev => ({ ...prev, [field]: value }));
    };

    const addSubtask = () => {
      if (!newSubtask.trim()) return;
      const updated = [...(task.subtasks || []), { id: uid("st"), text: newSubtask.trim(), done: false }];
      saveField("subtasks", updated);
      setNewSubtask("");
    };

    const toggleSubtask = (stId) => {
      const updated = (task.subtasks || []).map(st => st.id === stId ? { ...st, done: !st.done } : st);
      saveField("subtasks", updated);
    };

    const removeSubtask = (stId) => {
      saveField("subtasks", (task.subtasks || []).filter(st => st.id !== stId));
    };

    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: 60, overflowY: "auto" }}
        onClick={(e) => { if (e.target === e.currentTarget) { updItem(task.sectionId, task.id, { notes: localNotes, due: localDue }); setSelectedTask(null); } }}
      >
        <div style={{ width: "100%", maxWidth: 600, background: t.surface, borderRadius: 14, border: `1px solid ${t.borderHi}`, boxShadow: "0 20px 60px rgba(0,0,0,0.4)", overflow: "hidden", marginBottom: 60 }}>

          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, fontFamily: FONT_MONO, color: t.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{task.sectionTitle}</div>
              <div style={{ fontSize: 17, fontWeight: 600, color: t.text, lineHeight: 1.3 }}>{task.text}</div>
            </div>
            <button onClick={() => { updItem(task.sectionId, task.id, { notes: localNotes, due: localDue }); setSelectedTask(null); }}
              style={{ background: "none", border: "none", color: t.textDim, cursor: "pointer", fontSize: 18, padding: "4px 8px" }}>✕</button>
          </div>

          {/* Properties */}
          <div style={{ padding: "12px 20px", display: "grid", gridTemplateColumns: "100px 1fr", gap: "8px 12px", borderBottom: `1px solid ${t.border}`, fontSize: 12 }}>
            {/* Status */}
            <span style={{ color: t.textDim, fontWeight: 500 }}>Status</span>
            <select value={task.status} onChange={e => saveField("status", e.target.value)}
              style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${t.inputBorder}`, background: t.input, color: t.text, fontSize: 12, fontFamily: FONT_BODY, cursor: "pointer" }}>
              {config.statuses.map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
            </select>

            {/* Priority */}
            <span style={{ color: t.textDim, fontWeight: 500 }}>Priority</span>
            <select value={task.priority} onChange={e => saveField("priority", Number(e.target.value))}
              style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${t.inputBorder}`, background: t.input, color: t.text, fontSize: 12, fontFamily: FONT_BODY, cursor: "pointer" }}>
              {[1,2,3,4].map(p => <option key={p} value={p}>{priorityMeta[p].short} — {priorityMeta[p].label}</option>)}
            </select>

            {/* Owner */}
            <span style={{ color: t.textDim, fontWeight: 500 }}>Owner</span>
            <select value={task.owner || "unassigned"} onChange={e => saveField("owner", e.target.value)}
              style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${t.inputBorder}`, background: t.input, color: t.text, fontSize: 12, fontFamily: FONT_BODY, cursor: "pointer" }}>
              <option value="unassigned">Unassigned</option>
              {config.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>

            {/* Due */}
            <span style={{ color: t.textDim, fontWeight: 500 }}>Due Date</span>
            <input type="date" value={localDue} onChange={e => { setLocalDue(e.target.value); saveField("due", e.target.value); }}
              style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${t.inputBorder}`, background: t.input, color: t.text, fontSize: 12, fontFamily: FONT_BODY }} />

            {/* Tags */}
            <span style={{ color: t.textDim, fontWeight: 500 }}>Tags</span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
              {(task.tags || []).map(tg => (
                <span key={tg} onClick={() => saveField("tags", task.tags.filter(x => x !== tg))}
                  style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 6px", borderRadius: 4, background: (tagMap[tg]?.color || "#666") + "18", color: tagMap[tg]?.color || "#666", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: FONT_MONO }}>
                  {tagMap[tg]?.label || tg} ✕
                </span>
              ))}
              <select
                value=""
                onChange={e => { if (e.target.value && !(task.tags || []).includes(e.target.value)) saveField("tags", [...(task.tags || []), e.target.value]); }}
                style={{ padding: "2px 6px", borderRadius: 4, border: `1px solid ${t.inputBorder}`, background: t.input, color: t.textDim, fontSize: 10, cursor: "pointer" }}
              >
                <option value="">+ tag</option>
                {config.tags.filter(tg => !(task.tags || []).includes(tg.key)).map(tg => (
                  <option key={tg.key} value={tg.key}>{tg.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtasks */}
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: FONT_MONO }}>Subtasks</div>
            {(task.subtasks || []).map(st => (
              <div key={st.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <input type="checkbox" checked={st.done} onChange={() => toggleSubtask(st.id)}
                  style={{ accentColor: t.accent, cursor: "pointer" }} />
                <span style={{ flex: 1, fontSize: 12, color: st.done ? t.textDim : t.text, textDecoration: st.done ? "line-through" : "none" }}>{st.text}</span>
                <button onClick={() => removeSubtask(st.id)} style={{ background: "none", border: "none", color: t.textGhost, cursor: "pointer", fontSize: 11 }}>✕</button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <input value={newSubtask} onChange={e => setNewSubtask(e.target.value)}
                placeholder="Add subtask..." onKeyDown={e => { if (e.key === "Enter") addSubtask(); }}
                style={{ flex: 1, padding: "5px 8px", background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 6, color: t.text, fontSize: 12, fontFamily: FONT_BODY, outline: "none" }} />
              <button onClick={addSubtask} style={{ padding: "5px 10px", background: t.accentSoft, border: `1px solid ${t.accent}33`, borderRadius: 6, color: t.accentText, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Add</button>
            </div>
          </div>

          {/* Notes */}
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: FONT_MONO }}>Notes</div>
            <textarea
              value={localNotes}
              onChange={e => setLocalNotes(e.target.value)}
              onBlur={() => saveField("notes", localNotes)}
              placeholder="Add notes, context, links..."
              rows={4}
              style={{ width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 8, color: t.text, fontSize: 12, fontFamily: FONT_BODY, outline: "none", resize: "vertical", lineHeight: 1.5 }}
            />
          </div>

          {/* Delete */}
          <div style={{ padding: "12px 20px", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => { if (confirm("Delete this task?")) deleteItem(task.sectionId, task.id); }}
              style={{ padding: "6px 14px", background: t.redSoft, border: `1px solid ${t.red}33`, borderRadius: 6, color: t.red, fontSize: 11, cursor: "pointer", fontWeight: 600 }}
            >
              Delete Task
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  SETTINGS MODAL
  // ═══════════════════════════════════════════════════════════════════════════

  const SettingsModal = () => {
    if (!showSettings) return null;
    const [localConfig, setLocalConfig] = useState(JSON.parse(JSON.stringify(config)));
    const [newMemberName, setNewMemberName] = useState("");
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState("#6366f1");

    const saveCfg = () => { setConfig(localConfig); setShowSettings(false); };

    const addMember = () => {
      if (!newMemberName.trim()) return;
      const name = newMemberName.trim();
      const id = name.toLowerCase().replace(/\s+/g, "-");
      const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
      const colors = ["#6366f1","#8b5cf6","#ec4899","#ef4444","#f59e0b","#22c55e","#06b6d4","#3b82f6"];
      const color = colors[localConfig.members.length % colors.length];
      setLocalConfig(c => ({ ...c, members: [...c.members, { id, name, initials, color }] }));
      setNewMemberName("");
    };

    const removeMember = (id) => {
      setLocalConfig(c => ({ ...c, members: c.members.filter(m => m.id !== id) }));
    };

    const addTag = () => {
      if (!newTagName.trim()) return;
      const key = newTagName.trim().toLowerCase().replace(/\s+/g, "-");
      setLocalConfig(c => ({ ...c, tags: [...c.tags, { key, label: newTagName.trim(), color: newTagColor }] }));
      setNewTagName("");
    };

    const removeTag = (key) => {
      setLocalConfig(c => ({ ...c, tags: c.tags.filter(tg => tg.key !== key) }));
    };

    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: 60, overflowY: "auto" }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}>
        <div style={{ width: "100%", maxWidth: 520, background: t.surface, borderRadius: 14, border: `1px solid ${t.borderHi}`, boxShadow: "0 20px 60px rgba(0,0,0,0.4)", overflow: "hidden", marginBottom: 60 }}>

          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: t.text }}>Settings</span>
            <button onClick={() => setShowSettings(false)} style={{ background: "none", border: "none", color: t.textDim, cursor: "pointer", fontSize: 18 }}>✕</button>
          </div>

          {/* Workspace name */}
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${t.border}` }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: t.textDim, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: FONT_MONO, display: "block", marginBottom: 6 }}>Workspace Name</label>
            <input value={localConfig.teamName} onChange={e => setLocalConfig(c => ({ ...c, teamName: e.target.value }))}
              style={{ width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 6, color: t.text, fontSize: 14, fontFamily: FONT_BODY, outline: "none" }} />
          </div>

          {/* Members */}
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${t.border}` }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: t.textDim, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: FONT_MONO, display: "block", marginBottom: 8 }}>Team Members</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
              {localConfig.members.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", background: t.surface2, borderRadius: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", fontFamily: FONT_MONO }}>{m.initials}</div>
                  <span style={{ flex: 1, fontSize: 12, color: t.text }}>{m.name}</span>
                  <button onClick={() => removeMember(m.id)} style={{ background: "none", border: "none", color: t.textGhost, cursor: "pointer", fontSize: 11 }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input value={newMemberName} onChange={e => setNewMemberName(e.target.value)} placeholder="Name..."
                onKeyDown={e => { if (e.key === "Enter") addMember(); }}
                style={{ flex: 1, padding: "5px 8px", background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 6, color: t.text, fontSize: 12, outline: "none" }} />
              <button onClick={addMember} style={{ padding: "5px 12px", background: t.accentSoft, border: `1px solid ${t.accent}33`, borderRadius: 6, color: t.accentText, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Add</button>
            </div>
          </div>

          {/* Tags */}
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${t.border}` }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: t.textDim, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: FONT_MONO, display: "block", marginBottom: 8 }}>Tags</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
              {localConfig.tags.map(tg => (
                <span key={tg.key} onClick={() => removeTag(tg.key)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 4, background: tg.color + "18", color: tg.color, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                  {tg.label} ✕
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="Tag name..."
                onKeyDown={e => { if (e.key === "Enter") addTag(); }}
                style={{ flex: 1, padding: "5px 8px", background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 6, color: t.text, fontSize: 12, outline: "none" }} />
              <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)}
                style={{ width: 32, height: 28, border: "none", background: "none", cursor: "pointer", padding: 0 }} />
              <button onClick={addTag} style={{ padding: "5px 12px", background: t.accentSoft, border: `1px solid ${t.accent}33`, borderRadius: 6, color: t.accentText, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Add</button>
            </div>
          </div>

          {/* Danger zone */}
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${t.border}` }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: t.red, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: FONT_MONO, display: "block", marginBottom: 8 }}>Danger Zone</label>
            <button onClick={() => { if (confirm("Clear ALL data and start fresh?")) { setSections([]); setConfig(DEFAULT_CONFIG); setExpanded(new Set()); setShowSettings(false); } }}
              style={{ padding: "6px 14px", background: t.redSoft, border: `1px solid ${t.red}33`, borderRadius: 6, color: t.red, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
              Reset Everything
            </button>
          </div>

          {/* Save */}
          <div style={{ padding: "12px 20px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button onClick={() => setShowSettings(false)} style={{ padding: "8px 16px", background: "none", border: `1px solid ${t.border}`, borderRadius: 8, color: t.textMd, fontSize: 12, cursor: "pointer" }}>Cancel</button>
            <button onClick={saveCfg} style={{ padding: "8px 20px", background: t.accent, border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Save Changes</button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  SHORTCUTS MODAL
  // ═══════════════════════════════════════════════════════════════════════════

  const ShortcutsModal = () => {
    if (!showShortcuts) return null;
    const shortcuts = [
      { key: "/", desc: "Focus search" },
      { key: "n", desc: "New task in first section" },
      { key: "1", desc: "Switch to List view" },
      { key: "2", desc: "Switch to Kanban view" },
      { key: "3", desc: "Switch to Timeline view" },
      { key: "?", desc: "Toggle this help" },
      { key: "Esc", desc: "Close modal / clear focus" },
    ];
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}
        onClick={() => setShowShortcuts(false)}>
        <div style={{ background: t.surface, borderRadius: 14, border: `1px solid ${t.borderHi}`, padding: 24, width: 320, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}
          onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 16 }}>Keyboard Shortcuts</div>
          {shortcuts.map(s => (
            <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
              <span style={{ fontSize: 12, color: t.textMd }}>{s.desc}</span>
              <kbd style={{ padding: "2px 8px", background: t.surface2, borderRadius: 4, border: `1px solid ${t.border}`, fontSize: 11, fontFamily: FONT_MONO, color: t.text }}>{s.key}</kbd>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  const viewOptions = [
    { key: "list", label: "List", icon: "☰" },
    { key: "kanban", label: "Board", icon: "▦" },
    { key: "timeline", label: "Timeline", icon: "◷" },
  ];

  return (
    <div style={{ fontFamily: FONT_BODY, background: t.bg, minHeight: "100vh", color: t.text, transition: "background 0.2s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        select option { background: ${t.surface}; color: ${t.text}; }
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 3px; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: ${mode === "dark" ? "invert(0.8)" : "none"}; cursor: pointer; }
        ::selection { background: ${t.accent}44; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ borderBottom: `1px solid ${t.border}`, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, background: t.bgAlt }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Logo mark */}
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${t.accent}, ${t.accent}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>⌘</div>
          <div>
            <div style={{ fontSize: 9, fontFamily: FONT_MONO, color: t.textDim, letterSpacing: 1.5, textTransform: "uppercase" }}>{config.teamName}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: -0.3 }}>ARX · Project Command</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* View toggle */}
          <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${t.border}` }}>
            {viewOptions.map(v => (
              <button key={v.key} onClick={() => setView(v.key)}
                style={{ padding: "5px 12px", background: view === v.key ? t.accentSoft : "transparent", color: view === v.key ? t.accentText : t.textDim, border: "none", cursor: "pointer", fontSize: 11, fontFamily: FONT_MONO, fontWeight: view === v.key ? 600 : 400, transition: "all 0.15s", borderRight: `1px solid ${t.border}` }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>

          {/* Settings */}
          <button onClick={() => setShowSettings(true)}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", color: t.textDim, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
            title="Settings">⚙</button>

          {/* Theme toggle */}
          <button onClick={() => setMode(m => m === "dark" ? "light" : "dark")}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", color: t.textDim, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
            title="Toggle theme">
            {mode === "dark" ? "☀" : "☾"}
          </button>

          {/* Shortcuts */}
          <button onClick={() => setShowShortcuts(true)}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", color: t.textDim, cursor: "pointer", fontSize: 13, fontFamily: FONT_MONO, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}
            title="Keyboard shortcuts">?</button>

          {/* Stats */}
          <div style={{ textAlign: "right", paddingLeft: 8, borderLeft: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: pct >= 75 ? t.green : pct >= 40 ? t.amber : t.textMd, fontFamily: FONT_MONO }}>{pct}<span style={{ fontSize: 11, fontWeight: 500 }}>%</span></div>
            <div style={{ fontSize: 9, color: t.textDim, fontFamily: FONT_MONO }}>{doneCount}/{totalAll} done</div>
          </div>
        </div>
      </header>

      {/* ── STAT BADGES ── */}
      {(overdueCount > 0 || blockedCount > 0) && (
        <div style={{ padding: "6px 20px", display: "flex", gap: 8, borderBottom: `1px solid ${t.border}`, background: t.bg }}>
          {overdueCount > 0 && (
            <span style={{ fontSize: 10, fontFamily: FONT_MONO, padding: "2px 8px", borderRadius: 4, background: t.redSoft, color: t.red, fontWeight: 600 }}>
              ⚠ {overdueCount} overdue
            </span>
          )}
          {blockedCount > 0 && (
            <span style={{ fontSize: 10, fontFamily: FONT_MONO, padding: "2px 8px", borderRadius: 4, background: t.amberSoft, color: t.amber, fontWeight: 600 }}>
              ⊘ {blockedCount} blocked
            </span>
          )}
        </div>
      )}

      {/* ── FILTERS ── */}
      <div style={{ padding: "8px 20px", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", borderBottom: `1px solid ${t.border}`, background: t.bg }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span style={{ position: "absolute", left: 8, fontSize: 12, color: t.textGhost, pointerEvents: "none" }}>⌕</span>
          <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            style={{ padding: "6px 10px 6px 26px", background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 6, color: t.text, fontSize: 12, outline: "none", width: 180, fontFamily: FONT_BODY }} />
          {!search && <kbd style={{ position: "absolute", right: 8, fontSize: 9, fontFamily: FONT_MONO, color: t.textGhost, padding: "0px 4px", background: t.surface2, borderRadius: 3 }}>/</kbd>}
        </div>

        <select value={fStatus} onChange={e => setFStatus(e.target.value)}
          style={{ padding: "6px 8px", borderRadius: 6, border: `1px solid ${t.inputBorder}`, background: t.input, color: fStatus !== "all" ? t.accentText : t.textMd, fontSize: 11, fontFamily: FONT_BODY, cursor: "pointer" }}>
          <option value="all">All Status</option>
          {config.statuses.map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
        </select>

        {config.members.length > 1 && (
          <select value={fOwner} onChange={e => setFOwner(e.target.value)}
            style={{ padding: "6px 8px", borderRadius: 6, border: `1px solid ${t.inputBorder}`, background: t.input, color: fOwner !== "all" ? t.accentText : t.textMd, fontSize: 11, fontFamily: FONT_BODY, cursor: "pointer" }}>
            <option value="all">All People</option>
            <option value="unassigned">Unassigned</option>
            {config.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        )}

        <select value={fPri} onChange={e => setFPri(e.target.value)}
          style={{ padding: "6px 8px", borderRadius: 6, border: `1px solid ${t.inputBorder}`, background: t.input, color: fPri !== "all" ? t.accentText : t.textMd, fontSize: 11, fontFamily: FONT_BODY, cursor: "pointer" }}>
          <option value="all">All Priority</option>
          {[1,2,3,4].map(p => <option key={p} value={p}>{priorityMeta[p].short} {priorityMeta[p].label}</option>)}
        </select>

        <select value={fTag} onChange={e => setFTag(e.target.value)}
          style={{ padding: "6px 8px", borderRadius: 6, border: `1px solid ${t.inputBorder}`, background: t.input, color: fTag !== "all" ? t.accentText : t.textMd, fontSize: 11, fontFamily: FONT_BODY, cursor: "pointer" }}>
          <option value="all">All Tags</option>
          {config.tags.map(tg => <option key={tg.key} value={tg.key}>{tg.label}</option>)}
        </select>

        {activeFilters > 0 && (
          <button onClick={() => { setFStatus("all"); setFOwner("all"); setFPri("all"); setFTag("all"); setSearch(""); }}
            style={{ padding: "4px 10px", background: t.accentSoft, border: `1px solid ${t.accent}33`, borderRadius: 6, color: t.accentText, fontSize: 10, cursor: "pointer", fontWeight: 600, fontFamily: FONT_MONO }}>
            Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}
          </button>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, fontFamily: FONT_MONO, color: t.textGhost }}>SORT</span>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ padding: "6px 8px", borderRadius: 6, border: `1px solid ${t.inputBorder}`, background: t.input, color: t.textMd, fontSize: 11, fontFamily: FONT_BODY, cursor: "pointer" }}>
            <option value="default">Default</option>
            <option value="priority">Priority</option>
            <option value="due">Due Date</option>
            <option value="alpha">A → Z</option>
            <option value="created">Newest First</option>
          </select>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div style={{ padding: "6px 20px", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ height: 3, borderRadius: 2, background: t.progressBg, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: pct >= 75 ? t.green : pct >= 40 ? t.amber : t.accent, transition: "width 0.4s ease", borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 9, fontFamily: FONT_MONO, color: t.textGhost, marginTop: 3 }}>
          {filtered.length} task{filtered.length !== 1 ? "s" : ""} shown
          {activeFilters > 0 && ` · filtered from ${totalAll}`}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: view === "kanban" ? "12px 20px" : 0 }}>
        {view === "list" && <ListView />}
        {view === "kanban" && <KanbanView />}
        {view === "timeline" && <TimelineView />}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding: "14px 20px", borderTop: `1px solid ${t.border}`, marginTop: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: t.textGhost, fontFamily: FONT_MONO }}>
          {config.teamName} · {totalAll} tasks · {config.members.length} member{config.members.length !== 1 ? "s" : ""} · {config.statuses.length} statuses
        </span>
        <span style={{ fontSize: 9, color: t.textGhost, fontFamily: FONT_MONO }}>
          Auto-saved · Press ? for shortcuts
        </span>
      </div>

      {/* ── MODALS ── */}
      <TaskModal />
      <SettingsModal />
      <ShortcutsModal />
    </div>
  );
}
