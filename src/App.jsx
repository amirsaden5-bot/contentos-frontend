import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ── Light minimal tokens ──────────────────────────────────────────────────────
const T = {
  bg:"#fbfbfd", card:"#ffffff", line:"#ececf1", lineHi:"#dcdce4",
  text:"#1a1a24", sub:"#8a8a99", faint:"#b8b8c4",
  ink:"#5b5bd6", inkSoft:"#eeeefb",
  green:"#0fa968", amber:"#d98a00", red:"#e0436b",
  greenBg:"#eafaf2", amberBg:"#fdf4e3", redBg:"#fdedf1",
};

const NICHES=[
  {id:"ai",    label:"AI & Tech",  icon:"🤖", desc:"כלים, חידושים, אוטומציה"},
  {id:"fin",   label:"Finance",    icon:"💰", desc:"השקעות, הכנסה פסיבית"},
  {id:"health",label:"Health",     icon:"💪", desc:"כושר, תזונה, אורח חיים"},
  {id:"mind",  label:"Mindset",    icon:"🧠", desc:"מוטיבציה, פרודוקטיביות"},
  {id:"travel",label:"Travel",     icon:"✈️", desc:"יעדים, טיפים, הרפתקאות"},
  {id:"food",  label:"Food",       icon:"🍕", desc:"מתכונים, מסעדות, בישול"},
  {id:"crypto",label:"Crypto",     icon:"🪙", desc:"מטבעות, בלוקצ׳יין, מסחר"},
  {id:"beauty",label:"Beauty",     icon:"💄", desc:"איפור, טיפוח, אופנה"},
];

const PLATFORMS=[
  {id:"youtube",  label:"YouTube",   icon:"▶",  color:"#ff0000", note:"Shorts + ארוך"},
  {id:"tiktok",   label:"TikTok",    icon:"♪",  color:"#000000", note:"וידאו קצר"},
  {id:"instagram",label:"Instagram", icon:"◎",  color:"#e1306c", note:"Reels + פוסטים"},
  {id:"facebook", label:"Facebook",  icon:"f",  color:"#1877f2", note:"Reels + דף"},
];

const PIPELINE_STAGES=[
  {id:"ideas",  label:"רעיונות",  icon:"💡", desc:"Claude מנתח טרנדים בנישה"},
  {id:"script", label:"סקריפט",   icon:"✍️", desc:"כתיבת hook + גוף + CTA"},
  {id:"voice",  label:"קריינות",  icon:"🎙️", desc:"ElevenLabs — קול אנושי"},
  {id:"visuals",label:"ויזואלים", icon:"🎬", desc:"Kling — קליפים מהסקריפט"},
  {id:"render", label:"עריכה",    icon:"🎞️", desc:"FFmpeg — חיבור + כתוביות"},
  {id:"publish",label:"פרסום",    icon:"🚀", desc:"העלאה לחשבונות המחוברים"},
];

const delay=ms=>new Promise(r=>setTimeout(r,ms));
const uid=()=>Math.random().toString(36).slice(2,9);

// ── Logo generator (deterministic SVG from seed + niche) ──────────────────────
const LOGO_STYLES=[
  {id:"monogram", label:"מונוגרמה"},
  {id:"emblem",   label:"אמבלם"},
  {id:"wordmark", label:"טקסט"},
];
const PALETTES=[
  ["#5b5bd6","#a5a5f5"], ["#0fa968","#7ee2b8"], ["#e0436b","#f5a5be"],
  ["#d98a00","#f5cd7e"], ["#0891b2","#7ddfef"], ["#7c3aed","#c4a5f5"],
  ["#ea580c","#f5b58a"], ["#0d9488","#7ee0d4"],
];

function LogoSVG({seed,style,palette,initials,icon,size=80}){
  const [c1,c2]=palette;
  const gid="lg"+seed+style;
  return(
    <svg width={size} height={size} viewBox="0 0 100 100" style={{display:"block"}}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1}/>
          <stop offset="100%" stopColor={c2}/>
        </linearGradient>
      </defs>
      {style==="monogram"&&(<>
        <rect x="6" y="6" width="88" height="88" rx="22" fill={`url(#${gid})`}/>
        <text x="50" y="50" fontSize="38" fontWeight="800" fill="#fff" textAnchor="middle" dominantBaseline="central" fontFamily="Inter,sans-serif">{initials}</text>
      </>)}
      {style==="emblem"&&(<>
        <circle cx="50" cy="50" r="44" fill="none" stroke={`url(#${gid})`} strokeWidth="5"/>
        <circle cx="50" cy="50" r="30" fill={`url(#${gid})`}/>
        <text x="50" y="51" fontSize="26" textAnchor="middle" dominantBaseline="central">{icon}</text>
      </>)}
      {style==="wordmark"&&(<>
        <rect x="6" y="30" width="88" height="40" rx="10" fill={`url(#${gid})`}/>
        <text x="50" y="51" fontSize="22" fontWeight="800" fill="#fff" textAnchor="middle" dominantBaseline="central" fontFamily="Inter,sans-serif" letterSpacing="1">{initials}</text>
      </>)}
    </svg>
  );
}

