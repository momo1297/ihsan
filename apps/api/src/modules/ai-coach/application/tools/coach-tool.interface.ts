import { LlmToolDefinition } from "../ports/llm-client.port";

export const COACH_TOOLS = "COACH_TOOLS";

export interface CoachTool {
  readonly definition: LlmToolDefinition;
  execute(userId: string, args: Record<string, unknown>): Promise<unknown>;
}

const DATE_RANGE_PARAMS = {
  from: { type: "string", description: "Start date, YYYY-MM-DD" },
  to: { type: "string", description: "End date, YYYY-MM-DD" },
};

export const DATE_RANGE_SCHEMA = {
  type: "object",
  properties: DATE_RANGE_PARAMS,
  required: ["from", "to"],
} as const;
