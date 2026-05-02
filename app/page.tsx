'use client';

import { useEffect, useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { InputForm } from '@/components/InputForm';
import { ShortlistBanner } from '@/components/ShortlistBanner';
import { ScoreCard } from '@/components/ScoreCard';
import { MatchSection } from '@/components/MatchSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { LiftSection } from '@/components/LiftSection';
import { Footer } from '@/components/Footer';
import type { AnalysisResult } from '@/types/analysis';

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      const t = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [result]);

  async function handleAnalyze({ resume, jd }: { resume: string; jd: string }) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jd }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Analysis failed');
      }
      const data = (await res.json()) as AnalysisResult;
      setResult(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <Header />
      <Hero />
      <InputForm
        onAnalyze={handleAnalyze}
        onReset={handleReset}
        loading={loading}
        error={error}
      />

      {result && (
        <section ref={resultsRef} className="border-t border-line py-[60px] animate-fadeUp">
          <div className="container max-w-page mx-auto px-6">
            <ShortlistBanner prediction={result.prediction} />
            <ScoreCard composite={result.composite} verdict={result.verdict} />
            <MatchSection
              matchScore={result.matchScore}
              projAvg={result.projAvg}
              formatScore={result.formatScore}
              matched={result.matched}
              missing={result.missing}
            />
            <ProjectsSection projects={result.projects} />
            <LiftSection lifts={result.lifts} />
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
