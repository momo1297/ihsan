import { Body, Controller, Get, Post, Query, UseGuards, UsePipes } from "@nestjs/common";
import { calendarDateSchema, logMeasurementSchema, LogMeasurementInput } from "@ihsan/contracts";
import { ClerkAuthGuard } from "../../../shared/guards/clerk-auth.guard";
import { ResolveCurrentUserGuard } from "../../../shared/guards/resolve-current-user.guard";
import { CurrentUser } from "../../../shared/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { UserEntity } from "../../users/domain/entities/user.entity";
import { LogMeasurementUseCase } from "../application/use-cases/log-measurement.use-case";
import { ListMeasurementsUseCase } from "../application/use-cases/list-measurements.use-case";
import { toMeasurementDto } from "./progress.mapper";

const optionalDateSchema = calendarDateSchema.optional();

@Controller("measurements")
@UseGuards(ClerkAuthGuard, ResolveCurrentUserGuard)
export class MeasurementController {
  constructor(
    private readonly logMeasurement: LogMeasurementUseCase,
    private readonly listMeasurements: ListMeasurementsUseCase,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: UserEntity,
    @Query("from", new ZodValidationPipe(optionalDateSchema)) from: string | undefined,
    @Query("to", new ZodValidationPipe(optionalDateSchema)) to: string | undefined,
  ) {
    const measurements = await this.listMeasurements.execute(user.id, from, to);
    return measurements.map(toMeasurementDto);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(logMeasurementSchema))
  async log(@CurrentUser() user: UserEntity, @Body() body: LogMeasurementInput) {
    const measurement = await this.logMeasurement.execute(user.id, body);
    return toMeasurementDto(measurement);
  }
}
