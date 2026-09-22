// The AI backends the tutor can use, in the order it tries them.
//
// Files under api/_lib aren't deployed as endpoints — this is shared code for
// api/ask.js. Each provider exposes the same shape so ask.js can fall through
// the list without caring who is answering.
//
// Adding a provider means adding one entry to chain() below.

const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'

// Gemini 3.x replaced thinkingBudget with thinkingLevel, and sending both is a
// 400. Only 3.6 accepts "minimal"; "low" is the safe floor everywhere else.
const GEMINI_THINKING =
  process.env.GEMINI_THINKING_LEVEL || (GEMINI_MODEL.startsWith('gemini-3.6') ? 'minimal' : 'low')

const MAX_TOKENS = 1200
const TEMPERATURE = 0.4

// Everything OpenAI-shaped (Groq, OpenRouter, OpenAI itself) speaks this.
function openAiStyle({ name, url, key, model, headers = {} }) {
  return {
    name,
    model,
    request({ system, turns, signal, stream }) {
      return fetch(url, {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...headers },
        body: JSON.stringify({
          model,
          stream,
          temperature: TEMPERATURE,
          max_completion_tokens: MAX_TOKENS,
          messages: [
            { role: 'system', content: system },
            ...turns.map((t) => ({ role: t.role === 'model' ? 'assistant' : 'user', content: t.text })),
          ],
        }),
      })
    },
    whole: (json) => json?.choices?.[0]?.message?.content || '',
    chunk: (json) => json?.choices?.[0]?.delta?.content || '',
    errorText: (json) => json?.error?.message || json?.error?.type || '',
  }
}

function gemini({ key, model }) {
  return {
    name: 'gemini',
    model,
    request({ system, turns, signal, stream }) {
      const method = stream ? 'streamGenerateContent?alt=sse' : 'generateContent'
      return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:${method}`, {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: turns.map((t) => ({ role: t.role === 'model' ? 'model' : 'user', parts: [{ text: t.text }] })),
          generationConfig: {
            temperature: TEMPERATURE,
            maxOutputTokens: MAX_TOKENS,
            thinkingConfig: { thinkingLevel: GEMINI_THINKING },
          },
        }),
      })
    },
    whole: (json) =>
      (json?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join(''),
    chunk: (json) =>
      (json?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join(''),
    errorText: (json) => json?.error?.message || '',
  }
}

// Order matters: the first one that answers wins, and the rest are only tried
// when it is rate-limited, overloaded or too slow. Groq goes first because its
// free tier allows roughly fifty times what Gemini's does.
export function chain() {
  const out = []
  if (process.env.GROQ_API_KEY) {
    out.push(openAiStyle({
      name: 'groq',
      // GROQ_URL exists so the whole path can be pointed at a local mock
      // during development; it is not needed in production.
      url: process.env.GROQ_URL || 'https://api.groq.com/openai/v1/chat/completions',
      key: process.env.GROQ_API_KEY,
      model: GROQ_MODEL,
    }))
  }
  if (process.env.OPENROUTER_API_KEY) {
    out.push(openAiStyle({
      name: 'openrouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      key: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    }))
  }
  if (process.env.GEMINI_API_KEY) {
    out.push(gemini({ key: process.env.GEMINI_API_KEY, model: GEMINI_MODEL }))
  }
  return out
}

// How long the provider asked us to wait, in ms, from either a structured
// RetryInfo detail or the sentence in the message. 0 when it didn't say.
export function retryDelay(json) {
  const info = (json?.error?.details || []).find((d) => String(d['@type']).includes('RetryInfo'))
  const fromDetail = info?.retryDelay && String(info.retryDelay).match(/^([\d.]+)s?$/)
  if (fromDetail) return Math.ceil(Number(fromDetail[1]) * 1000)
  const text = String(json?.error?.message || '')
  const fromText = text.match(/(?:retry in|try again in)\s*([\d.]+)\s*s/i)
  return fromText ? Math.ceil(Number(fromText[1]) * 1000) : 0
}

// Reads an SSE body and yields the text of each chunk. Both OpenAI-style and
// Gemini streams are "data: {json}" lines ending with a blank line.
export async function* sseText(response, extract) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let cut
    while ((cut = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, cut).trim()
      buffer = buffer.slice(cut + 1)
      if (!line.startsWith('data:')) continue
      const payload = line.slice(5).trim()
      if (!payload || payload === '[DONE]') continue
      try {
        const text = extract(JSON.parse(payload))
        if (text) yield text
      } catch {
        // A half-written chunk isn't worth killing the answer over.
      }
    }
  }
}
