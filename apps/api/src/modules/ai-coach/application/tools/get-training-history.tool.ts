import { Injectable } from "@nestjs/common";
import { ListSessionsUseCase } from "../../../training/application/use-cases/list-sessions.use-case";
import { ListPersonalRecordsUseCase } from "../../../training/application/use-cases/list-personal-records.use-case";
import { ListExercisesUseCase } from "../../../training/application/use-cases/list-exercises.use-case";
import { GetExerciseHistoryUseCase } from "../../../training/application/use-cases/get-exercise-history.use-case";
import { CoachTool } from "./coach-tool.interface";

interface Args {
  exercise?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class GetTrainingHistoryTool implements CoachTool {
  readonly definition = {
    name: "getTrainingHistory",
    description:
      "Get logged workout sessions (with sets), current personal records, and optionally the full set history " +
      "for one named exercise. All ranges are optional — omit to get everything logged.",
    parameters: {
      type: "object",
      properties: {
        exercise: { type: "string", description: "Exact or partial exercise name to filter by, e.g. 'Bench Press'" },
        from: { type: "string", description: "Start date, YYYY-MM-DD (optional)" },
        to: { type: "string", description: "End date, YYYY-MM-DD (optional)" },
      },
    },
  };

  constructor(
    private readonly listSessions: ListSessionsUseCase,
    private readonly listPersonalRecords: ListPersonalRecordsUseCase,
    private readonly listExercises: ListExercisesUseCase,
    private readonly getExerciseHistory: GetExerciseHistoryUseCase,
  ) {}

  async execute(userId: string, args: Record<string, unknown>): Promise<unknown> {
    const { exercise, from, to } = args as unknown as Args;

    const [sessions, personalRecords] = await Promise.all([
      this.listSessions.execute(userId, from, to),
      this.listPersonalRecords.execute(userId),
    ]);

    const sessionsSummary = sessions.map((session) => ({
      date: session.date,
      completed: session.completedAt !== null,
      sets: session.setLogs.map((set) => ({
        exerciseName: set.exerciseName,
        setNumber: set.setNumber,
        reps: set.reps,
        weightKg: set.weightKg,
        rpe: set.rpe,
        isWarmup: set.isWarmup,
      })),
    }));

    let exerciseHistory: unknown = undefined;
    if (exercise) {
      const exercises = await this.listExercises.execute(userId);
      const match = exercises.find((e) => e.name.toLowerCase().includes(exercise.toLowerCase()));
      if (match) {
        exerciseHistory = await this.getExerciseHistory.execute(match.id, userId);
      } else {
        exerciseHistory = { error: `No exercise found matching "${exercise}"` };
      }
    }

    return { sessions: sessionsSummary, personalRecords, exerciseHistory };
  }
}
