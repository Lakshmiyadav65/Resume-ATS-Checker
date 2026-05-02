# ResumeCheck

A web app that helps students predict whether their resume will pass an Applicant Tracking System for a specific job posting, scores their project descriptions, and gives concrete, point-quantified suggestions for how to improve.

## What it does

1. **Resume × Job Description compatibility check** — paste both, get a 0–100 ATS score and a verdict.
2. **Project description audit** — each project bullet is scored on action verbs, quantified impact, tech stack, length, and vague phrasing.
3. **Score-lift recommendations** — every recommendation has an estimated point gain.
4. **AI-generated rewrites** — weak bullets are rewritten by Claude in the XYZ format with measurable outcomes. Falls back to a deterministic rewrite when no API key is set, so the app runs out of the box.

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Anthropic Claude API** — `claude-haiku-4-5-20251001` for bullet rewrites
- `pdf-parse` and `mammoth` for resume file uploads (PDF / DOCX)
- Deploys to **Vercel** with zero config

## Getting started

```bash
npm install
cp .env.example .env.local
# (optional) put your ANTHROPIC_API_KEY in .env.local for live LLM rewrites
npm run dev
```

Open http://localhost:3000.

## How the score is computed

```
composite = round(matchScore * 0.45 + projAvg * 0.35 + formatScore * 0.20)
```

Verdict: `>= 80` ready · `>= 60` almost · `< 60` needs work.

Project bullets start at 100 and lose points for vague phrasing, missing action verbs, missing quantified impact, missing tech stack, and short bodies. See [lib/analysis/projects.ts](lib/analysis/projects.ts) for the exact rules.

## Project structure

```
app/                       Next.js App Router pages and API routes
  api/analyze/             POST — full analysis, returns AnalysisResult
  api/parse-resume/        POST — PDF/DOCX upload, returns extracted text
  api/rewrite/             POST — single-bullet rewrite (v2 hook)
components/                React components (Header, Hero, ScoreCard, …)
lib/
  analysis/                Scoring engine
  llm/                     Anthropic SDK wrappers and prompts
  parsing/                 PDF/DOCX text extraction
  data/                    Skills taxonomy, vague phrases, strong verbs
types/                     Shared TypeScript types
design-reference.html      The original visual prototype — source of truth for design
```

## Deployment

Push to GitHub and import into Vercel. Set `ANTHROPIC_API_KEY` in the project env vars. No database needed for v1.
