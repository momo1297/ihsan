import { Body, Controller, Get, Post, Query, UseGuards, UsePipes } from "@nestjs/common";
import { calendarDateSchema, logWeightSchema, LogWeightInput } from "@ihsan/contracts";
import { ClerkAuthGuard } from "../../../shared/guards/clerk-auth.guard";
import { ResolveCurrentUserGuard } from "../../../shared/guards/resolve-current-user.guard";
import { CurrentUser } from "../../../shared/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { UserEntity } from "../../users/domain/entities/user.entity";
import { LogWeightUseCase } from "../application/use-cases/log-weight.use-case";
import { ListWeightEntriesUseCase } from "../application/use-cases/list-weight-entries.use-case";
import { toWeightEntryDto } from "./progress.mapper";

const optionalDateSchema = calendarDateSchema.optional();

@Controller("weight-entries")
@UseGuards(ClerkAuthGuard, ResolveCurrentUserGuard)
export class WeightEntryController {
  constructor(
    private readonly logWeight: LogWeightUseCase,
    private readonly listWeightEntries: ListWeightEntriesUseCase,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: UserEntity,
    @Query("from", new ZodValidationPipe(optionalDateSchema)) from: string | undefined,
    @Query("to", new ZodValidationPipe(optionalDateSchema)) to: string | undefined,
  ) {
    const entries = await this.listWeightEntries.execute(user.id, from, to);
    return entries.map(toWeightEntryDto);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(logWeightSchema))
  async log(@CurrentUser() user: UserEntity, @Body() body: LogWeightInput) {
    const entry = await this.logWeight.execute(user.id, body);
    return toWeightEntryDto(entry);
  }
}
