import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { WeightEntryController } from "./presentation/weight-entry.controller";
import { MeasurementController } from "./presentation/measurement.controller";
import { ProgressController } from "./presentation/progress.controller";

import { LogWeightUseCase } from "./application/use-cases/log-weight.use-case";
import { ListWeightEntriesUseCase } from "./application/use-cases/list-weight-entries.use-case";
import { GetLatestWeightEntryUseCase } from "./application/use-cases/get-latest-weight-entry.use-case";
import { LogMeasurementUseCase } from "./application/use-cases/log-measurement.use-case";
import { ListMeasurementsUseCase } from "./application/use-cases/list-measurements.use-case";
import { GetBodyCompositionUseCase } from "./application/use-cases/get-body-composition.use-case";

import { WEIGHT_ENTRY_REPOSITORY } from "./application/ports/weight-entry.repository.port";
import { MEASUREMENT_REPOSITORY } from "./application/ports/measurement.repository.port";
import { PrismaWeightEntryRepository } from "./infrastructure/repositories/prisma-weight-entry.repository";
import { PrismaMeasurementRepository } from "./infrastructure/repositories/prisma-measurement.repository";
import { ResolveCurrentUserGuard } from "../../shared/guards/resolve-current-user.guard";

@Module({
  imports: [UsersModule],
  controllers: [WeightEntryController, MeasurementController, ProgressController],
  providers: [
    ResolveCurrentUserGuard,
    LogWeightUseCase,
    ListWeightEntriesUseCase,
    GetLatestWeightEntryUseCase,
    LogMeasurementUseCase,
    ListMeasurementsUseCase,
    GetBodyCompositionUseCase,
    { provide: WEIGHT_ENTRY_REPOSITORY, useClass: PrismaWeightEntryRepository },
    { provide: MEASUREMENT_REPOSITORY, useClass: PrismaMeasurementRepository },
  ],
  exports: [GetLatestWeightEntryUseCase, ListWeightEntriesUseCase, ListMeasurementsUseCase],
})
export class ProgressModule {}
