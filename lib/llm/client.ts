import Anthropic from '@anthropic-ai/sdk';

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!cached) {
    cached = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return cached;
}

export const MODEL = 'claude-haiku-4-5-20251001';
