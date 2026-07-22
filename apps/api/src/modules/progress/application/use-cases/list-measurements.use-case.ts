import { Inject, Injectable } from "@nestjs/common";
import { MeasurementEntity } from "../../domain/entities/measurement.entity";
import { MEASUREMENT_REPOSITORY, MeasurementRepositoryPort } from "../ports/measurement.repository.port";

@Injectable()
export class ListMeasurementsUseCase {
  constructor(@Inject(MEASUREMENT_REPOSITORY) private readonly measurements: MeasurementRepositoryPort) {}

  async execute(userId: string, from?: string, to?: string): Promise<MeasurementEntity[]> {
    return this.measurements.findManyByUserInRange(userId, from, to);
  }
}
