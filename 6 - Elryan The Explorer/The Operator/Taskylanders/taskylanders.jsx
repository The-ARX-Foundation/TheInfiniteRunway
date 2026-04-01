import { useState, useRef, useEffect } from "react";

const ELEMENTS = {
  fire:  { color: "#FF4D1C", glow: "#FF6B3D", icon: "🔥", label: "Urgent" },
  water: { color: "#0EA5E9", glow: "#38BDF8", icon: "💧", label: "In Progress" },
  earth: { color: "#84CC16", glow: "#A3E635", icon: "🌿", label: "Backlog" },
  tech:  { color: "#F59E0B", glow: "#FCD34D", icon: "⚡", label: "Blocked" },
  magic: { color: "#A855F7", glow: "#C084FC", icon: "✨", label: "Done" },
  dark:  { color: "#6B7280", glow: "#9CA3AF", icon: "🌑", label: "Someday" },
};

const FIGURE_SHAPES = [
  (color, glow, size) => (
    <svg width={size} height={size} viewBox="0 0 60 80" style={{filter:`drop-shadow(0 0 ${size/6}px ${glow})`}}>
      <ellipse cx="30" cy="72" rx="22" ry="8" fill={color} opacity="0.4"/>
      <rect x="18" y="45" width="24" height="28" rx="4" fill={color}/>
      <rect x="14" y="50" width="8" height="18" rx="3" fill={color} opacity="0.8"/>
      <rect x="38" y="50" width="8" height="18" rx="3" fill={color} opacity="0.8"/>
      <circle cx="30" cy="30" r="14" fill={color}/>
      <rect x="24" y="16" width="12" height="8" rx="2" fill={color} opacity="0.9"/>
      <rect x="27" y="10" width="6" height="10" rx="1" fill={color}/>
      <line x1="48" y1="35" x2="55" y2="20" stroke={glow} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  (color, glow, size) => (
    <svg width={size} height={size*1.3} viewBox="0 0 60 80" style={{filter:`drop-shadow(0 0 ${size/6}px ${glow})`}}>
      <ellipse cx="30" cy="74" rx="20" ry="6" fill={color} opacity="0.4"/>
      <path d="M20 70 Q15 55 18 45 Q25 35 30 35 Q35 35 42 45 Q45 55 40 70Z" fill={color}/>
      <path d="M18 50 Q8 45 5 35 Q10 38 18 42Z" fill={color} opacity="0.8"/>
      <path d="M42 50 Q52 45 55 35 Q50 38 42 42Z" fill={color} opacity="0.8"/>
      <path d="M25 40 Q20 25 22 15 Q28 10 30 8 Q32 10 38 15 Q40 25 35 40Z" fill={color}/>
      <circle cx="26" cy="22" r="3" fill={glow}/>
      <circle cx="34" cy="22" r="3" fill={glow}/>
      <path d="M27 30 Q30 33 33 30" stroke={glow} strokeWidth="1.5" fill="none"/>
    </svg>
  ),
  (color, glow, size) => (
    <svg width={size} height={size*1.3} viewBox="0 0 60 80" style={{filter:`drop-shadow(0 0 ${size/6}px ${glow})`}}>
      <ellipse cx="30" cy="74" rx="18" ry="6" fill={color} opacity="0.4"/>
      <path d="M15 65 Q14 50 16 40 Q20 35 24 33 Q36 33 40 40 Q44 50 45 65Z" fill={color}/>
      <circle cx="30" cy="28" r="12" fill={color}/>
      <path d="M18 28 L30 5 L42 28Z" fill={color}/>
      <circle cx="30" cy="5" r="4" fill={glow}/>
      <line x1="44" y1="45" x2="58" y2="30" stroke={glow} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="58" cy="28" r="4" fill={glow} opacity="0.8"/>
      <circle cx="26" cy="30" r="2" fill={glow}/>
      <circle cx="34" cy="30" r="2" fill={glow}/>
    </svg>
  ),
  (color, glow, size) => (
    <svg width={size} height={size*1.2} viewBox="0 0 60 75" style={{filter:`drop-shadow(0 0 ${size/6}px ${glow})`}}>
      <ellipse cx="30" cy="70" rx="22" ry="7" fill={color} opacity="0.4"/>
      <path d="M12 65 Q8 50 10 40 Q14 30 20 28 Q25 26 30 26 Q35 26 40 28 Q46 30 50 40 Q52 50 48 65Z" fill={color}/>
      <path d="M10 38 Q2 30 5 20 Q12 28 12 35Z" fill={color}/>
      <path d="M50 38 Q58 30 55 20 Q48 28 48 35Z" fill={color}/>
      <ellipse cx="30" cy="20" rx="14" ry="12" fill={color}/>
      <path d="M16 12 Q14 4 18 2 Q20 8 22 12Z" fill={color}/>
      <path d="M44 12 Q46 4 42 2 Q40 8 38 12Z" fill={color}/>
      <circle cx="26" cy="20" r="3" fill={glow}/>
      <circle cx="34" cy="20" r="3" fill={glow}/>
    </svg>
  ),
];

const initialTasks = [
  { id: 1, name: "Rewrite API auth layer",    element: "fire",  priority: 5, shape: 0, detail: "Security audit flagged JWT expiry issues" },
  { id: 2, name: "Design system docs",        element: "water", priority: 3, shape: 2, detail: "Document all components in Storybook" },
  { id: 3, name: "Migrate database schema",   element: "tech",  priority: 4, shape: 1, detail: "Waiting on DBA approval for prod access" },
  { id: 4, name: "Write unit tests",          element: "earth", priority: 2, shape: 3, detail: "Coverage is at 40%, need 80%" },
  { id: 5, name: "Prep Q3 roadmap",           element: "magic", priority: 3, shape: 2, detail: "Stakeholder meeting Friday" },
  { id: 6, name: "Refactor legacy modules",   element: "dark",  priority: 1, shape: 0, detail: "Low priority cleanup" },
];

function useLedPulse(active) {
  const [opacity, setOpacity] = useState(1);
  const raf = useRef(null);
  const start = useRef(null);
  useEffect(() => {
    if (!active) { setOpacity(1); return; }
    const animate = (ts) => {
      if (!start.current) start.current = ts;
      const t = (ts - start.current) / 1000;
      setOpacity(0.35 + 0.65 * Math.abs(Math.sin(t * Math.PI * 1.4)));
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);
  return opacity;
}

function Figure({ task, onClick, isSelected, ledActive, ledFlash }) {
  const elem = ELEMENTS[task.element];
  const baseSize = 30 + task.priority * 10;
  const ShapeComp = FIGURE_SHAPES[task.shape % FIGURE_SHAPES.length];
  const [hover, setHover] = useState(false);
  const pulseOpacity = useLedPulse(ledActive && !ledFlash);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    if (!ledFlash) return;
    let count = 0;
    const iv = setInterval(() => {
      setFlashOn(v => !v);
      count++;
      if (count > 6) clearInterval(iv);
    }, 130);
    return () => clearInterval(iv);
  }, [ledFlash]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        transform: hover ? "translateY(-8px) scale(1.05)" : "none",
        transition: "transform 0.2s ease",
        position: "relative",
        opacity: ledActive && !ledFlash ? pulseOpacity : 1,
        filter: ledFlash
          ? flashOn ? `drop-shadow(0 0 ${baseSize*0.4}px ${elem.glow}) drop-shadow(0 0 ${baseSize*0.6}px ${elem.color})` : "none"
          : "none",
      }}
    >
      {isSelected && (
        <div style={{
          position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
          background: elem.color, color: "#000", fontSize: 9, padding: "2px 6px",
          borderRadius: 10, whiteSpace: "nowrap", fontFamily: "monospace", fontWeight: 700,
          boxShadow: `0 0 8px ${elem.glow}`,
        }}>▼ SELECTED</div>
      )}
      {ShapeComp(elem.color, elem.glow, baseSize)}
      <div style={{
        fontSize: 9, color: elem.color, fontFamily: "'Courier New', monospace",
        fontWeight: 700, textAlign: "center", maxWidth: baseSize + 20,
        lineHeight: 1.2, textShadow: `0 0 6px ${elem.glow}`,
      }}>
        {task.name.split(" ").slice(0, 2).join(" ")}
      </div>
    </div>
  );
}

