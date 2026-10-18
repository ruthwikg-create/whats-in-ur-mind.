import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM = [
  "You are What's in U'R mind, a human-centered multilingual AI research companion created by Ruthwik.",
  "Understand what each person really wants. Speak respectfully and naturally like a thoughtful mentor, but do not pretend you are human.",
  "Match the user's language, script and code-switching: English, Telugu (తెలుగు), Hindi (हिन्दी), Tenglish (Telugu in Latin letters mixed with English), Hinglish (Hindi in Latin letters mixed with English), or other languages. If they type Tenglish or Hinglish, answer in the same natural mixed style.",
  "Give practical, nuanced help with career decisions, education, businesses, technology, ideas and life. For longer questions organize key facts, reasoned recommendations, important risks, and actionable steps. If essential context is missing, ask just one useful question.",
  "Distinguish reliable evidence from your own reasoned opinion. Use Google Search grounding when enabled for up-to-date jobs, exams, courses, market conditions, laws, prices, scientific information and any significant current claim. Prefer primary sources; clearly acknowledge uncertainties.",
  "Never invent citations or assert that web research was done when it wasn't. You must not fabricate numerical estimates, guarantees or human experiences.",
  "For health, financial, legal or other high-stakes situations, convey uncertainty and encourage appropriate professional confirmation. Be precise, compassionate, realistic and helpful.",
  "Use readable Markdown when helpful but avoid generic overlong lists. Finish with concrete next steps where useful."
].join('\n');

const recent = new Map();
function limited(ip) {
  const now=Date.now(), start=now-60000;
  const history=(recent.get(ip)||[]).filter(t=>t>start);
  if(history.length>=12) return true;
  history.push(now);recent.set(ip,history);
  if(recent.size>500){for(const [k,v] of recent)if(v[v.length-1]<start)recent.delete(k);}
  return false;
}
export async function POST(req){
  const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
  if(limited(ip))return NextResponse.json({error:'Too many questions. Please wait one minute.'},{status:429});
  let body;try{body=await req.json()}catch{return NextResponse.json({error:'Invalid request'},{status:400})}
  const question=typeof body?.message==='string'?body.message.trim():'';
  if(!question||question.length>6000)return NextResponse.json({error:'Please enter a question up to 6,000 characters.'},{status:400});
  const mode=body?.mode==='reflect'?'reflect':'research';
  const history=Array.isArray(body.history)?body.history.slice(-14):[];
  const contents=history.filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string'&&x.content.length<=12000).map(x=>({role:x.role==='assistant'?'model':'user',parts:[{text:x.content}]}));
  contents.push({role:'user',parts:[{text:question}]});
  if(!process.env.GEMINI_API_KEY)return NextResponse.json({error:'AI setup is pending. Site owner: set GEMINI_API_KEY in Vercel environment variables.'},{status:503});
  const payload={systemInstruction:{parts:[{text:SYSTEM+(mode==='reflect'?'\nNo browsing is available for this answer; do not claim that current facts were verified.':'\nResearch mode is active: search when current reliable information materially improves the answer. For major factual claims show available source links. If sources are missing, say so.')}]},contents,generationConfig:{temperature:0.65,maxOutputTokens:4096},...(mode==='research'?{tools:[{google_search:{}}]}:{})};
  const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),55000);
  try {
    const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
    const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},body:JSON.stringify(payload),signal:controller.signal,cache:'no-store'});
    const d=await r.json().catch(()=>({}));
    if(!r.ok){console.error('Gemini',r.status,String(d?.error?.message||'').slice(0,200));return NextResponse.json({error:r.status===429?'AI request limit reached. Try again later.':'AI unavailable. Check your API key, model and quota.'},{status:r.status===429?429:502});}
    const c=d?.candidates?.[0], answer=(c?.content?.parts||[]).map(x=>x.text||'').join('\n').trim();
    if(!answer)return NextResponse.json({error:'The AI returned no answer. Try a different question.'},{status:502});
    const g=c.groundingMetadata||{};
    const sources=(g.groundingChunks||[]).filter(x=>/^https:\/\//i.test(x?.web?.uri||'')).map(x=>({title:String(x.web.title||'Source').slice(0,150),url:x.web.uri})).filter((x,i,a)=>a.findIndex(v=>v.url===x.url)===i).slice(0,10);
    const searchQueries=(g.webSearchQueries||[]).filter(x=>typeof x==='string').slice(0,8);
    return NextResponse.json({answer,mode,searched:mode==='research'&&(sources.length>0||searchQueries.length>0),sources,searchQueries},{headers:{'Cache-Control':'no-store'}});
  } catch(e){console.error('AI fetch',e?.name);return NextResponse.json({error:e?.name==='AbortError'?'Research timed out. Try a shorter question.':'Could not reach the AI service. Retry later.'},{status:504})}
  finally{clearTimeout(timer)}
}
