import type { WeightEntry } from "@ihsan/contracts";

const WIDTH = 600;
const HEIGHT = 160;
const PADDING = 24;

export function WeightHistoryChart({ entries }: { entries: WeightEntry[] }) {
  if (entries.length < 2) {
    return <p className="text-text-secondary">Log at least two days to see a trend.</p>;
  }

  const weights = entries.map((entry) => entry.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;

  const points = entries.map((entry, index) => {
    const x = PADDING + (index / (entries.length - 1)) * (WIDTH - PADDING * 2);
    const y = HEIGHT - PADDING - ((entry.weightKg - min) / range) * (HEIGHT - PADDING * 2);
    return { x, y, entry };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Weight trend">
      <path d={path} fill="none" stroke="currentColor" className="text-brand" strokeWidth={2} />
      {points.map((p) => (
        <circle key={p.entry.id} cx={p.x} cy={p.y} r={3} className="fill-brand" />
      ))}
      <text x={PADDING} y={14} className="fill-current text-text-tertiary" fontSize={11}>
        {max}kg
      </text>
      <text x={PADDING} y={HEIGHT - 8} className="fill-current text-text-tertiary" fontSize={11}>
        {min}kg
      </text>
    </svg>
  );
}
