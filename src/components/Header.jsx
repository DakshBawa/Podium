const STEPS = [["setup", "Setup"], ["practice", "Practise"], ["report", "Report"]];

export default function Header({ stage }) {
  const i = STEPS.findIndex(([id]) => id === stage);
  return (
    <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-5 md:px-8">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-amber text-lg text-stage" aria-hidden>🎙</span>
        <span className="text-xl font-bold tracking-tight">Podium</span>
      </div>
      <ol className="flex items-center gap-2 text-xs font-semibold" aria-label="Steps">
        {STEPS.map(([id, l], k) => (
          <li key={id} className="flex items-center gap-2" aria-current={k === i ? "step" : undefined}>
            <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] ${k <= i ? "bg-amber text-stage" : "border border-edge text-cream/50"}`}>{k + 1}</span>
            <span className={k === i ? "text-cream" : "text-cream/45"}>{l}</span>
            {k < 2 && <span className="mx-1 h-px w-6 bg-edge" />}
          </li>
        ))}
      </ol>
    </header>
  );
}
