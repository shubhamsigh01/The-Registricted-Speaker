import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const categories = [
  { id:"superheroes", name:"Superheroes", icon:"🦸", color:"#3B82F6",
    hint:"A famous masked superhero.", hint2:"A genius billionaire in a high-tech suit.",
    words:["Spider-Man","Iron Man","Captain America","Thor","Black Widow","Hulk","Black Panther","Doctor Strange","Scarlet Witch","Vision","Batman","Superman","Wonder Woman","The Flash","Aquaman","Green Lantern","Cyborg","Shazam","Harley Quinn","Joker"] },
  { id:"movies", name:"Movies", icon:"🎬", color:"#7C3AED",
    hint:"A blockbuster film from Hollywood.", hint2:"An iconic cinematic masterpiece.",
    words:["The Godfather","Titanic","Avatar","Inception","The Dark Knight","Pulp Fiction","Forrest Gump","The Matrix","Jurassic Park","Star Wars","The Lion King","Frozen","Toy Story","Finding Nemo","Shrek","The Avengers","Interstellar","Shawshank Redemption","Gladiator","Braveheart"] },
  { id:"animals", name:"Animals", icon:"🦁", color:"#F59E0B",
    hint:"A wild creature found in nature.", hint2:"An animal known for its unique features.",
    words:["Elephant","Lion","Tiger","Giraffe","Zebra","Penguin","Dolphin","Whale","Shark","Octopus","Eagle","Parrot","Owl","Flamingo","Peacock","Kangaroo","Koala","Panda","Gorilla","Chimpanzee"] },
  { id:"celebrities", name:"Celebrities", icon:"⭐", color:"#EC4899",
    hint:"A world-famous entertainer.", hint2:"A superstar loved by millions.",
    words:["Tom Hanks","Leonardo DiCaprio","Brad Pitt","Jennifer Lawrence","Scarlett Johansson","Dwayne Johnson","Chris Hemsworth","Robert Downey Jr","Will Smith","Johnny Depp","Taylor Swift","Beyoncé","Ariana Grande","Ed Sheeran","Drake","LeBron James","Cristiano Ronaldo","Lionel Messi","Serena Williams","Tom Brady"] },
  { id:"food", name:"Food & Drinks", icon:"🍕", color:"#EF4444",
    hint:"Something delicious you eat or drink.", hint2:"A popular dish or beverage worldwide.",
    words:["Pizza","Burger","Sushi","Tacos","Pasta","Ice Cream","Chocolate","Pancakes","Waffles","Donuts","Coffee","Tea","Smoothie","Lemonade","Milkshake","Steak","Salmon","Lobster","Shrimp","Chicken Wings"] },
  { id:"places", name:"Famous Places", icon:"🗼", color:"#10B981",
    hint:"A world-famous landmark or destination.", hint2:"A place visited by millions of tourists.",
    words:["Eiffel Tower","Statue of Liberty","Great Wall of China","Taj Mahal","Big Ben","Pyramids of Giza","Colosseum","Machu Picchu","Christ the Redeemer","Stonehenge","Times Square","Golden Gate Bridge","Sydney Opera House","Buckingham Palace","Empire State Building","Mount Everest","Grand Canyon","Niagara Falls","Great Barrier Reef","Northern Lights"] },
  { id:"sports", name:"Sports", icon:"⚽", color:"#06B6D4",
    hint:"A popular sport or athletic activity.", hint2:"Played worldwide with a team or solo.",
    words:["Football","Basketball","Soccer","Tennis","Baseball","Golf","Swimming","Boxing","Gymnastics","Volleyball","Hockey","Cricket","Rugby","Skiing","Surfing","Chess","Poker","Monopoly","Scrabble","Checkers"] },
  { id:"technology", name:"Technology", icon:"💻", color:"#8B5CF6",
    hint:"A modern tech device or concept.", hint2:"Something cutting-edge in the digital world.",
    words:["iPhone","MacBook","PlayStation","Xbox","Nintendo Switch","Tesla","Drone","Smartwatch","Virtual Reality","Robot","Internet","Social Media","Artificial Intelligence","Smartphone","Tablet","Laptop","Headphones","Camera","Television","Smart Home"] },
];

const packs = [
  { id:"classic",    name:"Classic Pack",       icon:"🎯", desc:"The original favorites",      color:"#3B82F6", cats:[0,1,2,3] },
  { id:"family",     name:"Family Fun",          icon:"👨‍👩‍👧", desc:"Perfect for all ages",          color:"#F59E0B", cats:[2,4,5] },
  { id:"party",      name:"Adult Party",         icon:"🎉", desc:"For grown-up game nights",     color:"#EC4899", cats:[3,1,6] },
  { id:"everything", name:"Everything Pack",     icon:"🌟", desc:"All categories combined",       color:"#10B981", cats:[0,1,2,3,4,5,6,7] },
];

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const T = {
  dark:    "#0F172A",
  surface: "#1E293B",
  blue:    "#2563EB",
  blueHov: "#1D4ED8",
  cardBlue:"#3B82F6",
  purple:  "#7C3AED",
  red:     "#EF4444",
  green:   "#22C55E",
  gray:    "#94A3B8",
  border:  "#E2E8F0",
};

