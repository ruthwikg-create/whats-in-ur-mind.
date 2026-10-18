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
- `GEMINI_API_KEY`: Google AI Studio API key
- `GEMINI_MODEL`: `gemini-2.5-flash`

`npm install` then `npm run build`.

Important: live research happens only when Gemini returns grounding results. The website does not assert that every reply is independently verified. Abuse protection and usage limits should be configured before heavily promoting the public site.
