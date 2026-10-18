# What's in U'R mind

**Built by Ruthwik.** An independently hosted multilingual AI thought partner for career decisions, life questions and exploring new ideas.

## Answer styles

The chat composer includes an answer-style picker. Each choice works independently of Live Research vs Thoughtful Chat, and persists on the visitor's device.

- **Detailed** (default): article-style explanation with clear headings, context, examples, evidence, and practical takeaways.
- **Professional**: formal, evidence-focused analytical style for careers, research or workplace decisions.
- **Easy Way**: simple explanations with clear definitions and everyday examples.
- **Main Points**: short summary with numbered key points and a practical takeaway.

Answers avoid long dash punctuation and use paragraphs, headings, meaningful comparisons and authentic sources where supplied by the connected AI provider. The app retains English, Telugu, Hindi, Tenglish, and Hinglish handling.

## Research paper citations

**Research & papers** is a dedicated category in the sidebar. In Live Research mode, scientific, medical and scholarly questions may trigger a real-time scholarly bibliography lookup using the public **OpenAlex** search API (https://openalex.org) and **Crossref** (https://www.crossref.org). No extra secret is needed for light use; an optional `OPENALEX_API_KEY` can be added in Vercel for higher usage limits.

The assistant receives verified bibliographic records and any available abstract excerpts. It is instructed to cite relevant papers with source tags `[P1]`, `[P2]`, etc. Only tags that match actual retrieved paper records become clickable DOI links. The UI shows authors, year, journal, DOI and whether an abstract was available.

Paper cards honestly distinguish **Cited in answer** from **Related reading**. Retrieving a paper title or abstract does not mean the full article was read, does not establish peer review, and does not verify every claim. Metadata services can fail, may have missing abstracts or incorrect indexing, and should never be treated as a substitute for examining the original paper. When scholarly retrieval is unavailable the app continues with ordinary live research and does not manufacture paper citations.

To test, select **Live research**, choose **Research & papers** in the sidebar, and ask a question such as "Explain clinical evidence for wearable ECG arrhythmia detection and cite research papers." Verify the links lead to actual DOI pages.

## Features
- English, Telugu, Hindi, Tenglish, Hinglish and other languages
- Research-backed Gemini answers with Google Search grounding and real source links when available
- Separate reflective conversation mode
- Chat history stored locally on each user's own browser
- Responsive mobile/desktop design, dark mode, voice dictation where supported
- No Hatchable dependencies, permission wall or watermark

## Use OpenRouter (mobile setup)

The app now supports **OpenRouter, OpenAI and Gemini** without any hosting-platform dependencies. When `OPENROUTER_API_KEY` is configured and `AI_PROVIDER` is not set, OpenRouter takes priority. If multiple keys exist, choose explicitly with `AI_PROVIDER=openrouter`.

In Vercel → Project → Settings → Environment Variables add:
- `AI_PROVIDER` = `openrouter`
- `OPENROUTER_API_KEY` = your secret from https://openrouter.ai/settings/keys
- `OPENROUTER_MODEL` = `openrouter/auto` (optional; default). You can select another OpenRouter model slug instead.

After saving variables, **redeploy the production deployment** to apply them. Never commit an API key or paste it into chat. The site uses the `openrouter:web_search` server tool in Live Research mode and disables that tool in Thoughtful Chat mode. Search has separate usage costs; `openrouter/auto` routes to variable-priced models and is not necessarily free. Sources are only marked researched when the provider confirms usage or returns citation data; answer text may also include citations.

## Vercel deployment
Framework: Next.js. Root directory: `./`.
Environment variables (configured only in Vercel, never committed):

**Use OpenAI** (recommended when Gemini quota is exhausted):
- `OPENAI_API_KEY`: your private OpenAI API key from https://platform.openai.com/api-keys
- `AI_PROVIDER`: `openai` (optional if OPENAI_API_KEY exists, but recommended when both keys exist)
- `OPENAI_MODEL`: `gpt-4.1-mini` (optional default; supports the Responses API and web search)

**Or use Gemini**:
- `GEMINI_API_KEY`: Google AI Studio API key
- `GEMINI_MODEL`: an accessible Gemini model supported by your account
- `AI_PROVIDER`: `gemini` (optional, explicitly selects Gemini when both keys exist)

OpenAI uses the Responses API with the built-in web_search tool when the user chooses Live Research. Only citations returned by the provider are displayed. AI costs and search-tool charges are billed by the provider separately from ChatGPT subscriptions. Both APIs require usage limits or billing/credits as applicable. Never commit a key into GitHub.

`npm install` then `npm run build`.

Important: live research happens only when Gemini returns grounding results. The website does not assert that every reply is independently verified. Abuse protection and usage limits should be configured before heavily promoting the public site.
