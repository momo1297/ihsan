import { Inject, Injectable } from "@nestjs/common";
import { calculateWeeklyCompletionPercent } from "../../domain/services/habit-completion-calculator.service";
import { HABIT_REPOSITORY, HabitRepositoryPort } from "../ports/habit.repository.port";

@Injectable()
export class GetWeeklyHabitCompletionUseCase {
  constructor(@Inject(HABIT_REPOSITORY) private readonly habits: HabitRepositoryPort) {}

  async execute(userId: string, days: string[]): Promise<number> {
    const habits = await this.habits.findManyActiveByUser(userId);
    return calculateWeeklyCompletionPercent(habits, days);
  }
}
