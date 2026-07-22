import { Inject, Injectable } from "@nestjs/common";
import { LogWeightInput } from "@ihsan/contracts";
import { WeightEntryEntity } from "../../domain/entities/weight-entry.entity";
import { WEIGHT_ENTRY_REPOSITORY, WeightEntryRepositoryPort } from "../ports/weight-entry.repository.port";

@Injectable()
export class LogWeightUseCase {
  constructor(@Inject(WEIGHT_ENTRY_REPOSITORY) private readonly weightEntries: WeightEntryRepositoryPort) {}

  async execute(userId: string, input: LogWeightInput): Promise<WeightEntryEntity> {
    return this.weightEntries.upsert(userId, input);
  }
}
