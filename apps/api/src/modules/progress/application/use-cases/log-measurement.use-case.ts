import { Inject, Injectable } from "@nestjs/common";
import { LogMeasurementInput } from "@ihsan/contracts";
import { MeasurementEntity } from "../../domain/entities/measurement.entity";
import { MEASUREMENT_REPOSITORY, MeasurementRepositoryPort } from "../ports/measurement.repository.port";

@Injectable()
export class LogMeasurementUseCase {
  constructor(@Inject(MEASUREMENT_REPOSITORY) private readonly measurements: MeasurementRepositoryPort) {}

  async execute(userId: string, input: LogMeasurementInput): Promise<MeasurementEntity> {
    return this.measurements.upsert(userId, input);
  }
}
