import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { calendarDateSchema } from "@ihsan/contracts";
import { ClerkAuthGuard } from "../../../shared/guards/clerk-auth.guard";
import { ResolveCurrentUserGuard } from "../../../shared/guards/resolve-current-user.guard";
import { CurrentUser } from "../../../shared/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { UserEntity } from "../../users/domain/entities/user.entity";
import { GetBodyCompositionUseCase } from "../application/use-cases/get-body-composition.use-case";

@Controller("progress")
@UseGuards(ClerkAuthGuard, ResolveCurrentUserGuard)
export class ProgressController {
  constructor(private readonly getBodyComposition: GetBodyCompositionUseCase) {}

  @Get("composition")
  async composition(
    @CurrentUser() user: UserEntity,
    @Query("date", new ZodValidationPipe(calendarDateSchema)) date: string,
  ) {
    return this.getBodyComposition.execute(user.id, date, { heightCm: user.heightCm, sex: user.sex });
  }
}
