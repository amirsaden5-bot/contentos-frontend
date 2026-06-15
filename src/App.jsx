import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { T, NICHES, PLATFORMS, uid, LogoMark, generateLogoSet, Btn, Card, Tag, Input, Avatar } from "./design.jsx";

const SUPA = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);
const API = import.meta.env.VITE_API_URL || "";

const auth = {
  signUp: (e,p,n) => SUPA.auth.signUp({email:e,password:p,options:{data:{name:n}}}),
  signIn: (e,p) => SUPA.auth.signInWithPassword({email:e,password:p}),
  signOut: () => SUPA.auth.signOut(),
  session: () => SUPA.auth.getSession(),
  onChange: (cb) => SUPA.auth.onAuthStateChange(cb),
};

function Toasts({items}){
  return <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,display:"flex",flexDirection:"column-reverse",gap:10,pointerEvents:"none"}}>
    {items.map(t=><div key={t.id} style={{background:"#fff",border:`1px solid ${t.type==="ok"?T.green:t.type==="err"?T.red:T.line}`,color:t.type==="ok"?T.green:t.type==="err"?T.red:T.text,borderRadius:12,padding:"12px 18px",fontSize:13,fontWeight:600,boxShadow:"0 8px 30px rgba(0,0,0,.12)",maxWidth:340}}>{t.msg}</div>)}
  </div>;
}

function AuthScreen({onAuth,toast}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [busy,setBusy]=useState(false);
  const submit=async()=>{
    setBusy(true);
    try{
      if(mode==="signup"){
        const {data,error}=await auth.signUp(email,password,name);
        if(error)throw error;
        if(data.session)onAuth(data.session);
        else toast("בדוק אימייל לאישור","ok");
      }else{
        const {data,error}=await auth.signIn(email,password);
        if(error)throw error;
        onAuth(data.session);
      }
    }catch(e){toast(e.message||"שגיאה","err");}
    setBusy(false);
  };
  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg,padding:20}}>
    <div style={{width:"100%",maxWidth:400}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{width:52,height:52,borderRadius:14,background:T.ink,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:26,fontWeight:800,margin:"0 auto 16px"}}>C</div>
        <div style={{fontSize:26,fontWeight:800,letterSpacing:-.6,color:T.text}}>ContentOS</div>
        <div style={{color:T.sub,fontSize:14,marginTop:6}}>{mode==="login"?"התחבר לחשבון שלך":"צור חשבון חדש"}</div>
      </div>
      <Card pad={28}>
        {mode==="signup"&&<><label style={{fontSize:12,fontWeight:600,color:T.sub,display:"block",marginBottom:8}}>שם מלא</label><Input value={name} onChange={e=>setName(e.target.value)} placeholder="ישראל ישראלי"/><div style={{height:16}}/></>}
        <label style={{fontSize:12,fontWeight:600,color:T.sub,display:"block",marginBottom:8}}>אימייל</label>
        <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@email.com" type="email"/>
        <div style={{height:16}}/>
        <label style={{fontSize:12,fontWeight:600,color:T.sub,display:"block",marginBottom:8}}>סיסמה</label>
        <Input value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type="password"/>
        <div style={{height:24}}/>
        <Btn full onClick={submit} disabled={busy||!email||!password||(mode==="signup"&&!name)}>{busy?"...":mode==="login"?"התחבר":"הרשם"}</Btn>
      </Card>
      <div style={{textAlign:"center",marginTop:20,fontSize:13,color:T.sub}}>
        {mode==="login"?"אין לך חשבון?":"כבר יש לך חשבון?"}{" "}
        <button onClick={()=>setMode(mode==="login"?"signup":"login")} style={{background:"none",border:"none",color:T.ink,fontWeight:600,cursor:"pointer",fontSize:13}}>{mode==="login"?"הרשם":"התחבר"}</button>
      </div>
    </div>
  </div>;
}

