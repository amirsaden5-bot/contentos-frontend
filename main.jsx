// ════════════════════════════════════════════════════════════════════════════
// design.jsx — tokens, logo generator, shared primitives
// ════════════════════════════════════════════════════════════════════════════
import React from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
export const T = {
  bg:"#f7f8fa", surface:"#ffffff", sidebar:"#0f1117", sidebarHover:"#1a1d27",
  line:"#e8eaef", lineHi:"#d4d7e0",
  text:"#13151c", sub:"#6b7280", faint:"#9ca3af",
  ink:"#5b5bd6", inkSoft:"#eef0fd", inkDark:"#4949c4",
  green:"#0fa968", greenBg:"#e8faf1",
  amber:"#d98a00", amberBg:"#fdf6e8",
  red:"#e0436b", redBg:"#fdedf2",
  sky:"#0891b2", skyBg:"#e7f7fb",
};

export const NICHES = [
  {id:"ai",     label:"AI & Tech",   icon:"🤖", desc:"tools, automation, innovation", cpm:"$8-14"},
  {id:"fin",    label:"Finance",     icon:"💰", desc:"investing, passive income",     cpm:"$12-20"},
  {id:"health", label:"Health",      icon:"💪", desc:"fitness, nutrition, lifestyle", cpm:"$6-10"},
  {id:"mind",   label:"Mindset",     icon:"🧠", desc:"motivation, productivity",      cpm:"$5-9"},
  {id:"travel", label:"Travel",      icon:"✈️", desc:"destinations, tips",            cpm:"$7-12"},
  {id:"food",   label:"Food",        icon:"🍕", desc:"recipes, cooking",              cpm:"$4-8"},
  {id:"crypto", label:"Crypto",      icon:"🪙", desc:"coins, blockchain, trading",    cpm:"$15-25"},
  {id:"beauty", label:"Beauty",      icon:"💄", desc:"makeup, skincare, fashion",     cpm:"$6-11"},
];

export const PLATFORMS = [
  {id:"youtube",  label:"YouTube",   glyph:"▶", color:"#ff0000"},
  {id:"tiktok",   label:"TikTok",    glyph:"♪", color:"#010101"},
  {id:"instagram",label:"Instagram", glyph:"◎", color:"#e1306c"},
  {id:"facebook", label:"Facebook",  glyph:"f", color:"#1877f2"},
];

export const uid = () => Math.random().toString(36).slice(2, 9);

// ════════════════════════════════════════════════════════════════════════════
// LOGO GENERATOR — significantly upgraded
// 8 distinct styles, gradient meshes, geometric marks
// ════════════════════════════════════════════════════════════════════════════
export const LOGO_PALETTES = [
  {name:"Indigo",  c:["#5b5bd6","#8b5cf6"], accent:"#c4b5fd"},
  {name:"Emerald", c:["#059669","#10b981"], accent:"#6ee7b7"},
  {name:"Rose",    c:["#e11d48","#f43f5e"], accent:"#fda4af"},
  {name:"Amber",   c:["#d97706","#f59e0b"], accent:"#fcd34d"},
  {name:"Ocean",   c:["#0891b2","#06b6d4"], accent:"#67e8f9"},
  {name:"Violet",  c:["#7c3aed","#a855f7"], accent:"#d8b4fe"},
  {name:"Sunset",  c:["#ea580c","#f97316"], accent:"#fdba74"},
  {name:"Teal",    c:["#0d9488","#14b8a6"], accent:"#5eead4"},
  {name:"Slate",   c:["#1e293b","#475569"], accent:"#94a3b8"},
  {name:"Fuchsia", c:["#c026d3","#e879f9"], accent:"#f5d0fe"},
];

export const LOGO_STYLES = ["mesh","orbit","monogram","shield","wave","prism","badge","minimal"];

