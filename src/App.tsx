import { useState, useRef, useEffect } from "react";
import {
  Home, BookMarked, Zap, CalendarDays, UserCircle2,
  ChevronRight, Plus, Check, Target, BookOpen,
  Sparkles, Star, FolderOpen, FileText, Pencil,
  ChevronLeft, Trash2, Award, CheckSquare, Layers, Camera
} from "lucide-react";

/* ─── FONTS ─────────────────────────────────────────────── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    body { background:#EAE4D8; font-family:'Plus Jakarta Sans',sans-serif; }
    .fd { font-family:'Bricolage Grotesque',sans-serif; }
    ::-webkit-scrollbar { width:0; }
    input, textarea { font-family:'Plus Jakarta Sans',sans-serif; }
    @keyframes flyIn {
      from { opacity:0; transform:scale(0.88) translateY(20px); }
      to   { opacity:1; transform:scale(1) translateY(0); }
    }
    .fly-in { animation: flyIn .26s cubic-bezier(.34,1.56,.64,1) forwards; }
  `}</style>
);

/* ─── TOKENS ─────────────────────────────────────────────── */
const T = {
  bg:"#EAE4D8", surf:"#FDFCF9", green:"#0B3D28",
  yellow:"#EDD800", sage:"#A8D4BC", peach:"#F6B89A",
  lav:"#C8B8FF", sky:"#8DCFF5", text:"#1A1A1A",
  muted:"#9CA3AF", border:"#E8E2D6", red:"#E05C5C",
};
const GRP_COLORS = [T.sage, T.peach, T.lav, T.sky, "#FFD6A5", "#F9C5D1"];

/* ─── REAL-TIME DATE ─────────────────────────────────────── */
const NOW    = new Date();
const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MSHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt    = (d = new Date()) => `${d.getDate()} ${MSHORT[d.getMonth()]}`;
const TODAY  = fmt(NOW);
const HERO_DATE  = `${DAYS[NOW.getDay()].slice(0,3)} · ${fmt(NOW)} ${NOW.getFullYear()}`;
const SCHED_DATE = `${DAYS[NOW.getDay()]}, ${NOW.getDate()} ${MONTHS[NOW.getMonth()]} ${NOW.getFullYear()}`;

/* ─── INITIAL DATA ───────────────────────────────────────── */
const INIT = {
  groups: [
    { id:1, name:"Belajar HTML",       emoji:"🌐", color:T.sage,
      notes:[
        { id:101, title:"HTML Part 1", body:"Tag dasar: html, head, body, p, h1–h6. Semantic: article, section, nav.", date:TODAY },
        { id:102, title:"HTML Part 2", body:"Form: input, textarea, button. Atribut: action, method, placeholder.",   date:TODAY },
      ]},
    { id:2, name:"Belajar CSS", emoji:"🎨", color:T.peach,
      notes:[
        { id:201, title:"Flexbox",  body:"justify-content, align-items, flex-direction, flex-wrap, gap.",   date:"17 May" },
        { id:202, title:"CSS Grid", body:"grid-template-columns, grid-template-rows, place-items, gap.",    date:"16 May" },
      ]},
    { id:3, name:"Belajar JavaScript", emoji:"⚡", color:T.lav,
      notes:[
        { id:301, title:"Array Methods", body:"map, filter, reduce, forEach, find, some, every.", date:"15 May" },
      ]},
  ],
  general:[
    { id:10, title:"Ilmu Baru Hari Ini", body:"async/await adalah syntactic sugar di atas Promise. Event loop JS itu single-threaded tapi non-blocking.", date:TODAY },
    { id:11, title:"Motivasi",           body:"30 menit per hari selama setahun = 182 jam. Konsistensi mengalahkan intensitas.",                          date:"17 May" },
  ],
  learned:[
    { id:1, text:"Memahami semantic HTML dan pentingnya buat aksesibilitas",       date:TODAY    },
    { id:2, text:"Git commit message yang baik: imperative mood, max 72 karakter", date:TODAY    },
    { id:3, text:"Feynman Technique: jelaskan konsep seolah ke anak kecil",        date:TODAY    },
    { id:4, text:"Async/await dan hubungannya dengan Promise chain",               date:"17 May" },
    { id:5, text:"CSS specificity: inline > id > class > element",                date:"16 May" },
    { id:6, text:"Array methods map, filter, reduce dengan contoh nyata",          date:"15 May" },
  ],
  targets:[
    { id:1, title:"Baca 10 halaman buku",    done:true  },
    { id:2, title:"Latihan coding 1 jam",    done:true  },
    { id:3, title:"Review catatan kemarin",  done:false },
    { id:4, title:"Tulis 1 insight baru",    done:false },
    { id:5, title:"Nonton 1 video tutorial", done:false },
  ],
  schedule:[
    { id:1, time:"06:00", title:"Morning Routine",  desc:"Olahraga & meditasi",          color:T.sage,    done:true  },
    { id:2, time:"07:30", title:"Baca Buku",        desc:"Atomic Habits – Bab 5",         color:"#FFD6A5", done:true  },
    { id:3, time:"09:00", title:"Belajar HTML/CSS", desc:"Lanjut materi Flexbox & Grid",  color:T.peach,   done:false },
    { id:4, time:"12:00", title:"Break & Makan",    desc:"Istirahat penuh, no gadget",    color:T.sky,     done:false },
    { id:5, time:"13:00", title:"Latihan Project",  desc:"Build landing page",            color:T.sage,    done:false },
    { id:6, time:"16:00", title:"Review & Catat",   desc:"Tulis semua insight hari ini",  color:T.yellow,  done:false },
    { id:7, time:"20:00", title:"Free Learning",    desc:"YouTube / Podcast tech",        color:T.lav,     done:false },
  ],
};

/* ─── SWIPE ACTIONS (right=delete, left=edit) ────────────── */
const SwipeActions = ({ onDelete, onEdit, children, radius = 0 }) => {
  const [dx, setDx]   = useState(0);
  const dragging      = useRef(false);
  const startX        = useRef(0);
  const THR           = 76;

  const onTS = e => { dragging.current = true; startX.current = e.touches[0].clientX; };
  const onTM = e => {
    if (!dragging.current) return;
    const d = e.touches[0].clientX - startX.current;
    setDx(Math.max(-(THR + 8), Math.min(THR + 8, d)));
  };
  const onTE = () => {
    dragging.current = false;
    if (dx >=  THR * 0.72) onDelete?.();
    if (dx <= -THR * 0.72) onEdit?.();
    setDx(0);
  };

  const dp = Math.min(Math.max( dx, 0) / THR, 1); // delete progress
  const ep = Math.min(Math.max(-dx, 0) / THR, 1); // edit progress

  return (
    <div style={{ position:"relative", overflow:"hidden", borderRadius:radius }}>
      {/* DELETE bg — left side, right swipe */}
      {dx > 0 && (
        <div style={{
          position:"absolute", inset:0, borderRadius:radius,
          background:`rgb(${Math.round(224-dp*20)},${Math.round(92-dp*10)},${Math.round(92-dp*10)})`,
          display:"flex", alignItems:"center", paddingLeft: Math.max(dx * 0.38, 10),
        }}>
          <div style={{ width:42, height:42, borderRadius:"50%", background:"rgba(255,255,255,.18)",
            display:"flex", alignItems:"center", justifyContent:"center",
            transform:`scale(${0.3+dp*0.7})`, opacity:Math.min(dx/18,1) }}>
            <Trash2 size={19} color="white" strokeWidth={2.2}/>
          </div>
        </div>
      )}
      {/* EDIT bg — right side, left swipe */}
      {dx < 0 && (
        <div style={{
          position:"absolute", inset:0, borderRadius:radius,
          background:`rgb(${Math.round(11+ep*30)},${Math.round(100+ep*30)},${Math.round(60+ep*20)})`,
          display:"flex", alignItems:"center", justifyContent:"flex-end",
          paddingRight: Math.max(-dx * 0.38, 10),
        }}>
          <div style={{ width:42, height:42, borderRadius:"50%", background:"rgba(255,255,255,.18)",
            display:"flex", alignItems:"center", justifyContent:"center",
            transform:`scale(${0.3+ep*0.7})`, opacity:Math.min(-dx/18,1) }}>
            <Pencil size={17} color="white" strokeWidth={2.2}/>
          </div>
        </div>
      )}
      {/* draggable content */}
      <div onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
        style={{ transform:`translateX(${dx}px)`,
          transition:dragging.current?"none":"transform .35s cubic-bezier(.34,1.4,.64,1)",
          position:"relative", zIndex:1 }}>
        {children}
      </div>
    </div>
  );
};

