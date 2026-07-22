import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { GoalController } from "./presentation/goal.controller";
import { CreateGoalUseCase } from "./application/use-cases/create-goal.use-case";
import { UpdateGoalUseCase } from "./application/use-cases/update-goal.use-case";
import { ListGoalsUseCase } from "./application/use-cases/list-goals.use-case";
import { GOAL_REPOSITORY } from "./application/ports/goal.repository.port";
import { PrismaGoalRepository } from "./infrastructure/repositories/prisma-goal.repository";
import { ResolveCurrentUserGuard } from "../../shared/guards/resolve-current-user.guard";

@Module({
  imports: [UsersModule],
  controllers: [GoalController],
  providers: [
    ResolveCurrentUserGuard,
    CreateGoalUseCase,
    UpdateGoalUseCase,
    ListGoalsUseCase,
    { provide: GOAL_REPOSITORY, useClass: PrismaGoalRepository },
  ],
  exports: [ListGoalsUseCase],
})
export class GoalsModule {}
