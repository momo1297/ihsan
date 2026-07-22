import { Body, Controller, Post, UseGuards, UsePipes } from "@nestjs/common";
import { applyPlanRequestSchema, ApplyPlanRequest, wizardChatRequestSchema, WizardChatRequest } from "@ihsan/contracts";
import { ClerkAuthGuard } from "../../../shared/guards/clerk-auth.guard";
import { ResolveCurrentUserGuard } from "../../../shared/guards/resolve-current-user.guard";
import { CurrentUser } from "../../../shared/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { todayDateString } from "../../../shared/utils/today.util";
import { UserEntity } from "../../users/domain/entities/user.entity";
import { ProcessWizardMessageUseCase } from "../application/use-cases/process-wizard-message.use-case";
import { ApplyPlanUseCase } from "../application/use-cases/apply-plan.use-case";

@Controller("plan-wizard")
@UseGuards(ClerkAuthGuard, ResolveCurrentUserGuard)
export class PlanWizardController {
  constructor(
    private readonly processWizardMessage: ProcessWizardMessageUseCase,
    private readonly applyPlan: ApplyPlanUseCase,
  ) {}

  @Post("chat")
  @UsePipes(new ZodValidationPipe(wizardChatRequestSchema))
  async chat(@CurrentUser() user: UserEntity, @Body() body: WizardChatRequest) {
    return this.processWizardMessage.execute(user.id, body.history, body.content);
  }

  @Post("apply")
  @UsePipes(new ZodValidationPipe(applyPlanRequestSchema))
  async apply(@CurrentUser() user: UserEntity, @Body() body: ApplyPlanRequest) {
    return this.applyPlan.execute(user.id, body, todayDateString());
  }
}
