import { useState, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   THE ARX FOUNDATION — The Archive Eternal
   "A library for one's soul."
   
   Pronounced: ARK, like Noah's.
   Aesthetic: Sacred minimalism. Cathedral geometry. Memento mori.
   Base: Pure black & white. User paints it through initiation.
═══════════════════════════════════════════════════════════════════════════ */

const WINDOWS_SEED = [
  {
    id: "mission",
    title: "⬡ The Mission",
    x: 40, y: 120, w: 380, h: 340, z: 1, open: false,
    content: `The ARX Foundation builds sovereign digital infrastructure for communities the system was designed to forget.\n\nWe don't ask permission. We don't wait for policy. We build the tools — and hand over the keys.\n\nDigital sovereignty is not a luxury. It is the architecture of freedom in an age of surveillance.\n\n"The only walls that matter are the ones you choose."`,
  },
  {
    id: "pillars",
    title: "◈ The Three Pillars",
    x: 60, y: 180, w: 380, h: 420, z: 2, open: false,
    content: `I. DIGITAL SOVEREIGNTY\nYour data. Your devices. Your infrastructure. No landlord, no gatekeeper, no silent extraction. We build tools that make self-hosting as easy as signing up for Gmail — and a thousand times more yours.\n\nII. PRIVACY INFRASTRUCTURE\nEncryption is not paranoia. It is architecture. From GrapheneOS onboarding to Signal-to-Matrix migration, we build the plumbing that keeps communities safe from systems designed to watch them.\n\nIII. SYSTEMIC ADVOCACY\nTechnology without policy is a toy. Policy without technology is a prayer. ARX operates at the intersection — building real infrastructure AND pushing the levers that make it last.`,
  },
  {
    id: "memento",
    title: "☩ Memento Mori",
    x: 80, y: 140, w: 360, h: 300, z: 3, open: false,
    content: `Remember that you will die.\n\nThis is not a threat. It is the oldest gift.\n\nEvery system you trust with your life's work will outlive you or betray you. The question is not whether — but which.\n\nARX builds for the long after. The archive that endures when the archivists are gone. The infrastructure that serves communities not yet born.\n\nWhat you build today is your letter to the future.\n\nMake it sovereign. Make it free. Make it last.`,
  },
  {
    id: "projects",
    title: "🔧 Active Builds",
    x: 100, y: 160, w: 400, h: 440, z: 4, open: false,
    content: `BUILDING NOW:\n\n▸ GrapheneOS Onboarding — Private Android for families who can't afford to be watched\n\n▸ Signal → Matrix Migration — Moving undocumented families off platforms that cooperate with ICE\n\n▸ Sovereign Tech Stack — Self-hosted email, comms, storage. No Google. No Microsoft. No silent data harvesting.\n\n▸ The Arx Mesh — Raspberry Pi nodes in public libraries. Offline knowledge. Distributed. Unseizable.\n\n▸ Forgejo Federation — Community-owned git infrastructure. Three-node mesh. ActivityPub native.\n\nOPEN FOR CONTRIBUTION:\n\n▸ End-of-Life Reform Research\n▸ International Student Access Coalition\n▸ ARX Public Manifesto`,
  },
  {
    id: "colophon",
    title: "📜 Colophon",
    x: 50, y: 200, w: 360, h: 280, z: 5, open: false,
    content: `THE ARX FOUNDATION\nEst. 2025 — Saint George, Utah\n\nFounded by Elryan.\nBuilt with Claude. Hosted sovereign.\n\nThe name: from Latin "arx" — citadel, fortress, the high place from which you see everything and cannot be taken.\n\nPronounced like Noah's Ark.\nBecause that's what this is.\n\nA vessel for what matters.\nBuilt before the flood.\n\n— vault.hopefullyabysmal.com\n— forge.arx.foundation (coming)\n— The Xatalyst (internal ops)`,
  },
  {
    id: "initiation",
    title: "✦ The Initiation",
    x: 70, y: 130, w: 380, h: 360, z: 6, open: false,
    content: `Welcome, architect.\n\nThis space was built in black and white — deliberately. A blank page. A coloring book.\n\nYour first act of sovereignty is to make it yours.\n\nUse the palette below to paint this cathedral in your colors. There is no wrong answer. There is no default. There is only your choice.\n\nThis is how ARX works:\nWe build the walls. You choose the light that fills them.\n\nWhen you're ready, open the other windows. Explore the rooms. Read the mission. Find where you fit.\n\nThe archive is eternal. Your contribution starts now.`,
  },
];

/* ─── Draggable Window Component ──────────────────────────────────────── */
function DraggableWindow({ win, accent, textColor, bgColor, borderColor, onClose, onFocus, onMove }) {
  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.closest(".win-btn")) return;
    setDragging(true);
    const rect = dragRef.current.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    onFocus();
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      onMove(e.clientX - offset.x, e.clientY - offset.y);
    };
    const handleUp = () => setDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, offset]);

  // Touch support
  const handleTouchStart = (e) => {
    if (e.target.closest(".win-btn")) return;
    const touch = e.touches[0];
    setDragging(true);
    const rect = dragRef.current.getBoundingClientRect();
    setOffset({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    onFocus();
  };

  useEffect(() => {
    if (!dragging) return;
    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      onMove(touch.clientX - offset.x, touch.clientY - offset.y);
    };
    const handleTouchEnd = () => setDragging(false);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragging, offset]);

  return (
    <div
      ref={dragRef}
      onClick={onFocus}
      style={{
        position: "absolute",
        left: win.x,
        top: win.y,
        width: win.w,
        maxWidth: "calc(100vw - 24px)",
        zIndex: win.z,
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 2,
        boxShadow: `0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px ${borderColor}`,
        fontFamily: "'EB Garamond', serif",
        transition: dragging ? "none" : "box-shadow 0.2s",
        overflow: "hidden",
      }}
    >
      {/* Title bar */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: `${accent}08`,
          borderBottom: `1px solid ${borderColor}`,
          cursor: dragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: 13, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: accent }}>{win.title}</span>
        <button className="win-btn" onClick={onClose} style={{ background: "none", border: `1px solid ${borderColor}`, color: textColor, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, borderRadius: 1, opacity: 0.5 }}>✕</button>
      </div>
      {/* Content */}
      <div style={{ padding: "16px 18px", maxHeight: win.h - 50, overflowY: "auto", fontSize: 15, lineHeight: 1.85, color: textColor, whiteSpace: "pre-wrap", letterSpacing: 0.2 }}>
        {win.content.split("\n").map((line, i) => {
          if (line.match(/^[IVX]+\.\s/)) return <p key={i} style={{ fontWeight: 700, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", marginTop: 18, marginBottom: 6, color: accent, fontFamily: "'Cormorant Garamond', serif" }}>{line}</p>;
          if (line.startsWith("▸")) return <p key={i} style={{ paddingLeft: 8, borderLeft: `2px solid ${accent}22`, marginBottom: 8, fontSize: 14, color: `${textColor}cc` }}>{line}</p>;
          if (line.match(/^[A-Z]{2,}/)) return <p key={i} style={{ fontWeight: 700, fontSize: 12, letterSpacing: 2.5, marginTop: 16, marginBottom: 6, color: accent, fontFamily: "'Cormorant Garamond', serif" }}>{line}</p>;
          if (line.startsWith('"') || line.startsWith('"')) return <p key={i} style={{ fontStyle: "italic", fontSize: 16, color: accent, margin: "12px 0", fontFamily: "'Cormorant Garamond', serif" }}>{line}</p>;
          if (line.startsWith("—")) return <p key={i} style={{ fontSize: 12, letterSpacing: 1, color: `${textColor}66`, marginTop: 4 }}>{line}</p>;
          if (line.trim() === "") return <div key={i} style={{ height: 10 }} />;
          return <p key={i} style={{ marginBottom: 6 }}>{line}</p>;
        })}
      </div>
    </div>
  );
}

/* ─── Rose Window SVG ─────────────────────────────────────────────────── */
function RoseWindow({ color, size = 280 }) {
  const petals = 12;
  const r1 = size * 0.38;
  const r2 = size * 0.22;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ opacity: 0.06 }}>
      <circle cx={size/2} cy={size/2} r={size*0.46} fill="none" stroke={color} strokeWidth="1"/>
      <circle cx={size/2} cy={size/2} r={size*0.35} fill="none" stroke={color} strokeWidth="0.5"/>
      <circle cx={size/2} cy={size/2} r={size*0.22} fill="none" stroke={color} strokeWidth="0.5"/>
      <circle cx={size/2} cy={size/2} r={size*0.08} fill="none" stroke={color} strokeWidth="1"/>
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (i / petals) * Math.PI * 2 - Math.PI / 2;
        const x1 = size/2 + Math.cos(angle) * r2;
        const y1 = size/2 + Math.sin(angle) * r2;
        const x2 = size/2 + Math.cos(angle) * r1;
        const y2 = size/2 + Math.sin(angle) * r1;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.5" />;
      })}
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (i / petals) * Math.PI * 2 - Math.PI / 2;
        const cx = size/2 + Math.cos(angle) * (r1 * 0.72);
        const cy = size/2 + Math.sin(angle) * (r1 * 0.72);
        return <circle key={`p${i}`} cx={cx} cy={cy} r={size * 0.05} fill="none" stroke={color} strokeWidth="0.5" />;
      })}
    </svg>
  );
}

