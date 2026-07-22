import type { Dashboard } from "@ihsan/contracts";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-micro text-text-tertiary">{label}</span>
      <span className="text-title font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export function WeeklyRollupCard({ weeklyProgress }: { weeklyProgress: Dashboard["weeklyProgress"] }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      <Stat
        label="WORKOUTS"
        value={`${weeklyProgress.workoutsCompleted}/${weeklyProgress.workoutsPlanned || "-"}`}
      />
      <Stat label="AVG CALORIES" value={weeklyProgress.avgCalories !== null ? `${weeklyProgress.avgCalories}` : "-"} />
      <Stat label="HABITS" value={`${weeklyProgress.habitCompletionPercent}%`} />
    </div>
  );
}