/* ─── FLOATING CARD ──────────────────────────────────────── */
const Card = ({ children, bg=T.surf, style={}, onClick, p=24 }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:bg, borderRadius:24, overflow:"hidden", padding:p,
        transition:"transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s ease",
        transform:hov?"translateY(-5px)":"translateY(0)",
        boxShadow:hov
          ?"0 20px 52px rgba(11,61,40,.16),0 4px 14px rgba(0,0,0,.08)"
          :"0 4px 20px rgba(11,61,40,.09),0 1px 4px rgba(0,0,0,.04)",
        cursor:onClick?"pointer":"default", ...style }}>
      {children}
    </div>
  );
};

/* ─── ICON BADGE ─────────────────────────────────────────── */
const IB = ({ icon:I, bg, color, sz=16, p=9 }) => (
  <div style={{ background:bg, borderRadius:999, flexShrink:0, width:sz+p*2, height:sz+p*2,
    display:"flex", alignItems:"center", justifyContent:"center" }}>
    <I size={sz} color={color} strokeWidth={2.2}/>
  </div>
);

/* ─── NAV ITEM ───────────────────────────────────────────── */
const NavItem = ({ icon:I, label, active, onClick }) => (
  <button onClick={onClick} style={{ display:"flex", flexDirection:"column", alignItems:"center",
    gap:3, padding:"4px 4px", border:"none", background:"none", cursor:"pointer" }}>
    <div style={{ display:"flex", alignItems:"center", gap:active?6:0,
      background:active?T.green:"transparent",
      padding:active?"7px 16px":"7px 10px", borderRadius:999,
      transition:"all .28s cubic-bezier(.34,1.56,.64,1)", overflow:"hidden", maxWidth:active?130:44 }}>
      <I size={18} color={active?T.yellow:"#BBBBBB"} strokeWidth={active?2.5:1.8}/>
      {active&&<span style={{ color:T.yellow, fontSize:11, fontWeight:800, whiteSpace:"nowrap", letterSpacing:".04em" }}>{label}</span>}
    </div>
  </button>
);

/* ─── MODAL ──────────────────────────────────────────────── */
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)",
      display:"flex", alignItems:"flex-end", zIndex:100 }} onClick={onClose}>
      <div style={{ background:T.surf, width:"100%", maxWidth:640, margin:"0 auto",
        borderRadius:"28px 28px 0 0", padding:"28px 24px 44px",
        boxShadow:"0 -8px 40px rgba(0,0,0,.14)", maxHeight:"85vh", overflowY:"auto" }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ width:40, height:4, background:T.border, borderRadius:99, margin:"0 auto 22px" }}/>
        <p className="fd" style={{ fontSize:20, fontWeight:800, color:T.green, marginBottom:20 }}>{title}</p>
        {children}
      </div>
    </div>
  );
};

/* ─── FORM PRIMITIVES ────────────────────────────────────── */
const Inp = ({ ph, val, chg, style={} }) => (
  <input placeholder={ph} value={val} onChange={chg}
    style={{ width:"100%", border:`1.5px solid ${T.border}`, borderRadius:14,
      padding:"13px 16px", fontSize:14, color:T.text, outline:"none",
      background:T.surf, transition:"border .15s", ...style }}
    onFocus={e=>{ e.target.style.borderColor=T.green; e.target.select(); }}
    onBlur={e=>e.target.style.borderColor=T.border}/>
);
const Txt = ({ ph, val, chg }) => (
  <textarea placeholder={ph} value={val} onChange={chg} rows={4}
    style={{ width:"100%", border:`1.5px solid ${T.border}`, borderRadius:14,
      padding:"13px 16px", fontSize:14, color:T.text, outline:"none",
      background:T.surf, resize:"none", lineHeight:1.6 }}
    onFocus={e=>e.target.style.borderColor=T.green}
    onBlur={e=>e.target.style.borderColor=T.border}/>
);
const BtnRow = ({ onCancel, onSave, label="Save" }) => (
  <div style={{ display:"flex", gap:12, marginTop:20 }}>
    <button onClick={onCancel} style={{ flex:1, border:`1.5px solid ${T.border}`, borderRadius:14,
      padding:"13px 0", fontSize:14, fontWeight:700, color:T.muted, background:"none", cursor:"pointer" }}>Cancel</button>
    <button onClick={onSave} style={{ flex:1, background:T.green, border:"none", borderRadius:14,
      padding:"13px 0", fontSize:14, fontWeight:800, color:"white", cursor:"pointer" }}>{label}</button>
  </div>
);

