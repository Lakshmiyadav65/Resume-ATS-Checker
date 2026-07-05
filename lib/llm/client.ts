// Groq LLM client (OpenAI-compatible chat completions API).
//
// Groq offers a free tier with fast inference of open models. We talk to its
// REST endpoint directly with fetch — no SDK dependency needed. Every caller
// has a deterministic fallback, so a missing key or a failed request simply
// returns null and the app keeps working out of the box.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

/** Default model. Override with GROQ_MODEL. llama-3.3-70b-versatile supports
 *  JSON mode and is a strong, generally-available default. */
export const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export function hasGroqKey(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Request strict JSON output. The prompt MUST mention "JSON" or Groq rejects it. */
  json?: boolean;
}

/**
 * Call Groq's chat completions API and return the assistant message text.
 * Returns null when no key is configured or the request fails — callers treat
 * null as "use the deterministic fallback".
 */
export async function groqChat(opts: ChatOptions): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.3,
        max_tokens: opts.maxTokens ?? 1024,
        ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content : null;
  } catch {
    return null;
  }
}
