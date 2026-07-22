import Link from "next/link";
import type { WorkoutDay } from "@ihsan/contracts";
import { Button } from "@/components/ui/button";

export function TodaysWorkoutCard({ workoutDay }: { workoutDay: WorkoutDay | null }) {
  if (!workoutDay) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-text-secondary">Rest day — no active program day scheduled.</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/training">Set up a program</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-body font-medium">{workoutDay.name}</p>
        <Button asChild size="sm">
          <Link href="/training">Start session</Link>
        </Button>
      </div>
      <ul className="flex flex-col gap-1.5">
        {workoutDay.exercises
          .sort((a, b) => a.order - b.order)
          .map((exercise) => (
            <li key={exercise.id} className="text-caption text-text-secondary">
              {exercise.exerciseName}
              <span className="text-text-tertiary">
                {" "}
                · {exercise.targetSets} × {exercise.targetRepsMin}-{exercise.targetRepsMax}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
