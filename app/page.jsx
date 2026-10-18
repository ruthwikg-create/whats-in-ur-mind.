'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Sparkles,BrainCircuit,Menu,X,Plus,BriefcaseBusiness,Lightbulb,BookOpen,Code2,Heart,Globe2,Mic,ArrowUp,MessageCircle,Moon,Sun,Trash2,ExternalLink,Download,Copy,Check,Info,ChevronDown,Compass,ShieldCheck} from 'lucide-react';

const STORE='whats-in-ur-mind-v1';
const ANSWER_STYLES=[{id:'detailed',label:'Detailed'},{id:'professional',label:'Professional'},{id:'easy',label:'Easy Way'},{id:'points',label:'Main Points'}];
const categories=[
{id:'all',label:'Discover anything',Icon:Sparkles},
{id:'career',label:'Career & future',Icon:BriefcaseBusiness},
{id:'ideas',label:'Ideas & business',Icon:Lightbulb},
{id:'learning',label:'Study & learning',Icon:BookOpen},
{id:'technology',label:'Technology',Icon:Code2},
{id:'life',label:'Life decisions',Icon:Heart}];
const starters=[
{title:'Find your direction',description:'Unsure what comes next? Explore your paths.',icon:Compass,tone:'peach',category:'career',prompt:'I am confused about my future career. Research practical career paths, job prospects and skills, and help me create a realistic plan.'},
{title:'Explore an idea',description:'Turn that "what if" into a practical plan.',icon:Lightbulb,tone:'mint',category:'ideas',prompt:'I have a new startup idea. Help me evaluate demand, alternatives, competitors, risks and a low-cost way to validate it.'},
{title:'Tenglish lo matladam',description:'Manasulo unnadi easy ga cheppu.',icon:Heart,tone:'lavender',category:'career',prompt:'Naku na future gurinchi confusion undi. Current careers ni research chesi, na interests batti options Tenglish lo natural ga explain chey.'},
{title:'Hinglish mein poochho',description:'Jo mann mein hai, bas pooch lo.',icon:Globe2,tone:'gold',category:'learning',prompt:'Mujhe future ke liye useful skills seekhne hain. Current opportunities research karke ek practical roadmap Hinglish mein batao.'}
];
const uid=()=>globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now().toString(36);
function readStored(){try{let a=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(a)?a.filter(x=>x&&typeof x.id==='string'&&Array.isArray(x.messages)).slice(0,80):[]}catch{return []}}
function Brand(){return <div className="brand"><span className="mark"><BrainCircuit size={25}/></span><div><span>what's in</span><b>U'R mind<i>.</i></b></div></div>}
function ChatMessage({m,copy}){
  const mine=m.role==='user';
  return <article className={'message '+(mine?'mine':'theirs')}>
    <span className="msgavatar">{mine?'U':<Sparkles size={17}/>}</span>
    <div className="msgmain"><div className="msgrole">{mine?'YOU':"WHAT'S IN U'R MIND"}</div>
      <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{a:({node,...props})=><a {...props} target="_blank" rel="noopener noreferrer nofollow"/>}}>{m.content||''}</ReactMarkdown></div>
      {!mine&&<><div className="meta-actions"><span className={'truth '+(m.searched?'searched':'')}><span className="truthdot"/>{m.mode==='reflect'?'No live research requested':m.searched?'Live research used':'No live sources retrieved'}</span><span className="answer-style-label">{ANSWER_STYLES.find(s=>s.id===m.answerStyle)?.label||'Detailed'}</span><button type="button" onClick={()=>copy(m.content)}><Copy size={13}/> Copy</button></div>
      {m.sources?.length>0&&<div className="source-group"><b><Globe2 size={14}/> SOURCES USED <span>{m.sources.length}</span></b><div className="sources">{m.sources.map((s,i)=><a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer nofollow"><small>{i+1}</small><span>{s.title||'Source'}</span><ExternalLink size={13}/></a>)}</div></div>}
      {m.searchQueries?.length>0&&<details className="query-details"><summary>Research searches <ChevronDown size={13}/></summary><div>{m.searchQueries.map((q,i)=><span key={i}>{q}</span>)}</div></details>}
      </>}
    </div>
  </article>
}
export default function Home(){
 const [ready,setReady]=useState(false),[chats,setChats]=useState([]),[selected,setSelected]=useState(null),[category,setCategory]=useState('all'),[mode,setMode]=useState('research'),[answerStyle,setAnswerStyle]=useState('detailed'),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[nav,setNav]=useState(false),[dark,setDark]=useState(false),[about,setAbout]=useState(false),[copied,setCopied]=useState(false),[listening,setListening]=useState(false);
 const input=useRef(null),end=useRef(null),chatsRef=useRef([]),busyRef=useRef(false),selRef=useRef(null);
 const active=chats.find(x=>x.id===selected)||null;
 useEffect(()=>{const c=readStored();setChats(c);chatsRef.current=c;setDark(localStorage.getItem('ur-mind-dark')==='1');const savedStyle=localStorage.getItem('ur-mind-answer-style');if(ANSWER_STYLES.some(s=>s.id===savedStyle))setAnswerStyle(savedStyle);setReady(true)},[]);
 useEffect(()=>{if(!ready)return;try{localStorage.setItem(STORE,JSON.stringify(chats.slice(0,80)))}catch{}chatsRef.current=chats},[chats,ready]);
 useEffect(()=>{if(ready)localStorage.setItem('ur-mind-dark',dark?'1':'0')},[dark,ready]);
 useEffect(()=>{if(ready)localStorage.setItem('ur-mind-answer-style',answerStyle)},[answerStyle,ready]);
 useEffect(()=>{selRef.current=selected},[selected]);
 useEffect(()=>{end.current?.scrollIntoView({block:'end',behavior:'smooth'})},[active?.messages?.length,busy]);
 const start=(cat='all')=>{if(busyRef.current)return;setSelected(null);selRef.current=null;setCategory(cat);setError('');setText('');setNav(false);input.current?.focus()};
 const choose=id=>{if(busyRef.current)return;setSelected(id);selRef.current=id;setError('');setNav(false)};
 const del=id=>{if(busyRef.current)return;if(!confirm('Delete this conversation from this device?'))return;setChats(v=>v.filter(c=>c.id!==id));if(selRef.current===id){setSelected(null);selRef.current=null}};
 const copy=async value=>{try{await navigator.clipboard.writeText(value);setCopied(true);setTimeout(()=>setCopied(false),1300)}catch{setError('Clipboard permission was denied.')}};
 const exportCurrent=()=>{if(!active)return;const rows=['# '+active.title,'','Exported from What\'s in U\'R mind — Built by Ruthwik','',...active.messages.flatMap(m=>['## '+(m.role==='user'?'You':'Mitra AI'),m.content,'',...(m.sources?.length?m.sources.map(s=>'- '+s.title+': '+s.url):[])])];const url=URL.createObjectURL(new Blob([rows.join('\n')],{type:'text/markdown'}));const a=document.createElement('a');a.href=url;a.download='ur-mind-'+active.id.slice(0,8)+'.md';a.click();URL.revokeObjectURL(url)};
 const ask=useCallback(async(override,cat)=>{
   if(busyRef.current)return;
   const question=String(override??text).trim();if(!question)return;
   if(question.length>6000){setError('Keep your question under 6,000 characters.');return}
   const prior=chatsRef.current.find(c=>c.id===selRef.current),id=prior?.id||uid();
   const previous=prior?.messages||[],history=previous.slice(-14).map(x=>({role:x.role,content:x.content}));
   const mine={id:uid(),role:'user',content:question};
   const fresh={id,title:previous.length?prior.title:question.replace(/\s+/g,' ').slice(0,70),category:prior?.category||cat||category,updated:Date.now(),messages:[...previous,mine]};
   setChats(list=>[fresh,...list.filter(c=>c.id!==id)]);chatsRef.current=[fresh,...chatsRef.current.filter(c=>c.id!==id)];
   setSelected(id);selRef.current=id;setText('');setError('');setNav(false);setBusy(true);busyRef.current=true;
   try{
     const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:question,mode,answerStyle,history})});
     const data=await res.json().catch(()=>({}));
     if(!res.ok||data.error)throw Error(data.error||'AI is temporarily unavailable.');
     const reply={id:uid(),role:'assistant',content:data.answer,mode:data.mode||mode,answerStyle:data.answerStyle||answerStyle,searched:!!data.searched,sources:data.sources||[],searchQueries:data.searchQueries||[]};
     setChats(list=>list.map(c=>c.id===id?{...c,messages:[...c.messages,reply],updated:Date.now()}:c).sort((a,b)=>b.updated-a.updated));
   }catch(e){setError(e.message||'Could not answer. Try again.');setText(question)}
   finally{setBusy(false);busyRef.current=false}
 },[category,mode,answerStyle,text]);
 const voice=()=>{const API=window.SpeechRecognition||window.webkitSpeechRecognition;if(!API){setError('Voice typing is not supported in this browser. Please type your question.');return}const r=new API();r.lang=/[\u0c00-\u0c7f]/.test(text)?'te-IN':/[\u0900-\u097f]/.test(text)?'hi-IN':'en-IN';r.continuous=false;r.interimResults=false;r.onresult=e=>setText(t=>[t,e.results[0][0].transcript].filter(Boolean).join(' '));r.onend=()=>setListening(false);r.onerror=()=>{setListening(false);setError('Microphone unavailable. Check permission.')};setListening(true);try{r.start()}catch{setListening(false)}};
 return <div className={'app '+(dark?'dark':'')}>
   {nav&&<div className="overlay" onClick={()=>setNav(false)}/>}
   <aside className={'sidebar '+(nav?'open':'')}>
     <div className="sidebrand"><button onClick={()=>start()} className="brandbutton"><Brand/></button><button className="closemenu" onClick={()=>setNav(false)} aria-label="Close menu"><X size={21}/></button></div>
     <button className="new" onClick={()=>start()}><Plus size={19}/> New conversation <span>↗</span></button>
     <div className="grouphead">EXPLORE</div><div className="navlist">{categories.map(c=><button onClick={()=>start(c.id)} className={category===c.id?'chosen':''} key={c.id}><c.Icon size={17}/>{c.label}</button>)}</div>
     <div className="history"><div className="grouphead">YOUR CONVERSATIONS</div>{chats.length?chats.map(c=><div className={'historyitem '+(c.id===selected?'active':'')} key={c.id}><button className="historyopen" onClick={()=>choose(c.id)} title={c.title}><MessageCircle size={14}/><span>{c.title}</span></button><button className="delete" onClick={()=>del(c.id)} aria-label="Delete conversation"><Trash2 size={13}/></button></div>):<p className="none">Your thoughts have a home here.<br/>History is kept on this device.</p>}</div>
     <div className="sidefoot"><div className="footnote"><Sparkles size={19}/><div><b>Every thought matters.</b><p>No perfect words needed.<br/>Just start talking.</p></div></div><div className="creator"><span>R</span><div><b>Made for curious minds</b><small>Built by Ruthwik</small></div></div></div>
   </aside>
   <main className="main">
     <header className="header"><div className="headerleft"><button className="menubutton" onClick={()=>setNav(true)} aria-label="Open menu"><Menu size={23}/></button><span>YOUR SPACE TO THINK</span></div><div className="headeractions"><span className="status"><i/>AI research companion</span><button className="themebtn" onClick={()=>setDark(d=>!d)} title="Toggle theme">{dark?<Sun size={18}/>:<Moon size={18}/>}</button><button className="aboutbtn" onClick={()=>setAbout(true)}><Info size={14}/> About</button></div></header>
     <div className="workspace">
       {!active?.messages.length?<section className="welcome"><div className="eyebrow"><Sparkles size={15}/> THINK. EXPLORE. DISCOVER.</div><h1>What's in <em>U'R mind?</em></h1><p className="sub">A question, a big dream, or just a random thought.<br/>Whatever it is, let's figure it out together.</p><div className="languages"><Globe2 size={15}/><b>Speak your language.</b><span>English · తెలుగు · हिन्दी · Tenglish · Hinglish · more</span></div><div className="starters">{starters.map((s,i)=><button key={i} onClick={()=>ask(s.prompt,s.category)} disabled={busy} className="starter"><span className={'startericon '+s.tone}><s.icon size={19}/></span><span className="starterarrow">↗</span><b>{s.title}</b><small>{s.description}</small></button>)}</div></section>:
       <div className="chat"><div className="chathead"><div className="chatmark"><Sparkles size={18}/></div><div><b>{active.title}</b><small>Keep asking. Go deeper.</small></div><button onClick={exportCurrent} title="Export conversation"><Download size={15}/> <span>Export</span></button></div><div className="messages">{active.messages.map(m=><ChatMessage key={m.id} m={m} copy={copy}/>)}</div>{busy&&<div className="thinking"><Sparkles size={18}/><span className="dots"><i/><i/><i/></span>{mode==='research'?'Researching and reviewing sources…':'Thinking it through…'}</div>}<div ref={end}/></div>}
       <div className={'inputarea '+(active?.messages.length?'chatinput':'')}>
         {error&&<div className="error"><Info size={15}/><span>{error}</span><button onClick={()=>setError('')} aria-label="Dismiss error"><X size={15}/></button></div>}
         <form onSubmit={e=>{e.preventDefault();ask()}} className="composer"><textarea ref={input} placeholder="Tell me what's on your mind..." aria-label="Ask in any language" maxLength={6000} rows={2} value={text} disabled={busy} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask()}}}/><div className="composerbottom"><div className="tools"><button type="button" className={'mode '+(mode==='research'?'research':'reflect')} onClick={()=>setMode(m=>m==='research'?'reflect':'research')}><Globe2 size={15}/>{mode==='research'?'Live research':'Thoughtful chat'}<ChevronDown size={13}/></button><label className="style-picker"><BookOpen size={15} aria-hidden="true"/><select aria-label="Answer style" title="Choose how detailed or simple the answer should be" value={answerStyle} onChange={e=>setAnswerStyle(e.target.value)} disabled={busy}>{ANSWER_STYLES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select><ChevronDown size={13} aria-hidden="true"/></label><button className={'voice '+(listening?'active':'')} type="button" onClick={voice}><Mic size={15}/><span>{listening?'Listening…':'Voice'}</span></button></div><div className="sendgroup"><small>{text.length}/6000</small><button type="submit" className="send" disabled={!text.trim()||busy} aria-label="Send"><ArrowUp size={21}/></button></div></div></form>
         <div className="credit"><Sparkles size={12}/> Built by <b>Ruthwik</b><span>·</span> Sources when available <span>·</span> AI can make mistakes</div>
       </div>
     </div>
   </main>
   {copied&&<div className="toast"><Check size={15}/> Copied</div>}
   {about&&<div className="modalback" onClick={()=>setAbout(false)}><div className="modal" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true"><button className="modalclose" onClick={()=>setAbout(false)}><X size={19}/></button><div className="modallogo"><Sparkles size={22}/></div><h2>An open space for every mind.</h2><p>What's in U'R mind understands questions about careers, ideas, life, business and learning in the language you naturally speak — including Telugu, Hindi, English, Tenglish and Hinglish.</p><div className="modalrow"><Globe2 size={17}/><div><b>Research when it matters</b><small>In Live research mode the connected AI provider can consult current search results and share genuine source links when available.</small></div></div><div className="modalrow"><ShieldCheck size={17}/><div><b>Your browser, your history</b><small>Chats are saved on this device. Questions are sent to the AI provider to answer them. Don't share sensitive information.</small></div></div><div className="modalrow"><BookOpen size={17}/><div><b>Four answer styles</b><small>Detailed for article-style explanations, Professional for formal analysis, Easy Way for simple examples, and Main Points for a concise summary.</small></div></div><p className="modalcredit">Designed & built by <b>Ruthwik</b></p></div></div>}
 </div>;
}
