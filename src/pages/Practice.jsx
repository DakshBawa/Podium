import { useEffect, useMemo, useRef, useState } from "react";
import Waveform from "../components/Waveform.jsx";
import Ring from "../components/Ring.jsx";
import usePractice, { speechSupported } from "../hooks/usePractice.js";
import { findFillers, tokenize } from "../utils/analyze.js";
import { fmtTime } from "../utils/time.js";

export default function Practice({ cfg, band, onFinish, onCancel }) {
  const { live, start, stop, cancel } = usePractice();
  const [count, setCount] = useState(3), [failed, setFailed] = useState(false), [busy, setBusy] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (count > 0) { const t = setTimeout(() => setCount((c) => c - 1), 900); return () => clearTimeout(t); }
    if (!started.current) { started.current = true; start(cfg.lang).then((ok) => { if (!ok) setFailed(true); }); }
  }, [count]); // eslint-disable-line

  const finals = live.finals.map((s) => s.text).join(" ");
  const full = `${finals} ${live.interim}`.trim();
  const words = useMemo(() => tokenize(full), [full]);
  const fillers = useMemo(() => findFillers(words).filter((m) => m && m !== "_").length, [words]);
  const recent = live.finals.filter((s) => s.t >= live.elapsed - 30).reduce((a, s) => a + tokenize(s.text).length, 0) + tokenize(live.interim).length;
  const rolling = live.elapsed > 10 ? Math.round((recent * 60) / Math.min(30, live.elapsed)) : null;
  const pace = rolling === null ? ["Warming up", "text-cream/50"] : rolling > band.max + 10 ? ["Slow down", "text-coral"] : rolling < band.min - 10 ? ["Speed up a little", "text-amber"] : ["Good pace", "text-good"];
  const pct = (live.elapsed / cfg.targetSec) * 100, over = live.elapsed > cfg.targetSec;

  const finish = async () => { setBusy(true); onFinish(await stop()); };
  const quit = () => { cancel(); onCancel(); };

  if (count > 0) return <div className="grid min-h-[60vh] place-items-center"><p key={count} className="count-pop font-mono text-9xl font-bold text-amber">{count}</p></div>;
  if (failed || live.error && !live.running) return (
    <div className="card mx-auto max-w-md text-center"><p className="text-3xl" aria-hidden>🎙</p><h2 className="mt-2 text-xl font-bold">We couldn't use your microphone</h2><p className="mt-2 text-sm text-cream/65">{live.error || "Allow microphone access and try again. You can also paste a transcript instead."}</p><button className="btn mt-5" onClick={quit}>Back to setup</button></div>
  );

  return (
    <div className="fade-up mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <section className="card flex flex-col items-center py-8">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-coral"><span className="rec-pulse h-2.5 w-2.5 rounded-full bg-coral" />Recording</p>
          <Ring value={Math.min(100, pct)} size={190} stroke={10} color={over ? "#ff6b4a" : pct > 90 ? "#ffb020" : "#5ad19a"}>
            <div className="text-center"><p className="font-mono text-5xl font-bold">{fmtTime(live.elapsed)}</p><p className="text-xs text-cream/50">of {fmtTime(cfg.targetSec)}</p></div>
          </Ring>
          <div className="mt-6 w-full max-w-md"><Waveform bars={live.bars} active={live.level > 0.05} /></div>
          <div className="mt-4 flex gap-3"><button className="btn" disabled={busy} onClick={finish}>{busy ? "Analysing…" : "■ Finish and analyse"}</button><button className="btn-ghost" disabled={busy} onClick={quit}>Discard</button></div>
        </section>

        <section className="card">
          <p className="label mb-2">Live transcript</p>
          {speechSupported ? <p className="min-h-16 text-sm leading-relaxed text-cream/85">{full ? full.slice(-420) : <span className="text-cream/40">Start speaking. Your words will appear here.</span>}</p>
            : <p className="text-sm text-cream/55">Live transcript isn't available in this browser. Keep talking, and we'll still measure your timing, pauses and volume.</p>}
        </section>
      </div>

      <aside className="space-y-4">
        <div className="card !p-4"><p className="label">Pace now</p><p className="font-mono text-3xl font-bold">{rolling ?? "–"}<span className="text-sm font-normal text-cream/50"> wpm</span></p><p className={`text-sm font-bold ${pace[1]}`}>{pace[0]}</p><p className="mt-1 text-xs text-cream/45">Aim for {band.min} to {band.max}</p></div>
        <div className="grid grid-cols-2 gap-4"><div className="card !p-4"><p className="label">Words</p><p className="font-mono text-2xl font-bold">{words.length}</p></div><div className="card !p-4"><p className="label">Fillers</p><p className={`font-mono text-2xl font-bold ${fillers > 5 ? "text-coral" : ""}`}>{fillers}</p></div></div>
        {cfg.notes.trim() && <div className="card !p-4"><p className="label mb-2">Your notes</p><p className="max-h-60 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-cream/70">{cfg.notes}</p></div>}
      </aside>
    </div>
  );
}