function PortalBase({ tasks, selectedId, onSelect, ledStates }) {
  const elemCounts = {};
  tasks.forEach(t => { elemCounts[t.element] = (elemCounts[t.element] || 0) + 1; });
  const dominantElem = Object.entries(elemCounts).sort((a,b) => b[1]-a[1])[0];
  const portalColor = dominantElem ? ELEMENTS[dominantElem[0]].color : "#6B7280";
  const portalGlow  = dominantElem ? ELEMENTS[dominantElem[0]].glow  : "#9CA3AF";
  const cx = 200, cy = 200;

  return (
    <div style={{ position: "relative", width: 400, height: 400 }}>
      <svg width="400" height="400" style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <radialGradient id="pg" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={portalGlow}  stopOpacity="0.3"/>
            <stop offset="60%"  stopColor={portalColor} stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#0a0a0a"     stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="ig" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={portalGlow}  stopOpacity="0.6"/>
            <stop offset="100%" stopColor={portalColor} stopOpacity="0"/>
          </radialGradient>
          <filter id="bl"><feGaussianBlur stdDeviation="8"/></filter>
        </defs>
        <circle cx="200" cy="200" r="190" fill="none" stroke={portalColor} strokeWidth="2" opacity="0.3"/>
        <circle cx="200" cy="200" r="175" fill="none" stroke={portalColor} strokeWidth="1" opacity="0.2"/>
        <circle cx="200" cy="200" r="180" fill="url(#pg)" filter="url(#bl)"/>
        <circle cx="200" cy="200" r="80"  fill="url(#ig)" opacity="0.4"/>
        <circle cx="200" cy="200" r="80"  fill="none" stroke={portalGlow} strokeWidth="3" opacity="0.6"/>
        <circle cx="200" cy="200" r="65"  fill="none" stroke={portalColor} strokeWidth="1" opacity="0.4"/>
        {[0,45,90,135,180,225,270,315].map((a,i) => {
          const r = (a*Math.PI)/180;
          return <circle key={i} cx={200+183*Math.cos(r)} cy={200+183*Math.sin(r)} r="3" fill={portalColor} opacity="0.6"/>;
        })}
        {[0,60,120,180,240,300].map((a,i) => {
          const r = (a*Math.PI)/180;
          return <line key={i} x1={200+85*Math.cos(r)} y1={200+85*Math.sin(r)} x2={200+165*Math.cos(r)} y2={200+165*Math.sin(r)} stroke={portalColor} strokeWidth="1" opacity="0.15"/>;
        })}
        <text x="200" y="210" textAnchor="middle" fontSize="28" opacity="0.25" fill={portalColor}>⬡</text>
      </svg>
      {tasks.map((task, i) => {
        const angle = (i / tasks.length) * 2 * Math.PI - Math.PI / 2;
        const r = 118 + (task.priority - 3) * 8;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return (
          <div key={task.id} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -80%)" }}>
            <Figure
              task={task}
              onClick={() => onSelect(task.id)}
              isSelected={selectedId === task.id}
              ledActive={ledStates[task.id]?.mode === "pulse"}
              ledFlash={ledStates[task.id]?.mode === "flash"}
            />
          </div>
        );
      })}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
        <div style={{ fontSize: 11, color: portalGlow, fontFamily: "monospace", opacity: 0.5 }}>{tasks.length} ACTIVE</div>
      </div>
    </div>
  );
}

