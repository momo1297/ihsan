import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { TrainingModule } from "../training/training.module";
import { NutritionModule } from "../nutrition/nutrition.module";
import { GoalsModule } from "../goals/goals.module";
import { ResolveCurrentUserGuard } from "../../shared/guards/resolve-current-user.guard";

import { PlanWizardController } from "./presentation/plan-wizard.controller";

import { GeneratePlanUseCase } from "./application/use-cases/generate-plan.use-case";
import { ApplyPlanUseCase } from "./application/use-cases/apply-plan.use-case";
import { ProcessWizardMessageUseCase } from "./application/use-cases/process-wizard-message.use-case";

import { LLM_CLIENT } from "../ai-coach/application/ports/llm-client.port";
import { OpenRouterLlmClient } from "../ai-coach/infrastructure/llm/openrouter-llm-client";

@Module({
  imports: [UsersModule, TrainingModule, NutritionModule, GoalsModule],
  controllers: [PlanWizardController],
  providers: [
    ResolveCurrentUserGuard,
    GeneratePlanUseCase,
    ApplyPlanUseCase,
    ProcessWizardMessageUseCase,
    { provide: LLM_CLIENT, useClass: OpenRouterLlmClient },
  ],
})
export class PlanWizardModule {}
