import { useState, useEffect, useCallback } from "react";

const TABS = ["Overview", "Student Loans", "CACREP", "Living Situation", "Asset Liquidation"];
const WORKSTREAMS = ["Student Loans", "CACREP", "Living Situation", "Asset Liquidation"];
const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const STATUS_OPTS = ["reviewing", "interested", "touring", "offer", "passed"];

const INIT = {
  "Student Loans": { milestones: [], tasks: [], notes: "" },
  "CACREP": { milestones: [], tasks: [], notes: "" },
  "Living Situation": { milestones: [], tasks: [], notes: "" },
  "Asset Liquidation": { milestones: [], tasks: [], notes: "" },
  pinned: [],
  properties: [
    {
      id: "snavely01",
      url: "https://www.zillow.com/homedetails/0-Snavely-Dr-Redding-CA-96003/450118215_zpid/",
      address: "0 Snavely Dr, Redding, CA 96003",
      price: 65000,
      acres: 3.64,
      type: "land",
      zoning: "RS-2 (subdividable 1-acre lots, manufactured + stick-built OK)",
      notes: "End of quiet road NW Redding. Power at gate, city water nearby. Seasonal creek, Mt Lassen views. Rolling/level. 418 days on market — negotiate hard.",
      status: "reviewing",
      addedBy: "K",
      added: "2026-03-08"
    }
  ]
};

