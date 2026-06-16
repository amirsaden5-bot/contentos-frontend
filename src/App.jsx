import React, { useState } from "react";

// ── Config (from env) ─────────────────────────────────────────────────────────
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY || "";
const ELEVENLABS_KEY = import.meta.env.VITE_ELEVENLABS_KEY || "";
const KLING_KEY = import.meta.env.VITE_KLING_KEY || "";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#f7f8fa", white: "#fff", dark: "#0f1117",
  ink: "#5b5bd6", inkLight: "#eef0fd",
  text: "#13151c", sub: "#6b7280", faint: "#9ca3af",
  line: "#e8eaef",
  green: "#0fa968", greenBg: "#e8faf1",
  amber: "#d98a00", amberBg: "#fdf6e8",
  red: "#e0436b", redBg: "#fdedf2",
};

const uid = () => Math.random().toString(36).slice(2,8);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const NICHES = [
  { id:"finance",   label:"Finance & Money",   icon:"💰", prompt:"personal finance, investing, passive income, budgeting tips" },
  { id:"ai",        label:"AI & Technology",    icon:"🤖", prompt:"AI tools, productivity hacks, tech news, automation" },
  { id:"health",    label:"Health & Fitness",   icon:"💪", prompt:"workout routines, nutrition, mental health, wellness" },
  { id:"mindset",   label:"Mindset & Success",  icon:"🧠", prompt:"motivation, productivity, morning routines, self improvement" },
  { id:"crypto",    label:"Crypto & Web3",      icon:"🪙", prompt:"cryptocurrency, blockchain, DeFi, NFTs, trading" },
  { id:"travel",    label:"Travel & Adventure", icon:"✈️", prompt:"travel tips, hidden gems, budget travel, destinations" },
];

// ── Claude API ────────────────────────────────────────────────────────────────
async function callClaude(prompt, maxTokens = 1000) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const d = await res.json();
  const text = d.content?.[0]?.text || "";
  return text.replace(/```json|```/g, "").trim();
}

// ── ElevenLabs TTS ────────────────────────────────────────────────────────────
async function generateVoice(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!res.ok) throw new Error("ElevenLabs error: " + await res.text());
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ── Kling AI ──────────────────────────────────────────────────────────────────
async function generateKlingClip(prompt) {
  // Submit task
  const res = await fetch("https://api.klingai.com/v1/videos/text2video", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${KLING_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      duration: 5,
      aspect_ratio: "9:16",
      mode: "standard",
    }),
  });
  const data = await res.json();
  const taskId = data.data?.task_id;
  if (!taskId) throw new Error("Kling task failed: " + JSON.stringify(data));

  // Poll until done (max 3 min)
  for (let i = 0; i < 36; i++) {
    await sleep(5000);
    const poll = await fetch(`https://api.klingai.com/v1/videos/text2video/${taskId}`, {
      headers: { "Authorization": `Bearer ${KLING_KEY}` },
    });
    const pd = await poll.json();
    const status = pd.data?.task_status;
    if (status === "succeed") return pd.data.task_result.videos[0].url;
    if (status === "failed") throw new Error("Kling clip failed");
  }
  throw new Error("Kling timed out");
}

// ── Components ────────────────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, color, outline, full }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: full ? "100%" : "auto",
      background: disabled ? C.line : outline ? "transparent" : (color || C.ink),
      color: disabled ? C.faint : outline ? (color || C.ink) : "#fff",
      border: outline ? `1.5px solid ${color || C.ink}` : "none",
      borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit",
      transition: "all .15s",
    }}>{children}</button>
  );
}

