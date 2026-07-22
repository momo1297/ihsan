import { Inject, Injectable } from "@nestjs/common";
import { zodToJsonSchema } from "zod-to-json-schema";
import { llmPlanContentSchema, LlmPlanContent } from "@ihsan/contracts";
import {
  LLM_CLIENT,
  LlmClientPort,
  LlmMessage,
  LlmToolDefinition,
} from "../../../ai-coach/application/ports/llm-client.port";
import { CatalogExercise, EquipmentAccess, ExperienceLevel, TrainingGoal } from "../../domain/services/split-generator.service";
import { CatalogRecipe, DietaryRestriction } from "../../domain/services/meal-suggestor.service";
import { JobType } from "../../domain/services/tdee-calculator.service";

const MAX_ATTEMPTS = 2;
const TOOL_NAME = "buildPlan";

export interface OtherActivityInput {
  dayOfWeek: string;
  activityType: string;
}

export interface AiPlanContentInput {
  daysPerWeek: number;
  experienceLevel: ExperienceLevel;
  trainingGoal: TrainingGoal;
  physicalRestrictions: string;
  equipmentAccess: EquipmentAccess;
  jobType: JobType;
  dietaryRestrictions: DietaryRestriction[];
  otherDietaryNotes: string;
  mealsPerDay: number;
  programDurationWeeks: number;
  otherActivities: OtherActivityInput[];
  exerciseCatalog: CatalogExercise[];
  recipeCatalog: CatalogRecipe[];
}

function buildSystemPrompt(input: AiPlanContentInput): string {
  return [
    "You are an expert strength & combat-sports coach building a personalized training and nutrition plan inside the Ihsan app.",
    `The user trains ${input.daysPerWeek} day(s) per week, experience level ${input.experienceLevel}, goal ${input.trainingGoal}, equipment access ${input.equipmentAccess}, job type ${input.jobType}.`,
    input.physicalRestrictions ? `Physical restrictions to respect: ${input.physicalRestrictions}.` : "",
    input.otherActivities.length > 0
      ? `The user also regularly trains: ${input.otherActivities
          .map((activity) => `${activity.activityType} on ${activity.dayOfWeek}`)
          .join(", ")}. Adapt exercise selection and intensity around this (e.g. avoid heavy lower-body or high-impact work that would compromise those sessions) and call out how you adapted for it in your notes.`
      : "",
    `Build a program spanning ${input.programDurationWeeks} week(s): the day structure repeats weekly, but your notes must include week-by-week periodization guidance across the ${input.programDurationWeeks} weeks (progressive overload cues, when to deload).`,
    "You may ONLY use exercise ids and recipe ids from the catalogs given in the user message — never invent an id, and never use an id that isn't listed.",
    `Pick meals from the recipe catalog respecting these dietary restrictions: ${
      input.dietaryRestrictions.length > 0 ? input.dietaryRestrictions.join(", ") : "none"
    }, for ${input.mealsPerDay} meals/day (include a snack only if mealsPerDay > 3).`,
    input.otherDietaryNotes
      ? `Other dietary notes to keep in mind (informational, not automatically filtered): ${input.otherDietaryNotes}.`
      : "",
    `Call the ${TOOL_NAME} tool exactly once with the complete result (days, mealSuggestions, notes). Do not answer with free text.`,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildUserMessage(input: AiPlanContentInput): string {
  return JSON.stringify({
    exerciseCatalog: input.exerciseCatalog,
    recipeCatalog: input.recipeCatalog,
  });
}

function findReferentialError(content: LlmPlanContent, exerciseIds: Set<string>, recipeIds: Set<string>): string | null {
  for (const day of content.days) {
    for (const exercise of day.exercises) {
      if (!exerciseIds.has(exercise.exerciseId)) {
        return `exerciseId "${exercise.exerciseId}" is not in the provided exercise catalog`;
      }
    }
  }
  const slots = ["breakfast", "lunch", "dinner", "snack"] as const;
  for (const slot of slots) {
    for (const recipe of content.mealSuggestions[slot]) {
      if (!recipeIds.has(recipe.id)) {
        return `recipe id "${recipe.id}" in ${slot} is not in the provided recipe catalog`;
      }
    }
  }
  return null;
}

@Injectable()
export class AiPlanContentService {
  constructor(@Inject(LLM_CLIENT) private readonly llm: LlmClientPort) {}

  async generate(input: AiPlanContentInput): Promise<LlmPlanContent> {
    const tool: LlmToolDefinition = {
      name: TOOL_NAME,
      description: "Return the complete generated training days, meal suggestions, and coaching notes.",
      parameters: zodToJsonSchema(llmPlanContentSchema as unknown as Parameters<typeof zodToJsonSchema>[0]) as Record<
        string,
        unknown
      >,
    };

    const exerciseIds = new Set(input.exerciseCatalog.map((exercise) => exercise.id));
    const recipeIds = new Set(input.recipeCatalog.map((recipe) => recipe.id));

    const messages: LlmMessage[] = [
      { role: "system", content: buildSystemPrompt(input) },
      { role: "user", content: buildUserMessage(input) },
    ];

    let lastError = "";
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        messages.push({
          role: "user",
          content: `Your previous call to ${TOOL_NAME} was invalid: ${lastError}. Call ${TOOL_NAME} again, correcting this.`,
        });
      }

      const result = await this.llm.complete(messages, [tool]);
      const call = result.toolCalls.find((toolCall) => toolCall.name === TOOL_NAME);
      if (!call) {
        lastError = `You must call the ${TOOL_NAME} tool — no free-form text answers.`;
        continue;
      }

      let parsedArgs: unknown;
      try {
        parsedArgs = call.arguments ? JSON.parse(call.arguments) : {};
      } catch {
        lastError = "The arguments were not valid JSON.";
        continue;
      }

      const validation = llmPlanContentSchema.safeParse(parsedArgs);
      if (!validation.success) {
        lastError = validation.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        continue;
      }

      const referentialError = findReferentialError(validation.data, exerciseIds, recipeIds);
      if (referentialError) {
        lastError = referentialError;
        continue;
      }

      return validation.data;
    }

    throw new Error(`AiPlanContentService: LLM failed to produce a valid plan after ${MAX_ATTEMPTS} attempt(s): ${lastError}`);
  }
}
