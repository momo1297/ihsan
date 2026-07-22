import { Injectable } from "@nestjs/common";
import { ListGoalsUseCase } from "../../../goals/application/use-cases/list-goals.use-case";
import { CoachTool } from "./coach-tool.interface";

@Injectable()
export class GetActiveGoalsTool implements CoachTool {
  readonly definition = {
    name: "getActiveGoals",
    description: "Get the user's currently active goals (weight or body fat %), with start/target values and dates.",
    parameters: { type: "object", properties: {} },
  };

  constructor(private readonly listGoals: ListGoalsUseCase) {}

  async execute(userId: string): Promise<unknown> {
    const goals = await this.listGoals.execute(userId);
    return goals
      .filter((goal) => goal.status === "ACTIVE")
      .map((goal) => ({
        type: goal.type,
        startValue: goal.startValue,
        targetValue: goal.targetValue,
        startDate: goal.startDate,
        targetDate: goal.targetDate,
      }));
  }
}