function Card({ children, style }) {
  return <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.line}`, padding: 22, ...style }}>{children}</div>;
}

function Badge({ label, color, bg }) {
  return <span style={{ background: bg, color, borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 600 }}>{label}</span>;
}

function Progress({ steps, current }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            height: 4, borderRadius: 99, marginBottom: 6,
            background: i < current ? C.ink : i === current ? C.ink : C.line,
            opacity: i === current ? 1 : i < current ? 0.5 : 0.3,
          }}/>
          <span style={{ fontSize: 11, color: i <= current ? C.ink : C.faint, fontWeight: i === current ? 700 : 400 }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0); // 0=niche 1=ideas 2=script 3=produce 4=review
  const [niche, setNiche] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [chosenIdea, setChosenIdea] = useState(null);
  const [script, setScript] = useState(null);  // { narration, scenes:[{prompt,caption}], hashtags }
  const [production, setProduction] = useState(null); // { voiceUrl, clips:[url], status }
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [logs, setLogs] = useState([]);

  const log = (msg, type = "info") => setLogs(l => [...l, { id: uid(), msg, type }]);

  // ── Step 1: generate ideas ─────────────────────────────────────────────────
  const generateIdeas = async () => {
    setLoading(true); setLoadMsg("Claude מייצר רעיונות...");
    try {
      const nc = NICHES.find(n => n.id === niche);
      const raw = await callClaude(`You are a viral YouTube Shorts strategist.
Generate 5 high-performing short video ideas for the niche: "${nc.label}" (${nc.prompt}).

Rules:
- Each video should be 45-60 seconds
- Hook must grab attention in first 3 seconds
- Content must be evergreen (not news-dependent)

Return ONLY valid JSON array, no markdown:
[{"title":"...","hook":"...","angle":"...","estimated_views":"...","score":90}]`);
      const parsed = JSON.parse(raw);
      setIdeas(parsed);
      setStep(1);
      log("✓ " + parsed.length + " רעיונות נוצרו", "ok");
    } catch (e) {
      log("שגיאה: " + e.message, "err");
    }
    setLoading(false);
  };

  // ── Step 2: generate script ────────────────────────────────────────────────
  const generateScript = async (idea) => {
    setChosenIdea(idea);
    setLoading(true); setLoadMsg("Claude כותב סקריפט...");
    try {
      const nc = NICHES.find(n => n.id === niche);
      const raw = await callClaude(`Write a 55-second YouTube Shorts script for:
Title: "${idea.title}"
Hook: "${idea.hook}"
Niche: ${nc.label}

The script must be in ENGLISH and optimized for viral shorts.

