function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
      <div
        className="h-full rounded-full bg-brand transition-[width]"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function MacrosRemainingBar({
  label,
  remaining,
  consumed,
  target,
  unit,
}: {
  label: string;
  remaining: number;
  consumed: number;
  target: number;
  unit: string;
}) {
  const percent = target > 0 ? (consumed / target) * 100 : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-micro text-text-tertiary">{label}</span>
        <span className="text-body font-semibold tabular-nums">
          {remaining}
          <span className="text-caption text-text-secondary">{unit} left</span>
        </span>
      </div>
      <ProgressBar percent={percent} />
    </div>
  );
}
