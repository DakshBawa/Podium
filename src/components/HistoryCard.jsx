import { scoreColor } from "../utils/time.js";

export default function HistoryCard({ history }) {
  if (!history.length) return <section className="card"><h2 className="font-bold">Your progress</h2><p className="mt-2 text-sm text-cream/55">Your sessions will show up here so you can watch your scores climb.</p></section>;
  const list = history.slice(0, 8).reverse(), W = 240, H = 56;
  const pts = list.map((h, i) => `${list.length === 1 ? W / 2 : (i / (list.length - 1)) * (W - 8) + 4},${H - 6 - (h.overall / 100) * (H - 12)}`).join(" ");
  return (
    <section className="card">
      <h2 className="font-bold">Your progress</h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="my-3 w-full" role="img" aria-label="Overall score over recent sessions"><polyline points={pts} fill="none" stroke="#ffb020" strokeWidth="2.5" strokeLinejoin="round" /></svg>
      <ul className="space-y-1.5">
        {history.slice(0, 5).map((h) => (
          <li key={h.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0 truncate"><span className="font-semibold">{h.title || "Untitled talk"}</span> <span className="text-xs text-cream/45">{new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></span>
            <span className="font-mono text-xs text-cream/60">{h.wpm} wpm</span>
            <span className="font-mono font-bold" style={{ color: scoreColor(h.overall) }}>{h.overall}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
