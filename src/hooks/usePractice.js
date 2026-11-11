import { useCallback, useEffect, useRef, useState } from "react";

const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
export const speechSupported = !!SR;

/* Records the mic, measures volume 5 times a second, and (where supported) transcribes live */
export default function usePractice() {
  const [live, setLive] = useState({ running: false, elapsed: 0, level: 0, bars: [], interim: "", finals: [], error: "" });
  const r = useRef({});

  const cleanup = useCallback(() => {
    const x = r.current;
    clearInterval(x.timer); x.wantRec = false;
    try { x.sr && x.sr.abort(); } catch { /* ignore */ }
    try { x.mr && x.mr.state !== "inactive" && x.mr.stop(); } catch { /* ignore */ }
    x.stream && x.stream.getTracks().forEach((t) => t.stop());
    try { x.ctx && x.ctx.close(); } catch { /* ignore */ }
  }, []);
  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(async (lang) => {
    const x = (r.current = { segments: [], volume: [], chunks: [], wantRec: true });
    try { x.stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { setLive((l) => ({ ...l, error: "The microphone is blocked. Allow access in your browser settings, then try again." })); return false; }

    const AC = window.AudioContext || window.webkitAudioContext;
    x.ctx = new AC();
    x.an = x.ctx.createAnalyser(); x.an.fftSize = 1024;
    x.ctx.createMediaStreamSource(x.stream).connect(x.an);
    const buf = new Uint8Array(x.an.fftSize);

    if (window.MediaRecorder) {
      try { x.mr = new MediaRecorder(x.stream); x.mr.ondataavailable = (e) => e.data.size && x.chunks.push(e.data); x.mr.start(); } catch { /* playback just won't be available */ }
    }
    x.t0 = performance.now();
    if (SR) {
      const sr = (x.sr = new SR());
      sr.continuous = true; sr.interimResults = true; sr.lang = lang;
      sr.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) { const text = res[0].transcript.trim(); if (text) x.segments.push({ t: (performance.now() - x.t0) / 1000, text, conf: res[0].confidence }); }
          else interim += res[0].transcript;
        }
        setLive((l) => ({ ...l, interim, finals: [...x.segments] }));
      };
      sr.onend = () => { if (x.wantRec) { try { sr.start(); } catch { /* ignore */ } } };
      sr.onerror = (e) => { if (e.error === "not-allowed") setLive((l) => ({ ...l, error: "Speech recognition was blocked. Timing and volume are still measured." })); };
      try { sr.start(); } catch { /* ignore */ }
    }
    x.timer = setInterval(() => {
      x.an.getByteTimeDomainData(buf);
      let s = 0; for (const b of buf) { const v = (b - 128) / 128; s += v * v; }
      const rms = Math.sqrt(s / buf.length), t = (performance.now() - x.t0) / 1000, lv = Math.min(1, rms * 4);
      x.volume.push({ t, v: rms });
      setLive((l) => ({ ...l, running: true, elapsed: t, level: lv, bars: [...l.bars.slice(-47), lv] }));
    }, 200);
    setLive((l) => ({ ...l, running: true }));
    return true;
  }, []);

  const stop = useCallback(() => new Promise((resolve) => {
    const x = r.current, durationSec = (performance.now() - x.t0) / 1000;
    clearInterval(x.timer); x.wantRec = false;
    try { x.sr && x.sr.stop(); } catch { /* ignore */ }
    const finish = () => {
      const audioUrl = x.chunks.length ? URL.createObjectURL(new Blob(x.chunks, { type: x.mr?.mimeType || "audio/webm" })) : null;
      cleanup(); setLive((l) => ({ ...l, running: false }));
      resolve({ durationSec, segments: x.segments, volume: x.volume, audioUrl, transcript: x.segments.map((s) => s.text).join(" ") });
    };
    if (x.mr && x.mr.state !== "inactive") { x.mr.onstop = () => setTimeout(finish, 500); x.mr.stop(); } else setTimeout(finish, 600);
  }), [cleanup]);

  return { live, start, stop, cancel: cleanup };
}