const NAV=[
  {id:"home",label:"דשבורד",icon:"◧"},
  {id:"channels",label:"ערוצים",icon:"▦"},
  {id:"create",label:"ערוץ חדש",icon:"＋"},
  {id:"studio",label:"סטודיו",icon:"✦"},
  {id:"analytics",label:"אנליטיקס",icon:"◷"},
  {id:"accounts",label:"חיבורים",icon:"⊕"},
  {id:"settings",label:"הגדרות",icon:"⚙"},
];

function Sidebar({page,setPage,user,channels,onSignOut}){
  return <div style={{width:240,background:T.sidebar,minHeight:"100vh",padding:"22px 14px",display:"flex",flexDirection:"column",position:"fixed",right:0,top:0,bottom:0,zIndex:40}}>
    <div style={{display:"flex",alignItems:"center",gap:11,padding:"0 8px 24px"}}>
      <div style={{width:34,height:34,borderRadius:10,background:T.ink,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:800}}>C</div>
      <span style={{fontSize:17,fontWeight:700,color:"#fff",letterSpacing:-.3}}>ContentOS</span>
    </div>
    <nav style={{display:"flex",flexDirection:"column",gap:3,flex:1}}>
      {NAV.map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 13px",borderRadius:10,background:page===n.id?T.ink:"transparent",border:"none",color:page===n.id?"#fff":"#9ca3b8",fontSize:14,fontWeight:page===n.id?600:500,cursor:"pointer",textAlign:"right",fontFamily:"inherit"}}
        onMouseEnter={e=>{if(page!==n.id)e.currentTarget.style.background=T.sidebarHover;}}
        onMouseLeave={e=>{if(page!==n.id)e.currentTarget.style.background="transparent";}}>
        <span style={{fontSize:16,width:18,textAlign:"center"}}>{n.icon}</span>
        {n.label}
        {n.id==="channels"&&channels.length>0&&<span style={{marginInlineStart:"auto",fontSize:11,background:"#ffffff14",color:"#fff",borderRadius:6,padding:"1px 7px"}}>{channels.length}</span>}
      </button>)}
    </nav>
    <div style={{borderTop:"1px solid #ffffff14",paddingTop:14}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 8px 12px"}}>
        <div style={{width:34,height:34,borderRadius:"50%",background:T.inkDark,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:700}}>{(user?.user_metadata?.name||user?.email||"U")[0].toUpperCase()}</div>
        <div style={{minWidth:0,flex:1}}>
          <div style={{fontSize:13,fontWeight:600,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.user_metadata?.name||"משתמש"}</div>
          <div style={{fontSize:11,color:"#6b7280",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email}</div>
        </div>
      </div>
      <button onClick={onSignOut} style={{width:"100%",background:"#ffffff0a",border:"none",color:"#9ca3b8",borderRadius:9,padding:9,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>התנתק</button>
    </div>
  </div>;
}

function PageHeader({title,sub,action}){
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
    <div>
      <h1 style={{fontSize:26,fontWeight:800,letterSpacing:-.6,color:T.text,margin:0}}>{title}</h1>
      {sub&&<div style={{color:T.sub,fontSize:14,marginTop:5}}>{sub}</div>}
    </div>
    {action}
  </div>;
}

function HomePage({channels,setPage}){
  const stats=[
    {label:"ערוצים",value:channels.length,icon:"▦"},
    {label:"חיבורים",value:channels.reduce((a,c)=>a+Object.keys(c.connections||{}).length,0),icon:"⊕"},
    {label:"CPM ממוצע",value:"$8–14",icon:"💰"},
    {label:"סרטונים",value:0,icon:"🎬"},
  ];
  return <>
    <PageHeader title="דשבורד" sub="סקירה כללית"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
      {stats.map(s=><Card key={s.label} pad={20}>
        <div style={{fontSize:22,marginBottom:10}}>{s.icon}</div>
        <div style={{fontSize:30,fontWeight:800,color:T.text,letterSpacing:-1}}>{s.value}</div>
        <div style={{fontSize:12,color:T.sub,marginTop:4}}>{s.label}</div>
      </Card>)}
    </div>
    {channels.length===0?<Card pad={52} style={{textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:16}}>📺</div>
      <div style={{fontSize:18,fontWeight:700,color:T.text}}>נתחיל ביצירת ערוץ</div>
      <div style={{fontSize:14,color:T.sub,marginTop:8,marginBottom:26,lineHeight:1.7}}>בחר נישה, קבל שם ולוגו מ-Claude,<br/>וחבר את הרשתות שלך</div>
      <div style={{display:"flex",justifyContent:"center"}}><Btn onClick={()=>setPage("create")}>+ צור ערוץ ראשון</Btn></div>
    </Card>:<Card>
      <div style={{fontSize:13,fontWeight:600,color:T.sub,marginBottom:16}}>הערוצים שלך</div>
      {channels.map(ch=><div key={ch.id} onClick={()=>setPage("channels")} style={{display:"flex",gap:12,alignItems:"center",padding:12,borderRadius:11,background:T.bg,cursor:"pointer",marginBottom:8}}>
        <Avatar channel={ch} size={42}/>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:600,color:T.text}}>{ch.name}</div>
          <div style={{fontSize:12,color:T.ink}}>{ch.handle}</div>
        </div>
        <Tag label={NICHES.find(n=>n.id===ch.niche)?.label||ch.niche}/>
      </div>)}
    </Card>}
  </>;
}

function ChannelsPage({channels,setPage,onDelete}){
  return <>
    <PageHeader title="ערוצים" sub={channels.length+" ערוצים"} action={<Btn onClick={()=>setPage("create")}>+ ערוץ חדש</Btn>}/>
    {channels.length===0?<Card pad={52} style={{textAlign:"center",color:T.sub}}>
      <div style={{fontSize:42,marginBottom:14}}>📺</div>
      <div style={{display:"flex",justifyContent:"center",marginTop:20}}><Btn onClick={()=>setPage("create")}>+ צור ערוץ ראשון</Btn></div>
    </Card>:<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
      {channels.map(ch=>{const nc=NICHES.find(n=>n.id===ch.niche);return<Card key={ch.id} pad={20}>
        <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
          <Avatar channel={ch} size={56}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:16,fontWeight:700,color:T.text}}>{ch.name}</div>
            <div style={{fontSize:13,color:T.ink,marginTop:2}}>{ch.handle}</div>
            <div style={{fontSize:12,color:T.sub,marginTop:4}}>{ch.tagline}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",marginTop:16,paddingTop:14,borderTop:`1px solid ${T.line}`}}>
          <Tag label={(nc?.icon||"")+" "+(nc?.label||ch.niche)}/>
          <span style={{fontSize:11,color:T.green,fontWeight:600,marginInlineStart:4}}>{nc?.cpm} CPM</span>
          <button onClick={()=>{if(confirm("למחוק?"))onDelete(ch.id);}} style={{marginInlineStart:"auto",background:"none",border:"none",color:T.faint,cursor:"pointer",fontSize:12}}>מחק</button>
        </div>
      </Card>;})}
    </div>}
  </>;
}

