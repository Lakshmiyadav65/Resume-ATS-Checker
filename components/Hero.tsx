export function Hero() {
  return (
    <section className="border-b border-line py-20 md:py-[80px] pb-[60px] text-center">
      <div className="container max-w-page mx-auto px-6">
        <div className="text-sm text-ink-3 mb-[18px]">
          For students applying to their first roles
        </div>
        <h1 className="font-serif font-normal leading-[1.05] tracking-[-0.02em] max-w-[720px] mx-auto text-[clamp(40px,6vw,64px)]">
          Will your resume <em className="italic text-accent">pass</em> the algorithm before a human ever sees it?
        </h1>
        <p className="mt-[22px] text-[18px] text-ink-2 max-w-[560px] mx-auto">
          Most companies filter resumes with software before recruiters read them. Paste yours below to see exactly what to fix.
        </p>
        <div className="mt-10 flex justify-center gap-8 text-sm text-ink-3 flex-wrap">
          <Step n={1}>Paste resume</Step>
          <Step n={2}>Paste job</Step>
          <Step n={3}>Get fixes</Step>
        </div>
      </div>
    </section>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div>
      <span className="inline-block w-[22px] h-[22px] border border-line rounded-full text-center leading-[20px] text-xs mr-2 text-ink">
        {n}
      </span>
      {children}
    </div>
  );
}
