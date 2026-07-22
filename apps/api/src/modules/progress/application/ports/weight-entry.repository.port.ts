import { LogWeightInput } from "@ihsan/contracts";
import { WeightEntryEntity } from "../../domain/entities/weight-entry.entity";

export const WEIGHT_ENTRY_REPOSITORY = "WEIGHT_ENTRY_REPOSITORY";

export interface WeightEntryRepositoryPort {
  upsert(userId: string, input: LogWeightInput): Promise<WeightEntryEntity>;
  findManyByUserInRange(userId: string, from?: string, to?: string): Promise<WeightEntryEntity[]>;
  findByDate(userId: string, date: string): Promise<WeightEntryEntity | null>;
  findLatest(userId: string): Promise<WeightEntryEntity | null>;
}