/* ─── FLYING CARD PREVIEW OVERLAY ───────────────────────── */
const PreviewOverlay = ({ preview, onClose }) => {
  if (!preview) return null;
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:300,
      background:"rgba(0,0,0,.55)",
      backdropFilter:"blur(7px)", WebkitBackdropFilter:"blur(7px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"24px 16px",
    }}>
      <div className="fly-in" onClick={e => e.stopPropagation()} style={{
        background:T.surf, borderRadius:28, padding:28,
        width:"100%", maxWidth:520, maxHeight:"78vh", overflowY:"auto",
        boxShadow:"0 28px 80px rgba(0,0,0,.35), 0 4px 20px rgba(0,0,0,.12)",
      }}>
        {/* Header row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
          <div style={{ flex:1, paddingRight:12 }}>
            {preview.type==="note" && (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:preview.color||T.sage }}/>
                  <span style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:".08em" }}>{preview.groupName||"Note"}</span>
                </div>
                <p className="fd" style={{ fontSize:22, fontWeight:800, color:T.green, lineHeight:1.2 }}>{preview.title}</p>
              </>
            )}
            {preview.type==="general" && (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:T.lav }}/>
                  <span style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:".08em" }}>General Note</span>
                </div>
                <p className="fd" style={{ fontSize:22, fontWeight:800, color:T.green, lineHeight:1.2 }}>{preview.title}</p>
              </>
            )}
            {preview.type==="learned" && (
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#4DBF8A" }}/>
                <span style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:".08em" }}>Learning Insight</span>
              </div>
            )}
          </div>
          {/* Close button */}
          <button onClick={onClose} style={{
            width:34, height:34, borderRadius:"50%",
            background:T.bg, border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
            fontSize:20, color:T.muted, lineHeight:1, fontWeight:300,
          }}>×</button>
        </div>

        {/* Body */}
        {(preview.type==="note"||preview.type==="general") && (
          <>
            <p style={{ fontSize:14, color:"#444", lineHeight:1.85, marginBottom:20 }}>{preview.body||"(no content)"}</p>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              paddingTop:16, borderTop:`1px solid ${T.border}` }}>
              <span style={{ fontSize:12, color:T.muted, fontWeight:600 }}>{preview.date}</span>
            </div>
          </>
        )}
        {preview.type==="learned" && (
          <>
            <p style={{ fontSize:16, color:T.text, lineHeight:1.85, marginBottom:20, marginTop:12 }}>{preview.text}</p>
            <div style={{ paddingTop:16, borderTop:`1px solid ${T.border}` }}>
              <span style={{ fontSize:12, color:T.muted, fontWeight:600 }}>{preview.date}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── CARD CORNER DELETE BTN ─────────────────────────────── */
// Sits flush in the top-right corner, border-radius mirrors the card corner
const UNUSED_CardDelBtn = ({ onDelete }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={e => { e.stopPropagation(); onDelete(); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position:"absolute", top:0, right:0,
        width:40, height:40,
        // top-left:0  top-right matches card corner (20px)
        // bottom-right:0  bottom-left: soft diagonal curve
        borderRadius:"0 20px 0 18px",
        background: hov ? "rgba(224,92,92,.80)" : "rgba(0,0,0,.16)",
        border:"none",
        display:"flex", alignItems:"center", justifyContent:"center",
        cursor:"pointer", zIndex:2,
        transition:"background .18s ease",
      }}>
      <Trash2 size={14} color="rgba(255,255,255,.92)" strokeWidth={2.2}/>
    </button>
  );
};

/* ─── SECTION HEADER ─────────────────────────────────────── */
const SHdr = ({ icon:I, ibg, icol, title, btnLabel, onBtn }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <IB icon={I} bg={ibg} color={icol} sz={15} p={7}/>
      <span className="fd" style={{ fontSize:16, fontWeight:800, color:T.green }}>{title}</span>
    </div>
    {btnLabel&&(
      <button onClick={onBtn} style={{ display:"flex", alignItems:"center", gap:5,
        background:T.green, border:"none", borderRadius:999,
        padding:"7px 14px", cursor:"pointer", color:"white", fontSize:12, fontWeight:800 }}>
        <Plus size={13}/>{btnLabel}
      </button>
    )}
  </div>
);

/* ─── HERO WRAPPER ───────────────────────────────────────── */
const Hero = ({ children, pt=52 }) => (
  <div style={{ background:T.green, borderRadius:"0 0 40px 40px",
    padding:`${pt}px 24px 28px`, position:"relative", overflow:"hidden" }}>
    <div style={{ position:"absolute", inset:0, opacity:.04,
      backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
      backgroundSize:"28px 28px" }}/>
    <div style={{ position:"absolute", top:-60, right:-50, width:200, height:200, borderRadius:"50%",
      background:"radial-gradient(circle,#EDD80022 0%,transparent 70%)" }}/>
    <div style={{ position:"relative", maxWidth:640, margin:"0 auto" }}>{children}</div>
  </div>
);

/* ─── DATE SORT HELPER ───────────────────────────────────── */
const dateScore = s => {
  const [d, m] = s.split(" ");
  return MSHORT.indexOf(m) * 31 + parseInt(d);
};

/* ─── LOCALSTORAGE HELPERS ───────────────────────────────── */
const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

/* ═══════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [tab, setTab]           = useState("home");
  const [data, setData]         = useState(() => load("lum_data", INIT));
  const [userName, setUserName] = useState(() => load("lum_name", "Maul"));
  const [avatar, setAvatar]     = useState(() => load("lum_avatar", { type:"initial", value:"" }));
  const fileRef                 = useRef(null);
  const [noteView, setNoteView] = useState(null);

  /* persist to localStorage on every change */
  useEffect(() => { save("lum_data",   data);     }, [data]);
  useEffect(() => { save("lum_name",   userName); }, [userName]);
  useEffect(() => { save("lum_avatar", avatar);   }, [avatar]);  // null | "general" | groupId(number)
  const [modal, setModal]       = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [preview, setPreview]       = useState(null);
  const [gid, setGid]               = useState(null);    // group id for addNote
  const [f, setF]             = useState({ title:"", body:"", emoji:"", name:"", learn:"", target:"", time:"", stitle:"", sdesc:"", newName:"" });
  const up = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const close = () => setModal(null);

  /* derived */
  const done         = data.targets.filter(t => t.done).length;
  const total        = data.targets.length;
  const pct          = Math.round((done / total) * 100);
  const allNotes     = data.general.length + data.groups.reduce((s, g) => s + g.notes.length, 0);
  const todayLearned = data.learned.filter(l => l.date === TODAY);

  /* ── mutations ── */
  const toggleTarget = id => setData(p => ({ ...p, targets: p.targets.map(t => t.id===id?{...t,done:!t.done}:t) }));
  const toggleSched  = id => setData(p => ({ ...p, schedule: p.schedule.map(s => s.id===id?{...s,done:!s.done}:s) }));

  const delGroup   = id      => setData(p => ({ ...p, groups:   p.groups.filter(g => g.id!==id) }));
  const delNote    = (gi,ni) => setData(p => ({ ...p, groups:   p.groups.map(g => g.id===gi?{...g,notes:g.notes.filter(n=>n.id!==ni)}:g) }));
  const delGeneral = id      => setData(p => ({ ...p, general:  p.general.filter(n => n.id!==id) }));
  const delLearned = id      => setData(p => ({ ...p, learned:  p.learned.filter(l => l.id!==id) }));
  const delTarget  = id      => setData(p => ({ ...p, targets:  p.targets.filter(t => t.id!==id) }));
  const delSched   = id      => setData(p => ({ ...p, schedule: p.schedule.filter(s => s.id!==id) }));

  const addGroup = () => {
    if (!f.name.trim()) return;
    setData(p => ({ ...p, groups: [...p.groups, { id:Date.now(), name:f.name,
      emoji: f.emoji.trim() || "📝",
      color: GRP_COLORS[p.groups.length % GRP_COLORS.length], notes:[] }] }));
    setF(p => ({ ...p, name:"", emoji:"" }));
    close();
  };
  const addNote = gId => {
    if (!f.title.trim()) return;
    const n = { id:Date.now(), title:f.title, body:f.body, date:TODAY };
    if (gId) setData(p => ({ ...p, groups: p.groups.map(g => g.id===gId?{...g,notes:[...g.notes,n]}:g) }));
    else     setData(p => ({ ...p, general: [...p.general, n] }));
    setF(p => ({ ...p, title:"", body:"" }));
    close();
  };
  const addLearn = () => {
    if (!f.learn.trim()) return;
    setData(p => ({ ...p, learned: [{ id:Date.now(), text:f.learn, date:TODAY }, ...p.learned] }));
    setF(p => ({ ...p, learn:"" }));
    close();
  };
  const addTarget = () => {
    if (!f.target.trim()) return;
    setData(p => ({ ...p, targets: [...p.targets, { id:Date.now(), title:f.target, done:false }] }));
    setF(p => ({ ...p, target:"" }));
    close();
  };
  const addSched = () => {
    if (!f.stitle.trim() || !f.time.trim()) return;
    setData(p => ({ ...p, schedule: [...p.schedule,
      { id:Date.now(), time:f.time, title:f.stitle, desc:f.sdesc, color:T.lav, done:false }
    ].sort((a,b) => a.time.localeCompare(b.time)) }));
    setF(p => ({ ...p, stitle:"", sdesc:"", time:"" }));
    close();
  };
  const saveName = () => {
    if (!f.newName.trim()) return;
    setUserName(f.newName.trim());
    setF(p => ({ ...p, newName:"" }));
    close();
  };

  /* ── edit handlers ── */
  const closeEdit = () => setEditTarget(null);
  const upEdit = k => e => setEditTarget(p => ({ ...p, [k]: e.target.value }));

  const saveEdit = () => {
    if (!editTarget) return;
    const { type, id } = editTarget;
    if (type==="learned") {
      if (!editTarget.text?.trim()) return;
      setData(p => ({ ...p, learned: p.learned.map(l => l.id===id ? {...l, text:editTarget.text} : l) }));
    } else if (type==="target") {
      if (!editTarget.title?.trim()) return;
      setData(p => ({ ...p, targets: p.targets.map(t => t.id===id ? {...t, title:editTarget.title} : t) }));
    } else if (type==="note-group") {
      if (!editTarget.title?.trim()) return;
      setData(p => ({ ...p, groups: p.groups.map(g => g.id===editTarget.gid
        ? { ...g, notes: g.notes.map(n => n.id===id ? {...n, title:editTarget.title, body:editTarget.body} : n) }
        : g) }));
    } else if (type==="note-general") {
      if (!editTarget.title?.trim()) return;
      setData(p => ({ ...p, general: p.general.map(n => n.id===id ? {...n, title:editTarget.title, body:editTarget.body} : n) }));
    } else if (type==="sched") {
      if (!editTarget.title?.trim()) return;
      setData(p => ({ ...p, schedule: p.schedule
        .map(s => s.id===id ? {...s, time:editTarget.time, title:editTarget.title, desc:editTarget.desc} : s)
        .sort((a,b) => a.time.localeCompare(b.time)) }));
    }
    closeEdit();
  };

  /* ── edit modal (unified) ── */
  const EditModal = () => {
    if (!editTarget) return null;
    const { type } = editTarget;
    const titles = { learned:"Edit Insight", target:"Edit Target", "note-group":"Edit Note", "note-general":"Edit Note", sched:"Edit Activity" };
    return (
      <Modal show={true} onClose={closeEdit} title={titles[type] || "Edit"}>
        {type==="learned" && (
          <Txt ph="Insight..." val={editTarget.text||""} chg={upEdit("text")}/>
        )}
        {(type==="note-group"||type==="note-general") && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Inp ph="Title..." val={editTarget.title||""} chg={upEdit("title")}/>
            <Txt ph="Content..." val={editTarget.body||""} chg={upEdit("body")}/>
          </div>
        )}
        {type==="target" && (
          <Inp ph="Target..." val={editTarget.title||""} chg={upEdit("title")}/>
        )}
        {type==="sched" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Inp ph="Time (e.g. 08:00)" val={editTarget.time||""} chg={upEdit("time")}/>
            <Inp ph="Activity title..." val={editTarget.title||""} chg={upEdit("title")}/>
            <Inp ph="Description..." val={editTarget.desc||""} chg={upEdit("desc")}/>
          </div>
        )}
        <BtnRow onCancel={closeEdit} onSave={saveEdit} label="Save Changes"/>
      </Modal>
    );
  };

  const navs = [
    { id:"home",     Icon:Home,         label:"Home"     },
    { id:"notes",    Icon:BookMarked,   label:"Notes"    },
    { id:"learn",    Icon:Zap,          label:"Learn"    },
    { id:"schedule", Icon:CalendarDays, label:"Schedule" },
    { id:"profile",  Icon:UserCircle2,  label:"Me"       },
  ];

  /* ══════════════════════════════════════════════════════════
     HOME
  ══════════════════════════════════════════════════════════ */
  const HomeScreen = () => (
    <div style={{ flex:1, overflowY:"auto" }}>
      <Hero>
        <div style={{ display:"inline-flex", alignItems:"center", gap:7,
          background:"rgba(255,255,255,.1)", borderRadius:999, padding:"4px 14px", marginBottom:18,
          border:"1px solid rgba(255,255,255,.12)" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#4DBF8A",
            boxShadow:"0 0 6px #4DBF8A", display:"inline-block" }}/>
          <span style={{ color:"#A8D4BC", fontSize:11, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase" }}>{HERO_DATE}</span>
        </div>
        <h1 className="fd" style={{ color:"white", fontSize:44, fontWeight:800, lineHeight:1.0, letterSpacing:"-.03em", marginBottom:20 }}>
          DAILY<br/><span style={{ color:T.yellow }}>SNAP</span>SHOT
        </h1>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {[
            { I:BookOpen,   v:`${allNotes} notes`,              bg:"rgba(168,212,188,.18)", c:"#A8D4BC" },
            { I:Target,     v:`${done}/${total} targets`,       bg:"rgba(237,216,0,.15)",   c:T.yellow  },
            { I:Sparkles,   v:`${todayLearned.length} insights`,bg:"rgba(200,184,255,.18)", c:T.lav     },
          ].map(({ I,v,bg,c }) => (
            <div key={v} style={{ display:"flex", alignItems:"center", gap:6,
              background:bg, borderRadius:999, padding:"5px 11px 5px 9px", border:`1px solid ${c}35` }}>
              <I size={12} color={c} strokeWidth={2.2}/><span style={{ color:c, fontSize:11, fontWeight:700 }}>{v}</span>
            </div>
          ))}
        </div>
      </Hero>

      <div style={{ padding:"20px 16px", maxWidth:640, margin:"0 auto", display:"flex", flexDirection:"column", gap:14 }}>
        {/* Arc progress */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p className="fd" style={{ fontSize:17, fontWeight:800, color:T.green, marginBottom:3 }}>Daily Progress</p>
              <p style={{ fontSize:12, color:T.muted }}>{pct}% of your goals today</p>
            </div>
            <div style={{ background:pct===100?T.yellow:"#F0EAE0", borderRadius:999, padding:"5px 14px" }}>
              <span className="fd" style={{ fontSize:13, fontWeight:800, color:T.green }}>{done}/{total}</span>
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"center", marginTop:8 }}>
            <svg viewBox="0 0 220 124" width="210" height="116">
              {[
                { r:88, sw:14, bg:"#E6E0D4", fg:"#4DBF8A", p:pct },
                { r:70, sw:11, bg:"#E6E0D4", fg:T.yellow,  p:Math.min(pct+14,100) },
                { r:54, sw:9,  bg:"#E6E0D4", fg:T.lav,     p:pct*0.62 },
              ].map(({ r,sw,bg,fg,p }, i) => {
                const arc = Math.PI * r;
                return (
                  <g key={i}>
                    <path d={`M${110-r} 108 A${r} ${r} 0 0 1 ${110+r} 108`} fill="none" stroke={bg} strokeWidth={sw} strokeLinecap="round"/>
                    <path d={`M${110-r} 108 A${r} ${r} 0 0 1 ${110+r} 108`} fill="none" stroke={fg} strokeWidth={sw} strokeLinecap="round"
                      strokeDasharray={`${(p/100)*arc} ${arc}`}/>
                  </g>
                );
              })}
              <text x="110" y="100" textAnchor="middle"
                style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:30, fill:T.green }}>
                {pct}%
              </text>
            </svg>
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:20 }}>
            {[["#4DBF8A","Overall"],[T.yellow,"Learning"],[T.lav,"Personal"]].map(([c,l]) => (
              <span key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:T.muted }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:c, display:"inline-block" }}/>{l}
              </span>
            ))}
          </div>
        </Card>

        {/* 2-col quick cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Card bg={T.sage} p={20}>
            <IB icon={Sparkles} bg="rgba(11,61,40,.15)" color={T.green} sz={15} p={8}/>
            <p className="fd" style={{ margin:"14px 0 2px", fontSize:38, fontWeight:800, color:T.green, lineHeight:1 }}>
              {todayLearned.length}
            </p>
            <p style={{ fontSize:12, fontWeight:700, color:T.green, opacity:.65 }}>insights<br/>today</p>
            <div style={{ marginTop:14 }}>
              <div style={{ height:4, borderRadius:99, background:T.green, width:`${Math.min(todayLearned.length*22,100)}%`, marginBottom:6 }}/>
              <div style={{ height:4, borderRadius:99, background:T.green, opacity:.12, width:"100%" }}/>
            </div>
          </Card>
          <Card bg={T.green} p={20}>
            <IB icon={Star} bg="rgba(237,216,0,.2)" color={T.yellow} sz={14} p={7}/>
            <p style={{ fontSize:11, fontWeight:800, color:T.yellow, margin:"12px 0 6px", textTransform:"uppercase", letterSpacing:".1em" }}>Maul's Tip</p>
            <p style={{ fontSize:12, color:"rgba(255,255,255,.75)", lineHeight:1.55 }}>Review catatan sebelum tidur buat retensi lebih kuat!</p>
          </Card>
        </div>

        {/* Targets preview */}
        <Card>
          <SHdr icon={Target} ibg="#FFF3C4" icol={T.green} title="Today's Targets"/>
          <div style={{ display:"flex", gap:5, marginBottom:16 }}>
            {data.targets.map(t => (
              <div key={t.id} style={{ flex:1, height:6, borderRadius:99, background:t.done?"#4DBF8A":T.border, transition:"background .3s" }}/>
            ))}
          </div>
          {data.targets.slice(0,3).map((t,i) => (
            <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:i<2?`1px solid ${T.border}`:"none" }}>
              <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                background:t.done?"#4DBF8A":"transparent",
                border:`2.5px solid ${t.done?"#4DBF8A":T.border}` }}>
                {t.done&&<Check size={12} color="white" strokeWidth={3}/>}
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:t.done?T.muted:T.text, textDecoration:t.done?"line-through":"none" }}>{t.title}</span>
            </div>
          ))}
          <button onClick={() => setTab("learn")} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4,
            width:"100%", marginTop:14, background:T.bg, border:"none", borderRadius:12,
            padding:"10px 0", cursor:"pointer", color:T.green, fontSize:13, fontWeight:700 }}>
            See all targets <ChevronRight size={14}/>
          </button>
        </Card>

        {/* Schedule preview */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <IB icon={CalendarDays} bg="#E8DCFF" color="#6B4FBB" sz={15} p={7}/>
              <span className="fd" style={{ fontSize:16, fontWeight:800, color:T.green }}>Today's Schedule</span>
            </div>
            <button onClick={() => setTab("schedule")} style={{ display:"flex", alignItems:"center", gap:3,
              background:"none", border:"none", cursor:"pointer", fontSize:12, fontWeight:700, color:T.green }}>
              See all <ChevronRight size={13}/>
            </button>
          </div>
          {data.schedule.slice(0,3).map((s,i) => (
            <div key={s.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:i<2?`1px solid ${T.border}`:"none" }}>
              <span style={{ fontSize:11, color:T.muted, fontFamily:"monospace", width:38, flexShrink:0, fontWeight:600 }}>{s.time}</span>
              <div style={{ width:10, height:10, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
              <span style={{ flex:1, fontSize:13, fontWeight:600, color:s.done?T.muted:T.text, textDecoration:s.done?"line-through":"none" }}>{s.title}</span>
              {s.done&&<div style={{ background:"#E8F7EF", borderRadius:999, padding:"2px 9px" }}><span style={{ fontSize:11, fontWeight:800, color:"#4DBF8A" }}>Done</span></div>}
            </div>
          ))}
        </Card>
        <div style={{ height:8 }}/>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════
     NOTES
  ══════════════════════════════════════════════════════════ */
  const NotesScreen = () => {
    /* ── group detail ── */
    if (typeof noteView === "number") {
      const grp = data.groups.find(g => g.id === noteView);
      if (!grp) return null;
      return (
        <div style={{ flex:1, overflowY:"auto" }}>
          <Hero pt={48}>
            <button onClick={() => setNoteView(null)} style={{ display:"flex", alignItems:"center", gap:6,
              background:"rgba(255,255,255,.1)", border:"none", borderRadius:999,
              padding:"6px 14px", cursor:"pointer", color:"#A8D4BC", fontSize:12, fontWeight:700, marginBottom:16 }}>
              <ChevronLeft size={14}/> Back
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:16, background:grp.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{grp.emoji}</div>
              <div>
                <h1 className="fd" style={{ color:"white", fontSize:28, fontWeight:800, lineHeight:1.1 }}>{grp.name}</h1>
                <p style={{ color:"#A8D4BC", fontSize:12, marginTop:2 }}>{grp.notes.length} notes</p>
              </div>
            </div>
          </Hero>
          <div style={{ padding:"20px 16px", maxWidth:640, margin:"0 auto", display:"flex", flexDirection:"column", gap:10 }}>
            <button onClick={() => { setGid(grp.id); setModal("addNote"); }}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                background:T.green, border:"none", borderRadius:16, padding:"14px 0",
                cursor:"pointer", color:"white", fontSize:13, fontWeight:800 }}>
              <Plus size={16}/> Add Note
            </button>
            {grp.notes.length===0&&(
              <div style={{ textAlign:"center", padding:"40px 0", color:T.muted }}>
                <FileText size={40} color={T.border} style={{ margin:"0 auto 12px" }}/>
                <p style={{ fontWeight:700, marginBottom:4 }}>No notes yet</p>
                <p style={{ fontSize:13 }}>Tap the button above to add the first note</p>
              </div>
            )}
            {grp.notes.map(n => (
              <SwipeActions key={n.id} onDelete={() => delNote(grp.id, n.id)} onEdit={() => setEditTarget({type:"note-group", id:n.id, gid:grp.id, title:n.title, body:n.body})} radius={20}>
                <Card p={20} style={{ borderRadius:20, boxShadow:"none" }}
                  onClick={() => setPreview({type:"note", ...n, color:grp.color, groupName:grp.name})}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:grp.color, flexShrink:0, marginTop:2 }}/>
                      <p className="fd" style={{ fontSize:16, fontWeight:800, color:T.green }}>{n.title}</p>
                    </div>
                    <span style={{ fontSize:11, color:T.muted, flexShrink:0, marginLeft:8 }}>{n.date}</span>
                  </div>
                  <p style={{ fontSize:13, color:"#555", lineHeight:1.65, paddingLeft:16,
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{n.body}</p>
                </Card>
              </SwipeActions>
            ))}
            <div style={{ height:8 }}/>
          </div>
          <Modal show={modal==="addNote"&&gid===grp.id} onClose={close} title={`New Note — ${grp.name}`}>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <Inp ph="Note title..." val={f.title} chg={up("title")}/>
              <Txt ph="Write your notes here..." val={f.body} chg={up("body")}/>
              <BtnRow onCancel={close} onSave={() => addNote(grp.id)} label="Save Note"/>
            </div>
          </Modal>
        </div>
      );
    }

    /* ── general notes list ── */
    if (noteView === "general") {
      return (
        <div style={{ flex:1, overflowY:"auto" }}>
          <Hero pt={48}>
            <button onClick={() => setNoteView(null)} style={{ display:"flex", alignItems:"center", gap:6,
              background:"rgba(255,255,255,.1)", border:"none", borderRadius:999,
              padding:"6px 14px", cursor:"pointer", color:"#A8D4BC", fontSize:12, fontWeight:700, marginBottom:16 }}>
              <ChevronLeft size={14}/> Back
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:16, background:"rgba(255,255,255,.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <FileText size={22} color="white"/>
              </div>
              <div>
                <h1 className="fd" style={{ color:"white", fontSize:28, fontWeight:800 }}>General Notes</h1>
                <p style={{ color:"#A8D4BC", fontSize:12, marginTop:2 }}>{data.general.length} notes</p>
              </div>
            </div>
          </Hero>
          <div style={{ padding:"20px 16px", maxWidth:640, margin:"0 auto", display:"flex", flexDirection:"column", gap:10 }}>
            <button onClick={() => { setGid(null); setModal("addNote"); }}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                background:T.green, border:"none", borderRadius:16, padding:"14px 0",
                cursor:"pointer", color:"white", fontSize:13, fontWeight:800 }}>
              <Plus size={16}/> Add General Note
            </button>
            {data.general.map(n => (
              <SwipeActions key={n.id} onDelete={() => delGeneral(n.id)} radius={20}
                onEdit={() => setEditTarget({type:"note-general", id:n.id, title:n.title, body:n.body})}>
                <Card p={20} style={{ borderRadius:20, boxShadow:"none" }}
                  onClick={() => setPreview({type:"general", ...n})}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <p className="fd" style={{ fontSize:16, fontWeight:800, color:T.green }}>{n.title}</p>
                    <span style={{ fontSize:11, color:T.muted }}>{n.date}</span>
                  </div>
                  <p style={{ fontSize:13, color:"#555", lineHeight:1.65,
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{n.body}</p>
                </Card>
              </SwipeActions>
            ))}
            <div style={{ height:8 }}/>
          </div>
          <Modal show={modal==="addNote"&&gid===null} onClose={close} title="New General Note">
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <Inp ph="Note title..." val={f.title} chg={up("title")}/>
              <Txt ph="Write your thoughts..." val={f.body} chg={up("body")}/>
              <BtnRow onCancel={close} onSave={() => addNote(null)} label="Save Note"/>
            </div>
          </Modal>
        </div>
      );
    }

    /* ── notes index ── */
    return (
      <div style={{ flex:1, overflowY:"auto" }}>
        <Hero>
          <h1 className="fd" style={{ color:"white", fontSize:40, fontWeight:800, letterSpacing:"-.02em" }}>MY NOTES</h1>
          <p style={{ color:"#A8D4BC", fontSize:12, marginTop:6 }}>{data.groups.length} groups · {allNotes} total notes</p>
        </Hero>
        <div style={{ padding:"20px 16px", maxWidth:640, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>
          {/* groups */}
          <div>
            <SHdr icon={FolderOpen} ibg="rgba(237,216,0,.2)" icol={T.green}
              title="Group Notes" btnLabel="New Group"
              onBtn={() => { setF(p => ({...p, name:"", emoji:""})); setModal("addGroup"); }}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {data.groups.map(g => (
                <SwipeActions key={g.id} onDelete={() => delGroup(g.id)} radius={20}>
                  <Card bg={g.color} p={20} onClick={() => setNoteView(g.id)} style={{ borderRadius:20, boxShadow:"none" }}>
                    <div style={{ fontSize:26, marginBottom:10 }}>{g.emoji}</div>
                    <p className="fd" style={{ fontSize:15, fontWeight:800, color:T.green, lineHeight:1.2, marginBottom:4 }}>{g.name}</p>
                    <p style={{ fontSize:12, color:T.green, opacity:.6 }}>{g.notes.length} notes</p>
                  </Card>
                </SwipeActions>
              ))}
            </div>
          </div>
          {/* general */}
          <div>
            <SHdr icon={FileText} ibg="rgba(11,61,40,.08)" icol={T.green}
              title="General Notes" btnLabel="Add Note"
              onBtn={() => { setGid(null); setModal("addNote"); }}/>
            <Card p={0} onClick={() => setNoteView("general")} style={{ overflow:"hidden" }}>
              <div style={{ padding:"20px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <p className="fd" style={{ fontSize:16, fontWeight:800, color:T.green }}>All General Notes</p>
                  <p style={{ fontSize:12, color:T.muted, marginTop:2 }}>{data.general.length} notes saved</p>
                </div>
                <ChevronRight size={18} color={T.muted}/>
              </div>
              {data.general[0]&&(
                <div style={{ padding:"14px 24px", background:T.bg }}>
                  <p style={{ fontSize:13, fontWeight:700, color:T.green, marginBottom:4 }}>{data.general[0].title}</p>
                  <p style={{ fontSize:12, color:T.muted, lineHeight:1.5,
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {data.general[0].body}
                  </p>
                </div>
              )}
            </Card>
          </div>
          <div style={{ height:8 }}/>
        </div>

        <Modal show={modal==="addGroup"} onClose={close} title="New Note Group">
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", gap:10 }}>
              <Inp ph="📝" val={f.emoji} chg={up("emoji")} style={{ width:64, textAlign:"center", fontSize:22, padding:"13px 6px" }}/>
              <Inp ph="Group name (e.g. Belajar HTML)" val={f.name} chg={up("name")} style={{ flex:1 }}/>
            </div>
            <p style={{ fontSize:12, color:T.muted }}>Tip: type one emoji in the left box, then the group name.</p>
            <BtnRow onCancel={close} onSave={addGroup} label="Create Group"/>
          </div>
        </Modal>
        <Modal show={modal==="addNote"&&gid===null} onClose={close} title="New General Note">
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Inp ph="Note title..." val={f.title} chg={up("title")}/>
            <Txt ph="Write your thoughts..." val={f.body} chg={up("body")}/>
            <BtnRow onCancel={close} onSave={() => addNote(null)} label="Save Note"/>
          </div>
        </Modal>
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════════
     LEARN
  ══════════════════════════════════════════════════════════ */
  const LearnScreen = () => (
    <div style={{ flex:1, overflowY:"auto" }}>
      <Hero>
        <h1 className="fd" style={{ color:"white", fontSize:40, fontWeight:800, letterSpacing:"-.02em" }}>LEARN LOG</h1>
        <p style={{ color:"#A8D4BC", fontSize:12, marginTop:6 }}>Track what you learn every day</p>
      </Hero>
      <div style={{ padding:"20px 16px", maxWidth:640, margin:"0 auto", display:"flex", flexDirection:"column", gap:14 }}>
        {/* What I learned today */}
        <Card>
          <SHdr icon={Sparkles} ibg="rgba(168,212,188,.25)" icol={T.green}
            title="What I Learned Today" btnLabel="Add" onBtn={() => setModal("addLearn")}/>
          {todayLearned.length===0&&(
            <p style={{ fontSize:13, color:T.muted, textAlign:"center", padding:"16px 0" }}>Nothing yet — add your first insight!</p>
          )}
          {todayLearned.map((item, i) => (
            <SwipeActions key={item.id} onDelete={() => delLearned(item.id)}
              onEdit={() => setEditTarget({type:"learned", id:item.id, text:item.text})}>
              <div onClick={() => setPreview({type:"learned", ...item})}
                style={{ display:"flex", gap:12, padding:"10px 0", cursor:"pointer",
                borderBottom:i<todayLearned.length-1?`1px solid ${T.border}`:"none", background:T.surf }}>
                <div style={{ width:26, height:26, borderRadius:"50%", background:T.yellow, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center", marginTop:1 }}>
                  <span className="fd" style={{ fontSize:12, fontWeight:800, color:T.green }}>{i+1}</span>
                </div>
                <p style={{ fontSize:13, color:"#444", lineHeight:1.7,
                  display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{item.text}</p>
              </div>
            </SwipeActions>
          ))}
        </Card>

        {/* Daily targets */}
        <Card>
          <SHdr icon={CheckSquare} ibg="#FFF3C4" icol={T.green}
            title="Daily Targets" btnLabel="Add" onBtn={() => setModal("addTarget")}/>
          <div style={{ background:T.bg, borderRadius:14, padding:"12px 16px", marginBottom:18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:T.green }}>Progress</span>
              <span className="fd" style={{ fontSize:12, fontWeight:800, color:T.green }}>{done}/{total} · {pct}%</span>
            </div>
            <div style={{ background:"white", borderRadius:99, height:10, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:99, background:"#4DBF8A", width:`${pct}%`, transition:"width .5s ease" }}/>
            </div>
          </div>
          {data.targets.map((t, i) => (
            <SwipeActions key={t.id} onDelete={() => delTarget(t.id)}
              onEdit={() => setEditTarget({type:"target", id:t.id, title:t.title})}>
              <div onClick={() => toggleTarget(t.id)}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 0", cursor:"pointer",
                  borderBottom:i<data.targets.length-1?`1px solid ${T.border}`:"none", background:T.surf }}>
                <div style={{ width:24, height:24, borderRadius:"50%", flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background:t.done?"#4DBF8A":"transparent",
                  border:`2.5px solid ${t.done?"#4DBF8A":T.border}`, transition:"all .2s" }}>
                  {t.done&&<Check size={13} color="white" strokeWidth={3}/>}
                </div>
                <span style={{ fontSize:14, fontWeight:600, color:t.done?T.muted:T.text,
                  textDecoration:t.done?"line-through":"none", transition:"all .2s" }}>{t.title}</span>
              </div>
            </SwipeActions>
          ))}
        </Card>

        {/* Mini stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {[
            { I:Sparkles,   v:todayLearned.length,  l:"Today",    bg:T.sage  },
            { I:BookOpen,   v:data.learned.length,  l:"All-time", bg:T.lav   },
            { I:CheckSquare,v:`${done}/${total}`,   l:"Targets",  bg:T.peach },
          ].map(({ I,v,l,bg }) => (
            <Card key={l} bg={bg} p={16}>
              <IB icon={I} bg="rgba(11,61,40,.12)" color={T.green} sz={14} p={6}/>
              <p className="fd" style={{ fontSize:26, fontWeight:800, color:T.green, margin:"10px 0 2px" }}>{v}</p>
              <p style={{ fontSize:11, fontWeight:700, color:T.green, opacity:.6 }}>{l}</p>
            </Card>
          ))}
        </div>
        <div style={{ height:8 }}/>
      </div>

      <Modal show={modal==="addLearn"} onClose={close} title="What did you learn?">
        <Txt ph="Tulis insight atau hal baru yang kamu pelajari hari ini..." val={f.learn} chg={up("learn")}/>
        <BtnRow onCancel={close} onSave={addLearn} label="Save Insight"/>
      </Modal>
      <Modal show={modal==="addTarget"} onClose={close} title="New Daily Target">
        <Inp ph="e.g. Baca 10 halaman buku..." val={f.target} chg={up("target")}/>
        <BtnRow onCancel={close} onSave={addTarget} label="Add Target"/>
      </Modal>
    </div>
  );

  /* ══════════════════════════════════════════════════════════
     SCHEDULE
  ══════════════════════════════════════════════════════════ */
  const ScheduleScreen = () => (
    <div style={{ flex:1, overflowY:"auto" }}>
      <Hero>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <div>
            <h1 className="fd" style={{ color:"white", fontSize:40, fontWeight:800, letterSpacing:"-.02em" }}>SCHEDULE</h1>
            <p style={{ color:"#A8D4BC", fontSize:12, marginTop:6 }}>{SCHED_DATE}</p>
          </div>
          <button onClick={() => setModal("addSched")} style={{ display:"flex", alignItems:"center", gap:6,
            background:T.yellow, border:"none", borderRadius:999, padding:"8px 16px",
            cursor:"pointer", color:T.green, fontSize:12, fontWeight:800 }}>
            <Plus size={14}/> Add
          </button>
        </div>
      </Hero>
      <div style={{ padding:"20px 16px", maxWidth:640, margin:"0 auto" }}>
        <div style={{ position:"relative" }}>
          <div style={{ position:"absolute", left:54, top:8, bottom:8, width:2, background:T.border, borderRadius:1 }}/>
          {data.schedule.map((s) => (
            <div key={s.id} style={{ display:"flex", gap:12, marginBottom:10 }}>
              <span style={{ width:42, flexShrink:0, fontSize:11, color:T.muted, fontFamily:"monospace",
                fontWeight:600, paddingTop:14, textAlign:"right" }}>{s.time}</span>
              <div style={{ position:"relative", zIndex:1, flexShrink:0, paddingTop:13 }}>
                <div style={{ width:14, height:14, borderRadius:"50%", background:s.done?"#4DBF8A":s.color,
                  border:"2.5px solid white", boxShadow:"0 0 0 2px "+T.border }}/>
              </div>
              <div style={{ flex:1 }}>
                <SwipeActions onDelete={() => delSched(s.id)} radius={18}
                  onEdit={() => setEditTarget({type:"sched", id:s.id, time:s.time, title:s.title, desc:s.desc})}>
                  <div onClick={() => toggleSched(s.id)} style={{ cursor:"pointer" }}>
                    <Card bg={s.done?"#F5F0E8":s.color} p={14} style={{ borderRadius:18, boxShadow:"none" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <p className="fd" style={{ fontSize:14, fontWeight:800, color:s.done?T.muted:T.green, textDecoration:s.done?"line-through":"none" }}>{s.title}</p>
                          <p style={{ fontSize:12, color:s.done?T.muted:T.green, opacity:.7, marginTop:2 }}>{s.desc}</p>
                        </div>
                        <div style={{ background:s.done?"#E8F7EF":"rgba(11,61,40,.1)", borderRadius:999, padding:"3px 10px", flexShrink:0, marginLeft:8 }}>
                          <span style={{ fontSize:11, fontWeight:800, color:s.done?"#4DBF8A":T.green }}>{s.done?"Done":"Tap"}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </SwipeActions>
              </div>
            </div>
          ))}
        </div>
        <div style={{ height:8 }}/>
      </div>
      <Modal show={modal==="addSched"} onClose={close} title="New Activity">
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Inp ph="Time (e.g. 08:00)" val={f.time} chg={up("time")}/>
          <Inp ph="Activity title..." val={f.stitle} chg={up("stitle")}/>
          <Inp ph="Short description (optional)..." val={f.sdesc} chg={up("sdesc")}/>
          <BtnRow onCancel={close} onSave={addSched} label="Add Activity"/>
        </div>
      </Modal>
    </div>
  );

  /* ══════════════════════════════════════════════════════════
     PROFILE
  ══════════════════════════════════════════════════════════ */
  const ProfileScreen = () => {
    // Group learned by date, sorted recent first
    const byDate = data.learned.reduce((acc, l) => {
      (acc[l.date] || (acc[l.date] = [])).push(l);
      return acc;
    }, {});
    const dates = Object.keys(byDate).sort((a, b) => dateScore(b) - dateScore(a));

    return (
      <div style={{ flex:1, overflowY:"auto" }}>
        <Hero pt={52}>
          <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%",
            background:"radial-gradient(circle,#EDD80022 0%,transparent 70%)" }}/>
          <div style={{ position:"relative", display:"flex", alignItems:"center", gap:20 }}>
            {/* ── Clickable avatar ── */}
            <div style={{ position:"relative", flexShrink:0, cursor:"pointer" }}
              onClick={() => { setF(p=>({...p,newName:userName})); setModal("editName"); }}>
              <div style={{ width:72, height:72, borderRadius:24, overflow:"hidden",
                background:`linear-gradient(135deg,${T.yellow},#F5A800)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 8px 24px rgba(237,216,0,.4)" }}>
                {avatar.type==="photo" && avatar.value
                  ? <img src={avatar.value} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  : avatar.type==="emoji"
                    ? <span style={{ fontSize:32 }}>{avatar.value}</span>
                    : <span className="fd" style={{ fontSize:30, fontWeight:800, color:T.green }}>{userName.charAt(0).toUpperCase()}</span>
                }
              </div>
              {/* camera badge */}
              <div style={{ position:"absolute", bottom:-3, right:-3, width:24, height:24,
                borderRadius:"50%", background:T.green, border:"2px solid rgba(255,255,255,.3)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Camera size={11} color="white"/>
              </div>
            </div>

            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <h1 className="fd" style={{ color:"white", fontSize:28, fontWeight:800 }}>{userName}</h1>
                <button onClick={() => { setF(p=>({...p,newName:userName})); setModal("editName"); }}
                  style={{ display:"flex", alignItems:"center", gap:5,
                    background:"rgba(255,255,255,.12)", border:"none", borderRadius:999,
                    padding:"5px 12px", cursor:"pointer" }}>
                  <Pencil size={12} color="white"/>
                  <span style={{ color:"white", fontSize:11, fontWeight:700 }}>Edit</span>
                </button>
              </div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6,
                background:T.yellow, borderRadius:999, padding:"4px 12px", marginTop:8 }}>
                <Zap size={12} color={T.green} strokeWidth={2.5}/>
                <span className="fd" style={{ fontSize:12, fontWeight:800, color:T.green }}>Level Up With Maul</span>
              </div>
            </div>
          </div>
        </Hero>

        <div style={{ padding:"20px 16px", maxWidth:640, margin:"0 auto", display:"flex", flexDirection:"column", gap:14 }}>
          {/* Stats grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {[
              { v:allNotes,           l:"Total Notes", I:BookOpen,    bg:T.sage  },
              { v:data.groups.length, l:"Groups",      I:Layers,      bg:T.peach },
              { v:`${done}/${total}`, l:"Targets",     I:Target,      bg:T.lav   },
            ].map(({ v,l,I,bg }) => (
              <Card key={l} bg={bg} p={18}>
                <IB icon={I} bg="rgba(11,61,40,.12)" color={T.green} sz={16} p={7}/>
                <p className="fd" style={{ fontSize:26, fontWeight:800, color:T.green, margin:"10px 0 2px", lineHeight:1 }}>{v}</p>
                <p style={{ fontSize:11, fontWeight:700, color:T.green, opacity:.6 }}>{l}</p>
              </Card>
            ))}
          </div>

          {/* Learning log */}
          <Card>
            <SHdr icon={BookOpen} ibg="rgba(168,212,188,.3)" icol={T.green} title="Learning Log"/>
            {dates.length===0&&(
              <p style={{ fontSize:13, color:T.muted, textAlign:"center", padding:"16px 0" }}>No learning history yet.</p>
            )}
            {dates.map((date, di) => (
              <div key={date} style={{ marginBottom:di<dates.length-1?22:0 }}>
                {/* date divider */}
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <div style={{ flex:1, height:1, background:T.border }}/>
                  <div style={{ background:T.bg, borderRadius:999, padding:"3px 12px",
                    display:"flex", alignItems:"center", gap:5 }}>
                    <CalendarDays size={11} color={T.muted}/>
                    <span style={{ fontSize:11, fontWeight:800, color:T.muted }}>{date}</span>
                  </div>
                  <div style={{ flex:1, height:1, background:T.border }}/>
                </div>
                {byDate[date].map((item, i) => (
                  <SwipeActions key={item.id} onDelete={() => delLearned(item.id)}
                    onEdit={() => setEditTarget({type:"learned", id:item.id, text:item.text})}>
                    <div onClick={() => setPreview({type:"learned", ...item})}
                      style={{ display:"flex", gap:10, padding:"10px 0", cursor:"pointer",
                      borderBottom:i<byDate[date].length-1?`1px solid ${T.border}`:"none",
                      background:T.surf }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:"#4DBF8A",
                        flexShrink:0, marginTop:8 }}/>
                      <p style={{ fontSize:13, color:"#444", lineHeight:1.7,
                        display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{item.text}</p>
                    </div>
                  </SwipeActions>
                ))}
              </div>
            ))}
          </Card>

          {/* Motivational banner */}
          <Card bg={T.green} p={24}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:48, height:48, borderRadius:16, background:T.yellow,
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Award size={24} color={T.green} strokeWidth={2}/>
              </div>
              <div>
                <p className="fd" style={{ fontSize:18, fontWeight:800, color:T.yellow }}>Keep Going! 💪</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,.55)", marginTop:4, lineHeight:1.6 }}>
                  You're on a roll. One insight at a time.
                </p>
              </div>
            </div>
          </Card>
          <div style={{ height:8 }}/>
        </div>

        <Modal show={modal==="editName"} onClose={close} title="Edit Profile">
          {/* ── Avatar preview + upload via label (works in sandboxed iframe) ── */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, marginBottom:20 }}>
            <label htmlFor="avatar-file-input" style={{ cursor:"pointer", display:"block" }}>
              <div style={{ position:"relative" }}>
                <div style={{ width:86, height:86, borderRadius:28, overflow:"hidden",
                  background:`linear-gradient(135deg,${T.yellow},#F5A800)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 8px 24px rgba(237,216,0,.35)" }}>
                  {avatar.type==="photo" && avatar.value
                    ? <img src={avatar.value} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    : avatar.type==="emoji"
                      ? <span style={{ fontSize:38 }}>{avatar.value}</span>
                      : <span className="fd" style={{ fontSize:34, fontWeight:800, color:T.green }}>
                          {(f.newName||userName).charAt(0).toUpperCase()}
                        </span>
                  }
                </div>
                <div style={{ position:"absolute", bottom:-3, right:-3, width:28, height:28,
                  borderRadius:"50%", background:T.green, border:"2.5px solid white",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  pointerEvents:"none" }}>
                  <Camera size={13} color="white"/>
                </div>
              </div>
            </label>

            {/* Upload button — also a label so it directly triggers input */}
            <label htmlFor="avatar-file-input" style={{
              display:"flex", alignItems:"center", gap:7,
              background:T.green, borderRadius:999,
              padding:"8px 18px", cursor:"pointer",
            }}>
              <Camera size={14} color="white"/>
              <span style={{ color:"white", fontSize:13, fontWeight:800 }}>Upload dari Galeri</span>
            </label>

            {/* actual file input — hidden, triggered by both labels above */}
            <input
              id="avatar-file-input"
              type="file"
              accept="image/*"
              style={{ display:"none" }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => setAvatar({ type:"photo", value:ev.target.result });
                reader.readAsDataURL(file);
                e.target.value = "";
              }}
            />
          </div>

          {/* ── Emoji picker ── */}
          <p style={{ fontSize:12, fontWeight:800, color:T.muted, marginBottom:10, letterSpacing:".04em", textTransform:"uppercase" }}>Atau pilih emoji avatar</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:20 }}>
            {["🧑‍💻","👨‍🎓","🎓","🦁","🦊","🐺","🦉","🐸","🚀","🌟","💎","🎯","🔥","🧠","💪","⚡"].map(em => (
              <button key={em} onClick={() => setAvatar({ type:"emoji", value:em })}
                style={{
                  fontSize:28, border:`2px solid ${avatar.type==="emoji"&&avatar.value===em?T.green:"transparent"}`,
                  background: avatar.type==="emoji"&&avatar.value===em ? "rgba(11,61,40,.08)" : "none",
                  borderRadius:14, padding:"8px 4px", cursor:"pointer",
                  transition:"all .15s", lineHeight:1,
                }}>
                {em}
              </button>
            ))}
          </div>

          {/* ── Name ── */}
          <p style={{ fontSize:12, fontWeight:800, color:T.muted, marginBottom:8, letterSpacing:".04em", textTransform:"uppercase" }}>Display name</p>
          <Inp ph="Enter your name..." val={f.newName} chg={up("newName")}/>
          <BtnRow onCancel={close} onSave={saveName} label="Save Profile"/>
        </Modal>
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <>
      <FontLoader/>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:T.bg }}>
        <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column", paddingBottom:72 }}>
          {tab==="home"     && HomeScreen()}
          {tab==="notes"    && NotesScreen()}
          {tab==="learn"    && LearnScreen()}
          {tab==="schedule" && ScheduleScreen()}
          {tab==="profile"  && ProfileScreen()}
        </div>
        {EditModal()}
        {PreviewOverlay({ preview, onClose: () => setPreview(null) })}
        <nav style={{
          position:"fixed", bottom:0, left:0, right:0, zIndex:50,
          background:T.surf, borderTop:`1px solid ${T.border}`,
          boxShadow:"0 -4px 28px rgba(11,61,40,.07)",
          padding:"10px 8px 20px",
        }}>
          <div style={{ display:"flex", justifyContent:"space-around", alignItems:"center", maxWidth:640, margin:"0 auto" }}>
            {navs.map(({ id, Icon, label }) => (
              <NavItem key={id} icon={Icon} label={label} active={tab===id}
                onClick={() => { setTab(id); setNoteView(null); setModal(null); }}/>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}