/* ─── Gothic Arch SVG ─────────────────────────────────────────────────── */
function GothicArch({ color, width = 120, height = 200 }) {
  const hw = width / 2;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ opacity: 0.04 }}>
      <path d={`M 0 ${height} L 0 ${height*0.4} Q 0 0, ${hw} 0 Q ${width} 0, ${width} ${height*0.4} L ${width} ${height}`} fill="none" stroke={color} strokeWidth="1"/>
      <path d={`M 6 ${height} L 6 ${height*0.42} Q 6 6, ${hw} 6 Q ${width-6} 6, ${width-6} ${height*0.42} L ${width-6} ${height}`} fill="none" stroke={color} strokeWidth="0.5"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function ARXFoundation() {
  const [accent, setAccent] = useState("#888888");
  const [bgMode, setBgMode] = useState("dark"); // dark or light
  const [windows, setWindows] = useState(WINDOWS_SEED);
  const [maxZ, setMaxZ] = useState(10);
  const [initiated, setInitiated] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [heroFade, setHeroFade] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setHeroFade(true), 300);
  }, []);

  const bg = bgMode === "dark" ? "#0A0A0A" : "#F5F2ED";
  const text = bgMode === "dark" ? "#E8E4DC" : "#1A1A1A";
  const muted = bgMode === "dark" ? "rgba(232,228,220,0.3)" : "rgba(26,26,26,0.3)";
  const border = bgMode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const winBg = bgMode === "dark" ? "#111111" : "#FAF8F4";

  const presets = [
    { label: "Ember", color: "#F5A623" },
    { label: "Blood", color: "#C43333" },
    { label: "Crypt", color: "#6B5CE7" },
    { label: "Moss", color: "#3ECF7A" },
    { label: "Ocean", color: "#3B82F6" },
    { label: "Bone", color: "#D4C9B8" },
    { label: "Rose", color: "#E8618C" },
    { label: "Ash", color: "#888888" },
  ];

  const openWindow = (id) => {
    const newZ = maxZ + 1;
    setMaxZ(newZ);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, open: true, z: newZ } : w));
  };

  const closeWindow = (id) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, open: false } : w));
  };

  const focusWindow = (id) => {
    const newZ = maxZ + 1;
    setMaxZ(newZ);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, z: newZ } : w));
  };

  const moveWindow = (id, x, y) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x: Math.max(0, x), y: Math.max(0, y) } : w));
  };

  const beginInitiation = () => {
    setInitiated(true);
    setShowPalette(true);
    openWindow("initiation");
  };

  const navItems = [
    { id: "mission", label: "Mission" },
    { id: "pillars", label: "Pillars" },
    { id: "projects", label: "Builds" },
    { id: "memento", label: "Memento Mori" },
    { id: "colophon", label: "Colophon" },
  ];

  return (
    <div ref={containerRef} style={{ background: bg, minHeight: "100vh", color: text, fontFamily: "'EB Garamond', serif", position: "relative", overflow: "hidden", transition: "background 0.8s, color 0.8s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${border}; border-radius: 2px; }
        ::selection { background: ${accent}33; color: ${accent}; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes breathe { 0%, 100% { opacity: 0.04; } 50% { opacity: 0.08; } }
        @keyframes crossSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fade-up { animation: fadeUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .fade-in { animation: fadeIn 0.6s ease forwards; }
        .nav-link { cursor: pointer; -webkit-tap-highlight-color: transparent; user-select: none; border: none; background: none; font-family: 'Cormorant Garamond', serif; }
        .nav-link:hover { color: ${accent} !important; }
        body { overflow-x: hidden; }
      `}</style>

      {/* ── ATMOSPHERIC BACKGROUND ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Rose window, centered */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", animation: "breathe 8s ease-in-out infinite" }}>
          <RoseWindow color={accent} size={600} />
        </div>
        {/* Gothic arches left */}
        <div style={{ position: "absolute", bottom: 0, left: 40 }}>
          <GothicArch color={accent} width={80} height={300} />
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 140 }}>
          <GothicArch color={accent} width={80} height={260} />
        </div>
        {/* Gothic arches right */}
        <div style={{ position: "absolute", bottom: 0, right: 40 }}>
          <GothicArch color={accent} width={80} height={300} />
        </div>
        <div style={{ position: "absolute", bottom: 0, right: 140 }}>
          <GothicArch color={accent} width={80} height={260} />
        </div>
        {/* Cross — slow spin */}
        <div style={{ position: "absolute", top: 60, right: 60, animation: "crossSpin 120s linear infinite", opacity: 0.03 }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <rect x="45" y="10" width="10" height="80" fill={accent} />
            <rect x="25" y="30" width="50" height="10" fill={accent} />
          </svg>
        </div>
        {/* Noise grain */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* ── TOP BAR ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, background: `${bg}ee`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${border}`, padding: "0 24px", transition: "background 0.8s" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 18, color: accent }}>⬡</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: text, transition: "color 0.8s" }}>ARX</span>
            <span style={{ fontSize: 10, color: muted, letterSpacing: 2, fontFamily: "'Cormorant Garamond', serif" }}>FOUNDATION</span>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {navItems.map(item => (
              <button key={item.id} className="nav-link" onClick={() => openWindow(item.id)} style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: muted, padding: "4px 0", transition: "color 0.2s" }}>
                {item.label}
              </button>
            ))}
            <button className="nav-link" onClick={() => setShowPalette(!showPalette)} style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: accent, padding: "4px 8px", border: `1px solid ${accent}33`, borderRadius: 2, transition: "color 0.2s" }}>
              ✦ Customize
            </button>
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px", opacity: heroFade ? 1 : 0, transition: "opacity 1.5s ease" }}>
        {/* Logo placeholder */}
        <div style={{ width: 80, height: 80, border: `1px solid ${border}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32, background: `${accent}06` }}>
          <span style={{ fontSize: 32, color: accent }}>⬡</span>
        </div>

        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, letterSpacing: 6, textTransform: "uppercase", color: accent, marginBottom: 20, fontWeight: 600 }}>The Archive Eternal</p>

        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 300, lineHeight: 1.05, marginBottom: 24, letterSpacing: -1, color: text, transition: "color 0.8s", maxWidth: 800 }}>
          A library<br />for one's <em style={{ fontWeight: 700, fontStyle: "italic", color: accent }}>soul</em>
        </h1>

        <p style={{ fontSize: 18, lineHeight: 1.8, color: muted, maxWidth: 520, marginBottom: 40, letterSpacing: 0.3, transition: "color 0.8s" }}>
          Digital sovereignty, privacy infrastructure, and systemic advocacy for the communities the system was designed to forget.
        </p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {!initiated ? (
            <button onClick={beginInitiation} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, letterSpacing: 3, textTransform: "uppercase", padding: "14px 36px", background: "transparent", border: `1px solid ${accent}`, color: accent, cursor: "pointer", borderRadius: 2, transition: "all 0.3s" }}
              onMouseEnter={e => { e.target.style.background = accent; e.target.style.color = bg; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = accent; }}
            >
              Begin the Initiation
            </button>
          ) : (
            <>
              <button onClick={() => openWindow("mission")} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", padding: "12px 28px", background: "transparent", border: `1px solid ${border}`, color: text, cursor: "pointer", borderRadius: 2, transition: "all 0.3s" }}
                onMouseEnter={e => { e.target.style.borderColor = accent; e.target.style.color = accent; }}
                onMouseLeave={e => { e.target.style.borderColor = border; e.target.style.color = text; }}
              >
                Enter the Archive
              </button>
              <button onClick={() => openWindow("projects")} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", padding: "12px 28px", background: `${accent}11`, border: `1px solid ${accent}33`, color: accent, cursor: "pointer", borderRadius: 2, transition: "all 0.3s" }}
                onMouseEnter={e => { e.target.style.background = accent; e.target.style.color = bg; }}
                onMouseLeave={e => { e.target.style.background = `${accent}11`; e.target.style.color = accent; }}
              >
                View Active Builds
              </button>
            </>
          )}
        </div>

        {/* Memento Mori footer */}
        <div style={{ position: "absolute", bottom: 40, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 1, background: border }} />
          <p style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: muted, fontFamily: "'Cormorant Garamond', serif" }}>Memento Mori</p>
          <div style={{ width: 40, height: 1, background: border }} />
        </div>
      </div>

      {/* ── DRAGGABLE WINDOWS ── */}
      {windows.filter(w => w.open).map(win => (
        <DraggableWindow
          key={win.id}
          win={win}
          accent={accent}
          textColor={text}
          bgColor={winBg}
          borderColor={border}
          onClose={() => closeWindow(win.id)}
          onFocus={() => focusWindow(win.id)}
          onMove={(x, y) => moveWindow(win.id, x, y)}
        />
      ))}

      {/* ── CUSTOMIZATION PALETTE (The Coloring Book) ── */}
      {showPalette && (
        <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 600, background: `${winBg}f5`, border: `1px solid ${border}`, borderRadius: 4, padding: "16px 20px", backdropFilter: "blur(16px)", boxShadow: "0 12px 60px rgba(0,0,0,0.4)", maxWidth: 460, width: "calc(100% - 32px)" }} className="fade-in">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: accent, fontWeight: 700 }}>✦ The Coloring Book</p>
            <button onClick={() => setShowPalette(false)} style={{ background: "none", border: "none", color: muted, cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
          <p style={{ fontSize: 13, color: muted, lineHeight: 1.7, marginBottom: 14 }}>Paint this cathedral. Choose your light.</p>

          {/* Color presets */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {presets.map(p => (
              <button key={p.label} onClick={() => setAccent(p.color)} style={{
                width: 36, height: 36, borderRadius: 2, background: p.color,
                border: accent === p.color ? `2px solid ${text}` : `1px solid ${border}`,
                cursor: "pointer", transition: "all 0.2s", position: "relative",
                boxShadow: accent === p.color ? `0 0 12px ${p.color}44` : "none",
              }} title={p.label} />
            ))}
          </div>

          {/* Custom color input */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <input type="color" value={accent} onChange={e => setAccent(e.target.value)} style={{ width: 36, height: 28, border: `1px solid ${border}`, borderRadius: 2, cursor: "pointer", background: "transparent", padding: 0 }} />
            <span style={{ fontSize: 12, color: muted, fontFamily: "monospace" }}>{accent.toUpperCase()}</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button onClick={() => setBgMode("dark")} style={{
                padding: "4px 12px", fontSize: 11, fontFamily: "'Cormorant Garamond', serif",
                letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", borderRadius: 2,
                background: bgMode === "dark" ? text : "transparent",
                color: bgMode === "dark" ? bg : muted,
                border: `1px solid ${border}`, transition: "all 0.3s",
              }}>Dark</button>
              <button onClick={() => setBgMode("light")} style={{
                padding: "4px 12px", fontSize: 11, fontFamily: "'Cormorant Garamond', serif",
                letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", borderRadius: 2,
                background: bgMode === "light" ? text : "transparent",
                color: bgMode === "light" ? bg : muted,
                border: `1px solid ${border}`, transition: "all 0.3s",
              }}>Light</button>
            </div>
          </div>

          {/* Window spawners */}
          <div style={{ borderTop: `1px solid ${border}`, paddingTop: 12 }}>
            <p style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: muted, marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>Open Rooms</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {windows.map(w => (
                <button key={w.id} onClick={() => w.open ? closeWindow(w.id) : openWindow(w.id)} style={{
                  padding: "4px 10px", fontSize: 11, fontFamily: "'Cormorant Garamond', serif",
                  letterSpacing: 0.5, cursor: "pointer", borderRadius: 2, transition: "all 0.2s",
                  background: w.open ? `${accent}18` : "transparent",
                  color: w.open ? accent : muted,
                  border: `1px solid ${w.open ? accent + "44" : border}`,
                }}>
                  {w.open ? "●" : "○"} {w.title.split(" ").slice(1).join(" ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM INSCRIPTION ── */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "80px 24px 40px" }}>
        <div style={{ width: 60, height: 1, background: border, margin: "0 auto 20px" }} />
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, letterSpacing: 4, textTransform: "uppercase", color: muted }}>
          ARX Foundation · Est. 2025
        </p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, color: `${muted}88`, marginTop: 6, fontStyle: "italic" }}>
          "What you build today is your letter to the future."
        </p>
      </div>
    </div>
  );
}
