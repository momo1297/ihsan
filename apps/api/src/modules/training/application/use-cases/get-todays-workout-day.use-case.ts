import { Inject, Injectable } from "@nestjs/common";
import { selectNextWorkoutDay } from "../../domain/services/next-workout-day-selector.service";
import { WorkoutDayLine } from "../../domain/entities/program.entity";
import { PROGRAM_REPOSITORY, ProgramRepositoryPort } from "../ports/program.repository.port";
import { SESSION_REPOSITORY, SessionRepositoryPort } from "../ports/session.repository.port";

@Injectable()
export class GetTodaysWorkoutDayUseCase {
  constructor(
    @Inject(PROGRAM_REPOSITORY) private readonly programs: ProgramRepositoryPort,
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepositoryPort,
  ) {}

  async execute(userId: string, today: string): Promise<WorkoutDayLine | null> {
    const programs = await this.programs.findManyByUser(userId);
    const activeProgram = programs.find((program) => program.isActive);
    if (!activeProgram || activeProgram.days.length === 0) return null;

    const allSessions = await this.sessions.findManyByUserInRange(userId);

    const todaysSession = allSessions.find((session) => session.date === today && session.workoutDayId);
    if (todaysSession) {
      return activeProgram.days.find((day) => day.id === todaysSession.workoutDayId) ?? null;
    }

    const lastTrainedSession = allSessions.find((session) => session.workoutDayId !== null);
    return selectNextWorkoutDay(activeProgram.days, lastTrainedSession?.workoutDayId ?? null);
  }
}
