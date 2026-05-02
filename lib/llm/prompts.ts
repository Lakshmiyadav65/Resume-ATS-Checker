export interface RewritePromptInput {
  title: string;
  body: string;
  issues: string[];
  jdText: string;
  detectedTech: string[];
}

export function buildRewritePrompt(input: RewritePromptInput): string {
  return `You are helping a university student improve a single resume project bullet so it scores higher with applicant tracking systems and reads stronger to recruiters.

ORIGINAL PROJECT TITLE: ${input.title}
ORIGINAL BULLET: ${input.body}

DETECTED ISSUES:
${input.issues.map((i) => '- ' + i).join('\n')}

JOB DESCRIPTION (for keyword alignment):
${input.jdText.slice(0, 2000)}

TECH ALREADY MENTIONED IN BULLET: ${input.detectedTech.join(', ') || 'none'}

INSTRUCTIONS:
- Rewrite as ONE sentence in the XYZ format: "Accomplished [X] by doing [Y], measured by [Z]."
- Start with a strong action verb (Built, Designed, Shipped, Engineered, Optimized, etc.)
- Include 2-3 specific technologies, prioritizing those mentioned in the job description
- Include at least one quantified outcome (%, users, performance number, dataset size, etc.)
- If the original bullet lacks specifics, use realistic placeholders in [brackets] for the student to fill in
- Maximum 35 words
- Do NOT lie or invent achievements the student didn't make — when in doubt, use bracketed placeholders

Respond with strict JSON only. No markdown, no preamble. Format:
{"rewrite": "..."}`;
}