function CreatePage({user,toast,onCreated}){
  const [step,setStep]=useState(1);
  const [niche,setNiche]=useState(null);
  const [names,setNames]=useState([]);
  const [chosenName,setChosenName]=useState(null);
  const [logos,setLogos]=useState([]);
  const [chosenLogo,setChosenLogo]=useState(null);
  const [genNames,setGenNames]=useState(false);
  const [saving,setSaving]=useState(false);
  const nc=NICHES.find(n=>n.id===niche);

  const makeNames=async()=>{
    setGenNames(true);setNames([]);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY||"","anthropic-version":"2023-06-01"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:600,messages:[{role:"user",content:`Generate 4 YouTube channel name ideas for niche: "${nc.label}" (${nc.desc}). Return ONLY valid JSON array, no markdown: [{"name":"...","handle":"@...","tagline":"...short Hebrew tagline..."}]`}]})
      });
      const d=await res.json();
      const txt=(d.content?.[0]?.text||"[]").replace(/\`\`\`json|\`\`\`/g,"").trim();
      setNames(JSON.parse(txt));
    }catch{
      setNames([
        {name:nc.label+" Daily",handle:"@"+nc.id+"daily",tagline:"התוכן היומי שלך"},
        {name:"The "+nc.label+" Edit",handle:"@the"+nc.id,tagline:"רק מה שחשוב"},
        {name:nc.label+" Lab",handle:"@"+nc.id+"lab",tagline:"ניסויים ותובנות"},
        {name:"Next "+nc.label,handle:"@next"+nc.id,tagline:"צעד אחד לפני כולם"},
      ]);
      toast("הצעות גיבוי","info");
    }
    setGenNames(false);
  };

  useEffect(()=>{if(chosenName){setLogos(generateLogoSet(chosenName.name,niche));setChosenLogo(null);}},[chosenName]);

  const finish=async()=>{
    setSaving(true);
    try{
      const {data,error}=await SUPA.from("channels").insert({user_id:user.id,name:chosenName.name,handle:chosenName.handle,tagline:chosenName.tagline,niche,logo:chosenLogo,connections:{}}).select().single();
      if(error)throw error;
      onCreated(data);
    }catch(e){toast("שגיאה: "+e.message,"err");}
    setSaving(false);
  };

  return <div style={{maxWidth:680}}>
    <PageHeader title="יצירת ערוץ חדש" sub={"שלב "+step+" מתוך 3"}/>
    <div style={{display:"flex",gap:6,marginBottom:24}}>{[1,2,3].map(s=><div key={s} style={{flex:1,height:4,borderRadius:99,background:step>=s?T.ink:T.line}}/>)}</div>

    {step===1&&<Card>
      <div style={{fontSize:15,fontWeight:600,marginBottom:16,color:T.text}}>בחר נישה</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        {NICHES.map(n=><div key={n.id} onClick={()=>setNiche(n.id)} style={{padding:16,borderRadius:12,border:`1.5px solid ${niche===n.id?T.ink:T.line}`,background:niche===n.id?T.inkSoft:T.bg,cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:24}}>{n.icon}</span><span style={{fontSize:11,color:T.green,fontWeight:700}}>{n.cpm} CPM</span></div>
          <div style={{fontSize:14,fontWeight:600,marginTop:8,color:T.text}}>{n.label}</div>
          <div style={{fontSize:11,color:T.sub,marginTop:3}}>{n.desc}</div>
        </div>)}
      </div>
      <div style={{marginTop:20}}><Btn full onClick={()=>setStep(2)} disabled={!niche}>המשך</Btn></div>
    </Card>}

    {step===2&&<>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:names.length?14:0}}>
          <span style={{fontSize:15,fontWeight:600,color:T.text}}>שם הערוץ</span>
          <Btn size="sm" variant="secondary" onClick={makeNames} disabled={genNames}>{genNames?"מייצר...":names.length?"↻ עוד":"✦ צור שמות"}</Btn>
        </div>
        {!names.length&&!genNames&&<div style={{textAlign:"center",padding:"28px 0",color:T.faint,fontSize:13}}>לחץ "צור שמות" — Claude יציע 4 אפשרויות</div>}
        {genNames&&[1,2,3,4].map(i=><div key={i} style={{height:56,borderRadius:10,background:`linear-gradient(90deg,${T.line},${T.bg},${T.line})`,backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite",marginBottom:8}}/>)}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {names.map((opt,i)=><div key={i} onClick={()=>setChosenName(opt)} style={{padding:14,borderRadius:11,border:`1.5px solid ${chosenName?.name===opt.name?T.ink:T.line}`,background:chosenName?.name===opt.name?T.inkSoft:T.bg,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:14,fontWeight:600,color:T.text}}>{opt.name}</span><span style={{fontSize:12,color:T.ink}}>{opt.handle}</span></div>
            <div style={{fontSize:12,color:T.sub,marginTop:3}}>{opt.tagline}</div>
          </div>)}
        </div>
      </Card>
      {chosenName&&<Card style={{marginTop:14}}>
        <span style={{fontSize:15,fontWeight:600,color:T.text,display:"block",marginBottom:14}}>בחר לוגו</span>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {logos.map((lg,i)=><div key={i} onClick={()=>setChosenLogo(lg)} style={{padding:10,borderRadius:12,border:`1.5px solid ${chosenLogo===lg?T.ink:T.line}`,background:chosenLogo===lg?T.inkSoft:T.bg,cursor:"pointer",display:"flex",justifyContent:"center"}}>
            <LogoMark {...lg} size={58}/>
          </div>)}
        </div>
        <Btn full variant="secondary" size="sm" style={{marginTop:12}} onClick={()=>setLogos(generateLogoSet(chosenName.name,niche))}>↻ לוגואים אחרים</Btn>
      </Card>}
      <div style={{display:"flex",gap:10,marginTop:20}}>
        <Btn variant="secondary" onClick={()=>setStep(1)}>חזור</Btn>
        <Btn full onClick={()=>setStep(3)} disabled={!chosenName||!chosenLogo}>המשך</Btn>
      </div>
    </>}

    {step===3&&<Card pad={36} style={{textAlign:"center"}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:18}}><Avatar channel={{logo:chosenLogo}} size={88}/></div>
      <div style={{fontSize:22,fontWeight:800,color:T.text}}>{chosenName?.name}</div>
      <div style={{fontSize:14,color:T.ink,marginTop:4}}>{chosenName?.handle}</div>
      <div style={{fontSize:13,color:T.sub,marginTop:8,marginBottom:28}}>{chosenName?.tagline}</div>
      <Btn full onClick={finish} disabled={saving}>{saving?"שומר...":"צור ערוץ →"}</Btn>
      <button onClick={()=>setStep(2)} style={{background:"none",border:"none",color:T.faint,fontSize:13,cursor:"pointer",marginTop:14,display:"block",width:"100%"}}>חזור לעריכה</button>
    </Card>}
  </div>;
}

function StudioPage({channels,toast}){
  const [sel,setSel]=useState(null);
  const [ideas,setIdeas]=useState([]);
  const [busy,setBusy]=useState(false);
  useEffect(()=>{if(channels.length&&!sel)setSel(channels[0].id);},[channels]);
  const ch=channels.find(c=>c.id===sel)||channels[0];
  const gen=async()=>{
    if(!ch)return;
    setBusy(true);setIdeas([]);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY||"","anthropic-version":"2023-06-01"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:800,messages:[{role:"user",content:`Generate 5 viral short-video ideas for YouTube channel "${ch.name}" in niche: ${ch.niche}. Return ONLY JSON array: [{"id":"1","title":"English title","hook":"Hebrew hook sentence","score":90}]`}]})
      });
      const d=await res.json();
      const txt=(d.content?.[0]?.text||"[]").replace(/\`\`\`json|\`\`\`/g,"").trim();
      setIdeas(JSON.parse(txt).map(x=>({...x,id:uid()})));
    }catch{
      const nc=NICHES.find(n=>n.id===ch?.niche);
      setIdeas([
        {id:uid(),title:"5 "+nc?.label+" Secrets",hook:"רוב האנשים לא יודעים את זה",score:94},
        {id:uid(),title:"The Truth About "+nc?.label,hook:"מה שלא מספרים לך",score:89},
        {id:uid(),title:nc?.label+" Mistakes to Avoid",hook:"עשיתי את כולן כדי שלא תצטרך",score:85},
      ]);
      toast("רעיונות גיבוי","info");
    }
    setBusy(false);
  };
  return <>
    <PageHeader title="סטודיו" sub="הפק תוכן עם Claude"/>
    {channels.length===0?<Card pad={44} style={{textAlign:"center",color:T.sub}}>צור ערוץ קודם</Card>:<>
      <Card style={{marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:600,color:T.sub,marginBottom:12}}>בחר ערוץ</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {channels.map(c=><button key={c.id} onClick={()=>setSel(c.id)} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 14px",borderRadius:11,border:`1.5px solid ${(sel||channels[0]?.id)===c.id?T.ink:T.line}`,background:(sel||channels[0]?.id)===c.id?T.inkSoft:"#fff",cursor:"pointer"}}>
            <Avatar channel={c} size={28}/>
            <span style={{fontSize:13,fontWeight:600,color:T.text}}>{c.name}</span>
          </button>)}
        </div>
      </Card>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:ideas.length?16:0}}>
          <span style={{fontSize:15,fontWeight:600,color:T.text}}>רעיונות מ-Claude</span>
          <Btn size="sm" onClick={gen} disabled={busy}>{busy?"מייצר...":"✦ צור רעיונות"}</Btn>
        </div>
        {!ideas.length&&!busy&&<div style={{textAlign:"center",padding:"28px 0",color:T.faint,fontSize:13}}>לחץ "צור רעיונות" לקבלת 5 רעיונות ויראליים</div>}
        {busy&&[1,2,3].map(i=><div key={i} style={{height:68,borderRadius:11,background:`linear-gradient(90deg,${T.line},${T.bg},${T.line})`,backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite",marginBottom:10}}/>)}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {ideas.map(idea=><div key={idea.id} style={{padding:14,borderRadius:11,border:`1px solid ${T.line}`,background:T.bg}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:10}}>
              <span style={{fontSize:14,fontWeight:600,color:T.text}}>{idea.title}</span>
              <span style={{fontSize:18,fontWeight:800,color:T.amber}}>{idea.score}</span>
            </div>
            <div style={{fontSize:12,color:T.sub,marginTop:4,fontStyle:"italic"}}>"{idea.hook}"</div>
          </div>)}
        </div>
      </Card>
    </>}
  </>;
}

function AccountsPage({channels}){
  return <>
    <PageHeader title="חיבורים" sub="חבר חשבונות רשתות חברתיות"/>
    {channels.length===0?<Card pad={44} style={{textAlign:"center",color:T.sub}}>צור ערוץ קודם</Card>:channels.map(ch=><Card key={ch.id} style={{marginBottom:14}}>
      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16}}>
        <Avatar channel={ch} size={40}/>
        <div><div style={{fontSize:15,fontWeight:600,color:T.text}}>{ch.name}</div><div style={{fontSize:12,color:T.ink}}>{ch.handle}</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        {PLATFORMS.map(p=>{const conn=ch.connections?.[p.id];return<div key={p.id} style={{display:"flex",alignItems:"center",gap:11,padding:12,borderRadius:11,background:T.bg}}>
          <div style={{width:36,height:36,borderRadius:9,background:p.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:p.color}}>{p.glyph}</div>
          <span style={{flex:1,fontSize:13,fontWeight:600,color:T.text}}>{p.label}</span>
          {conn?<Tag label="✓ מחובר" color={T.green} bg={T.greenBg}/>:<button onClick={()=>window.open(API+"/oauth/"+p.id+"/connect?channelId="+ch.id,"_blank")} style={{background:p.color,color:"#fff",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>חבר</button>}
        </div>;})}
      </div>
    </Card>)}
    <div style={{background:T.amberBg,border:`1px solid ${T.amber}33`,borderRadius:12,padding:"14px 16px",fontSize:13,color:"#8a5a00",lineHeight:1.6}}>
      ⓘ חיבור דורש הגדרת OAuth Apps ב-Google/TikTok/Meta. לאחר הגדרה, כפתור "חבר" יפתח חלון רשמי.
    </div>
  </>;
}

function AnalyticsPage(){
  return <>
    <PageHeader title="אנליטיקס" sub="ביצועים על פני כל הערוצים"/>
    <Card pad={52} style={{textAlign:"center"}}>
      <div style={{fontSize:42,marginBottom:14}}>📊</div>
      <div style={{fontSize:16,fontWeight:600,color:T.text}}>נתונים יופיעו כאן</div>
      <div style={{fontSize:13,color:T.sub,marginTop:8,lineHeight:1.6}}>לאחר פרסום סרטונים, ביצועי הצפיות והעוקבים יוצגו כאן אוטומטית</div>
    </Card>
  </>;
}

function SettingsPage({user,onSignOut}){
  return <>
    <PageHeader title="הגדרות"/>
    <Card style={{marginBottom:14}}>
      <div style={{fontSize:13,fontWeight:600,color:T.sub,marginBottom:14}}>פרטי חשבון</div>
      {[["שם",user?.user_metadata?.name||"—"],["אימייל",user?.email]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${T.line}`}}>
        <span style={{fontSize:13,color:T.sub}}>{l}</span>
        <span style={{fontSize:13,fontWeight:600,color:T.text}}>{v}</span>
      </div>)}
    </Card>
    <Card style={{marginBottom:14}}>
      <div style={{fontSize:13,fontWeight:600,color:T.sub,marginBottom:14}}>חיבורי API</div>
      {[["Claude (Anthropic)","סקריפטים + רעיונות"],["ElevenLabs","קריינות"],["Kling AI","וידאו"]].map(([n,d])=><div key={n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:12,borderRadius:11,background:T.bg,marginBottom:8}}>
        <div><div style={{fontSize:13,fontWeight:600,color:T.text}}>{n}</div><div style={{fontSize:11,color:T.sub}}>{d}</div></div>
        <Tag label="✓ מחובר" color={T.green} bg={T.greenBg}/>
      </div>)}
    </Card>
    <Btn variant="danger" onClick={onSignOut}>התנתק מהחשבון</Btn>
  </>;
}

