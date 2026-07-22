import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { NutritionModule } from "../nutrition/nutrition.module";
import { TrainingModule } from "../training/training.module";
import { HabitsModule } from "../habits/habits.module";
import { GoalsModule } from "../goals/goals.module";
import { ProgressModule } from "../progress/progress.module";
import { DashboardController } from "./presentation/dashboard.controller";
import { GetDashboardUseCase } from "./application/use-cases/get-dashboard.use-case";
import { ResolveCurrentUserGuard } from "../../shared/guards/resolve-current-user.guard";

@Module({
  imports: [UsersModule, NutritionModule, TrainingModule, HabitsModule, GoalsModule, ProgressModule],
  controllers: [DashboardController],
  providers: [ResolveCurrentUserGuard, GetDashboardUseCase],
})
export class DashboardModule {}
