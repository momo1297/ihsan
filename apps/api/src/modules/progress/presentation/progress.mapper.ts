import type { Measurement, WeightEntry } from "@ihsan/contracts";
import { WeightEntryEntity } from "../domain/entities/weight-entry.entity";
import { MeasurementEntity } from "../domain/entities/measurement.entity";

export function toWeightEntryDto(entity: WeightEntryEntity): WeightEntry {
  return {
    id: entity.id,
    date: entity.date,
    weightKg: entity.weightKg,
    createdAt: entity.createdAt.toISOString(),
  };
}

export function toMeasurementDto(entity: MeasurementEntity): Measurement {
  return {
    id: entity.id,
    date: entity.date,
    waistCm: entity.waistCm ?? undefined,
    neckCm: entity.neckCm ?? undefined,
    hipsCm: entity.hipsCm ?? undefined,
    chestCm: entity.chestCm ?? undefined,
    armCm: entity.armCm ?? undefined,
    thighCm: entity.thighCm ?? undefined,
    notes: entity.notes ?? undefined,
    createdAt: entity.createdAt.toISOString(),
  };
}
