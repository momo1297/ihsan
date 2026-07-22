import { LogMeasurementInput } from "@ihsan/contracts";
import { MeasurementEntity } from "../../domain/entities/measurement.entity";

export const MEASUREMENT_REPOSITORY = "MEASUREMENT_REPOSITORY";

export interface MeasurementRepositoryPort {
  upsert(userId: string, input: LogMeasurementInput): Promise<MeasurementEntity>;
  findManyByUserInRange(userId: string, from?: string, to?: string): Promise<MeasurementEntity[]>;
  findByDate(userId: string, date: string): Promise<MeasurementEntity | null>;
}
