// OpenRouter adapter using Chat Completions + OpenRouter's live web-search server tool.
// The OpenRouter API key stays exclusively in Vercel server environment variables.
function pickSources(data, message) {
  const all = [];
  const add = (url, title) => {
    if(typeof url !== 'string' || !/^https:\/\//i.test(url) || all.some(x=>x.url===url)) return;
    all.push({url, title:String(title||'Source').slice(0,150)});
  };
  const annotations = [
    ...(Array.isArray(message?.annotations)?message.annotations:[]),
    ...(Array.isArray(data?.annotations)?data.annotations:[])
  ];
  for(const a of annotations) {
    const c=a?.url_citation||a;
    if(c?.type==='url_citation'||c?.url) add(c.url, c.title);
  }
  // Some search-capable model providers include a top-level citations list.
  for(const c of Array.isArray(data?.citations)?data.citations:[]) {
    if(typeof c==='string') add(c,'Search source');
    else if(c&&typeof c==='object') add(c.url||c.uri,c.title);
  }
  return all.slice(0,10);
}
function publicApiError(status, raw) {
  const msg=String(raw?.error?.message||raw?.message||'');
  const code=String(raw?.error?.code||raw?.error?.type||'');
  console.error('OpenRouter API failure',status,code,msg.slice(0,400));
  if(status===401) return 'OpenRouter API key is invalid. Update OPENROUTER_API_KEY in Vercel.';
  if(status===402||/insufficient.credits|not enough credits|payment required|no credits/i.test(msg+' '+code)) return 'Your OpenRouter balance is insufficient. Add credits or choose an available free model.';
  if(status===429||/rate.limit|quota/i.test(msg+' '+code)) return 'OpenRouter rate limit or quota reached. Wait or check your OpenRouter credits and limits.';
  if(status===403) return 'OpenRouter access denied. Check key permissions and model availability.';
  if(status===404||/model.*not found/i.test(msg)) return 'OpenRouter model not found. Check OPENROUTER_MODEL in Vercel.';
  if(status===400) return 'OpenRouter rejected the model or web-search request. Check OPENROUTER_MODEL and tool access.';
  if(status>=500) return 'OpenRouter is temporarily unavailable. Please retry shortly.';
  return 'OpenRouter could not answer. Check provider settings or retry.';
}
export async function requestOpenRouter({question,history,mode,system,signal}) {
  const model=(process.env.OPENROUTER_MODEL||'openrouter/auto').trim();
  const research=mode==='research';
  const messages=[
    {role:'system',content:system + (research
      ? '\nResearch mode: use the live web search tool to verify time-sensitive claims, prioritize trustworthy original sources, distinguish researched facts from reasoned opinion and cite real URLs. Do not claim a search occurred unless it actually did.'
      : '\nConversation mode: no web-search tool is available. Do not claim fresh facts are verified.')},
    ...history.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string'&&m.content.length<=12000).slice(-14)
      .map(m=>({role:m.role,content:m.content})),
    {role:'user',content:question}
  ];
  const payload={model,messages,stream:false,max_tokens:3500,temperature:0.65};
  if(research) payload.tools=[{type:'openrouter:web_search'}];
  const response=await fetch('https://openrouter.ai/api/v1/chat/completions',{
    method:'POST',
    headers:{
      Authorization:'Bearer '+process.env.OPENROUTER_API_KEY,
      'Content-Type':'application/json',
      'X-Title':"What's in U'R mind"
    },
    body:JSON.stringify(payload),signal,cache:'no-store'
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw Object.assign(new Error(publicApiError(response.status,data)),{status:response.status===429?429:502});
  const message=data?.choices?.[0]?.message;
  const content=message?.content;
  const answer=(typeof content==='string'?content:Array.isArray(content)?content.map(p=>p?.text||'').join('\n'):'').trim();
  if(!answer) throw Object.assign(new Error('OpenRouter returned no answer. Try a different model or retry.'),{status:502});
  const sources=pickSources(data,message);
  const count=Number(data?.usage?.server_tool_use?.web_search_requests||0);
  const toolOutput=(Array.isArray(message?.tool_calls)?message.tool_calls:[]).some(t=>String(t?.type||t?.function?.name||'').includes('web_search'));
  return {answer,mode,searched:research&&(count>0||toolOutput||sources.length>0),sources,searchQueries:[]};
}