// ─── TINY HELPERS ────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

// ─── CONFETTI ────────────────────────────────────────────────────────────────
function Confetti() {
  const colors = ["#2563EB","#7C3AED","#EF4444","#22C55E","#F59E0B","#EC4899","#06B6D4"];
  const pieces = Array.from({length:40}, (_,i)=>({
    id:i,
    x: Math.random()*100,
    delay: Math.random()*1.5,
    dur: 2+Math.random()*2,
    color: colors[i%colors.length],
    size: 6+Math.random()*8,
    rotate: Math.random()*360,
  }));
  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      {pieces.map(p=>(
        <div key={p.id} style={{
          position:"absolute",
          left:`${p.x}%`,
          top:"-20px",
          width:p.size,
          height:p.size,
          background:p.color,
          borderRadius:Math.random()>0.5?"50%":"2px",
          animation:`confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
          transform:`rotate(${p.rotate}deg)`,
        }}/>
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity:1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity:0; }
        }
      `}</style>
    </div>
  );
}

// ─── HOLD BUTTON ─────────────────────────────────────────────────────────────
function HoldButton({ label, subLabel, color, onHold, icon, holdDuration=700 }) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const timerRef = useRef(null);
  const progRef = useRef(null);

  const start = useCallback(() => {
    setHolding(true);
    const t0 = Date.now();
    progRef.current = setInterval(()=>{
      setProgress(Math.min(((Date.now()-t0)/holdDuration)*100, 100));
    }, 16);
    timerRef.current = setTimeout(()=>{ onHold(); end(); }, holdDuration);
  },[holdDuration, onHold]);

  const end = useCallback(()=>{
    setHolding(false); setProgress(0);
    clearTimeout(timerRef.current); clearInterval(progRef.current);
  },[]);

  useEffect(()=>()=>{ clearTimeout(timerRef.current); clearInterval(progRef.current); },[]);

  const r=45, circ=2*Math.PI*r;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,userSelect:"none"}}>
      <button
        onMouseDown={start} onMouseUp={end} onMouseLeave={end}
        onTouchStart={e=>{e.preventDefault();start();}} onTouchEnd={end}
        style={{
          position:"relative",width:"clamp(56px,14vw,88px)",height:"clamp(56px,14vw,88px)",
          borderRadius:"50%",background:color,border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",
          transform:holding?"scale(0.9)":"scale(1)",transition:"transform 0.1s",
          flexShrink:0,
        }}
      >
        <span style={{fontSize:"clamp(20px,5vw,30px)",color:"white",fontWeight:900,lineHeight:1}}>{icon}</span>
        {holding && (
          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",transform:"rotate(-90deg)"}} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} fill="none" stroke="white" strokeWidth="5"
              strokeDasharray={`${(progress/100)*circ} ${circ}`} strokeLinecap="round" opacity="0.6"/>
          </svg>
        )}
      </button>
      <span style={{color:"white",fontSize:"clamp(9px,2vw,12px)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",textAlign:"center"}}>
        {label}
      </span>
      <span style={{color:T.gray,fontSize:"clamp(8px,1.8vw,11px)",textAlign:"center",lineHeight:1.2}}>{subLabel}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — HOME
// ═══════════════════════════════════════════════════════════════════════════════
function HomeScreen({ onStart, onHowToPlay }) {
  return (
    <div style={{
      minHeight:"100%",background:"white",display:"flex",flexDirection:"column",
      fontFamily:"'Nunito',system-ui,sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .menu-row { display:flex;align-items:center;justify-content:space-between;padding:16px 20px;
          border:1.5px solid #E2E8F0;border-radius:16px;cursor:pointer;transition:all .15s;background:white; }
        .menu-row:hover { background:#F8FAFC;transform:translateX(2px); }
        .start-btn { width:100%;padding:18px;background:#2563EB;color:white;border:none;border-radius:50px;
          font-size:clamp(15px,3.5vw,18px);font-weight:800;cursor:pointer;transition:all .15s;
          font-family:inherit;display:flex;align-items:center;justify-content:center;gap:10px; }
        .start-btn:hover { background:#1D4ED8;transform:scale(1.01); }
        .start-btn:active { transform:scale(0.98); }
        @keyframes sparkle { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
      `}</style>

      {/* Hero */}
      <div style={{
        flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        padding:"clamp(24px,6vw,80px) clamp(20px,5vw,60px)",textAlign:"center",gap:"clamp(8px,2vw,16px)",
      }}>
        {/* Logo */}
        <div style={{position:"relative",marginBottom:"clamp(8px,2vw,16px)"}}>
          {["◈","✦","✧","◆"].map((s,i)=>(
            <span key={i} style={{
              position:"absolute",fontSize:"clamp(10px,2vw,16px)",color:T.blue,
              animation:`sparkle 1.5s ${i*0.3}s infinite`,
              top: ["-20px","10px","-10px","20px"][i],
              left: ["-10px","50px","-30px","40px"][i],
            }}>{s}</span>
          ))}
          <h1 style={{
            fontSize:"clamp(42px,10vw,96px)",fontWeight:900,lineHeight:1,letterSpacing:"-2px",
            margin:0,color:"#0F172A",
          }}>
            Heads<span style={{color:T.blue}}>Up</span>
            <span style={{color:T.blue,fontSize:"0.7em"}}>!</span>
          </h1>
        </div>
        <p style={{color:T.gray,fontSize:"clamp(13px,2.5vw,18px)",margin:0,maxWidth:360,lineHeight:1.5}}>
          Hold your phone up and let your friends guess!
        </p>

        {/* How to play steps */}
        <div style={{
          display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",
          gap:"clamp(8px,2vw,16px)",width:"100%",maxWidth:680,marginTop:"clamp(8px,2vw,24px)",
        }}>
          {[
            { n:"1", icon:"📱", title:"Hold it up", desc:"Phone on your forehead so friends can see" },
            { n:"2", icon:"💬", title:"Get clues",  desc:"Friends give hints without saying the word" },
            { n:"3", icon:"✅", title:"Guess & win",desc:"Tap CORRECT to score or SKIP to pass" },
          ].map(s=>(
            <div key={s.n} style={{
              background:"#F8FAFC",borderRadius:16,padding:"clamp(12px,3vw,20px)",
              border:"1.5px solid #E2E8F0",textAlign:"center",
            }}>
              <div style={{fontSize:"clamp(24px,5vw,36px)",marginBottom:6}}>{s.icon}</div>
              <div style={{fontWeight:800,fontSize:"clamp(12px,2vw,14px)",color:"#0F172A",marginBottom:4}}>{s.title}</div>
              <div style={{color:T.gray,fontSize:"clamp(10px,1.8vw,12px)",lineHeight:1.4}}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div style={{padding:"clamp(16px,4vw,40px)",display:"flex",flexDirection:"column",gap:12,maxWidth:640,margin:"0 auto",width:"100%"}}>
        {[
          { icon:"📦", label:"Word Packs",  sub:"8 Categories", action: onStart },
          { icon:"❓", label:"How to Play", sub:"Quick guide",   action: onHowToPlay },
          { icon:"⚙️", label:"Settings",    sub:"Customize",     action:()=>{} },
        ].map(m=>(
          <div key={m.label} className="menu-row" onClick={m.action}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <span style={{fontSize:24}}>{m.icon}</span>
              <div>
                <div style={{fontWeight:800,fontSize:"clamp(14px,2.5vw,16px)",color:"#0F172A"}}>{m.label}</div>
                <div style={{color:T.gray,fontSize:"clamp(11px,2vw,13px)"}}>{m.sub}</div>
              </div>
            </div>
            <span style={{color:T.gray,fontSize:20,fontWeight:300}}>›</span>
          </div>
        ))}
        <button className="start-btn" onClick={onStart}>
          <span style={{fontSize:20}}>▶</span> Start Game
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — SELECT PACK
// ═══════════════════════════════════════════════════════════════════════════════
function SelectPackScreen({ onBack, onNext }) {
  const [selected, setSelected] = useState("everything");
  const pack = packs.find(p=>p.id===selected);
  const catCount = pack ? pack.cats.reduce((s,i)=>s+categories[i].words.length,0) : 0;

  return (
    <div style={{minHeight:"100%",background:"white",display:"flex",flexDirection:"column",fontFamily:"'Nunito',system-ui,sans-serif"}}>
      <style>{`
        .pack-card { border-radius:20px;padding:clamp(14px,3vw,22px);cursor:pointer;
          transition:all .2s;border:3px solid transparent;position:relative;overflow:hidden; }
        .pack-card:hover { transform:translateY(-2px); }
        .pack-card.sel { border-color:white;box-shadow:0 0 0 4px #2563EB; }
        .next-btn { width:100%;padding:18px;background:#2563EB;color:white;border:none;border-radius:50px;
          font-size:clamp(15px,3vw,18px);font-weight:800;cursor:pointer;transition:all .15s;font-family:inherit; }
        .next-btn:hover { background:#1D4ED8; }
      `}</style>

      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",padding:"16px clamp(16px,4vw,32px)",borderBottom:"1.5px solid #E2E8F0",gap:16}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:T.blue,fontWeight:700,fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
          ‹ Back
        </button>
        <h2 style={{flex:1,textAlign:"center",margin:0,fontSize:"clamp(16px,3vw,22px)",fontWeight:900,color:"#0F172A"}}>Select Pack</h2>
        <div style={{width:60}}/>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"clamp(16px,4vw,32px)"}}>
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill,minmax(clamp(140px,20vw,200px),1fr))",
          gap:"clamp(10px,2vw,18px)",maxWidth:900,margin:"0 auto",
        }}>
          {packs.map(p=>{
            const wc = p.cats.reduce((s,i)=>s+categories[i].words.length,0);
            return (
              <div key={p.id} className={`pack-card${selected===p.id?" sel":""}`}
                style={{background:p.color}} onClick={()=>setSelected(p.id)}>
                {selected===p.id && (
                  <div style={{position:"absolute",top:10,right:10,width:26,height:26,background:"white",
                    borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                    color:T.blue,fontSize:14,fontWeight:900}}>✓</div>
                )}
                <div style={{fontSize:"clamp(28px,6vw,44px)",marginBottom:8,textAlign:"center"}}>{p.icon}</div>
                <div style={{color:"white",fontWeight:900,fontSize:"clamp(13px,2.5vw,16px)",textAlign:"center",lineHeight:1.2,marginBottom:4}}>{p.name}</div>
                <div style={{color:"rgba(255,255,255,0.8)",fontSize:"clamp(10px,2vw,12px)",textAlign:"center"}}>{wc} words</div>
                <div style={{color:"rgba(255,255,255,0.7)",fontSize:"clamp(9px,1.8vw,11px)",textAlign:"center",marginTop:3}}>{p.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Preview categories */}
        {pack && (
          <div style={{marginTop:"clamp(16px,4vw,32px)",maxWidth:900,margin:"clamp(16px,4vw,32px) auto 0"}}>
            <p style={{color:T.gray,fontSize:"clamp(11px,2vw,14px)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>
              Included categories ({pack.cats.length})
            </p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {pack.cats.map(i=>(
                <span key={i} style={{
                  display:"flex",alignItems:"center",gap:6,padding:"6px 14px",
                  background:`${categories[i].color}20`,border:`1.5px solid ${categories[i].color}40`,
                  borderRadius:50,fontSize:"clamp(11px,2vw,13px)",fontWeight:700,
                }}>
                  {categories[i].icon} {categories[i].name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{padding:"clamp(12px,3vw,24px) clamp(16px,4vw,32px)"}}>
        <button className="next-btn" onClick={()=>onNext(packs.find(p=>p.id===selected))}>
          Next  ›
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — SELECT CATEGORY
// ═══════════════════════════════════════════════════════════════════════════════
function SelectCategoryScreen({ pack, onBack, onStart }) {
  const [selected, setSelected] = useState("all");
  const [search, setSearch] = useState("");
  const availCats = pack ? pack.cats.map(i=>categories[i]) : categories;
  const filtered = availCats.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id) => {
    if (id==="all") { setSelected("all"); return; }
    setSelected(id);
  };

  const chosenCat = selected==="all"
    ? availCats[Math.floor(Math.random()*availCats.length)]
    : availCats.find(c=>c.id===selected);

  return (
    <div style={{minHeight:"100%",background:"white",display:"flex",flexDirection:"column",fontFamily:"'Nunito',system-ui,sans-serif"}}>
      <style>{`
        .cat-row { display:flex;align-items:center;justify-content:space-between;
          padding:14px 16px;border-radius:14px;cursor:pointer;transition:all .15s;border:1.5px solid #E2E8F0; }
        .cat-row:hover { background:#F8FAFC; }
        .cat-row.sel { background:#EFF6FF;border-color:#BFDBFE; }
        .sstart-btn { width:100%;padding:18px;background:#2563EB;color:white;border:none;border-radius:50px;
          font-size:clamp(15px,3vw,18px);font-weight:800;cursor:pointer;transition:all .15s;font-family:inherit; }
        .sstart-btn:hover { background:#1D4ED8; }
        .search-input { width:100%;padding:12px 16px;border:1.5px solid #E2E8F0;border-radius:14px;
          font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;margin-bottom:12px; }
        .search-input:focus { border-color:#2563EB; }
      `}</style>

      <div style={{display:"flex",alignItems:"center",padding:"16px clamp(16px,4vw,32px)",borderBottom:"1.5px solid #E2E8F0",gap:16}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:T.blue,fontWeight:700,fontFamily:"inherit"}}>
          ‹ Back
        </button>
        <h2 style={{flex:1,textAlign:"center",margin:0,fontSize:"clamp(16px,3vw,22px)",fontWeight:900,color:"#0F172A"}}>Select Category</h2>
        <div style={{width:60}}/>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"clamp(12px,3vw,28px) clamp(16px,4vw,32px)"}}>
        <input className="search-input" placeholder="🔍  Search categories…"
          value={search} onChange={e=>setSearch(e.target.value)}/>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(140px,22vw,220px),1fr))",gap:"clamp(8px,2vw,12px)"}}>
          {/* All categories option */}
          {!search && (
            <div className={`cat-row${selected==="all"?" sel":""}`}
              onClick={()=>toggle("all")}
              style={{gridColumn:"1/-1",background:selected==="all"?"#EFF6FF":"white"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:22}}>🌐</span>
                <div>
                  <div style={{fontWeight:800,color:"#0F172A",fontSize:"clamp(13px,2.5vw,15px)"}}>All Categories</div>
                  <div style={{color:T.gray,fontSize:"clamp(10px,2vw,12px)"}}>Random category each round</div>
                </div>
              </div>
              {selected==="all" && <span style={{color:T.blue,fontSize:18,fontWeight:900}}>✓</span>}
            </div>
          )}

          {filtered.map(c=>(
            <div key={c.id} className={`cat-row${selected===c.id?" sel":""}`} onClick={()=>toggle(c.id)}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:`${c.color}20`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
                  {c.icon}
                </div>
                <div>
                  <div style={{fontWeight:800,color:"#0F172A",fontSize:"clamp(12px,2vw,14px)"}}>{c.name}</div>
                  <div style={{color:T.gray,fontSize:"clamp(10px,1.8vw,11px)"}}>{c.words.length} words</div>
                </div>
              </div>
              {selected===c.id && <span style={{color:T.blue,fontWeight:900}}>✓</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"clamp(12px,3vw,24px) clamp(16px,4vw,32px)"}}>
        <button className="sstart-btn" onClick={()=>onStart(chosenCat)}>
          Start Game
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — GAME SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function GameScreen({ category, onEnd }) {
  const TOTAL_TIME = 60;
  const words = useRef(shuffle(category.words.slice(0,20)));
  const [idx, setIdx] = useState(0);
  const [time, setTime] = useState(TOTAL_TIME);
  const [score, setScore] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [cardAnim, setCardAnim] = useState("");
  const [showHint, setShowHint] = useState(false);

  useEffect(()=>{
    if (time<=0) { onEnd({ score, skipped, bestStreak, history, category }); return; }
    const t = setInterval(()=>setTime(p=>p-1), 1000);
    return ()=>clearInterval(t);
  },[time]);

  const next = (correct) => {
    setCardAnim(correct?"animRight":"animLeft");
    setHistory(h=>[...h,{word:words.current[idx],correct}]);
    if (correct) {
      const ns = streak+1;
      setScore(s=>s+1); setStreak(ns);
      if (ns>bestStreak) setBestStreak(ns);
    } else {
      setStreak(0); setSkipped(s=>s+1);
    }
    setTimeout(()=>{
      setShowHint(false);
      setCardAnim("");
      if (idx+1 >= words.current.length) onEnd({ score:score+(correct?1:0), skipped:skipped+(correct?0:1), bestStreak, history:[...history,{word:words.current[idx],correct}], category });
      else setIdx(i=>i+1);
    }, 300);
  };

  const progress = ((idx)/(words.current.length))*100;
  const timeColor = time<=10 ? T.red : time<=20 ? "#F59E0B" : "white";

  // alternate card color
  const cardColor = idx%2===0 ? category.color : (category.color==="#3B82F6"?"#7C3AED":category.color==="#7C3AED"?"#3B82F6":"#7C3AED");

  return (
    <div style={{
      minHeight:"100%",background:T.dark,display:"flex",flexDirection:"column",
      fontFamily:"'Nunito',system-ui,sans-serif",position:"relative",overflow:"hidden",
    }}>
      <style>{`
        @keyframes slideRight { 0%{transform:translateX(0) rotate(0)} 100%{transform:translateX(120%) rotate(15deg);opacity:0} }
        @keyframes slideLeft  { 0%{transform:translateX(0) rotate(0)} 100%{transform:translateX(-120%) rotate(-15deg);opacity:0} }
        @keyframes cardIn     { 0%{transform:translateY(40px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        .card-anim-right { animation: slideRight 0.3s ease-in forwards; }
        .card-anim-left  { animation: slideLeft  0.3s ease-in forwards; }
        .card-idle       { animation: cardIn 0.3s ease-out forwards; }
        @keyframes timerPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        .timer-urgent { animation: timerPulse 0.5s infinite; color:${T.red}!important; }
      `}</style>

      {/* Status bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"clamp(12px,3vw,20px) clamp(16px,4vw,28px)",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:T.surface,
          borderRadius:50,padding:"6px 14px"}}>
          <span style={{fontSize:"clamp(14px,3vw,18px)"}}>{category.icon}</span>
          <span style={{color:"white",fontWeight:800,fontSize:"clamp(11px,2vw,14px)"}}>{category.name}</span>
        </div>

        <div className={time<=10?"timer-urgent":""} style={{
          color:timeColor,fontWeight:900,fontSize:"clamp(20px,5vw,32px)",
          fontVariantNumeric:"tabular-nums",transition:"color 0.3s",
        }}>
          ⏱ {String(Math.floor(time/60)).padStart(2,"0")}:{String(time%60).padStart(2,"0")}
        </div>

        <div style={{color:T.gray,fontWeight:700,fontSize:"clamp(12px,2.5vw,16px)"}}>
          {idx+1}<span style={{color:T.surface}}> / </span>{words.current.length}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{height:4,background:T.surface,margin:"0 clamp(16px,4vw,28px)"}}>
        <div style={{height:"100%",background:T.blue,borderRadius:2,width:`${progress}%`,transition:"width 0.3s"}}/>
      </div>

      <div style={{color:T.gray,textAlign:"center",fontSize:"clamp(11px,2vw,14px)",
        padding:"8px 0",fontWeight:600}}>Category: {category.name}</div>

      {/* Game area */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
        justifyContent:"center",padding:"clamp(8px,2vw,24px) clamp(16px,4vw,32px)",gap:"clamp(12px,3vw,28px)"}}>

        {/* Actions + card row */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",
          gap:"clamp(10px,3vw,32px)",width:"100%",maxWidth:900}}>
          <HoldButton
            icon="«" label="SKIP" subLabel="HOLD TO SKIP"
            color={T.red} onHold={()=>next(false)}
          />

          {/* Word card */}
          <div className={cardAnim==="animRight"?"card-anim-right":cardAnim==="animLeft"?"card-anim-left":"card-idle"}
            style={{
              flex:1,maxWidth:"clamp(280px,60vw,680px)",
              height:"clamp(180px,30vw,380px)",
              borderRadius:24,background:cardColor,
              display:"flex",alignItems:"center",justifyContent:"center",
              padding:"clamp(16px,4vw,40px)",
              boxShadow:"0 20px 60px rgba(0,0,0,0.5)",
            }}>
            <h1 style={{
              color:"white",fontWeight:900,textAlign:"center",
              fontSize:"clamp(28px,7vw,72px)",
              letterSpacing:"-0.02em",lineHeight:1.1,
              textTransform:"uppercase",wordBreak:"break-word",margin:0,
            }}>{words.current[idx]}</h1>
          </div>

          <HoldButton
            icon="»" label="CORRECT" subLabel="HOLD TO CONFIRM"
            color={T.green} onHold={()=>next(true)}
          />
        </div>

        {/* Hint */}
        <div style={{textAlign:"center",minHeight:56}}>
          {!showHint ? (
            <button onClick={()=>setShowHint(true)} style={{
              background:"none",border:"1.5px solid "+T.surface,borderRadius:50,
              color:T.gray,padding:"8px 20px",cursor:"pointer",fontSize:"clamp(12px,2vw,14px)",
              fontWeight:700,fontFamily:"inherit",transition:"all .15s",
            }}>💡 Show Hint</button>
          ) : (
            <div>
              <div style={{color:"#FCD34D",fontSize:"clamp(12px,2vw,14px)",fontWeight:700,marginBottom:4}}>💡 Hint</div>
              <div style={{color:"white",fontSize:"clamp(12px,2vw,15px)",maxWidth:400,lineHeight:1.5,opacity:0.9}}>
                {idx%2===0 ? category.hint : category.hint2}
              </div>
            </div>
          )}
        </div>

        {/* Streak */}
        {streak>=2 && (
          <div style={{display:"flex",alignItems:"center",gap:6,
            background:T.surface,borderRadius:50,padding:"6px 18px",
            color:"white",fontWeight:800,fontSize:"clamp(12px,2vw,15px)"}}>
            🔥 Streak: {streak}
          </div>
        )}
      </div>

      {/* End game */}
      <div style={{padding:"clamp(10px,2vw,20px) clamp(16px,4vw,28px)"}}>
        <button onClick={()=>onEnd({score,skipped,bestStreak,history,category})}
          style={{width:"100%",background:"none",border:"1.5px solid "+T.surface,
            color:T.gray,borderRadius:50,padding:12,cursor:"pointer",
            fontSize:"clamp(12px,2vw,14px)",fontWeight:700,fontFamily:"inherit",
            transition:"all .15s",
          }}>
          End Game
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — RESULTS
// ═══════════════════════════════════════════════════════════════════════════════
function ResultsScreen({ result, onPlayAgain, onHome }) {
  const { score, skipped, bestStreak, history, category } = result;
  const total = score + skipped;
  const pct = total>0 ? Math.round((score/total)*100) : 0;

  return (
    <div style={{
      minHeight:"100%",background:T.dark,display:"flex",flexDirection:"column",
      fontFamily:"'Nunito',system-ui,sans-serif",position:"relative",overflow:"hidden",
      alignItems:"center",
    }}>
      <Confetti/>
      <style>{`
        @keyframes popIn { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        .pop { animation: popIn 0.6s cubic-bezier(.34,1.56,.64,1) forwards; }
        .fadeUp { animation: fadeUp 0.5s ease forwards; }
        .play-btn { width:100%;padding:18px;background:#2563EB;color:white;border:none;border-radius:50px;
          font-size:clamp(15px,3vw,18px);font-weight:800;cursor:pointer;transition:all .15s;font-family:inherit; }
        .play-btn:hover { background:#1D4ED8; }
        .end-btn  { width:100%;padding:16px;background:none;color:#2563EB;border:2px solid #2563EB;
          border-radius:50px;font-size:clamp(14px,3vw,17px);font-weight:800;cursor:pointer;
          transition:all .15s;font-family:inherit;margin-top:10px; }
        .end-btn:hover { background:#EFF6FF; }
      `}</style>

      <div style={{
        position:"relative",zIndex:1,
        width:"100%",maxWidth:640,
        padding:"clamp(24px,5vw,48px) clamp(16px,4vw,40px)",
        display:"flex",flexDirection:"column",alignItems:"center",gap:"clamp(16px,3vw,28px)",
      }}>
        {/* Badge */}
        <div style={{fontSize:"clamp(48px,12vw,88px)"}} className="pop">🎉</div>

        <div className="fadeUp" style={{animationDelay:"0.2s",textAlign:"center"}}>
          <h2 style={{color:"white",fontWeight:900,fontSize:"clamp(26px,6vw,48px)",margin:0,lineHeight:1}}>
            {pct>=80?"Amazing!":pct>=60?"Great Job!":pct>=40?"Nice Try!":"Keep Practicing!"}
          </h2>
          <p style={{color:T.gray,fontSize:"clamp(13px,2.5vw,16px)",margin:"6px 0 0"}}>
            You guessed <strong style={{color:"white"}}>{score}</strong> out of <strong style={{color:"white"}}>{total}</strong> words
          </p>
        </div>

        {/* Stats row */}
        <div className="fadeUp" style={{
          animationDelay:"0.35s",
          display:"grid",gridTemplateColumns:"repeat(3,1fr)",
          gap:"clamp(8px,2vw,16px)",width:"100%",
        }}>
          {[
            { icon:"✅", val:score,       label:"Correct" },
            { icon:"🔥", val:bestStreak,  label:"Best Streak" },
            { icon:"⏭️", val:skipped,     label:"Skipped" },
          ].map(s=>(
            <div key={s.label} style={{
              background:T.surface,borderRadius:20,padding:"clamp(12px,3vw,20px)",
              textAlign:"center",
            }}>
              <div style={{fontSize:"clamp(20px,5vw,32px)",marginBottom:4}}>{s.icon}</div>
              <div style={{color:"white",fontWeight:900,fontSize:"clamp(22px,5vw,40px)",lineHeight:1}}>{s.val}</div>
              <div style={{color:T.gray,fontSize:"clamp(10px,2vw,13px)",marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Accuracy bar */}
        <div className="fadeUp" style={{width:"100%",animationDelay:"0.5s"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{color:T.gray,fontSize:"clamp(11px,2vw,13px)",fontWeight:700}}>Accuracy</span>
            <span style={{color:"white",fontWeight:800,fontSize:"clamp(11px,2vw,13px)"}}>{pct}%</span>
          </div>
          <div style={{height:10,background:T.surface,borderRadius:10}}>
            <div style={{
              height:"100%",borderRadius:10,
              background: pct>=60?T.green:pct>=40?"#F59E0B":T.red,
              width:`${pct}%`,transition:"width 1s ease",
            }}/>
          </div>
        </div>

        {/* Word history */}
        {history.length>0 && (
          <div className="fadeUp" style={{width:"100%",animationDelay:"0.6s"}}>
            <p style={{color:T.gray,fontSize:"clamp(10px,2vw,12px)",fontWeight:700,
              textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 10px"}}>Round history</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {history.map((h,i)=>(
                <span key={i} style={{
                  padding:"4px 12px",borderRadius:50,fontSize:"clamp(10px,1.8vw,12px)",fontWeight:700,
                  background:h.correct?"#16503020":"#EF444420",
                  color:h.correct?T.green:T.red,
                  border:`1px solid ${h.correct?T.green:T.red}40`,
                }}>
                  {h.correct?"✓":"✗"} {h.word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="fadeUp" style={{width:"100%",animationDelay:"0.7s"}}>
          <button className="play-btn" onClick={onPlayAgain}>▶ Play Again</button>
          <button className="end-btn" onClick={onHome}>🏠 Home</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOW TO PLAY MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function HowToPlayScreen({ onBack }) {
  return (
    <div style={{minHeight:"100%",background:"white",display:"flex",flexDirection:"column",fontFamily:"'Nunito',system-ui,sans-serif"}}>
      <div style={{display:"flex",alignItems:"center",padding:"16px clamp(16px,4vw,32px)",borderBottom:"1.5px solid #E2E8F0",gap:16}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:T.blue,fontWeight:700,fontFamily:"inherit"}}>
          ‹ Back
        </button>
        <h2 style={{flex:1,textAlign:"center",margin:0,fontSize:"clamp(16px,3vw,22px)",fontWeight:900,color:"#0F172A"}}>How to Play</h2>
        <div style={{width:60}}/>
      </div>
      <div style={{flex:1,padding:"clamp(20px,5vw,48px) clamp(16px,4vw,40px)",overflowY:"auto"}}>
        <div style={{maxWidth:640,margin:"0 auto",display:"flex",flexDirection:"column",gap:20}}>
          {[
            { n:"01", icon:"📱", title:"Hold it up",     bg:"#EFF6FF", accent:T.blue,
              desc:"Place your phone on your forehead so the screen faces outward. Your friends can see the word but you can't!" },
            { n:"02", icon:"💬", title:"Get clues",      bg:"#F0FDF4", accent:T.green,
              desc:"Your friends give you verbal hints, act it out, or describe the word — but they can't say the word itself!" },
            { n:"03", icon:"⚡", title:"Hold to confirm", bg:"#FFF7ED", accent:"#F59E0B",
              desc:"When you guess correctly, hold the green CORRECT button for 1 second. Hold the red SKIP button to pass." },
            { n:"04", icon:"🏆", title:"Score big",      bg:"#FDF4FF", accent:T.purple,
              desc:"You have 60 seconds per round. Build streaks for bonus fun! The more you guess, the higher your score." },
          ].map(s=>(
            <div key={s.n} style={{
              background:s.bg,borderRadius:20,padding:"clamp(16px,3vw,24px)",
              display:"flex",gap:16,alignItems:"flex-start",
            }}>
              <div style={{
                width:48,height:48,borderRadius:14,background:s.accent,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:24,flexShrink:0,
              }}>{s.icon}</div>
              <div>
                <div style={{fontWeight:900,fontSize:"clamp(14px,2.5vw,17px)",color:"#0F172A",marginBottom:6}}>{s.title}</div>
                <div style={{color:"#475569",fontSize:"clamp(12px,2vw,14px)",lineHeight:1.6}}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("home");   // home | pack | category | game | results | howto
  const [pack, setPack] = useState(null);
  const [category, setCategory] = useState(null);
  const [result, setResult] = useState(null);

  return (
    <div style={{
      width:"100%",minHeight:"100vh",
      fontFamily:"'Nunito',system-ui,sans-serif",
      display:"flex",flexDirection:"column",
    }}>
      {screen==="home" && (
        <HomeScreen
          onStart={()=>setScreen("pack")}
          onHowToPlay={()=>setScreen("howto")}
        />
      )}
      {screen==="howto" && (
        <HowToPlayScreen onBack={()=>setScreen("home")}/>
      )}
      {screen==="pack" && (
        <SelectPackScreen
          onBack={()=>setScreen("home")}
          onNext={p=>{ setPack(p); setScreen("category"); }}
        />
      )}
      {screen==="category" && (
        <SelectCategoryScreen
          pack={pack}
          onBack={()=>setScreen("pack")}
          onStart={c=>{ setCategory(c); setScreen("game"); }}
        />
      )}
      {screen==="game" && category && (
        <GameScreen
          category={category}
          onEnd={r=>{ setResult(r); setScreen("results"); }}
        />
      )}
      {screen==="results" && result && (
        <ResultsScreen
          result={result}
          onPlayAgain={()=>{ setScreen("game"); setCategory({...category}); }}
          onHome={()=>{ setScreen("home"); setResult(null); }}
        />
      )}
    </div>
  );
}