export default function Dashboard() {
  const [tab, setTab] = useState("Overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("task");
  const [who, setWho] = useState("E");
  const [editingNote, setEditingNote] = useState(false);
  const [noteVal, setNoteVal] = useState("");
  const [showAddProp, setShowAddProp] = useState(false);
  const [propForm, setPropForm] = useState({ url: "", address: "", price: "", acres: "", type: "land", zoning: "", notes: "", addedBy: "K" });

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("dash-v1");
        if (r?.value) {
          const p = JSON.parse(r.value);
          if (p["Trailer Life"] && !p["Living Situation"]) {
            p["Living Situation"] = p["Trailer Life"];
            delete p["Trailer Life"];
          }
          if (!p.properties) p.properties = INIT.properties;
          WORKSTREAMS.forEach(w => { if (!p[w]) p[w] = { milestones: [], tasks: [], notes: "" }; });
          if (!p.pinned) p.pinned = [];
          setData(p);
        } else setData(INIT);
      } catch { setData(INIT); }
      setLoading(false);
    })();
  }, []);

  const save = useCallback(async (d) => {
    setData(d);
    try { await window.storage.set("dash-v1", JSON.stringify(d)); } catch (e) { console.error(e); }
  }, []);

  const C = (d) => JSON.parse(JSON.stringify(d));

  const addItem = () => {
    if (!input.trim() || tab === "Overview") return;
    const d = C(data);
    d[tab][mode === "task" ? "tasks" : "milestones"].push({ id: id(), text: input.trim(), done: false, who, created: new Date().toLocaleDateString() });
    setInput(""); save(d);
  };

  const toggle = (type, iid) => { const d = C(data); const i = d[tab][type].findIndex(x => x.id === iid); if (i > -1) d[tab][type][i].done = !d[tab][type][i].done; save(d); };
  const remove = (type, iid) => { const d = C(data); d[tab][type] = d[tab][type].filter(x => x.id !== iid); save(d); };
  const pin = (src, type, item) => { const d = C(data); d.pinned.push({ ...item, source: src, type }); save(d); };
  const unpin = (iid) => { const d = C(data); d.pinned = d.pinned.filter(x => x.id !== iid); save(d); };
  const saveNote = () => { const d = C(data); d[tab].notes = noteVal; save(d); setEditingNote(false); };

  const addProperty = () => {
    if (!propForm.address.trim()) return;
    const d = C(data);
    d.properties.push({ id: id(), url: propForm.url.trim(), address: propForm.address.trim(), price: propForm.price ? Number(propForm.price) : 0, acres: propForm.acres ? Number(propForm.acres) : 0, type: propForm.type, zoning: propForm.zoning.trim(), notes: propForm.notes.trim(), status: "reviewing", addedBy: propForm.addedBy, added: new Date().toISOString().slice(0, 10) });
    setPropForm({ url: "", address: "", price: "", acres: "", type: "land", zoning: "", notes: "", addedBy: "K" });
    setShowAddProp(false); save(d);
  };

  const updatePropStatus = (pid, status) => { const d = C(data); const p = d.properties.find(x => x.id === pid); if (p) p.status = status; save(d); };
  const removeProp = (pid) => { const d = C(data); d.properties = d.properties.filter(x => x.id !== pid); save(d); };

  const exportData = () => {
    const b = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u;
    a.download = `dashboard-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(u);
  };

  const importData = () => {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json";
    inp.onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { save(JSON.parse(await f.text())); } catch { alert("Invalid file"); } }; inp.click();
  };

  if (loading) return <div style={{ padding: 20, fontFamily: "monospace" }}>Loading...</div>;
  if (!data) return <div style={{ padding: 20, fontFamily: "monospace" }}>Error</div>;

  const S = {
    wrap: { fontFamily: "monospace", fontSize: 13, maxWidth: 820, margin: "0 auto", padding: "12px 16px" },
    tabs: { display: "flex", gap: 0, borderBottom: "2px solid #333", marginBottom: 12, flexWrap: "wrap" },
    tab: (a) => ({ padding: "6px 12px", cursor: "pointer", fontWeight: a ? "bold" : "normal", borderBottom: a ? "2px solid #333" : "none", marginBottom: -2, background: a ? "#f0f0f0" : "transparent", fontSize: 12 }),
    row: { display: "flex", gap: 6, marginBottom: 8, alignItems: "center" },
    input: { flex: 1, padding: "4px 6px", fontFamily: "monospace", fontSize: 12, border: "1px solid #999" },
    btn: { padding: "4px 10px", fontFamily: "monospace", fontSize: 11, cursor: "pointer", border: "1px solid #666", background: "#eee" },
    btnSm: { padding: "2px 6px", fontFamily: "monospace", fontSize: 10, cursor: "pointer", border: "1px solid #999", background: "transparent", marginLeft: 4 },
    item: (done) => ({ display: "flex", alignItems: "flex-start", gap: 6, padding: "3px 0", textDecoration: done ? "line-through" : "none", opacity: done ? 0.5 : 1 }),
    sec: { marginBottom: 14 },
    h3: { margin: "0 0 4px", fontSize: 12, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1 },
    tag: { fontSize: 9, padding: "1px 4px", border: "1px solid #aaa", borderRadius: 2, marginLeft: 4 },
    note: { width: "100%", minHeight: 50, fontFamily: "monospace", fontSize: 11, padding: 6, border: "1px solid #999", resize: "vertical", boxSizing: "border-box" },
    propCard: { border: "1px solid #ccc", padding: "8px 10px", marginBottom: 6, fontSize: 12 },
    fi: { display: "flex", gap: 6, marginBottom: 4, alignItems: "center", fontSize: 11 },
    fInput: { flex: 1, padding: "3px 5px", fontFamily: "monospace", fontSize: 11, border: "1px solid #aaa" },
    fLabel: { width: 55, textAlign: "right", fontSize: 10, color: "#555", flexShrink: 0 },
    sBadge: (s) => {
      const c = { reviewing: "#888", interested: "#2a7", touring: "#47a", offer: "#c70", passed: "#aaa" };
      return { fontSize: 9, padding: "1px 5px", background: c[s] || "#888", color: "#fff", borderRadius: 2, display: "inline-block" };
    }
  };

  const renderItems = (items, type, isSrc) => items.map(item => (
    <div key={item.id} style={S.item(item.done)}>
      <input type="checkbox" checked={item.done} onChange={() => isSrc ? null : toggle(type, item.id)} readOnly={!!isSrc} />
      <span style={{ flex: 1 }}>{item.text}<span style={S.tag}>{item.who || "?"}</span>{isSrc && <span style={S.tag}>{item.source}</span>}</span>
      {!isSrc && <button style={S.btnSm} onClick={() => pin(tab, type, item)}>📌</button>}
      <button style={S.btnSm} onClick={() => isSrc ? unpin(item.id) : remove(type, item.id)}>✕</button>
    </div>
  ));

  const renderProperties = () => {
    const props = data.properties || [];
    const active = props.filter(p => p.status !== "passed");
    const passed = props.filter(p => p.status === "passed");
    return (
      <div style={S.sec}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={S.h3}>Property Tracker</div>
          <button style={S.btn} onClick={() => setShowAddProp(!showAddProp)}>{showAddProp ? "Cancel" : "+ Property"}</button>
        </div>
        {showAddProp && (
          <div style={{ border: "1px solid #aaa", padding: 8, marginBottom: 8 }}>
            <div style={S.fi}><span style={S.fLabel}>URL</span><input style={S.fInput} value={propForm.url} onChange={e => setPropForm({ ...propForm, url: e.target.value })} placeholder="Zillow/Redfin link" /></div>
            <div style={S.fi}><span style={S.fLabel}>Address</span><input style={S.fInput} value={propForm.address} onChange={e => setPropForm({ ...propForm, address: e.target.value })} placeholder="Required" /></div>
            <div style={S.fi}>
              <span style={S.fLabel}>Price</span><input style={{ ...S.fInput, maxWidth: 90 }} type="number" value={propForm.price} onChange={e => setPropForm({ ...propForm, price: e.target.value })} />
              <span style={{ ...S.fLabel, width: 35 }}>Acres</span><input style={{ ...S.fInput, maxWidth: 70 }} type="number" step="0.01" value={propForm.acres} onChange={e => setPropForm({ ...propForm, acres: e.target.value })} />
              <select style={S.btn} value={propForm.type} onChange={e => setPropForm({ ...propForm, type: e.target.value })}><option value="land">Land</option><option value="house">House</option><option value="house+land">House+Land</option></select>
            </div>
            <div style={S.fi}><span style={S.fLabel}>Zoning</span><input style={S.fInput} value={propForm.zoning} onChange={e => setPropForm({ ...propForm, zoning: e.target.value })} /></div>
            <div style={S.fi}><span style={S.fLabel}>Notes</span><input style={S.fInput} value={propForm.notes} onChange={e => setPropForm({ ...propForm, notes: e.target.value })} /></div>
            <div style={S.fi}>
              <span style={S.fLabel}>By</span>
              <select style={S.btn} value={propForm.addedBy} onChange={e => setPropForm({ ...propForm, addedBy: e.target.value })}><option value="E">E</option><option value="K">K</option></select>
              <button style={{ ...S.btn, marginLeft: "auto" }} onClick={addProperty}>Save</button>
            </div>
          </div>
        )}
        {active.length === 0 && <div style={{ color: "#888", fontSize: 11 }}>No active properties</div>}
        {active.map(p => (
          <div key={p.id} style={S.propCard}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><strong>{p.address}</strong> <span style={S.tag}>{p.type}</span> <span style={S.tag}>{p.addedBy}</span> <span style={S.sBadge(p.status)}>{p.status}</span></div>
              <button style={S.btnSm} onClick={() => removeProp(p.id)}>✕</button>
            </div>
            <div style={{ color: "#333", marginTop: 2 }}>${p.price?.toLocaleString() || "?"} · {p.acres || "?"}ac{p.zoning && ` · ${p.zoning}`}</div>
            {p.notes && <div style={{ color: "#555", marginTop: 2, fontSize: 11 }}>{p.notes}</div>}
            <div style={{ marginTop: 4, display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" }}>
              {STATUS_OPTS.map(st => (
                <button key={st} style={{ ...S.btnSm, fontWeight: p.status === st ? "bold" : "normal", background: p.status === st ? "#ddd" : "transparent", marginLeft: 0 }}
                  onClick={() => updatePropStatus(p.id, st)}>{st}</button>
              ))}
              {p.url && <a href={p.url} target="_blank" rel="noopener" style={{ fontSize: 10, marginLeft: "auto" }}>listing ↗</a>}
            </div>
          </div>
        ))}
        {passed.length > 0 && (
          <details style={{ marginTop: 6, fontSize: 11 }}>
            <summary style={{ cursor: "pointer", color: "#888" }}>Passed ({passed.length})</summary>
            {passed.map(p => (
              <div key={p.id} style={{ ...S.propCard, opacity: 0.5, display: "flex", justifyContent: "space-between" }}>
                <span>{p.address} — ${p.price?.toLocaleString()}</span>
                <span><button style={S.btnSm} onClick={() => updatePropStatus(p.id, "reviewing")}>↩</button><button style={S.btnSm} onClick={() => removeProp(p.id)}>✕</button></span>
              </div>
            ))}
          </details>
        )}
      </div>
    );
  };

  const renderOverview = () => (
    <div>
      <div style={{ ...S.sec, borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
        <div style={S.h3}>Pinned</div>
        {(data.pinned || []).length === 0 ? <div style={{ color: "#888", fontSize: 11 }}>Pin items from any tab</div> : renderItems(data.pinned, null, true)}
      </div>
      {(data.properties || []).filter(p => p.status !== "passed").length > 0 && (
        <div style={{ ...S.sec, borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
          <div style={S.h3}>Active Properties</div>
          {data.properties.filter(p => p.status !== "passed").map(p => (
            <div key={p.id} style={{ fontSize: 11, padding: "2px 0", display: "flex", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setTab("Living Situation")}>
              <span>{p.address} <span style={S.sBadge(p.status)}>{p.status}</span></span>
              <span>${p.price?.toLocaleString()} · {p.acres}ac</span>
            </div>
          ))}
        </div>
      )}
      {WORKSTREAMS.map(t => {
        const d = data[t]; const at = d.tasks.filter(i => !i.done).length, tt = d.tasks.length;
        const am = d.milestones.filter(i => !i.done).length, tm = d.milestones.length;
        return (
          <div key={t} style={{ ...S.sec, borderBottom: "1px solid #eee", paddingBottom: 6, cursor: "pointer" }} onClick={() => setTab(t)}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "bold" }}>{t}</span>
              <span style={{ fontSize: 10, color: "#666" }}>{at}/{tt} tasks · {am}/{tm} ms</span>
            </div>
            {d.notes && <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>{d.notes.slice(0, 80)}{d.notes.length > 80 ? "…" : ""}</div>}
          </div>
        );
      })}
    </div>
  );

  const renderTab = () => {
    if (tab === "Overview") return renderOverview();
    const d = data[tab];
    return (
      <div>
        <div style={S.row}>
          <select value={mode} onChange={e => setMode(e.target.value)} style={{ ...S.btn, padding: "4px" }}><option value="task">Task</option><option value="milestone">Milestone</option></select>
          <select value={who} onChange={e => setWho(e.target.value)} style={{ ...S.btn, padding: "4px", width: 44 }}><option value="E">E</option><option value="K">K</option><option value="Both">Both</option></select>
          <input style={S.input} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addItem()} placeholder={`Add ${mode}…`} />
          <button style={S.btn} onClick={addItem}>+</button>
        </div>
        <div style={S.sec}><div style={S.h3}>Milestones</div>{d.milestones.length === 0 ? <div style={{ color: "#888", fontSize: 11 }}>—</div> : renderItems(d.milestones, "milestones")}</div>
        <div style={S.sec}><div style={S.h3}>Tasks</div>{d.tasks.length === 0 ? <div style={{ color: "#888", fontSize: 11 }}>—</div> : renderItems(d.tasks, "tasks")}</div>
        {tab === "Living Situation" && renderProperties()}
        <div style={S.sec}><div style={S.h3}>Notes</div>
          {editingNote ? (
            <div><textarea style={S.note} value={noteVal} onChange={e => setNoteVal(e.target.value)} />
              <div style={{ ...S.row, marginTop: 4 }}><button style={S.btn} onClick={saveNote}>Save</button><button style={S.btn} onClick={() => setEditingNote(false)}>Cancel</button></div></div>
          ) : (
            <div style={{ fontSize: 11, whiteSpace: "pre-wrap", cursor: "pointer", color: d.notes ? "#333" : "#888", minHeight: 16 }}
              onClick={() => { setNoteVal(d.notes || ""); setEditingNote(true); }}>{d.notes || "Click to add notes…"}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={S.wrap}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontWeight: "bold", fontSize: 14 }}>E + K Transition Dashboard</div>
        <div style={{ display: "flex", gap: 4 }}>
          <button style={S.btnSm} onClick={exportData} title="Export">💾</button>
          <button style={S.btnSm} onClick={importData} title="Import">📂</button>
          <button style={{ ...S.btnSm, color: "red" }} onClick={() => { if(confirm("Nuke everything?")) save(INIT); }} title="Reset">🗑</button>
        </div>
      </div>
      <div style={S.tabs}>{TABS.map(t => <div key={t} style={S.tab(t === tab)} onClick={() => setTab(t)}>{t}</div>)}</div>
      {renderTab()}
    </div>
  );
}
