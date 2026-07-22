import { Inject, Injectable } from "@nestjs/common";
import { calculateBodyFatPercent, calculateLeanMassKg } from "../../domain/services/body-composition-calculator.service";
import { MEASUREMENT_REPOSITORY, MeasurementRepositoryPort } from "../ports/measurement.repository.port";
import { WEIGHT_ENTRY_REPOSITORY, WeightEntryRepositoryPort } from "../ports/weight-entry.repository.port";

export interface BodyProfile {
  heightCm: number | null;
  sex: "MALE" | "FEMALE" | null;
}

export interface BodyCompositionResult {
  date: string;
  estimatedBodyFatPercent: number | null;
  estimatedLeanMassKg: number | null;
}

@Injectable()
export class GetBodyCompositionUseCase {
  constructor(
    @Inject(MEASUREMENT_REPOSITORY) private readonly measurements: MeasurementRepositoryPort,
    @Inject(WEIGHT_ENTRY_REPOSITORY) private readonly weightEntries: WeightEntryRepositoryPort,
  ) {}

  async execute(userId: string, date: string, profile: BodyProfile): Promise<BodyCompositionResult> {
    const measurement = await this.measurements.findByDate(userId, date);
    if (!measurement || !profile.heightCm || !profile.sex || measurement.waistCm == null || measurement.neckCm == null) {
      return { date, estimatedBodyFatPercent: null, estimatedLeanMassKg: null };
    }

    const bodyFatPercent = calculateBodyFatPercent({
      sex: profile.sex,
      heightCm: profile.heightCm,
      waistCm: measurement.waistCm,
      neckCm: measurement.neckCm,
      hipsCm: measurement.hipsCm,
    });
    if (bodyFatPercent === null) {
      return { date, estimatedBodyFatPercent: null, estimatedLeanMassKg: null };
    }

    const weightEntry = (await this.weightEntries.findByDate(userId, date)) ?? (await this.weightEntries.findLatest(userId));
    const estimatedLeanMassKg = weightEntry ? calculateLeanMassKg(weightEntry.weightKg, bodyFatPercent) : null;

    return { date, estimatedBodyFatPercent: bodyFatPercent, estimatedLeanMassKg };
  }
}
