import { Inject, Injectable } from "@nestjs/common";
import { WeightEntryEntity } from "../../domain/entities/weight-entry.entity";
import { WEIGHT_ENTRY_REPOSITORY, WeightEntryRepositoryPort } from "../ports/weight-entry.repository.port";

@Injectable()
export class ListWeightEntriesUseCase {
  constructor(@Inject(WEIGHT_ENTRY_REPOSITORY) private readonly weightEntries: WeightEntryRepositoryPort) {}

  async execute(userId: string, from?: string, to?: string): Promise<WeightEntryEntity[]> {
    return this.weightEntries.findManyByUserInRange(userId, from, to);
  }
}
