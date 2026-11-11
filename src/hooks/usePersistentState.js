import { useEffect, useState } from "react";

export default function usePersistentState(key, init) {
  const [v, setV] = useState(() => {
    try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch { /* ignore */ }
    return init;
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } }, [key, v]);
  return [v, setV];
}