// ── Primitives ────────────────────────────────────────────────────────────────
function Card({children,pad=20,style,onClick}){
  return <div onClick={onClick} style={{background:T.card,border:`1px solid ${T.line}`,borderRadius:16,padding:pad,...style}}>{children}</div>;
}
function Tag({label,color,bg}){
  return <span style={{background:bg||T.inkSoft,color:color||T.ink,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>;
}
function Avatar({user,size=44}){
  if(user.logo) return <div style={{width:size,height:size,borderRadius:size/3.5,overflow:"hidden",flexShrink:0,boxShadow:"0 1px 3px rgba(0,0,0,.1)"}}><LogoSVG {...user.logo} size={size}/></div>;
  const nc=NICHES.find(n=>n.id===user.niche);
  return <div style={{width:size,height:size,borderRadius:size/3.5,background:T.bg,border:`1px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.5,flexShrink:0}}>{nc?.icon}</div>;
}
function Toast({items}){
  return(
    <div style={{position:"fixed",bottom:74,right:16,zIndex:999,display:"flex",flexDirection:"column-reverse",gap:8,pointerEvents:"none"}}>
      {items.map(t=>(
        <div key={t.id} style={{background:T.card,border:`1px solid ${t.type==="ok"?T.green:t.type==="err"?T.red:T.line}`,color:t.type==="ok"?T.green:t.type==="err"?T.red:T.text,borderRadius:11,padding:"11px 15px",fontSize:13,fontWeight:600,boxShadow:"0 6px 24px rgba(0,0,0,.1)",maxWidth:300,animation:"slide .2s ease"}}>{t.msg}</div>
      ))}
    </div>
  );
}
function PrimaryBtn({children,onClick,disabled,full=true}){
  return <button onClick={onClick} disabled={disabled} style={{width:full?"100%":"auto",background:disabled?T.line:T.ink,color:disabled?T.faint:"#fff",border:"none",borderRadius:12,padding:"13px 20px",fontSize:14,fontWeight:600,cursor:disabled?"not-allowed":"pointer",transition:"background .2s"}}>{children}</button>;
}
function SectionLabel({children}){
  return <div style={{color:T.sub,fontSize:11,fontWeight:600,letterSpacing:.5,marginBottom:14}}>{children}</div>;
}

// ════════════════════════════════════════════════════════════════════════════
// CREATE USER WIZARD
// ════════════════════════════════════════════════════════════════════════════
function CreateWizard({onComplete,onCancel,toast}){
  const [step,setStep]=useState(1);       // 1 details · 2 niche · 3 branding · 4 connect · 5 done
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [niche,setNiche]=useState(null);

  // Branding
  const [generating,setGenerating]=useState(false);
  const [nameOptions,setNameOptions]=useState([]);     // [{name, handle, tagline}]
  const [chosenName,setChosenName]=useState(null);
  const [logoOptions,setLogoOptions]=useState([]);
  const [chosenLogo,setChosenLogo]=useState(null);

  // Connections
  const [connected,setConnected]=useState({});

  const nc=NICHES.find(n=>n.id===niche);

  // ── Claude: generate channel names ──────────────────────────────────────────
  const generateNames=async()=>{
    setGenerating(true);
    setNameOptions([]);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:700,
          messages:[{role:"user",content:`צור 4 שמות ערוץ למותג תוכן בנישת "${nc.label}" (${nc.desc}).

לכל אחד תן: שם ערוץ קליט באנגלית, handle (עם @), וטאגליין קצר בעברית.

החזר אך ורק JSON תקין, ללא טקסט נוסף, ללא markdown:
[{"name":"...","handle":"@...","tagline":"..."}]`}]
        })
      });
      const data=await res.json();
      let txt=data.content?.find(b=>b.type==="text")?.text||"[]";
      txt=txt.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(txt);
      setNameOptions(parsed);
    }catch(e){
      // graceful fallback so the flow never dead-ends
      setNameOptions([
        {name:`${nc.label} Daily`,    handle:"@"+nc.id+"daily",   tagline:"התוכן היומי שלך ב"+nc.label},
        {name:`The ${nc.label} Edit`, handle:"@the"+nc.id+"edit", tagline:"רק מה שחשוב, בלי רעש"},
        {name:`${nc.label} Lab`,      handle:"@"+nc.id+"lab",     tagline:"ניסויים, תובנות, תוצאות"},
        {name:`Next ${nc.label}`,     handle:"@next"+nc.id,       tagline:"צעד אחד לפני כולם"},
      ]);
      toast("Claude לא זמין כרגע — הוצגו הצעות גיבוי","info");
    }
    setGenerating(false);
  };

  // ── Generate logo options (local SVG, instant) ──────────────────────────────
  const generateLogos=(channelName)=>{
    const initials=channelName.split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();
    const opts=[];
    for(let i=0;i<6;i++){
      opts.push({
        seed:uid(),
        style:LOGO_STYLES[i%LOGO_STYLES.length].id,
        palette:PALETTES[i%PALETTES.length],
        initials,
        icon:nc.icon,
      });
    }
    setLogoOptions(opts);
    setChosenLogo(null);
  };

  // when name chosen → generate logos
  useEffect(()=>{ if(chosenName) generateLogos(chosenName.name); },[chosenName]);

  const canFinish = name && niche && chosenName && chosenLogo;

  const finish=()=>{
    onComplete({
      id:uid(), name:chosenName.name, owner:name, email,
      handle:chosenName.handle, tagline:chosenName.tagline,
      niche, logo:chosenLogo, connections:connected,
      status:"active", createdAt:new Date().toISOString().split("T")[0],
      videos:[], stats:{views:0,subs:0,videos:0},
    });
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* progress */}
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        {[1,2,3,4].map(s=>(
          <div key={s} style={{flex:1,height:4,borderRadius:99,background:step>=s?T.ink:T.line,transition:"background .3s"}}/>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{color:T.sub,fontSize:12}}>שלב {Math.min(step,4)} מתוך 4</span>
        <button onClick={onCancel} style={{background:"none",border:"none",color:T.faint,fontSize:13,cursor:"pointer"}}>ביטול</button>
      </div>

      {/* ─── STEP 1: details ─── */}
      {step===1&&(
        <>
          <div>
            <div style={{fontSize:22,fontWeight:700,letterSpacing:-.5}}>יצירת ערוץ חדש</div>
            <div style={{color:T.sub,fontSize:13,marginTop:4}}>נתחיל מהפרטים הבסיסיים</div>
          </div>
          <Card>
            <SectionLabel>שם הבעלים</SectionLabel>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="לדוגמה: דני כהן" style={{width:"100%",background:T.bg,border:`1px solid ${T.line}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:T.text,outline:"none",boxSizing:"border-box"}}/>
            <div style={{height:14}}/>
            <SectionLabel>אימייל</SectionLabel>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@email.com" style={{width:"100%",background:T.bg,border:`1px solid ${T.line}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:T.text,outline:"none",boxSizing:"border-box"}}/>
          </Card>
          <PrimaryBtn onClick={()=>setStep(2)} disabled={!name||!email}>המשך</PrimaryBtn>
        </>
      )}

      {/* ─── STEP 2: niche ─── */}
      {step===2&&(
        <>
          <div>
            <div style={{fontSize:22,fontWeight:700,letterSpacing:-.5}}>בחר נישה</div>
            <div style={{color:T.sub,fontSize:13,marginTop:4}}>זה יקבע את סוג התוכן והקהל</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {NICHES.map(n=>(
              <Card key={n.id} pad={16} onClick={()=>setNiche(n.id)} style={{cursor:"pointer",border:`1.5px solid ${niche===n.id?T.ink:T.line}`,background:niche===n.id?T.inkSoft:T.card,transition:"all .15s"}}>
                <div style={{fontSize:26}}>{n.icon}</div>
                <div style={{fontSize:14,fontWeight:600,marginTop:8,color:T.text}}>{n.label}</div>
                <div style={{fontSize:11,color:T.sub,marginTop:3,lineHeight:1.4}}>{n.desc}</div>
              </Card>
            ))}
          </div>
          <PrimaryBtn onClick={()=>setStep(3)} disabled={!niche}>המשך</PrimaryBtn>
        </>
      )}

      {/* ─── STEP 3: branding ─── */}
      {step===3&&(
        <>
          <div>
            <div style={{fontSize:22,fontWeight:700,letterSpacing:-.5}}>מיתוג הערוץ</div>
            <div style={{color:T.sub,fontSize:13,marginTop:4}}>Claude ייצר שמות, ואז נבחר לוגו</div>
          </div>

          {/* Name generation */}
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:nameOptions.length?14:0}}>
              <SectionLabel>שם הערוץ</SectionLabel>
              <button onClick={generateNames} disabled={generating} style={{background:T.inkSoft,color:T.ink,border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:generating?"wait":"pointer"}}>
                {generating?"מייצר...":nameOptions.length?"↻ עוד":"✦ צור שמות"}
              </button>
            </div>

            {!nameOptions.length&&!generating&&(
              <div style={{textAlign:"center",padding:"20px 0",color:T.faint,fontSize:13}}>לחץ "צור שמות" — Claude יציע 4 אפשרויות</div>
            )}
            {generating&&(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[1,2,3,4].map(i=>(<div key={i} style={{height:54,borderRadius:10,background:`linear-gradient(90deg,${T.line} 0%,${T.bg} 50%,${T.line} 100%)`,backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite"}}/>))}
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {nameOptions.map((opt,i)=>(
                <div key={i} onClick={()=>setChosenName(opt)} style={{padding:"12px 14px",borderRadius:10,border:`1.5px solid ${chosenName?.name===opt.name?T.ink:T.line}`,background:chosenName?.name===opt.name?T.inkSoft:T.bg,cursor:"pointer",transition:"all .15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:14,fontWeight:600,color:T.text}}>{opt.name}</span>
                    <span style={{fontSize:12,color:T.ink}}>{opt.handle}</span>
                  </div>
                  <div style={{fontSize:12,color:T.sub,marginTop:3}}>{opt.tagline}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Logo selection */}
          {chosenName&&(
            <Card>
              <SectionLabel>בחר לוגו</SectionLabel>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {logoOptions.map((lg,i)=>(
                  <div key={i} onClick={()=>setChosenLogo(lg)} style={{padding:10,borderRadius:12,border:`1.5px solid ${chosenLogo===lg?T.ink:T.line}`,background:chosenLogo===lg?T.inkSoft:T.bg,cursor:"pointer",display:"flex",justifyContent:"center",transition:"all .15s"}}>
                    <LogoSVG {...lg} size={64}/>
                  </div>
                ))}
              </div>
              <button onClick={()=>generateLogos(chosenName.name)} style={{marginTop:12,width:"100%",background:"none",border:`1px solid ${T.line}`,color:T.sub,borderRadius:9,padding:"8px",fontSize:12,fontWeight:600,cursor:"pointer"}}>↻ צור לוגואים אחרים</button>
            </Card>
          )}

          <PrimaryBtn onClick={()=>setStep(4)} disabled={!chosenName||!chosenLogo}>המשך לחיבור חשבונות</PrimaryBtn>
        </>
      )}

      {/* ─── STEP 4: connect platforms ─── */}
      {step===4&&(
        <>
          <div>
            <div style={{fontSize:22,fontWeight:700,letterSpacing:-.5}}>חיבור חשבונות</div>
            <div style={{color:T.sub,fontSize:13,marginTop:4,lineHeight:1.6}}>חבר את הרשתות שכבר פתחת. החיבור דרך OAuth רשמי — בטוח ומאושר.</div>
          </div>

          {/* identity preview */}
          <Card pad={16} style={{display:"flex",gap:12,alignItems:"center"}}>
            <Avatar user={{logo:chosenLogo}} size={48}/>
            <div>
              <div style={{fontSize:15,fontWeight:600,color:T.text}}>{chosenName.name}</div>
              <div style={{fontSize:12,color:T.ink}}>{chosenName.handle}</div>
            </div>
          </Card>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {PLATFORMS.map(p=>{
              const isConn=connected[p.id];
              return(
                <Card key={p.id} pad={14} style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:10,background:p.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:p.color,flexShrink:0}}>{p.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:600,color:T.text}}>{p.label}</div>
                    <div style={{fontSize:11,color:T.sub,marginTop:2}}>{p.note}</div>
                  </div>
                  {isConn?(
                    <Tag label="✓ מחובר" color={T.green} bg={T.greenBg}/>
                  ):(
                    <button onClick={()=>{setConnected(c=>({...c,[p.id]:true}));toast(`${p.label} חובר דרך OAuth`,"ok");}} style={{background:p.color,color:"#fff",border:"none",borderRadius:9,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer"}}>חבר</button>
                  )}
                </Card>
              );
            })}
          </div>

          <div style={{background:T.amberBg,border:`1px solid ${T.amber}33`,borderRadius:11,padding:"12px 14px",fontSize:12,color:"#8a5a00",lineHeight:1.6}}>
            ⓘ בפרודקשן כל "חבר" פותח חלון OAuth רשמי של הרשת. כאן זו הדגמה של הזרימה.
          </div>

          <PrimaryBtn onClick={()=>{setStep(5);}} disabled={Object.keys(connected).length===0}>
            סיום — {Object.keys(connected).length} חשבונות מחוברים
          </PrimaryBtn>
          <button onClick={()=>setStep(5)} style={{background:"none",border:"none",color:T.faint,fontSize:13,cursor:"pointer"}}>דלג, אחבר אחר כך</button>
        </>
      )}

      {/* ─── STEP 5: done ─── */}
      {step===5&&(
        <div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
            <Avatar user={{logo:chosenLogo}} size={80}/>
          </div>
          <div style={{fontSize:22,fontWeight:700,color:T.text}}>{chosenName.name}</div>
          <div style={{fontSize:13,color:T.ink,marginTop:4}}>{chosenName.handle}</div>
          <div style={{fontSize:13,color:T.sub,marginTop:8,marginBottom:24}}>הערוץ נוצר ומוכן להפקת תוכן</div>
          <PrimaryBtn onClick={finish}>פתח את הערוץ →</PrimaryBtn>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CHANNEL VIEW (with pipeline)
// ════════════════════════════════════════════════════════════════════════════
function ChannelView({channel,onBack,toast,onUpdate}){
  const [tab,setTab]=useState("home");
  const nc=NICHES.find(n=>n.id===channel.niche);

  // pipeline state
  const [stage,setStage]=useState(-1);
  const [prog,setProg]=useState(0);
  const [ideas,setIdeas]=useState([]);
  const [statuses,setStatuses]=useState({});
  const [script,setScript]=useState(null);
  const [genIdeas,setGenIdeas]=useState(false);
  const [genScript,setGenScript]=useState(false);
  const [log,setLog]=useState([]);
  const logRef=useRef(null);
  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight;},[log]);
  const addLog=(text,t="info")=>setLog(l=>[...l.slice(-50),{text,t,id:uid()}]);

  const approvedIds=Object.entries(statuses).filter(([,s])=>s==="approved").map(([id])=>id);

  // Claude: generate ideas for THIS channel's niche
  const generateIdeas=async()=>{
    setGenIdeas(true); setIdeas([]); setStatuses({}); setScript(null);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:900,
          messages:[{role:"user",content:`צור 5 רעיונות לסרטוני שורטס ויראליים לערוץ "${channel.name}" בנישת ${nc.label}.

החזר אך ורק JSON תקין ללא markdown:
[{"title":"כותרת באנגלית","hook":"משפט פתיחה בעברית","score":מספר 80-99}]`}]})
      });
      const data=await res.json();
      let txt=(data.content?.find(b=>b.type==="text")?.text||"[]").replace(/```json|```/g,"").trim();
      setIdeas(JSON.parse(txt).map(x=>({...x,id:uid()})));
    }catch{
      setIdeas([
        {id:uid(),title:`5 ${nc.label} Secrets Nobody Tells You`,hook:"רוב האנשים לא יודעים את זה",score:94},
        {id:uid(),title:`How I Grew My ${nc.label} Channel Fast`,hook:"לקח לי 30 יום בלבד",score:90},
        {id:uid(),title:`The Truth About ${nc.label} in 2025`,hook:"מה שאף אחד לא מספר לך",score:87},
        {id:uid(),title:`${nc.label} Mistakes to Avoid`,hook:"עשיתי את כולן כדי שלא תצטרך",score:84},
        {id:uid(),title:`Why Everyone Is Wrong About ${nc.label}`,hook:"הדעה הרווחת פשוט שגויה",score:82},
      ]);
      toast("Claude לא זמין — הוצגו רעיונות גיבוי","info");
    }
    setGenIdeas(false);
  };

  const generateScript=async()=>{
    setGenScript(true);
    const first=ideas.find(i=>i.id===approvedIds[0]);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:800,
          messages:[{role:"user",content:`כתוב סקריפט 60 שניות לסרטון "${first?.title}" בנישת ${nc.label}.
פורמט:
[HOOK 0-3s]
...
[VALUE 3-50s]
...
[CTA 50-60s]
...
בעברית, מרתק.`}]})
      });
      const data=await res.json();
      setScript(data.content?.find(b=>b.type==="text")?.text||"");
    }catch{
      setScript(`[HOOK 0-3s]\n"${first?.hook}"\n\n[VALUE 3-50s]\n1. נקודה ראשונה\n2. נקודה שנייה\n3. נקודה שלישית\n\n[CTA 50-60s]\n"עקבו לעוד תוכן ${nc.label}"`);
    }
    setGenScript(false);
  };

  const runRender=async()=>{
    const steps=[
      [2,"🎙️ ElevenLabs: יוצר קריינות...","ok"],
      [2,"✓ קריינות מוכנה (58s)","ok"],
      [3,"🎬 Kling: יוצר 6 קליפים...","ok"],
      [3,"✓ קליפים מוכנים","ok"],
      [4,"🎞️ FFmpeg: מחבר + כתוביות...","ok"],
      [4,"✓ סרטון מרונדר 1080×1920","ok"],
    ];
    for(const [st,text,t] of steps){
      setStage(st);
      for(let p=0;p<=100;p+=10){await delay(45);setProg(p);}
      addLog(text,t);
    }
    setStage(5);
    toast("✓ סרטון מוכן לפרסום","ok");
  };

  const publish=async(platform)=>{
    addLog(`🚀 מפרסם ל-${platform}...`,"info");
    await delay(1200);
    addLog(`✓ פורסם ל-${platform}`,"ok");
    toast(`פורסם ל-${platform}`,"ok");
    const newStats={...channel.stats,videos:channel.stats.videos+1,views:channel.stats.views+Math.floor(Math.random()*5000)+800};
    onUpdate({...channel,stats:newStats});
  };

  const startPipeline=()=>{ setTab("create"); setStage(0); setIdeas([]); setStatuses({}); setScript(null); setLog([]); };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:T.sub,cursor:"pointer",fontSize:13,padding:0,textAlign:"right",fontWeight:500}}>← כל הערוצים</button>

      {/* Channel header */}
      <Card>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <Avatar user={channel} size={56}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:18,fontWeight:700,color:T.text}}>{channel.name}</div>
            <div style={{fontSize:12,color:T.ink,marginTop:2}}>{channel.handle}</div>
            <div style={{fontSize:12,color:T.sub,marginTop:3}}>{nc?.icon} {nc?.label} · {Object.keys(channel.connections||{}).length} חשבונות</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:16}}>
          {[{l:"צפיות",v:channel.stats.views},{l:"סרטונים",v:channel.stats.videos},{l:"עוקבים",v:channel.stats.subs}].map(m=>(
            <div key={m.l} style={{textAlign:"center",background:T.bg,borderRadius:10,padding:"12px 8px"}}>
              <div style={{fontSize:18,fontWeight:700,color:T.text}}>{m.v>=1000?(m.v/1000).toFixed(1)+"K":m.v}</div>
              <div style={{fontSize:11,color:T.sub,marginTop:3}}>{m.l}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,background:T.bg,border:`1px solid ${T.line}`,borderRadius:11,padding:4}}>
        {[{id:"home",l:"בית"},{id:"create",l:"הפקה"},{id:"accounts",l:"חשבונות"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:tab===t.id?T.card:"none",color:tab===t.id?T.text:T.sub,border:tab===t.id?`1px solid ${T.line}`:"1px solid transparent",borderRadius:8,padding:"9px 0",fontSize:12,fontWeight:tab===t.id?600:400,cursor:"pointer"}}>{t.l}</button>
        ))}
      </div>

      {/* HOME */}
      {tab==="home"&&(
        <Card>
          <SectionLabel>הפק תוכן חדש</SectionLabel>
          <div style={{textAlign:"center",padding:"10px 0 20px"}}>
            <div style={{fontSize:40,marginBottom:12}}>{nc?.icon}</div>
            <div style={{color:T.sub,fontSize:13,lineHeight:1.6,marginBottom:20}}>הרץ את ה-Pipeline והמערכת תייצר<br/>סרטון מותאם לנישת {nc?.label}</div>
            <PrimaryBtn onClick={startPipeline}>⚡ הפק סרטון חדש</PrimaryBtn>
          </div>
        </Card>
      )}

      {/* CREATE / PIPELINE */}
      {tab==="create"&&(
        <>
          {/* stage tracker */}
          <Card>
            <SectionLabel>Pipeline</SectionLabel>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              {PIPELINE_STAGES.map((s,i)=>{
                const done=stage>i, active=stage===i;
                return(
                  <div key={s.id} style={{textAlign:"center",flex:1}}>
                    <div style={{width:32,height:32,borderRadius:"50%",margin:"0 auto",background:done?T.ink:active?T.inkSoft:T.bg,border:`1.5px solid ${done||active?T.ink:T.line}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:done?"#fff":T.text,transition:"all .3s"}}>
                      {done?"✓":s.icon}
                    </div>
                    <div style={{fontSize:9,color:active?T.ink:T.faint,marginTop:5,fontWeight:active?600:400}}>{s.label}</div>
                  </div>
                );
              })}
            </div>
            {stage>=0&&stage<6&&active!==undefined&&(
              <div style={{marginTop:14,background:T.bg,borderRadius:99,height:5,overflow:"hidden"}}>
                <div style={{width:`${prog}%`,height:"100%",background:T.ink,borderRadius:99,transition:"width .3s"}}/>
              </div>
            )}
          </Card>

          {/* ideas */}
          {stage===0&&(
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:ideas.length?14:0}}>
                <SectionLabel>רעיונות מ-Claude</SectionLabel>
                <button onClick={generateIdeas} disabled={genIdeas} style={{background:T.inkSoft,color:T.ink,border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:genIdeas?"wait":"pointer"}}>{genIdeas?"מייצר...":ideas.length?"↻ עוד":"✦ צור"}</button>
              </div>
              {genIdeas&&[1,2,3].map(i=><div key={i} style={{height:60,borderRadius:10,background:`linear-gradient(90deg,${T.line} 0%,${T.bg} 50%,${T.line} 100%)`,backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite",marginBottom:8}}/>)}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {ideas.map(idea=>{
                  const st=statuses[idea.id];
                  return(
                    <div key={idea.id} style={{padding:12,borderRadius:10,border:`1.5px solid ${st==="approved"?T.green:st==="rejected"?T.red:T.line}`,background:st==="approved"?T.greenBg:st==="rejected"?T.redBg:T.bg}}>
                      <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
                        <span style={{fontSize:13,fontWeight:600,color:T.text,lineHeight:1.4}}>{idea.title}</span>
                        <span style={{fontSize:16,fontWeight:800,color:T.amber}}>{idea.score}</span>
                      </div>
                      <div style={{fontSize:12,color:T.sub,marginTop:4,fontStyle:"italic"}}>"{idea.hook}"</div>
                      {!st&&(
                        <div style={{display:"flex",gap:6,marginTop:10}}>
                          <button onClick={()=>setStatuses(s=>({...s,[idea.id]:"approved"}))} style={{flex:1,background:T.greenBg,color:T.green,border:`1px solid ${T.green}33`,borderRadius:8,padding:"6px",fontSize:12,fontWeight:600,cursor:"pointer"}}>✓ אשר</button>
                          <button onClick={()=>setStatuses(s=>({...s,[idea.id]:"rejected"}))} style={{flex:1,background:T.redBg,color:T.red,border:`1px solid ${T.red}33`,borderRadius:8,padding:"6px",fontSize:12,fontWeight:600,cursor:"pointer"}}>✗ דחה</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {approvedIds.length>0&&<div style={{marginTop:12}}><PrimaryBtn onClick={()=>{setStage(1);generateScript();}}>המשך — {approvedIds.length} אושרו</PrimaryBtn></div>}
            </Card>
          )}

          {/* script */}
          {stage===1&&(
            <Card>
              <SectionLabel>סקריפט</SectionLabel>
              {genScript?(
                <div style={{height:160,borderRadius:10,background:`linear-gradient(90deg,${T.line} 0%,${T.bg} 50%,${T.line} 100%)`,backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite"}}/>
              ):script?(
                <>
                  <div style={{background:T.bg,borderRadius:10,padding:14,direction:"ltr"}}>
                    {script.split("\n").map((l,i)=>{const h=l.startsWith("[");return<div key={i} style={{color:h?T.ink:T.text,fontWeight:h?700:400,fontSize:h?11:13,lineHeight:1.8,marginTop:h&&i>0?10:0}}>{l}</div>;})}
                  </div>
                  <div style={{marginTop:12}}><PrimaryBtn onClick={runRender}>אשר — צור וידאו</PrimaryBtn></div>
                </>
              ):null}
            </Card>
          )}

          {/* rendering log */}
          {stage>=2&&stage<5&&(
            <Card>
              <SectionLabel>הפקה מתבצעת</SectionLabel>
              <div ref={logRef} style={{maxHeight:130,overflowY:"auto",direction:"ltr"}}>
                {log.map(l=><div key={l.id} style={{fontSize:12,color:l.t==="ok"?T.green:T.sub,lineHeight:1.7}}>{l.text}</div>)}
              </div>
            </Card>
          )}

          {/* publish */}
          {stage===5&&(
            <Card>
              <SectionLabel>הסרטון מוכן — פרסם</SectionLabel>
              <div style={{height:120,background:`linear-gradient(135deg,${nc?.icon?T.inkSoft:T.bg},${T.bg})`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,marginBottom:14}}>{nc?.icon}🎬</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {PLATFORMS.filter(p=>channel.connections?.[p.id]).map(p=>(
                  <button key={p.id} onClick={()=>publish(p.label)} style={{background:p.color,color:"#fff",border:"none",borderRadius:10,padding:"11px",fontSize:13,fontWeight:600,cursor:"pointer"}}>פרסם ל-{p.label}</button>
                ))}
                {!Object.keys(channel.connections||{}).length&&<div style={{textAlign:"center",color:T.sub,fontSize:12,padding:"10px"}}>חבר חשבונות בטאב "חשבונות" כדי לפרסם</div>}
              </div>
            </Card>
          )}
        </>
      )}

      {/* ACCOUNTS */}
      {tab==="accounts"&&(
        <Card>
          <SectionLabel>חשבונות מחוברים</SectionLabel>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {PLATFORMS.map(p=>{
              const isConn=channel.connections?.[p.id];
              return(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderTop:`1px solid ${T.line}`}}>
                  <div style={{width:38,height:38,borderRadius:10,background:p.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:800,color:p.color}}>{p.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:600,color:T.text}}>{p.label}</div>
                    <div style={{fontSize:11,color:T.sub}}>{p.note}</div>
                  </div>
                  {isConn?<Tag label="✓ מחובר" color={T.green} bg={T.greenBg}/>:(
                    <button onClick={()=>{onUpdate({...channel,connections:{...channel.connections,[p.id]:true}});toast(`${p.label} חובר`,"ok");}} style={{background:p.color,color:"#fff",border:"none",borderRadius:9,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>חבר</button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════
export default function App(){
  const [channels,setChannels]=useState([]);
  const [view,setView]=useState("list");      // list | create | channel
  const [active,setActive]=useState(null);
  const [toasts,setToasts]=useState([]);

  const toast=useCallback((msg,type="info")=>{
    const id=uid();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);
  },[]);

  const addChannel=(ch)=>{ setChannels(c=>[...c,ch]); setView("list"); toast(`✓ הערוץ "${ch.name}" נוצר`,"ok"); };
  const updateChannel=(ch)=>{ setChannels(cs=>cs.map(c=>c.id===ch.id?ch:c)); setActive(ch); };

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Inter',-apple-system,system-ui,sans-serif",direction:"rtl"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:0}
        input::placeholder{color:${T.faint}}
        @keyframes slide{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

      {/* top bar */}
      <div style={{position:"sticky",top:0,zIndex:50,background:T.bg+"f5",backdropFilter:"blur(16px)",borderBottom:`1px solid ${T.line}`,height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px"}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{width:30,height:30,borderRadius:9,background:T.ink,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:15,fontWeight:700}}>C</div>
          <span style={{fontSize:16,fontWeight:700,letterSpacing:-.3}}>ContentOS</span>
        </div>
        {channels.length>0&&<span style={{fontSize:12,color:T.sub}}>{channels.length} ערוצים</span>}
      </div>

      <div style={{padding:"20px 16px 40px",maxWidth:600,margin:"0 auto"}}>
        {/* CHANNEL LIST */}
        {view==="list"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <div style={{fontSize:24,fontWeight:700,letterSpacing:-.5}}>הערוצים שלי</div>
              <div style={{color:T.sub,fontSize:13,marginTop:4}}>נהל את כל ערוצי התוכן במקום אחד</div>
            </div>

            {channels.length===0?(
              <Card pad={40} style={{textAlign:"center"}}>
                <div style={{fontSize:44,marginBottom:14}}>📺</div>
                <div style={{fontSize:16,fontWeight:600,color:T.text}}>אין עדיין ערוצים</div>
                <div style={{fontSize:13,color:T.sub,marginTop:6,marginBottom:24,lineHeight:1.6}}>צור ערוץ ראשון — בחר נישה,<br/>קבל שם ולוגו, וחבר רשתות</div>
                <PrimaryBtn onClick={()=>setView("create")}>+ צור ערוץ ראשון</PrimaryBtn>
              </Card>
            ):(
              <>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {channels.map(ch=>{
                    const nc=NICHES.find(n=>n.id===ch.niche);
                    return(
                      <Card key={ch.id} pad={16} onClick={()=>{setActive(ch);setView("channel");}} style={{cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}>
                        <Avatar user={ch} size={48}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:15,fontWeight:600,color:T.text}}>{ch.name}</div>
                          <div style={{fontSize:12,color:T.ink,marginTop:2}}>{ch.handle}</div>
                          <div style={{fontSize:11,color:T.sub,marginTop:3}}>{nc?.icon} {nc?.label} · {Object.keys(ch.connections||{}).length} חשבונות</div>
                        </div>
                        <div style={{textAlign:"left"}}>
                          <div style={{fontSize:15,fontWeight:700,color:T.text}}>{ch.stats.videos}</div>
                          <div style={{fontSize:10,color:T.faint}}>סרטונים</div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                <PrimaryBtn onClick={()=>setView("create")}>+ ערוץ חדש</PrimaryBtn>
              </>
            )}
          </div>
        )}

        {/* CREATE WIZARD */}
        {view==="create"&&<CreateWizard onComplete={addChannel} onCancel={()=>setView("list")} toast={toast}/>}

        {/* CHANNEL VIEW */}
        {view==="channel"&&active&&<ChannelView channel={active} onBack={()=>setView("list")} toast={toast} onUpdate={updateChannel}/>}
      </div>

      <Toast items={toasts}/>
    </div>
  );
}
