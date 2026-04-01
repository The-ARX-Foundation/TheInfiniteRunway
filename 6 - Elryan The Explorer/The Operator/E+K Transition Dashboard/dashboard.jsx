import { useState, useEffect, useCallback } from "react";

const TABS = ["Overview", "Student Loans", "CACREP", "Trailer Life", "Asset Liquidation"];
const EMPTY = {
  milestones: [],
  tasks: [],
  notes: ""
};

const initData = () => ({
  "Student Loans": { ...EMPTY, milestones: [], tasks: [], notes: "" },
  "CACREP": { ...EMPTY, milestones: [], tasks: [], notes: "" },
  "Trailer Life": { ...EMPTY, milestones: [], tasks: [], notes: "" },
  "Asset Liquidation": { ...EMPTY, milestones: [], tasks: [], notes: "" },
  pinned: []
});

const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export default function Dashboard() {
  const [tab, setTab] = useState("Overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("task"); // task | milestone
  const [editingNote, setEditingNote] = useState(false);
  const [noteVal, setNoteVal] = useState("");
  const [who, setWho] = useState("E"); // E or W

  // Load
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("dash-v1");
        if (r?.value) setData(JSON.parse(r.value));
        else setData(initData());
      } catch {
        setData(initData());
      }
      setLoading(false);
    })();
  }, []);

  // Save
  const save = useCallback(async (d) => {
    setData(d);
    try { await window.storage.set("dash-v1", JSON.stringify(d)); } catch (e) { console.error(e); }
  }, []);

  const addItem = () => {
    if (!input.trim() || tab === "Overview") return;
    const d = JSON.parse(JSON.stringify(data));
    const item = { id: id(), text: input.trim(), done: false, who, created: new Date().toLocaleDateString() };
    if (mode === "task") d[tab].tasks.push(item);
    else d[tab].milestones.push(item);
    setInput("");
    save(d);
  };

  const toggle = (type, itemId) => {
    if (tab === "Overview") return;
    const d = JSON.parse(JSON.stringify(data));
    const arr = d[tab][type];
    const idx = arr.findIndex(i => i.id === itemId);
    if (idx > -1) arr[idx].done = !arr[idx].done;
    save(d);
  };

  const remove = (type, itemId) => {
    if (tab === "Overview") return;
    const d = JSON.parse(JSON.stringify(data));
    d[tab][type] = d[tab][type].filter(i => i.id !== itemId);
    save(d);
  };

  const pin = (tabName, type, item) => {
    const d = JSON.parse(JSON.stringify(data));
    if (!d.pinned) d.pinned = [];
    d.pinned.push({ ...item, source: tabName, type });
    save(d);
  };

  const unpin = (itemId) => {
    const d = JSON.parse(JSON.stringify(data));
    d.pinned = (d.pinned || []).filter(i => i.id !== itemId);
    save(d);
  };

  const saveNote = () => {
    const d = JSON.parse(JSON.stringify(data));
    d[tab].notes = noteVal;
    save(d);
    setEditingNote(false);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".json";
    inp.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      try {
        const parsed = JSON.parse(text);
        save(parsed);
      } catch { alert("Invalid file"); }
    };
    inp.click();
  };

  const resetAll = () => {
    if (confirm("Nuke everything? This clears all data.")) save(initData());
  };

  if (loading) return <div style={{ padding: 20, fontFamily: "monospace" }}>Loading...</div>;
  if (!data) return <div style={{ padding: 20, fontFamily: "monospace" }}>Error loading data</div>;

  const s = {
    wrap: { fontFamily: "monospace", fontSize: 13, maxWidth: 800, margin: "0 auto", padding: "12px 16px" },
    tabs: { display: "flex", gap: 0, borderBottom: "2px solid #333", marginBottom: 12, flexWrap: "wrap" },
    tab: (active) => ({
      padding: "6px 12px", cursor: "pointer", fontWeight: active ? "bold" : "normal",
      borderBottom: active ? "2px solid #333" : "none", marginBottom: -2,
      background: active ? "#f0f0f0" : "transparent"
    }),
    row: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" },
    input: { flex: 1, padding: "4px 6px", fontFamily: "monospace", fontSize: 13, border: "1px solid #999" },
    btn: { padding: "4px 10px", fontFamily: "monospace", fontSize: 12, cursor: "pointer", border: "1px solid #666", background: "#eee" },
    btnSm: { padding: "2px 6px", fontFamily: "monospace", fontSize: 11, cursor: "pointer", border: "1px solid #999", background: "transparent", marginLeft: 4 },
    item: (done) => ({
      display: "flex", alignItems: "flex-start", gap: 6, padding: "3px 0",
      textDecoration: done ? "line-through" : "none", opacity: done ? 0.5 : 1
    }),
    section: { marginBottom: 16 },
    h3: { margin: "0 0 6px", fontSize: 13, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1 },
    note: { width: "100%", minHeight: 60, fontFamily: "monospace", fontSize: 12, padding: 6, border: "1px solid #999", resize: "vertical" },
    tag: { fontSize: 10, padding: "1px 4px", border: "1px solid #aaa", borderRadius: 2, marginLeft: 4 }
  };

  const renderItems = (items, type, source = null) => items.map(item => (
    <div key={item.id} style={s.item(item.done)}>
      <input type="checkbox" checked={item.done} onChange={() => source ? null : toggle(type, item.id)} />
      <span style={{ flex: 1 }}>
        {item.text}
        <span style={s.tag}>{item.who || "?"}</span>
        {source && <span style={s.tag}>{source}</span>}
      </span>
      {!source && <button style={s.btnSm} onClick={() => pin(tab, type, item)} title="Pin to overview">📌</button>}
      {source && <button style={s.btnSm} onClick={() => unpin(item.id)} title="Unpin">✕</button>}
      {!source && <button style={s.btnSm} onClick={() => remove(type, item.id)} title="Remove">✕</button>}
    </div>
  ));

  const renderOverview = () => {
    const allTabs = TABS.filter(t => t !== "Overview");
    return (
      <div>
        <div style={{ ...s.section, borderBottom: "1px solid #ccc", paddingBottom: 12 }}>
          <div style={s.h3}>📌 Pinned Items</div>
          {(data.pinned || []).length === 0
            ? <div style={{ color: "#888", fontSize: 12 }}>Pin items from any tab to see them here</div>
            : renderItems(data.pinned, null, true)}
        </div>

        {allTabs.map(t => {
          const d = data[t];
          const activeTasks = d.tasks.filter(i => !i.done).length;
          const totalTasks = d.tasks.length;
          const activeMilestones = d.milestones.filter(i => !i.done).length;
          const totalMilestones = d.milestones.length;
          return (
            <div key={t} style={{ ...s.section, borderBottom: "1px solid #eee", paddingBottom: 8, cursor: "pointer" }}
              onClick={() => setTab(t)}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold" }}>{t}</span>
                <span style={{ fontSize: 11, color: "#666" }}>
                  {activeTasks}/{totalTasks} tasks · {activeMilestones}/{totalMilestones} milestones
                </span>
              </div>
              {d.notes && <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{d.notes.slice(0, 100)}{d.notes.length > 100 ? "..." : ""}</div>}
            </div>
          );
        })}
      </div>
    );
  };

  const renderTab = () => {
    if (tab === "Overview") return renderOverview();
    const d = data[tab];
    return (
      <div>
        {/* Add item */}
        <div style={s.row}>
          <select value={mode} onChange={e => setMode(e.target.value)} style={{ ...s.btn, padding: "4px" }}>
            <option value="task">Task</option>
            <option value="milestone">Milestone</option>
          </select>
          <select value={who} onChange={e => setWho(e.target.value)} style={{ ...s.btn, padding: "4px", width: 40 }}>
            <option value="E">E</option>
            <option value="W">W</option>
            <option value="Both">Both</option>
          </select>
          <input style={s.input} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addItem()}
            placeholder={`Add ${mode}...`} />
          <button style={s.btn} onClick={addItem}>+</button>
        </div>

        {/* Milestones */}
        <div style={s.section}>
          <div style={s.h3}>Milestones</div>
          {d.milestones.length === 0
            ? <div style={{ color: "#888", fontSize: 12 }}>No milestones yet</div>
            : renderItems(d.milestones, "milestones")}
        </div>

        {/* Tasks */}
        <div style={s.section}>
          <div style={s.h3}>Tasks</div>
          {d.tasks.length === 0
            ? <div style={{ color: "#888", fontSize: 12 }}>No tasks yet</div>
            : renderItems(d.tasks, "tasks")}
        </div>

        {/* Notes */}
        <div style={s.section}>
          <div style={s.h3}>Notes</div>
          {editingNote ? (
            <div>
              <textarea style={s.note} value={noteVal} onChange={e => setNoteVal(e.target.value)} />
              <div style={{ ...s.row, marginTop: 4 }}>
                <button style={s.btn} onClick={saveNote}>Save</button>
                <button style={s.btn} onClick={() => setEditingNote(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 12, whiteSpace: "pre-wrap", cursor: "pointer", color: d.notes ? "#333" : "#888", minHeight: 20 }}
              onClick={() => { setNoteVal(d.notes || ""); setEditingNote(true); }}>
              {d.notes || "Click to add notes..."}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={s.wrap}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: "bold", fontSize: 15 }}>E + W Transition Dashboard</div>
        <div style={{ display: "flex", gap: 4 }}>
          <button style={s.btnSm} onClick={exportData} title="Export">💾</button>
          <button style={s.btnSm} onClick={importData} title="Import">📂</button>
          <button style={s.btnSm} onClick={resetAll} title="Reset" style={{ ...s.btnSm, color: "red" }}>🗑</button>
        </div>
      </div>

      <div style={s.tabs}>
        {TABS.map(t => (
          <div key={t} style={s.tab(t === tab)} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      {renderTab()}
    </div>
  );
}
