import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { HabitController } from "./presentation/habit.controller";
import { CreateHabitUseCase } from "./application/use-cases/create-habit.use-case";
import { UpdateHabitUseCase } from "./application/use-cases/update-habit.use-case";
import { LogHabitUseCase } from "./application/use-cases/log-habit.use-case";
import { ListHabitsUseCase } from "./application/use-cases/list-habits.use-case";
import { GetWeeklyHabitCompletionUseCase } from "./application/use-cases/get-weekly-habit-completion.use-case";
import { HABIT_REPOSITORY } from "./application/ports/habit.repository.port";
import { PrismaHabitRepository } from "./infrastructure/repositories/prisma-habit.repository";
import { ResolveCurrentUserGuard } from "../../shared/guards/resolve-current-user.guard";

@Module({
  imports: [UsersModule],
  controllers: [HabitController],
  providers: [
    ResolveCurrentUserGuard,
    CreateHabitUseCase,
    UpdateHabitUseCase,
    LogHabitUseCase,
    ListHabitsUseCase,
    GetWeeklyHabitCompletionUseCase,
    { provide: HABIT_REPOSITORY, useClass: PrismaHabitRepository },
  ],
  exports: [ListHabitsUseCase, GetWeeklyHabitCompletionUseCase],
})
export class HabitsModule {}
