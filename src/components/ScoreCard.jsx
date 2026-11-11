import Ring from "./Ring.jsx";
import { scoreColor, scoreWord } from "../utils/time.js";

export default function ScoreCard({ title, score, value, sub, note }) {
  return (
    <article className="card flex items-center gap-4 !p-4">
      <Ring value={score} size={78} stroke={8} color={scoreColor(score)}><span className="font-mono text-xl font-bold">{score}</span></Ring>
      <div className="min-w-0">
        <p className="label">{title}</p>
        <p className="text-xl font-bold leading-tight">{value}</p>
        <p className="text-xs text-cream/55">{sub}</p>
        <p className="mt-1 text-xs font-bold" style={{ color: scoreColor(score) }}>{note || scoreWord(score)}</p>
      </div>
    </article>
  );
}
