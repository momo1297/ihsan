import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { PrismaModule } from "./shared/database/prisma.module";
import { DomainExceptionFilter } from "./shared/filters/domain-exception.filter";
import { ResponseEnvelopeInterceptor } from "./shared/interceptors/response-envelope.interceptor";
import { HealthModule } from "./modules/health/health.module";
import { UsersModule } from "./modules/users/users.module";
import { NutritionModule } from "./modules/nutrition/nutrition.module";
import { HabitsModule } from "./modules/habits/habits.module";
import { GoalsModule } from "./modules/goals/goals.module";
import { TrainingModule } from "./modules/training/training.module";
import { ProgressModule } from "./modules/progress/progress.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { AiCoachModule } from "./modules/ai-coach/ai-coach.module";
import { PlanWizardModule } from "./modules/plan-wizard/plan-wizard.module";

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    UsersModule,
    NutritionModule,
    HabitsModule,
    GoalsModule,
    TrainingModule,
    ProgressModule,
    DashboardModule,
    AiCoachModule,
    PlanWizardModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
  ],
})
export class AppModule {}