export function LogoMark({ seed, style, palette, initials, icon, size = 80 }) {
  const p = palette || LOGO_PALETTES[0];
  const [c1, c2] = p.c;
  const ac = p.accent;
  const g = `g${seed}`;
  const g2 = `h${seed}`;
  const r = (n) => { // deterministic pseudo-random from seed
    let x = 0; const s = seed + n;
    for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) % 1000;
    return x / 1000;
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display:"block" }}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1}/>
          <stop offset="100%" stopColor={c2}/>
        </linearGradient>
        <radialGradient id={g2} cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor={ac}/>
          <stop offset="100%" stopColor={c1}/>
        </radialGradient>
      </defs>

      {style === "mesh" && (<>
        <rect x="4" y="4" width="92" height="92" rx="24" fill={`url(#${g})`}/>
        <circle cx={30 + r("a")*40} cy={30 + r("b")*40} r="28" fill={ac} opacity="0.35"/>
        <circle cx={50 + r("c")*30} cy={55 + r("d")*30} r="20" fill="#fff" opacity="0.18"/>
        <text x="50" y="52" fontSize="34" fontWeight="800" fill="#fff" textAnchor="middle" dominantBaseline="central" fontFamily="Inter,sans-serif">{initials}</text>
      </>)}

      {style === "orbit" && (<>
        <rect x="4" y="4" width="92" height="92" rx="24" fill="#0f1117"/>
        <circle cx="50" cy="50" r="34" fill="none" stroke={`url(#${g})`} strokeWidth="3" opacity="0.6"/>
        <circle cx="50" cy="50" r="22" fill={`url(#${g})`}/>
        <circle cx="78" cy="32" r="6" fill={ac}/>
        <text x="50" y="51" fontSize="20" fontWeight="800" fill="#fff" textAnchor="middle" dominantBaseline="central" fontFamily="Inter,sans-serif">{initials}</text>
      </>)}

      {style === "monogram" && (<>
        <rect x="4" y="4" width="92" height="92" rx="20" fill="#fff" stroke={c1} strokeWidth="2.5"/>
        <text x="50" y="53" fontSize="42" fontWeight="800" fill={`url(#${g})`} textAnchor="middle" dominantBaseline="central" fontFamily="Inter,sans-serif" letterSpacing="-1">{initials}</text>
      </>)}

      {style === "shield" && (<>
        <path d="M50 6 L88 20 V52 C88 74 70 88 50 94 C30 88 12 74 12 52 V20 Z" fill={`url(#${g})`}/>
        <path d="M50 6 L88 20 V52 C88 74 70 88 50 94 C30 88 12 74 12 52 V20 Z" fill="none" stroke={ac} strokeWidth="1.5" opacity="0.5"/>
        <text x="50" y="50" fontSize="28" fontWeight="800" fill="#fff" textAnchor="middle" dominantBaseline="central" fontFamily="Inter,sans-serif">{initials}</text>
      </>)}

      {style === "wave" && (<>
        <rect x="4" y="4" width="92" height="92" rx="24" fill={`url(#${g2})`}/>
        <path d="M4 60 Q28 40 50 58 T96 56 V96 H4 Z" fill="#fff" opacity="0.2"/>
        <path d="M4 70 Q28 52 50 68 T96 66 V96 H4 Z" fill="#fff" opacity="0.15"/>
        <text x="50" y="42" fontSize="30" fontWeight="800" fill="#fff" textAnchor="middle" dominantBaseline="central" fontFamily="Inter,sans-serif">{initials}</text>
      </>)}

      {style === "prism" && (<>
        <rect x="4" y="4" width="92" height="92" rx="24" fill="#0f1117"/>
        <polygon points="50,18 78,66 22,66" fill={`url(#${g})`}/>
        <polygon points="50,18 78,66 50,66" fill={ac} opacity="0.4"/>
        <text x="50" y="80" fontSize="14" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="Inter,sans-serif" letterSpacing="2">{initials}</text>
      </>)}

      {style === "badge" && (<>
        <circle cx="50" cy="50" r="46" fill={`url(#${g})`}/>
        <circle cx="50" cy="50" r="38" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" strokeDasharray="3 3"/>
        <text x="50" y="51" fontSize="30" fontWeight="800" fill="#fff" textAnchor="middle" dominantBaseline="central" fontFamily="Inter,sans-serif">{initials}</text>
      </>)}

      {style === "minimal" && (<>
        <rect x="4" y="4" width="92" height="92" rx="24" fill={T.bg}/>
        <rect x="20" y="44" width="60" height="12" rx="6" fill={`url(#${g})`}/>
        <circle cx="30" cy="30" r="8" fill={ac}/>
        <text x="50" y="74" fontSize="13" fontWeight="700" fill={c1} textAnchor="middle" fontFamily="Inter,sans-serif" letterSpacing="1">{initials}</text>
      </>)}
    </svg>
  );
}

