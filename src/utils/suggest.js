import { fmtTime } from "./time.js";

const ORDER = { high: 0, med: 1, low: 2 };

/* Plain-language coaching based on the analysis. Each tip has a concrete drill to try next. */
export function suggest(a) {
  const tips = [], wins = [], { band } = a;
  const tip = (sev, area, title, why, drill) => tips.push({ sev, area, title, why, drill });

  if (a.wpm > band.max + 10) tip(a.wpm > band.max + 30 ? "high" : "med", "Pace", `You're speaking fast at ${a.wpm} words a minute`, `Audiences follow best at ${band.min} to ${band.max}. Fast speech makes key points blur together.`, `Mark a breath after every full stop in your notes. Practise one section at a time and aim to drop about ${a.wpm - band.max} words a minute.`);
  else if (a.wpm < band.min - 10) tip(a.wpm < band.min - 30 ? "high" : "med", "Pace", `You're speaking slowly at ${a.wpm} words a minute`, `A pace under ${band.min} can lose attention, especially in a longer talk.`, "Practise the opening two minutes with a timer, and trim words you don't need so you can keep a steady flow.");
  else wins.push(`Your pace of ${a.wpm} words a minute sits in the ideal ${band.min} to ${band.max} range.`);

  if (a.paceSd > 28) tip("med", "Pace", "Your speed swings from section to section", `Your pace varied by about ${Math.round(a.paceSd)} words a minute between parts of the talk.`, "Find the fastest part and rehearse it alone at a steady beat. A metronome app at a calm tempo helps.");
  if (a.thirds && a.thirds[2] > a.thirds[0] * 1.2 && a.thirds[2] > band.max - 10) tip("med", "Pace", "You rushed the ending", `You spoke at about ${a.thirds[0]} words a minute at the start and ${a.thirds[2]} at the end.`, "Rehearse your conclusion three times, slower each time. Your last sentence is the one people remember.");

  const top = a.fillers.counts[0];
  if (a.fillers.rate >= 4) tip("high", "Filler words", `${a.fillers.total} filler words, about ${a.fillers.rate.toFixed(1)} per 100 words`, `Your most used was “${top[0]}” (${top[1]} times). Too many fillers distract from your message.`, `Replace “${top[0]}” with a silent pause. Record 30 seconds where you only focus on that one word, then repeat.`);
  else if (a.fillers.rate >= 2) tip("med", "Filler words", `A few filler words crept in (${a.fillers.total})`, `“${top[0]}” appeared ${top[1]} times. A small habit, easy to fix.`, "Pause and breathe before each new point instead of filling the gap. Silence sounds confident.");
  else wins.push(a.fillers.total === 0 ? "No filler words at all. Very clean." : `Very few filler words (${a.fillers.total}). Nicely controlled.`);

  const diff = a.timingDiff, tol = a.targetSec * 0.1;
  if (diff > tol) tip(diff > a.targetSec * 0.25 ? "high" : "med", "Timing", `You ran ${fmtTime(diff)} over your target`, `You took ${fmtTime(a.durationSec)} against a ${fmtTime(a.targetSec)} target.`, `Cut about ${Math.round((diff / 60) * a.wpm)} words. Remove one example or a repeated point rather than speaking faster.`);
  else if (diff < -tol) tip("low", "Timing", `You finished ${fmtTime(-diff)} early`, `You took ${fmtTime(a.durationSec)} against a ${fmtTime(a.targetSec)} target.`, "Add a short example, a recap of your key points or a question to the audience. Don't rush to fill the time.");
  else wins.push(`Great timing: ${fmtTime(a.durationSec)} against a ${fmtTime(a.targetSec)} target.`);

  const d = a.delivery;
  if (d) {
    if (d.long >= 3) tip("med", "Flow", `${d.long} long pauses (over 3 seconds)`, "Long silences can feel like you lost your place.", "Write a one-line bridge between sections, such as “That brings me to…”, so you never go blank.");
    else if (d.count === 0 && a.durationSec > 90) tip("med", "Flow", "You barely paused", "Pauses give listeners time to take in key points.", "Add a deliberate two-second pause after your main points and after any question you ask.");
    else if (d.count >= 2) wins.push("You used pauses to let ideas land.");
    if (d.energy === "Flat") tip("med", "Delivery", "Your voice stayed fairly flat", "Little change in volume makes a talk sound monotone.", "Pick three key words per slide and say them louder or slower. Practise reading a story aloud with big expression.");
    else wins.push(`Your voice had ${d.energy.toLowerCase()}.`);
  }

  if (a.conf !== null && a.conf < 0.75) tip("med", "Clarity", "Some words were hard to catch", "The speech recogniser was unsure about parts of your talk, which often means unclear word endings or a low voice.", "Open your mouth a bit wider, finish every word, and practise a quick tongue twister before you start.");
  if (a.stumbles >= 3) tip("low", "Clarity", `${a.stumbles} repeated words or false starts`, "Repeating words usually means you're thinking while talking.", "Know your first sentence of each section by heart so you start cleanly.");
  if (a.hedges >= 4) tip("low", "Confidence", `Hedging words used ${a.hedges} times`, "Phrases like “I think” and “maybe” weaken your points.", "State your point directly: say “This shows…” instead of “I think this shows…”.");
  if (a.coverage?.miss.length) tip("med", "Content", `You skipped ${a.coverage.miss.length} key terms from your notes`, `Not mentioned: ${a.coverage.miss.slice(0, 5).join(", ")}.`, "Check whether these points belong in the talk, or add a cue for them in your slides.");
  if (a.coverage && !a.coverage.miss.length) wins.push("You covered all the key terms from your notes.");

  return { tips: tips.sort((x, y) => ORDER[x.sev] - ORDER[y.sev]), wins };
}
