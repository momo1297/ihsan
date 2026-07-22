import { Injectable } from "@nestjs/common";
import { GetHabitAdherenceUseCase } from "../../../habits/application/use-cases/get-habit-adherence.use-case";
import { CoachTool, DATE_RANGE_SCHEMA } from "./coach-tool.interface";

interface Args {
  from: string;
  to: string;
}

@Injectable()
export class GetHabitAdherenceTool implements CoachTool {
  readonly definition = {
    name: "getHabitAdherence",
    description: "Get how consistently each active habit was completed over a date range.",
    parameters: DATE_RANGE_SCHEMA,
  };

  constructor(private readonly getHabitAdherence: GetHabitAdherenceUseCase) {}

  async execute(userId: string, args: Record<string, unknown>): Promise<unknown> {
    const { from, to } = args as unknown as Args;
    return this.getHabitAdherence.execute(userId, from, to);
  }
}
