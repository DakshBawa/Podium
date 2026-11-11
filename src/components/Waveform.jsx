export default function Waveform({ bars, active }) {
  const list = bars.length ? bars : Array(48).fill(0);
  return (
    <div className="flex h-20 items-center justify-center gap-[3px]" aria-hidden>
      {Array.from({ length: 48 }, (_, i) => {
        const v = list[list.length - 48 + i] ?? 0;
        return <span key={i} className="level-bar w-1 rounded-full" style={{ height: `${Math.max(6, v * 100)}%`, background: active ? "#ffb020" : "#ffffff24", opacity: 0.4 + v * 0.6 }} />;
      })}
    </div>
  );
}
