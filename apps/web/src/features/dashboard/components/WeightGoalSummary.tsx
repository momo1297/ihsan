import type { Dashboard } from "@ihsan/contracts";

export function WeightGoalSummary({ weight }: { weight: Dashboard["weight"] }) {
  if (weight.current === null) {
    return <p className="text-text-secondary">Log a weight entry on the Progress page to get started.</p>;
  }

  const delta = weight.goal !== null ? Math.round((weight.goal - weight.current) * 10) / 10 : null;

  return (
    <div className="flex flex-wrap items-baseline gap-6">
      <div>
        <p className="text-micro text-text-tertiary">CURRENT</p>
        <p className="text-title font-semibold tabular-nums">{weight.current}kg</p>
      </div>
      {weight.goal !== null && (
        <>
          <div>
            <p className="text-micro text-text-tertiary">GOAL</p>
            <p className="text-title font-semibold tabular-nums">{weight.goal}kg</p>
          </div>
          <div>
            <p className="text-micro text-text-tertiary">TO GO</p>
            <p className="text-title font-semibold tabular-nums">
              {delta !== null ? Math.abs(delta) : "-"}kg
            </p>
          </div>
          {weight.projectedGoalDate && (
            <p className="text-caption text-text-secondary">
              At your current rate, projected by <strong>{weight.projectedGoalDate}</strong>
            </p>
          )}
        </>
      )}
    </div>
  );
}