export function generateLogoSet(channelName, niche, count = 8) {
  const initials = channelName.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "CO";
  const nc = NICHES.find(n => n.id === niche);
  const out = [];
  const usedStyles = [...LOGO_STYLES].sort(() => Math.random() - 0.5);
  for (let i = 0; i < count; i++) {
    const pal = LOGO_PALETTES[Math.floor(Math.random() * LOGO_PALETTES.length)];
    out.push({
      seed: uid(),
      style: usedStyles[i % usedStyles.length],
      palette: pal,
      initials,
      icon: nc?.icon || "📺",
    });
  }
  return out;
}

// ── Shared primitives ─────────────────────────────────────────────────────────
export function Btn({ children, onClick, disabled, variant = "primary", full, size = "md", style }) {
  const variants = {
    primary:   { bg: disabled ? T.line : T.ink, color: disabled ? T.faint : "#fff", border: "none" },
    secondary: { bg: T.surface, color: T.text, border: `1px solid ${T.line}` },
    ghost:     { bg: "transparent", color: T.sub, border: "none" },
    danger:    { bg: T.redBg, color: T.red, border: `1px solid ${T.red}33` },
  };
  const sizes = { sm:"7px 12px", md:"11px 18px", lg:"14px 22px" };
  const v = variants[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: full ? "100%" : "auto", background: v.bg, color: v.color, border: v.border,
      borderRadius: 11, padding: sizes[size], fontSize: size==="sm"?13:14, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer", transition: "all .15s",
      fontFamily: "inherit", ...style,
    }}>{children}</button>
  );
}

export function Card({ children, pad = 22, style, onClick, hover }) {
  return (
    <div onClick={onClick} style={{
      background: T.surface, border: `1px solid ${T.line}`, borderRadius: 16,
      padding: pad, transition: "all .15s", cursor: onClick ? "pointer" : "default",
      ...(hover ? { ":hover": {} } : {}), ...style,
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = T.lineHi; e.currentTarget.style.transform = "translateY(-1px)"; }}}
    onMouseLeave={e => { if (onClick) { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.transform = "none"; }}}>
      {children}
    </div>
  );
}

export function Tag({ label, color, bg }) {
  return <span style={{ background: bg || T.inkSoft, color: color || T.ink, borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>;
}

export function Input({ value, onChange, placeholder, type = "text", style }) {
  return <input value={value} onChange={onChange} placeholder={placeholder} type={type} style={{
    width: "100%", background: T.bg, border: `1px solid ${T.line}`, borderRadius: 11,
    padding: "12px 15px", fontSize: 14, color: T.text, outline: "none", boxSizing: "border-box",
    fontFamily: "inherit", transition: "border-color .15s", ...style,
  }} onFocus={e => e.target.style.borderColor = T.ink} onBlur={e => e.target.style.borderColor = T.line}/>;
}

export function Avatar({ channel, size = 44 }) {
  if (channel?.logo) return (
    <div style={{ width: size, height: size, borderRadius: size/3.6, overflow: "hidden", flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
      <LogoMark {...channel.logo} size={size}/>
    </div>
  );
  const nc = NICHES.find(n => n.id === channel?.niche);
  return <div style={{ width: size, height: size, borderRadius: size/3.6, background: T.bg, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size*.45, flexShrink: 0 }}>{nc?.icon || "📺"}</div>;
}
