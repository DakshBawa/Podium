import { fmtTime } from "../utils/time.js";

export default function PaceChart({ a }) {
  const W = 640, H = 190, pad = 28, dur = a.durationSec;
  const maxY = Math.max(200, ...a.timeline.map((x) => x.wpm + 20)), x = (t) => pad + (t / dur) * (W - pad - 8), y = (v) => H - 34 - (v / maxY) * (H - 50);
  const path = a.timeline.map((p, i) => `${i ? "L" : "M"}${x(p.t)} ${y(p.wpm)}`).join(" ");
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Speaking speed over time">
        <rect x={pad} y={y(a.band.max)} width={W - pad - 8} height={y(a.band.min) - y(a.band.max)} fill="#5ad19a" opacity=".12" />
        <text x={pad + 4} y={y(a.band.max) - 4} fontSize="10" fill="#5ad19a">Ideal {a.band.min} to {a.band.max}</text>
        {[0, 100, 200].filter((v) => v <= maxY).map((v) => <g key={v}><line x1={pad} x2={W - 8} y1={y(v)} y2={y(v)} stroke="#ffffff10" /><text x="2" y={y(v) + 3} fontSize="9" fill="#f5efe680">{v}</text></g>)}
        {a.delivery?.list.map((p, i) => <rect key={i} x={x(p.start)} y={H - 26} width={Math.max(2, x(p.end) - x(p.start))} height="8" rx="2" fill="#f5efe655"><title>Pause {(p.end - p.start).toFixed(1)}s</title></rect>)}
        {path && <path d={path} fill="none" stroke="#ffb020" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
        {a.timeline.map((p, i) => <circle key={i} cx={x(p.t)} cy={y(p.wpm)} r="3.5" fill="#ffb020"><title>{`${fmtTime(p.t)}: ${p.wpm} wpm`}</title></circle>)}
        {[0, 0.5, 1].map((f) => <text key={f} x={x(dur * f)} y={H - 4} fontSize="10" fill="#f5efe680" textAnchor={f === 0 ? "start" : f === 1 ? "end" : "middle"}>{fmtTime(dur * f)}</text>)}
      </svg>
      <figcaption className="text-xs text-cream/50">Words per minute in 15-second slices. Grey blocks are pauses over 1.2 seconds.</figcaption>
    </figure>
  );
}