function TaskCard({ task, onUpdate, onDelete }) {
  const elem = ELEMENTS[task.element];
  return (
    <div style={{
      background: "rgba(10,10,10,0.9)", border: `1px solid ${elem.color}`,
      borderRadius: 12, padding: 20, boxShadow: `0 0 30px ${elem.color}33`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: elem.color, fontFamily: "monospace", marginBottom: 4, letterSpacing: 2 }}>{elem.icon} {elem.label.toUpperCase()}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Courier New', monospace" }}>{task.name}</div>
        </div>
        <button onClick={() => onDelete(task.id)} style={{ background:"none", border:"1px solid #444", color:"#666", borderRadius:6, padding:"4px 8px", cursor:"pointer", fontSize:12 }}>✕</button>
      </div>
      <div style={{ fontSize: 13, color: "#aaa", marginBottom: 16, fontFamily: "monospace" }}>{task.detail}</div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", marginBottom: 6 }}>FIGURE SIZE (PRIORITY)</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[1,2,3,4,5].map(p => (
            <button key={p} onClick={() => onUpdate(task.id, { priority: p })} style={{
              width: 28+p*6, height: 28+p*6,
              background: task.priority===p ? elem.color : "transparent",
              border: `1px solid ${task.priority>=p ? elem.color : "#333"}`,
              borderRadius: 4, cursor: "pointer",
              color: task.priority===p ? "#000" : elem.color,
              fontSize: 10, fontWeight: 700, fontFamily: "monospace",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{p}</button>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", marginBottom: 6 }}>ELEMENT (STATUS)</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.entries(ELEMENTS).map(([key, val]) => (
            <button key={key} onClick={() => onUpdate(task.id, { element: key })} style={{
              background: task.element===key ? val.color : "transparent",
              border: `1px solid ${task.element===key ? val.color : "#333"}`,
              borderRadius: 6, padding: "4px 10px", cursor: "pointer",
              color: task.element===key ? "#000" : val.color,
              fontSize: 11, fontFamily: "monospace", fontWeight: 600,
            }}>{val.icon} {val.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddTaskForm({ onAdd, onCancel }) {
  const [name, setName] = useState(""); 
  const [detail, setDetail] = useState("");
  return (
    <div style={{ background:"rgba(10,10,10,0.95)", border:"1px solid #333", borderRadius:12, padding:20 }}>
      <div style={{ fontSize:13, color:"#888", fontFamily:"monospace", marginBottom:12, letterSpacing:2 }}>⬡ PLACE NEW FIGURE</div>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Task name..."
        style={{ width:"100%", background:"#111", border:"1px solid #333", borderRadius:6, padding:"8px 12px", color:"#fff", fontFamily:"monospace", fontSize:13, marginBottom:8, boxSizing:"border-box" }}/>
      <input value={detail} onChange={e=>setDetail(e.target.value)} placeholder="Details..."
        style={{ width:"100%", background:"#111", border:"1px solid #333", borderRadius:6, padding:"8px 12px", color:"#fff", fontFamily:"monospace", fontSize:13, marginBottom:12, boxSizing:"border-box" }}/>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={()=>{ if(!name.trim()) return; onAdd({ name:name.trim(), detail:detail.trim()||"No details yet" }); }}
          style={{ flex:1, background:"#22c55e22", border:"1px solid #22c55e", borderRadius:6, padding:"8px", cursor:"pointer", color:"#22c55e", fontFamily:"monospace", fontWeight:700, fontSize:12 }}>
          ⬡ PLACE ON PORTAL
        </button>
        <button onClick={onCancel} style={{ background:"none", border:"1px solid #333", borderRadius:6, padding:"8px 14px", cursor:"pointer", color:"#555", fontFamily:"monospace", fontSize:12 }}>CANCEL</button>
      </div>
    </div>
  );
}

const LED_PATTERNS = [
  { pattern: "Slow breathe · element color",  meaning: "Task active / in progress",         demo: "pulse",   elemKey: "water" },
  { pattern: "Fast strobe · red tint",         meaning: "URGENT — needs immediate attention", demo: "strobe",  elemKey: "fire" },
  { pattern: "3× flash → solid",              meaning: "Claude just finished responding",     demo: "flash",   elemKey: "magic" },
  { pattern: "Slow breathe · white",           meaning: "Blocked — waiting on something",     demo: "white",   elemKey: "tech" },
  { pattern: "Fade to off",                    meaning: "Task marked done",                   demo: "fadeout", elemKey: "earth" },
  { pattern: "Rainbow spin · all figures",     meaning: "All tasks clear — celebrate",        demo: "rainbow", elemKey: "fire" },
];

const BOM = [
  { component: "NTAG213 NFC tag",          qty: "1× per figure",   cost: "$0.40",  note: "Embeds in base, stores task ID + element" },
  { component: "WS2812B addressable LED",  qty: "1–3× per figure", cost: "$0.30",  note: "Full RGB, diffuses through translucent resin" },
  { component: "ESP32-C3 mini",            qty: "1× per figure",   cost: "$2.50",  note: "BLE comms + LED driver, tiny form factor" },
  { component: "LiPo 80mAh + LDO 3.3V",   qty: "1× per figure",   cost: "$2.80",  note: "Or use pogo-pin contacts from portal base" },
  { component: "PN532 NFC reader module",  qty: "1× portal",       cost: "$4.00",  note: "Detects placed figures via I2C to hub ESP32" },
  { component: "ESP32 dev board (hub)",    qty: "1× portal",       cost: "$5.00",  note: "USB-C host to machine + BLE hub to figures" },
  { component: "Translucent epoxy resin",  qty: "per batch",       cost: "$12.00", note: "Cast figure bodies; element-dyed for glow" },
  { component: "Pogo pins + copper pads",  qty: "per figure",      cost: "$0.80",  note: "Charging contacts on base plate" },
];

const DAEMON_CODE = `// taskylanders-daemon.js  —  run locally
import Anthropic from "@anthropic-ai/sdk";
import noble from "@abandonware/noble";   // BLE
import { PN532 } from "pn532";            // NFC portal

const client = new Anthropic();

// Map NFC tag UIDs → task IDs (populate after flashing your figures)
const FIGURE_MAP = {
  "04:A3:2B:11": { taskId: 1, name: "API auth layer" },
  "04:F1:9C:22": { taskId: 3, name: "DB schema"      },
  // add yours here...
};

// 1. Detect figures placed on portal
const portal = new PN532({ path: "/dev/ttyUSB0" });
portal.on("tag", async (tagId) => {
  const fig = FIGURE_MAP[tagId];
  if (!fig) return;
  console.log("Figure placed:", fig.name);
  await sendLED(fig.taskId, "pulse"); // start breathing
});

// 2. Stream Claude — flash figure on completion
export async function runTaskWithClaude(taskId, prompt) {
  await sendLED(taskId, "pulse");

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk?.delta?.text ?? "");
  }

  const msg = await stream.finalMessage();
  if (msg.stop_reason === "end_turn") {
    await sendLED(taskId, "flash");  // 3-pulse flash ✓
    console.log("\\n⬡ Figure", taskId, "flashed — response complete");
  }
}

// 3. CEO MODE — parallel agents, one figure each
export async function runCEOMode(tasks) {
  await Promise.all(
    tasks.map(task => runTaskWithClaude(task.id, task.prompt))
  );
  // All done → rainbow all figures
  await broadcastLED("rainbow");
}

async function sendLED(taskId, mode) {
  const peripheral = await findPeripheralForTask(taskId);
  if (!peripheral) return;
  await peripheral.writeAsync(Buffer.from(JSON.stringify({ mode })));
}`;

const FIRMWARE_CODE = `// figure-firmware.ino  —  ESP32-C3 + WS2812B
// Flash once per figure; burn element color at compile time.
#include <BLEDevice.h>
#include <BLEServer.h>
#include <Adafruit_NeoPixel.h>

#define LED_PIN   4
#define NUM_LEDS  2

Adafruit_NeoPixel strip(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

// Burn element color per figure at flash time:
// fire: 255,77,28  |  water: 14,165,233  |  earth: 132,204,22
// tech: 245,158,11 |  magic: 168,85,247  |  dark:  107,114,128
uint8_t R = 255, G = 77, B = 28;  // <- change per figure

String ledMode = "idle";
float phase = 0;
unsigned long lastMs = 0;
int flashCount = 0;

// BLE write callback sets ledMode
class LEDCallback : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* c) {
    String val = c->getValue().c_str();
    if (val.indexOf("pulse")   >= 0) { ledMode = "pulse";   phase = 0; }
    if (val.indexOf("flash")   >= 0) { ledMode = "flash";   flashCount = 0; }
    if (val.indexOf("rainbow") >= 0) { ledMode = "rainbow"; phase = 0; }
    if (val.indexOf("idle")    >= 0)   ledMode = "idle";
  }
};

void setup() {
  strip.begin(); strip.show();
  BLEDevice::init("taskfig-01");  // unique per figure
  BLEServer* srv = BLEDevice::createServer();
  BLEService* svc = srv->createService("12345678-1234-1234-1234-123456789abc");
  BLECharacteristic* chr = svc->createCharacteristic(
    "87654321-...", BLECharacteristic::PROPERTY_WRITE
  );
  chr->setCallbacks(new LEDCallback());
  svc->start();
  BLEDevice::startAdvertising();
}

void loop() {
  unsigned long now = millis();
  float dt = (now - lastMs) / 1000.0;
  lastMs = now;

  if (ledMode == "pulse") {
    phase += dt * 1.4 * 3.14159;
    float b = 0.35 + 0.65 * abs(sin(phase));
    strip.setPixelColor(0, strip.Color(R*b, G*b, B*b));

  } else if (ledMode == "flash") {
    bool on = ((now / 130) % 2 == 0);
    strip.setPixelColor(0, on ? strip.Color(R,G,B) : strip.Color(0,0,0));
    if (++flashCount > 48) { ledMode = "idle"; flashCount = 0; }

  } else if (ledMode == "rainbow") {
    int hue = (now / 8) % 65536;
    strip.setPixelColor(0, strip.gamma32(strip.ColorHSV(hue)));

  } else {
    strip.setPixelColor(0, strip.Color(R/10, G/10, B/10));
  }

  strip.show();
  delay(16);
}`;

const FAB_STEPS = [
  { n:"01", title:"Print figure positive",    color:"#0EA5E9", desc:'FDM print in PLA at 0.1mm layer height. This is your mold master. Print base hollow with cavity for electronics (~20×12×8mm). Smooth with filler primer + 400 grit.' },
  { n:"02", title:"Silicone mold",             color:"#84CC16", desc:"Brush-on silicone (Smooth-On Mold Star 15 or similar). 3 coats. Cure 4 hrs. Yields a flexible mold you can reuse indefinitely for a whole run of figures." },
  { n:"03", title:"First resin pour — embed",  color:"#F59E0B", desc:"Mix clear epoxy resin + translucent element-color dye. Pour 40% into mold. Before cure, press in ESP32-C3 + LED + NFC tag assembly. Let set 12 hrs." },
  { n:"04", title:"Second pour — seal",        color:"#A855F7", desc:"Fill remaining cavity with resin. Press pogo pin contacts into base for charging. Full cure 24 hrs room temp or 2 hrs at 60°C. Do NOT rush this." },
  { n:"05", title:"Demold + finish",           color:"#FF4D1C", desc:"Pop from silicone. Sand base flat (400 → 800 → 2000 grit). Paint exterior with element accent color. Leave chest/core bare resin — LED glows through." },
  { n:"06", title:"Flash firmware + test",     color:"#22c55e", desc:"Flash ESP32-C3 via USB before fully sealing (or via exposed UART pads on base). Burn element color constants. Verify LED responds to BLE commands. Then seal permanently." },
];

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false), 1500); };
  return (
    <div style={{ position:"relative", margin:"10px 0" }}>
      <div style={{
        background:"#0a0a0a", border:"1px solid #1a1a1a", borderRadius:8,
        padding:"14px 16px", fontFamily:"'Courier New',monospace", fontSize:10.5,
        color:"#7dd3fc", lineHeight:1.75, overflowX:"auto", whiteSpace:"pre",
        maxHeight:300, overflowY:"auto",
      }}>{code}</div>
      <button onClick={copy} style={{
        position:"absolute", top:8, right:8,
        background: copied?"#22c55e22":"#111",
        border:`1px solid ${copied?"#22c55e":"#222"}`,
        borderRadius:5, padding:"3px 9px", cursor:"pointer",
        color:copied?"#22c55e":"#444", fontFamily:"monospace", fontSize:9,
      }}>{copied?"COPIED":"COPY"}</button>
    </div>
  );
}

function LedDot({ demo, elemKey }) {
  const elem = ELEMENTS[elemKey];
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t+1), 80);
    return () => clearInterval(iv);
  }, []);
  const t = tick * 0.08;
  let bg = elem.color, op = 1;
  if (demo==="pulse")   op = 0.35 + 0.65*Math.abs(Math.sin(t*1.4));
  if (demo==="strobe")  { bg="#ef4444"; op = Math.abs(Math.sin(t*6))>0.5?1:0.08; }
  if (demo==="flash")   op = Math.abs(Math.sin(t*3.5))>0.5?1:0.1;
  if (demo==="white")   { bg="#e0e0e0"; op = 0.35+0.65*Math.abs(Math.sin(t*0.7)); }
  if (demo==="fadeout") op = Math.max(0, 1-(tick%70)/70);
  if (demo==="rainbow") bg = `hsl(${(tick*3)%360},100%,55%)`;
  return (
    <div style={{ width:14, height:14, borderRadius:"50%", background:bg, opacity:op,
      boxShadow:`0 0 6px ${bg}, 0 0 14px ${bg}55`, flexShrink:0,
      transition: demo==="fadeout"?"opacity 0.08s":"none" }}/>
  );
}

