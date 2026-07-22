import { Inject, Injectable } from "@nestjs/common";
import { planIntakeSchema, WizardChatMessage, WizardChatResponse } from "@ihsan/contracts";
import { LLM_CLIENT, LlmClientPort, LlmMessage, LlmToolDefinition } from "../../../ai-coach/application/ports/llm-client.port";
import { GeneratePlanUseCase } from "./generate-plan.use-case";

const CLARIFICATION_MESSAGE =
  "Sorry, I got a bit confused there — could you answer with a single specific number rather than a range (e.g. \"5\" instead of \"5-6\")?";

const SYSTEM_PROMPT = [
  "You are Ihsan's setup assistant. Have a SHORT, friendly conversation to gather what's needed to build the user",
  "a personalized workout program and nutrition targets. Ask about, a couple at a time (not a giant list):",
  "how many days a week they want to train, their experience level, main training goal (strength/hypertrophy/fat loss/general fitness),",
  "any physical restrictions or injuries, what equipment they have access to (full gym / basic home / bodyweight only),",
  "their job type (desk job / on their feet / physical labor), their age, current weight (kg), height (cm), and sex,",
  "their dietary restrictions (vegetarian, vegan, gluten-free, dairy-free, nut-free, or none) plus any other notes,",
  "how many meals a day they prefer, and their weight goal (lose, gain, or maintain — with a target weight if relevant).",
  "Keep every question short. Once you have every required field, call proposePlan with the structured data —",
  "do not ask for confirmation first, just call it. Never invent or compute the actual program or nutrition numbers yourself,",
  "proposePlan handles that deterministically from real data.",
].join(" ");

const PROPOSE_PLAN_TOOL: LlmToolDefinition = {
  name: "proposePlan",
  description: "Call once every required field below has been gathered from the user. Triggers deterministic plan generation.",
  parameters: {
    type: "object",
    properties: {
      daysPerWeek: { type: "integer", minimum: 1, maximum: 7 },
      experienceLevel: { type: "string", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
      trainingGoal: { type: "string", enum: ["STRENGTH", "HYPERTROPHY", "FAT_LOSS", "GENERAL_FITNESS"] },
      physicalRestrictions: { type: "string", description: "Free text, empty string if none" },
      equipmentAccess: { type: "string", enum: ["FULL_GYM", "BASIC_HOME", "BODYWEIGHT_ONLY"] },
      jobType: { type: "string", enum: ["SEDENTARY", "MODERATE", "PHYSICAL"] },
      dietaryRestrictions: {
        type: "array",
        items: { type: "string", enum: ["VEGETARIAN", "VEGAN", "GLUTEN_FREE", "DAIRY_FREE", "NUT_FREE"] },
      },
      otherDietaryNotes: { type: "string", description: "Free text, empty string if none" },
      mealsPerDay: { type: "integer", minimum: 2, maximum: 6 },
      weightGoalDirection: { type: "string", enum: ["LOSE", "GAIN", "MAINTAIN"] },
      targetWeightKg: { type: ["number", "null"], description: "Target weight in kg, or null if MAINTAIN" },
      age: { type: "integer" },
      currentWeightKg: { type: "number" },
      heightCm: { type: "number" },
      sex: { type: "string", enum: ["MALE", "FEMALE"] },
    },
    required: [
      "daysPerWeek",
      "experienceLevel",
      "trainingGoal",
      "physicalRestrictions",
      "equipmentAccess",
      "jobType",
      "dietaryRestrictions",
      "otherDietaryNotes",
      "mealsPerDay",
      "weightGoalDirection",
      "targetWeightKg",
      "age",
      "currentWeightKg",
      "heightCm",
      "sex",
    ],
  },
};

@Injectable()
export class ProcessWizardMessageUseCase {
  constructor(
    @Inject(LLM_CLIENT) private readonly llm: LlmClientPort,
    private readonly generatePlan: GeneratePlanUseCase,
  ) {}

  async execute(userId: string, history: WizardChatMessage[], content: string): Promise<WizardChatResponse> {
    const messages: LlmMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((message) => ({ role: message.role, content: message.content })),
      { role: "user", content },
    ];

    const result = await this.llm.complete(messages, [PROPOSE_PLAN_TOOL]);
    const updatedHistory: WizardChatMessage[] = [...history, { role: "user", content }];

    const proposeCall = result.toolCalls.find((call) => call.name === "proposePlan");
    if (proposeCall) {
      let rawArgs: unknown;
      try {
        rawArgs = JSON.parse(proposeCall.arguments);
      } catch {
        updatedHistory.push({ role: "assistant", content: CLARIFICATION_MESSAGE });
        return { type: "question", message: CLARIFICATION_MESSAGE, history: updatedHistory };
      }

      const validation = planIntakeSchema.safeParse(rawArgs);
      if (!validation.success) {
        updatedHistory.push({ role: "assistant", content: CLARIFICATION_MESSAGE });
        return { type: "question", message: CLARIFICATION_MESSAGE, history: updatedHistory };
      }

      const plan = await this.generatePlan.execute(userId, validation.data);
      return { type: "proposal", plan, history: updatedHistory };
    }

    const assistantMessage = result.content ?? "Could you say a bit more about that?";
    updatedHistory.push({ role: "assistant", content: assistantMessage });
    return { type: "question", message: assistantMessage, history: updatedHistory };
  }
}
