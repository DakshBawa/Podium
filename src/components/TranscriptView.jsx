export default function TranscriptView({ text, marks }) {
  let idx = -1;
  return (
    <p className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-cream/80">
      {text.split(/([A-Za-z']+)/).map((part, i) => {
        if (i % 2 === 0) return part;
        idx++;
        return marks[idx] ? <mark key={i} className="filler">{part}</mark> : part;
      })}
    </p>
  );
}
