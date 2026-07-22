import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { NutritionModule } from "../nutrition/nutrition.module";
import { TrainingModule } from "../training/training.module";
import { ProgressModule } from "../progress/progress.module";
import { GoalsModule } from "../goals/goals.module";
import { HabitsModule } from "../habits/habits.module";
import { ResolveCurrentUserGuard } from "../../shared/guards/resolve-current-user.guard";

import { ChatController } from "./presentation/chat.controller";

import { CreateConversationUseCase } from "./application/use-cases/create-conversation.use-case";
import { ListConversationsUseCase } from "./application/use-cases/list-conversations.use-case";
import { ListMessagesUseCase } from "./application/use-cases/list-messages.use-case";
import { SendMessageUseCase } from "./application/use-cases/send-message.use-case";

import { CHAT_REPOSITORY } from "./application/ports/chat.repository.port";
import { LLM_CLIENT } from "./application/ports/llm-client.port";
import { PrismaChatRepository } from "./infrastructure/repositories/prisma-chat.repository";
import { OpenRouterLlmClient } from "./infrastructure/llm/openrouter-llm-client";

import { COACH_TOOLS, CoachTool } from "./application/tools/coach-tool.interface";
import { GetNutritionSummaryTool } from "./application/tools/get-nutrition-summary.tool";
import { GetTrainingHistoryTool } from "./application/tools/get-training-history.tool";
import { GetWeightTrendTool } from "./application/tools/get-weight-trend.tool";
import { GetMeasurementsTool } from "./application/tools/get-measurements.tool";
import { GetActiveGoalsTool } from "./application/tools/get-active-goals.tool";
import { GetHabitAdherenceTool } from "./application/tools/get-habit-adherence.tool";

@Module({
  imports: [UsersModule, NutritionModule, TrainingModule, ProgressModule, GoalsModule, HabitsModule],
  controllers: [ChatController],
  providers: [
    ResolveCurrentUserGuard,
    CreateConversationUseCase,
    ListConversationsUseCase,
    ListMessagesUseCase,
    SendMessageUseCase,
    { provide: CHAT_REPOSITORY, useClass: PrismaChatRepository },
    { provide: LLM_CLIENT, useClass: OpenRouterLlmClient },
    GetNutritionSummaryTool,
    GetTrainingHistoryTool,
    GetWeightTrendTool,
    GetMeasurementsTool,
    GetActiveGoalsTool,
    GetHabitAdherenceTool,
    {
      provide: COACH_TOOLS,
      useFactory: (
        nutrition: GetNutritionSummaryTool,
        training: GetTrainingHistoryTool,
        weight: GetWeightTrendTool,
        measurements: GetMeasurementsTool,
        goals: GetActiveGoalsTool,
        habits: GetHabitAdherenceTool,
      ): CoachTool[] => [nutrition, training, weight, measurements, goals, habits],
      inject: [
        GetNutritionSummaryTool,
        GetTrainingHistoryTool,
        GetWeightTrendTool,
        GetMeasurementsTool,
        GetActiveGoalsTool,
        GetHabitAdherenceTool,
      ],
    },
  ],
})
export class AiCoachModule {}