export default function App(){
  const [session,setSession]=useState(null);
  const [loading,setLoading]=useState(true);
  const [page,setPage]=useState("home");
  const [channels,setChannels]=useState([]);
  const [toasts,setToasts]=useState([]);
  const toast=useCallback((msg,type="info")=>{const id=uid();setToasts(t=>[...t,{id,msg,type}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500);},[]);

  useEffect(()=>{
    auth.session().then(({data})=>{setSession(data.session);setLoading(false);});
    const {data:sub}=auth.onChange((_e,s)=>setSession(s));
    return ()=>sub?.subscription?.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!session?.user)return;
    SUPA.from("channels").select("*").eq("user_id",session.user.id).order("created_at",{ascending:false}).then(({data})=>setChannels(data||[]));
  },[session]);

  if(loading)return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg,color:T.sub}}>טוען...</div>;
  if(!session)return<><AuthScreen onAuth={setSession} toast={toast}/><Toasts items={toasts}/></>;

  const user=session.user;
  const onCreated=ch=>{setChannels(c=>[ch,...c]);setPage("channels");toast(`הערוץ "${ch.name}" נוצר`,"ok");};
  const onDelete=async id=>{const {error}=await SUPA.from("channels").delete().eq("id",id);if(!error){setChannels(c=>c.filter(x=>x.id!==id));toast("הערוץ נמחק","ok");}else toast("שגיאה","err");};
  const signOut=async()=>{await auth.signOut();setSession(null);setChannels([]);};

  return<div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Inter',-apple-system,system-ui,sans-serif",direction:"rtl"}}>
    <style>{`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:8px}::-webkit-scrollbar-thumb{background:#d4d7e0;border-radius:99px}input::placeholder{color:${T.faint}}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    <Sidebar page={page} setPage={setPage} user={user} channels={channels} onSignOut={signOut}/>
    <div style={{marginRight:240,padding:"32px 40px",minHeight:"100vh"}}>
      {page==="home"&&<HomePage channels={channels} setPage={setPage}/>}
      {page==="channels"&&<ChannelsPage channels={channels} setPage={setPage} onDelete={onDelete}/>}
      {page==="create"&&<CreatePage user={user} toast={toast} onCreated={onCreated}/>}
      {page==="studio"&&<StudioPage channels={channels} toast={toast}/>}
      {page==="analytics"&&<AnalyticsPage/>}
      {page==="accounts"&&<AccountsPage channels={channels}/>}
      {page==="settings"&&<SettingsPage user={user} onSignOut={signOut}/>}
    </div>
    <Toasts items={toasts}/>
  </div>;
}