Return ONLY valid JSON, no markdown:
{
  "narration": "full voiceover text (no stage directions, pure speech, ~130 words)",
  "scenes": [
    {"id":1,"prompt":"cinematic visual prompt for Kling AI video generation, detailed, 9:16 vertical","caption":"on-screen text","duration":5},
    {"id":2,"prompt":"...","caption":"...","duration":5},
    {"id":3,"prompt":"...","caption":"...","duration":5},
    {"id":4,"prompt":"...","caption":"...","duration":5},
    {"id":5,"prompt":"...","caption":"...","duration":5},
    {"id":6,"prompt":"...","caption":"...","duration":5}
  ],
  "title": "YouTube title (60 chars max)",
  "description": "YouTube description with keywords (150 chars)",
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5"]
}`, 1400);
      const parsed = JSON.parse(raw);
      setScript(parsed);
      setStep(2);
      log("✓ סקריפט מוכן — " + parsed.scenes.length + " סצנות", "ok");
    } catch (e) {
      log("שגיאה בסקריפט: " + e.message, "err");
    }
    setLoading(false);
  };

  // ── Step 3: produce (voice + clips) ───────────────────────────────────────
  const produce = async () => {
    setLoading(true);
    setProduction({ voiceUrl: null, clips: [], status: "producing" });
    setStep(3);

    try {
      // Voice
      setLoadMsg("ElevenLabs מייצר קריינות...");
      log("🎙️ מייצר קריינות...", "info");
      const voiceUrl = await generateVoice(script.narration);
      setProduction(p => ({ ...p, voiceUrl }));
      log("✓ קריינות מוכנה", "ok");

      // Clips
      const clips = [];
      for (let i = 0; i < script.scenes.length; i++) {
        const scene = script.scenes[i];
        setLoadMsg(`Kling מייצר קליפ ${i+1}/${script.scenes.length}...`);
        log(`🎬 קליפ ${i+1}/${script.scenes.length}: ${scene.caption}`, "info");
        try {
          const clipUrl = await generateKlingClip(scene.prompt);
          clips.push({ ...scene, url: clipUrl, status: "ok" });
          log(`✓ קליפ ${i+1} מוכן`, "ok");
        } catch (e) {
          clips.push({ ...scene, url: null, status: "failed", error: e.message });
          log(`✗ קליפ ${i+1} נכשל: ${e.message}`, "err");
        }
        setProduction(p => ({ ...p, clips: [...clips] }));
      }

      setProduction(p => ({ ...p, status: "done" }));
      setStep(4);
      log("🎉 הפקה הושלמה!", "ok");
    } catch (e) {
      log("שגיאה בהפקה: " + e.message, "err");
      setProduction(p => p ? { ...p, status: "error" } : null);
    }
    setLoading(false);
  };

  const STEPS = ["נישה", "רעיון", "סקריפט", "הפקה", "סקירה"];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter',-apple-system,sans-serif", direction: "rtl" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#d4d7e0;border-radius:99px}@keyframes spin{to{transform:rotate(360deg)}}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Header */}
      <div style={{ background: C.dark, padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>C</div>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>ContentOS</span>
        <span style={{ color: "#6b7280", fontSize: 13, marginInlineStart: 8 }}>AI Video Pipeline</span>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px" }}>
        <Progress steps={STEPS} current={step}/>

        {/* Loading overlay */}
        {loading && (
          <div style={{ textAlign: "center", padding: "20px 0", marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${C.inkLight}`, borderTopColor: C.ink, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }}/>
            <div style={{ color: C.ink, fontWeight: 600, fontSize: 14 }}>{loadMsg}</div>
          </div>
        )}

        {/* STEP 0: Niche selection */}
        {step === 0 && !loading && (
          <Card>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 6 }}>בחר נישה לערוץ</div>
            <div style={{ color: C.sub, fontSize: 13, marginBottom: 20 }}>Claude ייצר 5 רעיונות לסרטונים ויראליים בנישה שתבחר</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {NICHES.map(n => (
                <div key={n.id} onClick={() => setNiche(n.id)} style={{ padding: 16, borderRadius: 12, border: `1.5px solid ${niche === n.id ? C.ink : C.line}`, background: niche === n.id ? C.inkLight : C.bg, cursor: "pointer", transition: "all .15s" }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{n.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{n.label}</div>
                  <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>{n.prompt.split(",")[0]}...</div>
                </div>
              ))}
            </div>
            <Btn full onClick={generateIdeas} disabled={!niche}>✦ צור רעיונות עם Claude</Btn>
          </Card>
        )}

        {/* STEP 1: Ideas */}
        {step === 1 && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>בחר רעיון לסרטון</div>
              <Btn outline onClick={() => { setStep(0); setIdeas([]); }}>← חזור</Btn>
            </div>
            {ideas.map((idea, i) => (
              <Card key={i} style={{ cursor: "pointer" }} onClick={() => generateScript(idea)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>{idea.title}</div>
                    <div style={{ fontSize: 13, color: C.sub, fontStyle: "italic", marginBottom: 8 }}>"{idea.hook}"</div>
                    <div style={{ fontSize: 12, color: C.faint }}>{idea.angle}</div>
                  </div>
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: idea.score >= 90 ? C.green : C.amber }}>{idea.score}</div>
                    <div style={{ fontSize: 10, color: C.faint }}>score</div>
                    <div style={{ fontSize: 11, color: C.ink, marginTop: 4, fontWeight: 600 }}>{idea.estimated_views}</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "flex-end" }}>
                  <Btn>בחר רעיון זה →</Btn>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* STEP 2: Script review */}
        {step === 2 && !loading && script && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>סקריפט מוכן לאישור</div>
              <Btn outline onClick={() => setStep(1)}>← חזור</Btn>
            </div>

            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 10 }}>כותרת YouTube</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{script.title}</div>
            </Card>

            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 10 }}>קריינות (ElevenLabs)</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8, background: C.bg, borderRadius: 10, padding: 14, direction: "ltr" }}>{script.narration}</div>
            </Card>

            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 12 }}>סצנות ({script.scenes.length} קליפי Kling)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {script.scenes.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: 12, borderRadius: 10, background: C.bg }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.inkLight, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 3 }}>{s.caption}</div>
                      <div style={{ fontSize: 11, color: C.faint, direction: "ltr" }}>{s.prompt.slice(0,80)}...</div>
                    </div>
                    <Badge label={s.duration+"s"} color={C.ink} bg={C.inkLight}/>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 8 }}>Hashtags</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {script.hashtags?.map(h => <Badge key={h} label={h} color={C.ink} bg={C.inkLight}/>)}
              </div>
            </Card>

            <div style={{ display: "flex", gap: 10 }}>
              <Btn outline onClick={() => generateScript(chosenIdea)}>↻ צור סקריפט אחר</Btn>
              <Btn full onClick={produce}>🚀 הפק סרטון — ElevenLabs + Kling</Btn>
            </div>
          </div>
        )}

        {/* STEP 3: Production log */}
        {step === 3 && (
          <Card>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>הפקה מתבצעת...</div>

            {/* Voice status */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", padding: 12, borderRadius: 10, background: C.bg, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>🎙️</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>קריינות (ElevenLabs)</span>
              {production?.voiceUrl
                ? <><Badge label="✓ מוכן" color={C.green} bg={C.greenBg}/><audio src={production.voiceUrl} controls style={{ height: 28, flex: 1 }}/></>
                : <Badge label="מייצר..." color={C.amber} bg={C.amberBg}/>}
            </div>

            {/* Clips status */}
            {script?.scenes.map((s, i) => {
              const clip = production?.clips?.[i];
              return (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: 10, borderRadius: 10, background: C.bg, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>🎬</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text, flex: 1 }}>קליפ {i+1}: {s.caption}</span>
                  {!clip && <Badge label="ממתין..." color={C.faint} bg={C.line}/>}
                  {clip?.status === "ok" && <Badge label="✓ מוכן" color={C.green} bg={C.greenBg}/>}
                  {clip?.status === "failed" && <Badge label="✗ נכשל" color={C.red} bg={C.redBg}/>}
                </div>
              );
            })}

            {/* Log */}
            <div style={{ marginTop: 16, background: C.dark, borderRadius: 10, padding: 14, maxHeight: 160, overflowY: "auto", direction: "ltr" }}>
              {logs.map(l => <div key={l.id} style={{ fontSize: 12, color: l.type==="ok"?"#4ade80":l.type==="err"?"#f87171":"#9ca3af", lineHeight: 1.8 }}>{l.msg}</div>)}
            </div>
          </Card>
        )}

        {/* STEP 4: Review & publish */}
        {step === 4 && production && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>🎉 הסרטון מוכן לסקירה</div>

            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 12 }}>קריינות</div>
              {production.voiceUrl && <audio src={production.voiceUrl} controls style={{ width: "100%" }}/>}
            </Card>

            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 12 }}>קליפי וידאו ({production.clips.filter(c=>c.status==="ok").length}/{production.clips.length})</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {production.clips.map((clip, i) => (
                  <div key={i} style={{ borderRadius: 10, overflow: "hidden", background: C.bg, border: `1px solid ${C.line}` }}>
                    {clip.status === "ok" && clip.url
                      ? <video src={clip.url} controls style={{ width: "100%", display: "block" }} muted/>
                      : <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", color: C.red, fontSize: 12 }}>✗ נכשל</div>}
                    <div style={{ padding: "6px 8px", fontSize: 11, color: C.sub }}>{clip.caption}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 8 }}>מידע לYouTube</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>{script.title}</div>
              <div style={{ fontSize: 12, color: C.sub, marginBottom: 10 }}>{script.description}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {script.hashtags?.map(h => <Badge key={h} label={h} color={C.ink} bg={C.inkLight}/>)}
              </div>
            </Card>

            <div style={{ background: C.amberBg, border: `1px solid ${C.amber}33`, borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#8a5a00", lineHeight: 1.6 }}>
              ⓘ פרסום אוטומטי ל-YouTube יפעל לאחר חיבור OAuth. כרגע — הורד את הקליפים ואת הקריינות וערוך ב-CapCut או DaVinci Resolve.
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Btn outline onClick={() => { setStep(0); setNiche(null); setIdeas([]); setScript(null); setProduction(null); setLogs([]); }}>+ סרטון חדש</Btn>
              <Btn color={C.green} full onClick={() => { /* YouTube upload */ alert("חיבור YouTube בקרוב!"); }}>📤 פרסם ב-YouTube</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