function HardwareTab() {
  const [section, setSection] = useState("overview");
  const navItems = [
    { id:"overview",     label:"Overview" },
    { id:"led",          label:"LED Language" },
    { id:"bom",          label:"Bill of Materials" },
    { id:"firmware",     label:"Figure Firmware" },
    { id:"daemon",       label:"Bridge Daemon" },
    { id:"fabrication",  label:"Fabrication" },
  ];

  return (
    <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
      <div style={{ width:168, borderRight:"1px solid #0f0f0f", padding:"12px 0", flexShrink:0, overflowY:"auto" }}>
        {navItems.map(item => (
          <button key={item.id} onClick={()=>setSection(item.id)} style={{
            display:"block", width:"100%", textAlign:"left",
            background: section===item.id ? "rgba(168,85,247,0.1)" : "none",
            border:"none", borderLeft:`2px solid ${section===item.id?"#a855f7":"transparent"}`,
            color: section===item.id ? "#a855f7" : "#3a3a3a",
            fontFamily:"monospace", fontSize:10.5, padding:"9px 16px",
            cursor:"pointer", letterSpacing:0.5, textTransform:"uppercase",
            transition:"all 0.12s",
          }}>{item.label}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>

        {section==="overview" && (
          <div>
            <div style={{ fontSize:22, fontWeight:900, color:"#fff", fontFamily:"monospace", marginBottom:4 }}>Physical Figure System</div>
            <div style={{ fontSize:11, color:"#333", fontFamily:"monospace", marginBottom:22, letterSpacing:2 }}>IRL AMBIENT NOTIFICATIONS · LED-EMBEDDED RESIN FIGURES · BLE + NFC</div>
            <div style={{ fontSize:12.5, color:"#666", lineHeight:2, fontFamily:"monospace", maxWidth:580, marginBottom:24 }}>
              Each figure is a self-contained BLE device that sits on your desk. Its LED breathes in its element color while a task is active. When Claude finishes a response, the daemon fires a <span style={{color:"#a855f7"}}>3-pulse flash</span> on the relevant figure — visible in your peripheral vision without looking at a screen.
              <br/><br/>
              The <span style={{color:"#F59E0B"}}>portal base</span> is the USB hub. It reads NFC tags to know which figures are present and routes BLE commands from your machine to each figure individually.
              <br/><br/>
              In <span style={{color:"#FF4D1C"}}>CEO Mode</span>, multiple Claude agents run in parallel — one figure per agent, one at a time flashing as each finishes. Your desk becomes a live status board.
            </div>
            <div style={{ padding:16, background:"#0a0a0a", border:"1px solid #161616", borderRadius:10, fontFamily:"monospace", fontSize:11 }}>
              <div style={{ color:"#2a2a2a", marginBottom:14, letterSpacing:3, fontSize:9 }}>SYSTEM ARCHITECTURE</div>
              <div style={{ display:"flex", alignItems:"center", gap:0, flexWrap:"wrap", rowGap:8 }}>
                {[
                  { label:"CLAUDE API",   color:"#a855f7", sub:"stream events" },
                  { arrow:true },
                  { label:"DAEMON",       color:"#0EA5E9", sub:"node / python" },
                  { arrow:true },
                  { label:"PORTAL HUB",  color:"#F59E0B", sub:"esp32 usb-c" },
                  { arrow:true },
                  { label:"FIGURES ×N",  color:"#FF4D1C", sub:"ble + ws2812b" },
                ].map((item,i) => item.arrow
                  ? <div key={i} style={{ color:"#222", fontSize:18, padding:"0 6px" }}>→</div>
                  : <div key={i} style={{ textAlign:"center", padding:"8px 14px", background:`${item.color}0d`, border:`1px solid ${item.color}28`, borderRadius:7, minWidth:88 }}>
                      <div style={{ color:item.color, fontWeight:800, fontSize:11 }}>{item.label}</div>
                      <div style={{ color:"#333", fontSize:9, marginTop:3 }}>{item.sub}</div>
                    </div>
                )}
              </div>
            </div>
          </div>
        )}

        {section==="led" && (
          <div>
            <div style={{ fontSize:18, fontWeight:900, color:"#fff", fontFamily:"monospace", marginBottom:4 }}>LED Language</div>
            <div style={{ fontSize:11, color:"#333", fontFamily:"monospace", marginBottom:20, letterSpacing:2 }}>AMBIENT SIGNALS YOU READ WITHOUT TOUCHING A SCREEN</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
              {LED_PATTERNS.map((p,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px", background:"#0a0a0a", border:"1px solid #141414", borderRadius:8 }}>
                  <LedDot demo={p.demo} elemKey={p.elemKey}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:"#bbb", fontFamily:"monospace", fontWeight:700 }}>{p.pattern}</div>
                    <div style={{ fontSize:10, color:"#444", fontFamily:"monospace", marginTop:3 }}>{p.meaning}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding:14, background:"#0d0d12", border:"1px solid #FF4D1C22", borderRadius:8, fontFamily:"monospace", fontSize:11, color:"#555", lineHeight:1.9 }}>
              <span style={{color:"#FF4D1C", fontWeight:700}}>CEO MODE:</span> Multiple Claude agents running in parallel, each mapped to a figure. Fire = urgent agent, Water = actively streaming response, Tech = blocked/awaiting tool results. Glance at your desk — see the whole fleet at once.
            </div>
          </div>
        )}

        {section==="bom" && (
          <div>
            <div style={{ fontSize:18, fontWeight:900, color:"#fff", fontFamily:"monospace", marginBottom:4 }}>Bill of Materials</div>
            <div style={{ fontSize:11, color:"#333", fontFamily:"monospace", marginBottom:20, letterSpacing:2 }}>~$8–12 PER FIGURE · ~$25 PORTAL HUB · 6-FIGURE SET ≈ $80 PARTS</div>
            <div style={{ border:"1px solid #141414", borderRadius:8, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr 72px 2fr" }}>
                {["COMPONENT","QTY","COST","NOTE"].map(h => (
                  <div key={h} style={{ padding:"8px 12px", background:"#0d0d0d", fontSize:9, color:"#2a2a2a", fontFamily:"monospace", letterSpacing:2, borderBottom:"1px solid #141414" }}>{h}</div>
                ))}
                {BOM.map((row,i) => (
                  [row.component, row.qty, row.cost, row.note].map((cell,j) => (
                    <div key={`${i}-${j}`} style={{
                      padding:"10px 12px", fontSize:11, fontFamily:"monospace",
                      color: j===0?"#ccc" : j===2?"#22c55e" : "#555",
                      borderBottom: i<BOM.length-1 ? "1px solid #0d0d0d" : "none",
                      background: i%2===0 ? "transparent" : "#050507",
                    }}>{cell}</div>
                  ))
                ))}
              </div>
            </div>
            <div style={{ marginTop:12, fontSize:10, color:"#2a2a2a", fontFamily:"monospace", lineHeight:2.2 }}>
              * Prices approx. AliExpress bulk · Portal: PN532 + ESP32 + USB-C breakout + 6 pogo pairs<br/>
              * Total for 6 figures + portal: ~$80 parts · ~1 weekend build
            </div>
          </div>
        )}

        {section==="firmware" && (
          <div>
            <div style={{ fontSize:18, fontWeight:900, color:"#fff", fontFamily:"monospace", marginBottom:4 }}>Figure Firmware</div>
            <div style={{ fontSize:11, color:"#333", fontFamily:"monospace", marginBottom:14, letterSpacing:2 }}>ESP32-C3 · ARDUINO IDE · ADAFRUIT NEOPIXEL</div>
            <div style={{ fontSize:12, color:"#555", fontFamily:"monospace", marginBottom:10, lineHeight:1.9 }}>
              Flash once per figure. Burn the element RGB constants at compile time so each figure is self-describing — no runtime config needed.
              BLE characteristic accepts <span style={{color:"#7dd3fc"}}>{"{ mode: 'pulse' | 'flash' | 'rainbow' | 'idle' }"}</span> JSON.
            </div>
            <CodeBlock code={FIRMWARE_CODE}/>
            <div style={{ marginTop:10, padding:12, background:"#0a0a0a", border:"1px solid #1a1a1a", borderRadius:8, fontFamily:"monospace", fontSize:10, color:"#333", lineHeight:2 }}>
              DEPS: Adafruit NeoPixel · ESP32 BLE Arduino · Install via Arduino Library Manager
            </div>
          </div>
        )}

        {section==="daemon" && (
          <div>
            <div style={{ fontSize:18, fontWeight:900, color:"#fff", fontFamily:"monospace", marginBottom:4 }}>Bridge Daemon</div>
            <div style={{ fontSize:11, color:"#333", fontFamily:"monospace", marginBottom:14, letterSpacing:2 }}>NODE.JS · ANTHROPIC SDK · BLE + NFC PORTAL</div>
            <div style={{ fontSize:12, color:"#555", fontFamily:"monospace", marginBottom:10, lineHeight:1.9 }}>
              Runs locally on your machine. Listens to the Anthropic streaming API — on <span style={{color:"#22c55e"}}>stop_reason: end_turn</span>, sends a BLE flash command to the figure whose task was being worked. Also reads the portal NFC reader to track which figures are physically present.
            </div>
            <CodeBlock code={DAEMON_CODE}/>
            <div style={{ marginTop:10, padding:12, background:"#0d0d10", border:"1px solid #F59E0B22", borderRadius:8, fontFamily:"monospace", fontSize:10.5, color:"#444", lineHeight:2.2 }}>
              <span style={{color:"#F59E0B"}}>INSTALL:</span> npm install @anthropic-ai/sdk @abandonware/noble pn532<br/>
              <span style={{color:"#F59E0B"}}>RUN:</span> node taskylanders-daemon.js<br/>
              <span style={{color:"#F59E0B"}}>NOTE:</span> noble requires macOS Bluetooth permissions or Linux with BlueZ
            </div>
          </div>
        )}

        {section==="fabrication" && (
          <div>
            <div style={{ fontSize:18, fontWeight:900, color:"#fff", fontFamily:"monospace", marginBottom:4 }}>Fabrication</div>
            <div style={{ fontSize:11, color:"#333", fontFamily:"monospace", marginBottom:22, letterSpacing:2 }}>RESIN CASTING · SILICONE MOLDS · ~1 WEEKEND BUILD</div>
            {FAB_STEPS.map((s,i) => (
              <div key={i} style={{ display:"flex", gap:18, marginBottom:20, paddingBottom:20, borderBottom:i<FAB_STEPS.length-1?"1px solid #0d0d0d":"none" }}>
                <div style={{ fontSize:22, fontWeight:900, color:s.color, fontFamily:"monospace", opacity:0.4, flexShrink:0, width:30, paddingTop:1 }}>{s.n}</div>
                <div>
                  <div style={{ fontSize:12, color:s.color, fontFamily:"monospace", fontWeight:700, marginBottom:6 }}>{s.title}</div>
                  <div style={{ fontSize:11.5, color:"#555", fontFamily:"monospace", lineHeight:1.9 }}>{s.desc}</div>
                </div>
              </div>
            ))}
            <div style={{ padding:14, background:"#0a0a0a", border:"1px solid #161616", borderRadius:8, fontFamily:"monospace", fontSize:11, color:"#333", lineHeight:2.2 }}>
              💡 Translucent PETG filament (direct FDM, no mold) also diffuses LEDs well for a faster first prototype.<br/>
              💡 Pogo pin portal: 6 spring contacts in a ring pattern, matching copper pads on figure base for wireless charging without connectors.<br/>
              💡 Clear casting resin + alcohol ink makes excellent element-colored translucent bodies.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function Taskylanders() {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState("portal");
  const [ledStates, setLedStates] = useState({});
  const nextId = useRef(100);

  const selectedTask  = tasks.find(t => t.id === selectedId);
  const activeTasks   = tasks.filter(t => t.element !== "magic" && t.element !== "dark");
  const totalPriority = tasks.reduce((s,t) => s+t.priority, 0);

  const handleUpdate = (id, changes) => setTasks(p => p.map(t => t.id===id ? {...t,...changes} : t));
  const handleDelete = (id) => { setTasks(p => p.filter(t => t.id!==id)); if(selectedId===id) setSelectedId(null); };
  const handleAdd = ({name, detail}) => {
    const t = { id:nextId.current++, name, detail, element:"earth", priority:2, shape:Math.floor(Math.random()*4) };
    setTasks(p=>[...p,t]); setSelectedId(t.id); setShowAdd(false);
  };

  const handleSelect = (id) => {
    if (selectedId === id) {
      setLedStates(s => ({ ...s, [id]: { mode:"flash" } }));
      setTimeout(() => setLedStates(s => { const n={...s}; delete n[id]; return n; }), 900);
      setSelectedId(null);
    } else {
      const prev = selectedId;
      setLedStates(s => {
        const n = {...s};
        if (prev) delete n[prev];
        n[id] = { mode:"pulse" };
        return n;
      });
      setSelectedId(id);
    }
  };

  return (
    <div style={{ height:"100vh", background:"#070709", fontFamily:"'Courier New',monospace", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ borderBottom:"1px solid #111", padding:"10px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(0,0,0,0.6)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ fontSize:17, fontWeight:900, color:"#fff", letterSpacing:3 }}>⬡ TASK<span style={{color:"#a855f7"}}>YLANDERS</span></div>
          <div style={{ fontSize:9, color:"#1e1e1e", letterSpacing:1 }}>PORTAL OS v3.0 · IRL EDITION</div>
        </div>
        <div style={{ display:"flex", gap:4, alignItems:"center" }}>
          {[["portal","⬡ PORTAL"],["hardware","⚙ HARDWARE BUILD"]].map(([key,label]) => (
            <button key={key} onClick={()=>setActiveTab(key)} style={{
              background: activeTab===key ? "rgba(168,85,247,0.12)" : "none",
              border:`1px solid ${activeTab===key?"#a855f7":"#1a1a1a"}`,
              borderRadius:6, padding:"5px 14px",
              cursor:"pointer", color:activeTab===key?"#a855f7":"#333",
              fontFamily:"monospace", fontSize:10, letterSpacing:1,
              transition:"all 0.15s", marginRight:4,
            }}>{label}</button>
          ))}
          <div style={{ width:1, height:16, background:"#1a1a1a", margin:"0 8px" }}/>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 8px #22c55e" }}/>
            <span style={{ fontSize:9, color:"#22c55e" }}>PORTAL CONNECTED</span>
          </div>
          <div style={{ width:1, height:12, background:"#1a1a1a", margin:"0 8px" }}/>
          <div style={{ fontSize:9, color:"#444" }}>
            LOAD <span style={{ color:totalPriority>20?"#ef4444":totalPriority>12?"#f59e0b":"#22c55e", fontWeight:700 }}>
              {totalPriority>20?"CRITICAL":totalPriority>12?"HIGH":"NOMINAL"}
            </span>
          </div>
          <div style={{ fontSize:9, color:"#2a2a2a", marginLeft:8 }}>{tasks.length} FIG / {activeTasks.length} ACTIVE</div>
        </div>
      </div>

      {activeTab==="portal" ? (
        <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
          <div style={{ flex:"0 0 420px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20, borderRight:"1px solid #0f0f0f" }}>
            <div style={{ fontSize:9, color:"#1e1e1e", letterSpacing:3, marginBottom:8 }}>ACTIVE PORTAL</div>
            <PortalBase tasks={tasks} selectedId={selectedId} onSelect={handleSelect} ledStates={ledStates}/>
            <div style={{ marginTop:14, width:320 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:9, color:"#222", letterSpacing:2 }}>PLATE LOAD</span>
                <span style={{ fontSize:9, color:"#444" }}>{totalPriority}/25</span>
              </div>
              <div style={{ height:4, background:"#0f0f0f", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.min(100,(totalPriority/25)*100)}%`, background:totalPriority>20?"#ef4444":totalPriority>12?"#f59e0b":"#22c55e", transition:"width 0.5s ease", boxShadow:"0 0 8px currentColor" }}/>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap", justifyContent:"center" }}>
              {Object.entries(ELEMENTS).map(([key,val]) => {
                const count = tasks.filter(t=>t.element===key).length;
                return (
                  <div key={key} style={{ display:"flex", alignItems:"center", gap:3 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:val.color, boxShadow:`0 0 4px ${val.glow}` }}/>
                    <span style={{ fontSize:9, color:count>0?val.color:"#1e1e1e" }}>{val.label}{count>0?` ×${count}`:""}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:10, fontSize:9, color:"#181818", letterSpacing:1, lineHeight:2, textAlign:"center" }}>
              CLICK FIGURE TO SELECT · TAP AGAIN TO DEMO LED FLASH
            </div>
          </div>

          <div style={{ flex:1, padding:20, display:"flex", flexDirection:"column", gap:10, overflowY:"auto" }}>
            <div style={{ fontSize:9, color:"#1e1e1e", letterSpacing:3 }}>YOUR PLATE</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {[...tasks].sort((a,b)=>b.priority-a.priority).map(task => {
                const elem = ELEMENTS[task.element];
                const isLit = !!ledStates[task.id];
                return (
                  <div key={task.id} onClick={()=>handleSelect(task.id)} style={{
                    cursor:"pointer", padding:"8px 12px",
                    background: selectedId===task.id?`${elem.color}12`:"rgba(255,255,255,0.015)",
                    border:`1px solid ${selectedId===task.id?elem.color:"#141414"}`,
                    borderRadius:8, display:"flex", alignItems:"center", gap:10, transition:"all 0.15s", minWidth:200,
                  }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:isLit?elem.color:"#141414", boxShadow:isLit?`0 0 8px ${elem.glow}`:"none", flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, color:"#bbb", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{task.name}</div>
                      <div style={{ fontSize:9, color:elem.color, marginTop:1 }}>{elem.icon} {elem.label}</div>
                    </div>
                    <div style={{ fontSize:9, color:elem.color, background:`${elem.color}18`, border:`1px solid ${elem.color}35`, borderRadius:4, padding:"2px 6px", fontWeight:700 }}>P{task.priority}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ borderTop:"1px solid #0d0d0d", margin:"2px 0" }}/>
            {selectedTask && !showAdd && <TaskCard task={selectedTask} onUpdate={handleUpdate} onDelete={handleDelete}/>}
            {showAdd && <AddTaskForm onAdd={handleAdd} onCancel={()=>setShowAdd(false)}/>}
            {!showAdd && (
              <button onClick={()=>{ setShowAdd(true); setSelectedId(null); }} style={{
                background:"transparent", border:"1px dashed #1a1a1a", borderRadius:10, padding:"11px",
                cursor:"pointer", color:"#2a2a2a", fontFamily:"monospace", fontSize:11, letterSpacing:2, marginTop:"auto",
              }}
              onMouseEnter={e=>{e.target.style.borderColor="#a855f7";e.target.style.color="#a855f7";}}
              onMouseLeave={e=>{e.target.style.borderColor="#1a1a1a";e.target.style.color="#2a2a2a";}}
              >⬡ PLACE NEW FIGURE ON PORTAL</button>
            )}
            <div style={{ padding:10, background:"rgba(255,255,255,0.01)", border:"1px solid #0d0d0d", borderRadius:8, fontSize:9, color:"#181818", lineHeight:1.9, letterSpacing:1 }}>
              ⬡ PORTAL FIRMWARE v3.1 · USB HID + BLE HUB · FIGURES: NFC R/W ENABLED<br/>
              LED BINDING: ACTIVE · PRIORITY SCALING: MASS-PROPORTIONAL · CLAUDE API: STREAMING
            </div>
          </div>
        </div>
      ) : (
        <HardwareTab/>
      )}
    </div>
  );
}
