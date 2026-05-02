export function Header() {
  return (
    <header className="border-b border-line">
      <div className="container max-w-page mx-auto px-6 py-7 flex justify-between items-center">
        <div className="font-serif text-[22px] tracking-[-0.01em]">
          resume
          <span className="inline-block w-2 h-2 bg-accent rounded-full mx-[3px] mb-[2px] align-middle" />
          check
        </div>
        <a href="#how" className="text-[13px] text-ink-3 hover:text-ink no-underline">
          How it works
        </a>
      </div>
    </header>
  );
}
