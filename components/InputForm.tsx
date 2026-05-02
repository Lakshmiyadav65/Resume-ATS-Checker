'use client';

import { useRef, useState } from 'react';
import { Button } from './ui/Button';

const DEMO_RESUME = `JOHN DOE
john.doe@email.com | (555) 123-4567 | github.com/johndoe

EDUCATION
B.Tech Computer Science, IIT Hyderabad, 2026
CGPA: 8.4

PROJECTS
Personal Portfolio Site
Worked on a personal portfolio website. Used HTML, CSS and some JavaScript. Helped me learn web development.

Movie Recommendation App
Built a movie recommendation system that suggests films to users. Used Python and pandas. Was responsible for the backend.

SKILLS
Python, Java, HTML, CSS, JavaScript, Git, problem solving, teamwork

EXPERIENCE
Summer Intern, ABC Corp (2 months)
Worked on internal tools and helped the team with various tasks.`;

const DEMO_JD = `Software Engineer Intern — Frontend

We're hiring a Frontend Engineering Intern to help build customer-facing web applications.

Required Skills:
- Strong fundamentals in JavaScript and TypeScript
- Experience with React and modern build tools (Vite, Webpack)
- Familiarity with REST APIs and version control (Git)
- Knowledge of responsive design and CSS frameworks (Tailwind preferred)
- Understanding of testing (Jest, Cypress)

Nice to Have:
- Next.js experience
- Worked with state management (Redux, Zustand)
- Deployed apps to Vercel or similar
- Open-source contributions`;

interface InputFormProps {
  onAnalyze: (input: { resume: string; jd: string }) => void;
  onReset: () => void;
  loading: boolean;
  error: string | null;
}

export function InputForm({ onAnalyze, onReset, loading, error }: InputFormProps) {
  const [resume, setResume] = useState(DEMO_RESUME);
  const [jd, setJd] = useState(DEMO_JD);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploadWarning(null);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/parse-resume', { method: 'POST', body: fd });
      if (!res.ok) {
        setUploadWarning('Could not read that file. Try pasting your resume text directly.');
        return;
      }
      const data = (await res.json()) as { text: string; warning?: string };
      setResume(data.text);
      if (data.warning === 'parser_garbled') {
        setUploadWarning('Your resume may not be ATS-readable — extracted text looks unusual. Consider exporting a simpler PDF or pasting plain text.');
      }
    } catch {
      setUploadWarning('Upload failed. Try pasting your resume text directly.');
    }
  }

  function submit() {
    if (!resume.trim() || !jd.trim()) return;
    onAnalyze({ resume: resume.trim(), jd: jd.trim() });
  }

  function reset() {
    setResume(DEMO_RESUME);
    setJd(DEMO_JD);
    setUploadWarning(null);
    onReset();
  }

  return (
    <section id="input-section" className="py-[60px]">
      <div className="container max-w-page mx-auto px-6">
        <div className="mb-9">
          <div className="flex items-baseline justify-between mb-1.5">
            <label htmlFor="resume" className="text-sm font-semibold">
              Your resume
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[12px] text-ink-3 hover:text-ink underline underline-offset-2 decoration-line"
            >
              Upload PDF / DOCX
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = '';
              }}
            />
          </div>
          <p className="text-[13px] text-ink-3 mb-3">
            Paste the full text. Include your projects, skills, and experience sections.
          </p>
          <textarea
            id="resume"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            className="w-full bg-surface border border-line rounded-lg p-4 font-sans text-sm leading-[1.6] text-ink min-h-[240px] resize-y outline-none focus:border-accent transition-colors"
            placeholder="Paste your resume here..."
          />
          {uploadWarning && (
            <p className="mt-2 text-[13px] text-warn">{uploadWarning}</p>
          )}
        </div>

        <div className="mb-9">
          <label htmlFor="jd" className="block text-sm font-semibold mb-1.5">
            Job description
          </label>
          <p className="text-[13px] text-ink-3 mb-3">
            Paste the job posting you want to apply to.
          </p>
          <textarea
            id="jd"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            className="w-full bg-surface border border-line rounded-lg p-4 font-sans text-sm leading-[1.6] text-ink min-h-[180px] resize-y outline-none focus:border-accent transition-colors"
            placeholder="Paste the job description..."
          />
        </div>

        {error && (
          <div className="mb-4 text-center text-[13px] text-bad bg-bad-soft py-2 px-4 rounded-full inline-block mx-auto" role="alert">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-3 mt-10">
          <Button onClick={submit} disabled={loading} variant="primary">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Analyzing…
              </span>
            ) : (
              'Check my resume'
            )}
          </Button>
          <Button onClick={reset} variant="ghost" disabled={loading}>
            Reset
          </Button>
        </div>
      </div>
    </section>
  );
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="#e8b84a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
