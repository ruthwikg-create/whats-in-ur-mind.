# What's in U'R mind

**Built by Ruthwik.** An independently hosted multilingual AI thought partner for career decisions, life questions and exploring new ideas.

## Features
- English, Telugu, Hindi, Tenglish, Hinglish and other languages
- Research-backed Gemini answers with Google Search grounding and real source links when available
- Separate reflective conversation mode
- Chat history stored locally on each user's own browser
- Responsive mobile/desktop design, dark mode, voice dictation where supported
- No Hatchable dependencies, permission wall or watermark

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
