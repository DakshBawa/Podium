import { FILLERS, HEDGE_RE, STOP } from "../data/presets.js";

const clamp = (v, a = 0, b = 100) => Math.min(b, Math.max(a, v));
export const tokenize = (t) => t.toLowerCase().match(/[a-z']+/g) || [];
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const sd = (xs) => { const m = mean(xs); return Math.sqrt(mean(xs.map((x) => (x - m) ** 2))); };

/* Marks filler words: marks[i] is the filler label, "_" for the rest of a phrase, or null */
export function findFillers(words) {
  const marks = new Array(words.length).fill(null);
  FILLERS.multi.forEach((phrase) => {
    const p = phrase.split(" ");
    for (let i = 0; i <= words.length - p.length; i++)
      if (p.every((w, k) => words[i + k] === w && !marks[i + k])) p.forEach((_, k) => { marks[i + k] = k === 0 ? phrase : "_"; });
  });
  words.forEach((w, i) => {
    if (marks[i]) return;
    if (FILLERS.single.includes(w)) marks[i] = w;
    else if (w === "like" && FILLERS.likePrev.includes(words[i - 1])) marks[i] = "like";
  });
  return marks;
}

function pausesFrom(volume) {
  if (volume.length < 20) return null;
  const sorted = volume.map((x) => x.v).sort((a, b) => a - b);
  const thr = Math.max(0.012, sorted[Math.floor(sorted.length * 0.9)] * 0.18);
  const speech = volume.filter((x) => x.v >= thr);
  if (!speech.length) return null;
  const first = speech[0].t, last = speech[speech.length - 1].t;
  const list = []; let start = null;
  volume.forEach((x) => {
    if (x.t < first || x.t > last) return;
    if (x.v < thr) { if (start === null) start = x.t; }
    else if (start !== null) { if (x.t - start >= 1.2) list.push({ start, end: x.t }); start = null; }
  });
  const db = speech.map((x) => 20 * Math.log10(Math.max(x.v, 1e-4)));
  const variety = sd(db);
  return {
    list, count: list.length, long: list.filter((p) => p.end - p.start >= 3).length,
    total: list.reduce((a, p) => a + (p.end - p.start), 0), span: last - first,
    variety, energy: variety < 3.5 ? "Flat" : variety < 6 ? "Good variety" : "Very expressive",
  };
}

export function coverageOf(notes, words) {
  const freq = {};
  tokenize(notes).filter((w) => w.length >= 5 && !STOP.has(w)).forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  const keys = Object.entries(freq).sort((a, b) => b[1] - a[1] || b[0].length - a[0].length).slice(0, 12).map(([w]) => w);
  if (keys.length < 3) return null;
  const hit = keys.filter((k) => words.some((w) => w.startsWith(k.slice(0, 5))));
  return { keys, hit, miss: keys.filter((k) => !hit.includes(k)) };
}

/* Turns a practice session into scores and findings. Everything runs in the browser. */
export function analyze({ transcript, durationSec, segments = [], volume = [], targetSec, band, notes = "" }) {
  const words = tokenize(transcript), n = words.length;
  if (n < 5) return { empty: true, durationSec, delivery: pausesFrom(volume) };
  const wpm = Math.round(n / Math.max(durationSec / 60, 1 / 60));

  // fillers, stumbles, hedges
  const marks = findFillers(words);
  const counts = {};
  marks.forEach((m) => { if (m && m !== "_") counts[m] = (counts[m] || 0) + 1; });
  const total = Object.values(counts).reduce((a, b) => a + b, 0), rate = (total / n) * 100;
  const stumbles = words.filter((w, i) => i && w === words[i - 1] && !marks[i] && w.length <= 4).length;
  const hedges = (transcript.toLowerCase().match(HEDGE_RE) || []).length;

  // pace over time (15 second windows)
  const W = 15, buckets = {};
  segments.forEach((s) => { const k = Math.min(Math.floor(s.t / W), Math.floor(durationSec / W)); buckets[k] = (buckets[k] || 0) + tokenize(s.text).length; });
  const timeline = Object.entries(buckets).map(([k, c]) => { const len = Math.min(W, durationSec - k * W); return len >= 5 ? { t: k * W + len / 2, wpm: Math.round((c * 60) / len) } : null; }).filter(Boolean).sort((a, b) => a.t - b.t);
  const flow = timeline.map((x) => x.wpm).filter((x) => x > 0);
  const paceSd = flow.length > 2 ? sd(flow) : 0;
  const third = Math.max(1, Math.floor(timeline.length / 3));
  const thirds = timeline.length >= 3 ? [mean(timeline.slice(0, third).map((x) => x.wpm)), mean(timeline.slice(third, -third).map((x) => x.wpm)), mean(timeline.slice(-third).map((x) => x.wpm))].map(Math.round) : null;

  // clarity
  const confs = segments.filter((s) => s.conf > 0), conf = confs.length ? confs.reduce((a, s) => a + s.conf * tokenize(s.text).length, 0) / confs.reduce((a, s) => a + tokenize(s.text).length, 0) : null;
  const variety = new Set(words).size / Math.sqrt(n), lowVariety = n >= 80 && variety < 4.5;
  const clarity = clamp(Math.round((conf !== null ? 55 + conf * 45 : 88) - (stumbles / n) * 400 - (hedges / n) * 200 - (lowVariety ? 8 : 0)));

  // scores
  const dev = wpm < band.min ? band.min - wpm : wpm > band.max ? wpm - band.max : 0;
  const pace = clamp(Math.round(100 - dev * 2.2 - Math.max(0, paceSd - 25) * 0.6));
  const fillerScore = clamp(Math.round(100 - rate * 10));
  const ratio = durationSec / targetSec, timing = clamp(Math.round(100 - (Math.abs(ratio - 1) - 0.1) * 150));
  const overall = Math.round(pace * 0.3 + fillerScore * 0.25 + clarity * 0.25 + timing * 0.2);
  const delivery = pausesFrom(volume);

  return {
    empty: false, words: n, wpm, durationSec, targetSec, band, transcript, marks,
    fillers: { total, rate, counts: Object.entries(counts).sort((a, b) => b[1] - a[1]) },
    stumbles, hedges, timeline, paceSd, thirds, conf, lowVariety, delivery,
    timingDiff: durationSec - targetSec,
    coverage: notes.trim() ? coverageOf(notes, words) : null,
    scores: { pace, fillers: fillerScore, clarity, timing: clamp(timing), overall },
  };
}
