export const fmtTime = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.round(Math.max(0, s) % 60)).padStart(2, "0")}`;
export const scoreColor = (v) => (v >= 80 ? "#5ad19a" : v >= 60 ? "#ffb020" : "#ff6b4a");
export const scoreWord = (v) => (v >= 85 ? "Excellent" : v >= 70 ? "Good" : v >= 55 ? "Okay" : "Needs work");
