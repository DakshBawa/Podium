import { useMemo } from "react";
import Ring from "../components/Ring.jsx";
import ScoreCard from "../components/ScoreCard.jsx";
import PaceChart from "../components/PaceChart.jsx";
import TranscriptView from "../components/TranscriptView.jsx";
import HistoryCard from "../components/HistoryCard.jsx";
import { suggest } from "../utils/suggest.js";
import { fmtTime, scoreColor, scoreWord } from "../utils/time.js";

const SEV = { high: ["bg-coral", "Fix first"], med: ["bg-amber", "Worth improving"], low: ["bg-cream/40", "Small tweak"] };

export default function Report({ a, session, cfg, history, prevScore, onAgain, onNew }) {
  const coach = useMemo(() => (a.empty ? null : suggest(a)), [a]);

  if (a.empty) return (
    <div className="card fade-up mx-auto max-w-md text-center"><p className="text-3xl" aria-hidden>🤔</p><h2 className="mt-2 text-xl font-bold">We didn't catch enough words</h2>
      <p className="mt-2 text-sm text-cream/65">We need at least a few sentences to analyse. {a.delivery ? `We did measure ${fmtTime(a.durationSec)} of audio.` : ""} Try speaking a little longer or closer to the mic, or paste a transcript instead.</p>
      <div className="mt-5 flex justify-center gap-3"><button className="btn" onClick={onAgain}>Try again</button><button className="btn-ghost" onClick={onNew}>Back to setup</button></div></div>
  );

  const s = a.scores, delta = prevScore == null ? null : s.overall - prevScore;
  const verdict = coach.tips[0] ? `Biggest win available: ${coach.tips[0].area.toLowerCase()}.` : "Nothing major to fix. Keep practising to stay sharp.";
  const d = a.delivery;

  return (
    <div className="fade-up space-y-6">
      <section className="card grid items-center gap-6 !p-6 md:grid-cols-[auto_1fr_auto]">
        <Ring value={s.overall} size={150} stroke={12} color={scoreColor(s.overall)}><div className="text-center"><p className="font-mono text-5xl font-bold">{s.overall}</p><p className="text-xs text-cream/50">out of 100</p></div></Ring>
        <div>
          <p className="label">{cfg.title || "Your practice run"}</p>
          <h1 className="text-3xl font-bold md:text-4xl" style={{ color: scoreColor(s.overall) }}>{scoreWord(s.overall)} delivery</h1>
          <p className="mt-1 text-cream/70">{verdict}</p>
          {delta !== null && <p className={`mt-2 text-sm font-bold ${delta >= 0 ? "text-good" : "text-coral"}`}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} points since your last session</p>}
        </div>
        <div className="flex gap-3 md:flex-col"><button className="btn" onClick={onAgain}>↻ Practise again</button><button className="btn-ghost" onClick={onNew}>New talk</button></div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard title="Speaking speed" score={s.pace} value={`${a.wpm} wpm`} sub={`Ideal ${a.band.min} to ${a.band.max}`} note={a.wpm > a.band.max ? "A bit fast" : a.wpm < a.band.min ? "A bit slow" : "In the sweet spot"} />
        <ScoreCard title="Filler words" score={s.fillers} value={`${a.fillers.total} found`} sub={`${a.fillers.rate.toFixed(1)} per 100 words`} />
        <ScoreCard title="Clarity" score={s.clarity} value={a.conf !== null ? `${Math.round(a.conf * 100)}% recognised` : "Estimated"} sub={a.stumbles ? `${a.stumbles} repeated words` : "Clean delivery"} />
        <ScoreCard title="Timing" score={s.timing} value={`${fmtTime(a.durationSec)} of ${fmtTime(a.targetSec)}`} sub={a.timingDiff > 0 ? `${fmtTime(a.timingDiff)} over` : `${fmtTime(-a.timingDiff)} under`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="card">
            <h2 className="mb-4 text-xl font-bold">How to improve</h2>
            <ol className="space-y-4">
              {coach.tips.length === 0 && <li className="text-sm text-cream/65">Great job. We have no major suggestions this time.</li>}
              {coach.tips.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 font-mono text-xs">{i + 1}</span>
                  <div>
                    <p className="flex flex-wrap items-center gap-2 font-bold">{t.title}<span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-stage ${SEV[t.sev][0]}`}>{SEV[t.sev][1]}</span></p>
                    <p className="mt-0.5 text-sm text-cream/65">{t.why}</p>
                    <p className="mt-1.5 rounded-xl bg-amber/10 px-3 py-2 text-sm text-amber"><b>Try this:</b> {t.drill}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <section className="card"><h2 className="mb-3 text-xl font-bold">Pace over time</h2>{a.timeline.length > 1 ? <PaceChart a={a} /> : <p className="text-sm text-cream/55">The pace chart needs a recorded talk with live transcription. Your average was {a.wpm} words a minute.</p>}</section>
          <section className="card"><h2 className="mb-3 text-xl font-bold">Your transcript</h2><p className="mb-2 text-xs text-cream/50">Filler words are <mark className="filler">highlighted</mark>.</p><TranscriptView text={a.transcript} marks={a.marks} /></section>
        </div>

        <div className="space-y-6">
          {coach.wins.length > 0 && <section className="card"><h2 className="mb-3 text-xl font-bold">What went well</h2><ul className="space-y-2 text-sm text-cream/80">{coach.wins.map((w, i) => <li key={i} className="flex gap-2"><span className="text-good" aria-hidden>✓</span>{w}</li>)}</ul></section>}
          <section className="card">
            <h2 className="mb-3 text-xl font-bold">Filler words</h2>
            {a.fillers.counts.length === 0 ? <p className="text-sm text-cream/65">None detected. Excellent.</p> : <ul className="space-y-2">{a.fillers.counts.map(([w, c]) => <li key={w} className="text-sm"><span className="flex justify-between"><span>“{w}”</span><span className="font-mono">{c}</span></span><span className="mt-1 block h-1.5 rounded-full bg-white/10"><span className="block h-full rounded-full bg-amber" style={{ width: `${(c / a.fillers.counts[0][1]) * 100}%` }} /></span></li>)}</ul>}
            <p className="mt-3 text-xs text-cream/40">“Like” is only counted where it's used as filler.</p>
          </section>
          {d && <section className="card"><h2 className="mb-3 text-xl font-bold">Delivery</h2><dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="label">Pauses</dt><dd className="font-mono text-xl font-bold">{d.count}</dd></div><div><dt className="label">Long pauses</dt><dd className="font-mono text-xl font-bold">{d.long}</dd></div><div><dt className="label">Time paused</dt><dd className="font-mono text-xl font-bold">{Math.round((d.total / d.span) * 100)}%</dd></div><div><dt className="label">Voice energy</dt><dd className="text-sm font-bold">{d.energy}</dd></div></dl></section>}
          {a.coverage && <section className="card"><h2 className="mb-3 text-xl font-bold">Notes coverage</h2><p className="mb-3 text-sm text-cream/65">You mentioned {a.coverage.hit.length} of {a.coverage.keys.length} key terms.</p><div className="flex flex-wrap gap-1.5">{a.coverage.keys.map((k) => <span key={k} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${a.coverage.hit.includes(k) ? "bg-good/15 text-good" : "bg-coral/15 text-coral"}`}>{a.coverage.hit.includes(k) ? "✓" : "✗"} {k}</span>)}</div></section>}
          {session.audioUrl && <section className="card"><h2 className="mb-3 text-xl font-bold">Listen back</h2><audio controls src={session.audioUrl} className="w-full" /><p className="mt-2 text-xs text-cream/40">Hearing yourself is the fastest way to spot habits.</p></section>}
          <HistoryCard history={history} />
        </div>
      </div>
    </div>
  );
}
