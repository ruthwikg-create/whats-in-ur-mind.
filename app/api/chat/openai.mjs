// OpenAI Responses API adapter for What's in U'R mind.
// Uses a server-side key only; never send credentials to the browser.
// For research, citation metadata is extracted from OpenAI's output annotations.
export async function requestOpenAI({ question, history, mode, system, signal }) {
  const model = (process.env.OPENAI_MODEL || 'gpt-4.1-mini').trim();
  const input = [...history
    .filter(x => x && ['user', 'assistant'].includes(x.role) && typeof x.content === 'string')
    .slice(-14)
    .map(x => ({ role: x.role, content: x.content })),
    { role: 'user', content: question }];
  const wantsResearch = mode === 'research';
  const payload = {
    model, store: false,
    instructions: system + (wantsResearch
      ? '\nLive research is enabled. Search for relevant up-to-date facts when useful, ground important claims in reliable sources, and make sources and your own analysis clearly distinguishable.'
      : '\nDo not claim to have searched the web in this mode. Be transparent about uncertainty.'),
    input, max_output_tokens: 3500
  };
  if (wantsResearch) payload.tools = [{ type: 'web_search', search_context_size: 'medium' }];
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    signal, cache: 'no-store'
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = data?.error?.code || data?.error?.type || '';
    const detail = String(data?.error?.message || '').slice(0, 400);
    console.error('OpenAI API:', response.status, code, detail);
    let message = 'OpenAI could not answer right now. Try again later.';
    if (response.status === 401 || /invalid_api_key/i.test(code))
      message = 'OpenAI API key is invalid. Check OPENAI_API_KEY in Vercel.';
    else if (response.status === 429 && /quota|insufficient_quota|billing/i.test(code + ' ' + detail))
      message = 'OpenAI API credits or quota are exhausted. Check billing at platform.openai.com.';
    else if (response.status === 429)
      message = 'OpenAI rate limit reached. Please wait and try again.';
    else if (response.status === 403)
      message = 'OpenAI API access denied. Check project permissions and model access.';
    else if (response.status === 404 || /model_not_found/i.test(code))
      message = 'OpenAI model unavailable. Check OPENAI_MODEL in Vercel.';
    else if (response.status === 400)
      message = 'OpenAI rejected the request. Check the selected model and its web search support.';
    throw Object.assign(new Error(message), { status: response.status === 429 ? 429 : 502 });
  }
  const output = Array.isArray(data.output) ? data.output : [];
  const parts = output
    .filter(x => x?.type === 'message' && x.role === 'assistant')
    .flatMap(x => Array.isArray(x.content) ? x.content : [])
    .filter(x => x?.type === 'output_text');
  const answer = parts.map(x => x.text || '').join('\n').trim();
  if (!answer) throw Object.assign(new Error('OpenAI returned no answer. Please retry.'), { status: 502 });
  const calls = output.filter(x => x?.type === 'web_search_call');
  const searchQueries = calls.flatMap(x => {
    const action = x.action || {};
    return Array.isArray(action.queries) ? action.queries : (action.query ? [action.query] : []);
  }).filter(x => typeof x === 'string').slice(0, 8);
  const sources = [];
  for (const p of parts) {
    for (const a of Array.isArray(p.annotations) ? p.annotations : []) {
      const c = a.type === 'url_citation' ? a : a.url_citation;
      if (!c?.url || !/^https:\/\//i.test(c.url) || sources.some(s => s.url === c.url)) continue;
      sources.push({ title: String(c.title || 'Source').slice(0, 150), url: c.url });
      if (sources.length === 10) break;
    }
  }
  return { answer, mode, searched: wantsResearch && calls.length > 0, sources, searchQueries };
}
