import { Inject, Injectable } from "@nestjs/common";
import { WeightEntryEntity } from "../../domain/entities/weight-entry.entity";
import { WEIGHT_ENTRY_REPOSITORY, WeightEntryRepositoryPort } from "../ports/weight-entry.repository.port";

@Injectable()
export class GetLatestWeightEntryUseCase {
  constructor(@Inject(WEIGHT_ENTRY_REPOSITORY) private readonly weightEntries: WeightEntryRepositoryPort) {}

  async execute(userId: string): Promise<WeightEntryEntity | null> {
    return this.weightEntries.findLatest(userId);
  }
}
