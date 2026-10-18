// Shared answer-style policy for Gemini, OpenAI and OpenRouter.
// The client sends a style id only. All authoritative instructions stay server-side.
export const ANSWER_STYLES = Object.freeze({
  detailed: {
    label: 'Detailed',
    guidance: [
      'Use a high-quality encyclopedia-style explanation with approachable human wording, similar to the clarity of a well-edited Wikipedia overview.',
      'For substantial informational questions, start with a direct overview paragraph, then use meaningful Markdown headings (## and ###) to cover background, how or why it works, major aspects and practical implications.',
      'Define unfamiliar terminology before relying on it. Explain causes, reasoning, evidence, limitations and helpful concrete examples. Address relevant alternatives and tradeoffs, not just a generic list of claims.',
      'Give sufficient detail for a curious beginner to understand thoroughly, often several sections for broad questions. Do not pad simple questions with irrelevant text.',
      'Use complete paragraphs for explanation. Reserve numbered lists for actual steps and bullet lists for genuinely distinct points. Use readable tables only when comparing options.',
      'If web research provides sources, cite sources accurately at the relevant claims; distinguish documented facts from interpretation and give a reasoned recommendation when requested.'
    ].join(' ')
  },
  professional: {
    label: 'Professional',
    guidance: [
      'Write in a formal, precise, well-organized professional voice suitable for an academic report, professional briefing or career consultation.',
      'Lead with a clear executive overview, then use Markdown headings for evidence, detailed analysis, considerations, limitations, and recommendations as relevant.',
      'Explain domain-specific terms when useful, prioritize technical correctness and credible sources, and distinguish verified research from professional judgment.',
      'Use substantive paragraphs and neutral, polished language; do not use unnecessary emoji, filler or decorative formatting.'
    ].join(' ')
  },
  easy: {
    label: 'Easy Way',
    guidance: [
      'Explain the answer in friendly, natural, very easy language without losing essential facts.',
      'Start with a simple direct explanation, define new words in everyday language, and build understanding in small logical steps.',
      'Use at least one familiar real-world example or analogy for complex concepts when it helps. Explain why each step matters.',
      'Use short paragraphs and plain headings. Prefer simple sentences, but do not oversimplify important risks or invent certainty.',
      'Honor the user\'s language and script. For Tenglish and Hinglish, sound natural rather than translating word-for-word from English.'
    ].join(' ')
  },
  points: {
    label: 'Main Points',
    guidance: [
      'Give a quick but meaningful summary of the most important information.',
      'Start with a brief one- or two-sentence answer, followed by 4 to 8 numbered key points with one or two explanatory sentences each if the topic warrants it.',
      'End with a concrete takeaway or next action when relevant. Do not add numerous redundant headings, long introductions or excessive detail.',
      'If research is used, keep important source links and uncertainties. Do not drop crucial caveats merely for brevity.'
    ].join(' ')
  }
});

export function normalizeAnswerStyle(style) {
  return typeof style === 'string' && Object.prototype.hasOwnProperty.call(ANSWER_STYLES, style)
    ? style
    : 'detailed';
}

export function getAnswerStylePrompt(style) {
  const selected = ANSWER_STYLES[normalizeAnswerStyle(style)];
  return [
    'REQUIRED ANSWER PRESENTATION: ' + selected.label + '.',
    selected.guidance,
    'Typography rule: do not output the long em dash character or en dash character as punctuation. Use a period, comma, colon, parentheses or simple words instead. Standard Markdown hyphens for lists are allowed.',
    'Prefer accurate, informative headings and coherent explanatory paragraphs rather than fragmented decorative slogans.',
    'Always match the user\'s chosen language and script, including Telugu, Hindi, Tenglish or Hinglish. Do not make up research sources.'
  ].join('\n');
}

// Backstop for providers that occasionally ignore typographic instructions.
// Keep ordinary list hyphens and literal URLs unchanged.
export function cleanAnswerTypography(text) {
  return typeof text === 'string'
    ? text.replace(/\s*—\s*/g, ', ').replace(/\s*–\s*/g, ' to ')
    : text;
}

export function styleAnswerResponse(result, style) {
  return { ...result, answer: cleanAnswerTypography(result.answer), answerStyle: normalizeAnswerStyle(style) };
}
