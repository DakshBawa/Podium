import { useState } from "react";
import HistoryCard from "../components/HistoryCard.jsx";
import { PRESETS, LANGS } from "../data/presets.js";
import { speechSupported } from "../hooks/usePractice.js";

export default function Setup({ cfg, setCfg, history, onRecord, onPaste }) {
  const [mode, setMode] = useState("mic");
  const [text, setText] = useState(""), [mins, setMins] = useState(3), [secs, setSecs] = useState(0);
  const set = (k, v) => setCfg({ ...cfg, [k]: v });
  const dur = (+mins || 0) * 60 + (+secs || 0);

  return (
    <div className="fade-up grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">Practise out loud.<br /><span className="text-amber">Get coached instantly.</span></h1>
          <p className="mt-3 max-w-lg text-cream/65">Record your talk and Podium checks your speaking speed, filler words, clarity and timing, then tells you exactly what to improve.</p>
        </div>

        <section className="card space-y-5">
          <label className="block"><span className="label">Talk title (optional)</span><input className="field mt-1.5" value={cfg.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Final year project demo" /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block"><span className="label">Who is it for?</span>
              <select className="field mt-1.5" value={cfg.preset} onChange={(e) => set("preset", e.target.value)}>{PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.min} to {p.max} wpm)</option>)}</select></label>
            <label className="block"><span className="label">Target length: {Math.floor(cfg.targetSec / 60)}:{String(cfg.targetSec % 60).padStart(2, "0")}</span>
              <input type="range" min="60" max="900" step="30" value={cfg.targetSec} onChange={(e) => set("targetSec", +e.target.value)} className="mt-4 w-full accent-amber" aria-label="Target length" /></label>
          </div>
          <label className="block"><span className="label">Your notes or script (optional)</span><textarea rows={4} className="field mt-1.5" value={cfg.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Paste your script. We'll check that you covered your key terms, and show it while you speak." /></label>
        </section>

        <section className="card">
          <div className="mb-4 flex w-fit rounded-full bg-stage p-1" role="tablist">
            {[["mic", "🎙 Record with mic"], ["paste", "📝 Paste a transcript"]].map(([k, l]) => <button key={k} role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === k ? "bg-amber text-stage" : "text-cream/60"}`}>{l}</button>)}
          </div>
          {mode === "mic" ? (
            <div className="space-y-4">
              <p className={`rounded-xl px-3.5 py-2.5 text-sm ${speechSupported ? "bg-good/10 text-good" : "bg-amber/10 text-amber"}`}>{speechSupported ? "Live transcription works in this browser." : "This browser can't transcribe live (use Chrome or Edge). We'll still measure timing, pauses and volume, and you can paste a transcript for the word analysis."}</p>
              {speechSupported && <label className="block"><span className="label">Language you'll speak</span><select className="field mt-1.5 sm:w-64" value={cfg.lang} onChange={(e) => set("lang", e.target.value)}>{LANGS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>}
              <button className="btn" onClick={onRecord}>● Start practising</button>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea rows={6} className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste what you said, for example from a voice recording transcript." aria-label="Transcript" />
              <div className="flex flex-wrap items-end gap-3"><span className="label w-full">How long did it take?</span>
                <input type="number" min="0" className="field !w-20" value={mins} onChange={(e) => setMins(e.target.value)} aria-label="Minutes" /><span className="pb-2 text-sm">min</span>
                <input type="number" min="0" max="59" className="field !w-20" value={secs} onChange={(e) => setSecs(e.target.value)} aria-label="Seconds" /><span className="pb-2 text-sm">sec</span></div>
              <button className="btn" disabled={text.trim().split(/\s+/).length < 5 || dur < 10} onClick={() => onPaste(text, dur)}>Analyse transcript</button>
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="card">
          <h2 className="font-bold">What you'll get</h2>
          <ul className="mt-3 space-y-3 text-sm text-cream/70">
            {[["⚡", "Speaking speed", "Words per minute over time, against an ideal range"], ["🗣", "Filler words", "Um, like, you know and more, highlighted in your transcript"], ["🔍", "Clarity", "How easy you are to follow, plus pauses and voice energy"], ["⏱", "Timing", "How close you got to your target length"], ["💡", "Coaching", "Specific fixes with a drill to try next"]].map(([i, t, d]) => <li key={t} className="flex gap-3"><span aria-hidden>{i}</span><span><b className="text-cream">{t}.</b> {d}</span></li>)}
          </ul>
        </section>
        <HistoryCard history={history} />
        <p className="px-2 text-xs text-cream/40">Your audio and transcript stay in your browser. Nothing is uploaded. Live transcription in Chrome may use the browser's own speech service.</p>
      </aside>
    </div>
  );
}
