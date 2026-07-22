import { Injectable } from "@nestjs/common";
import { ListWeightEntriesUseCase } from "../../../progress/application/use-cases/list-weight-entries.use-case";
import { CoachTool, DATE_RANGE_SCHEMA } from "./coach-tool.interface";

interface Args {
  from: string;
  to: string;
}

@Injectable()
export class GetWeightTrendTool implements CoachTool {
  readonly definition = {
    name: "getWeightTrend",
    description: "Get logged weight entries (date + weight in kg) for a date range, oldest first.",
    parameters: DATE_RANGE_SCHEMA,
  };

  constructor(private readonly listWeightEntries: ListWeightEntriesUseCase) {}

  async execute(userId: string, args: Record<string, unknown>): Promise<unknown> {
    const { from, to } = args as unknown as Args;
    const entries = await this.listWeightEntries.execute(userId, from, to);
    return entries.map((entry) => ({ date: entry.date, weightKg: entry.weightKg }));
  }
}
