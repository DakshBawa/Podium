import { useState } from "react";
import Header from "./components/Header.jsx";
import Setup from "./pages/Setup.jsx";
import Practice from "./pages/Practice.jsx";
import Report from "./pages/Report.jsx";
import usePersistentState from "./hooks/usePersistentState.js";
import { PRESETS } from "./data/presets.js";
import { analyze } from "./utils/analyze.js";

const DEFAULT = { title: "", preset: "class", targetSec: 300, notes: "", lang: "en-IN" };

export default function App() {
  const [stage, setStage] = useState("setup");
  const [cfg, setCfg] = useState(DEFAULT);
  const [history, setHistory] = usePersistentState("podium.history", []);
  const [result, setResult] = useState(null);
  const band = PRESETS.find((p) => p.id === cfg.preset);

  const finish = (session) => {
    const a = analyze({ ...session, targetSec: cfg.targetSec, band, notes: cfg.notes });
    const prevScore = history[0]?.overall ?? null;
    if (!a.empty) setHistory((h) => [{ id: Date.now(), date: new Date().toISOString(), title: cfg.title, overall: a.scores.overall, wpm: a.wpm, fillers: a.fillers.total, duration: Math.round(a.durationSec) }, ...h].slice(0, 30));
    setResult({ a, session, prevScore });
    setStage("report");
  };

  return (
    <div className="min-h-screen pb-16">
      <Header stage={stage} />
      <main className="mx-auto max-w-5xl px-4 md:px-8">
        {stage === "setup" && <Setup cfg={cfg} setCfg={setCfg} history={history} onRecord={() => setStage("practice")} onPaste={(transcript, durationSec) => finish({ transcript, durationSec, segments: [], volume: [], audioUrl: null })} />}
        {stage === "practice" && <Practice cfg={cfg} band={band} onFinish={finish} onCancel={() => setStage("setup")} />}
        {stage === "report" && result && <Report a={result.a} session={result.session} cfg={cfg} history={history} prevScore={result.prevScore} onAgain={() => setStage("practice")} onNew={() => { setCfg(DEFAULT); setStage("setup"); }} />}
      </main>
    </div>
  );
}
