import { Injectable } from "@nestjs/common";
import { GetDailyMacroSummaryUseCase } from "../../../nutrition/application/use-cases/get-daily-macro-summary.use-case";
import { buildDateRange } from "../../domain/services/date-range.util";
import { CoachTool, DATE_RANGE_SCHEMA } from "./coach-tool.interface";

interface Args {
  from: string;
  to: string;
}

@Injectable()
export class GetNutritionSummaryTool implements CoachTool {
  readonly definition = {
    name: "getNutritionSummary",
    description: "Get daily nutrition targets vs. actuals (calories, protein, carbs, fat) for a date range.",
    parameters: DATE_RANGE_SCHEMA,
  };

  constructor(private readonly getDailyMacroSummary: GetDailyMacroSummaryUseCase) {}

  async execute(userId: string, args: Record<string, unknown>): Promise<unknown> {
    const { from, to } = args as unknown as Args;
    const days = buildDateRange(from, to);
    return Promise.all(days.map((date) => this.getDailyMacroSummary.execute(userId, date)));
  }
}
