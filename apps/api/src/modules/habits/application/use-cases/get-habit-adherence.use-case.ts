import { Inject, Injectable } from "@nestjs/common";
import { buildDateRange } from "../../domain/services/date-range-builder.service";
import { HABIT_REPOSITORY, HabitRepositoryPort } from "../ports/habit.repository.port";

export interface HabitAdherence {
  habitName: string;
  totalDays: number;
  completedCount: number;
  completedDates: string[];
}

@Injectable()
export class GetHabitAdherenceUseCase {
  constructor(@Inject(HABIT_REPOSITORY) private readonly habits: HabitRepositoryPort) {}

  async execute(userId: string, from: string, to: string): Promise<HabitAdherence[]> {
    const habits = await this.habits.findManyActiveByUser(userId);
    const days = buildDateRange(from, to);

    return habits.map((habit) => {
      const completedDates = days.filter((day) => habit.completedDates.includes(day));
      return {
        habitName: habit.name,
        totalDays: days.length,
        completedCount: completedDates.length,
        completedDates,
      };
    });
  }
}
