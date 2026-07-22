import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError } from "../../../../shared/errors/domain-errors";
import { ChatMessageEntity, ChatMessageRole } from "../../domain/entities/chat-message.entity";
import { CHAT_REPOSITORY, ChatRepositoryPort } from "../ports/chat.repository.port";
import { LLM_CLIENT, LlmClientPort, LlmMessage, LlmMessageRole } from "../ports/llm-client.port";
import { COACH_TOOLS, CoachTool } from "../tools/coach-tool.interface";

const MAX_TOOL_ITERATIONS = 5;

function buildSystemPrompt(today: string): string {
  return [
    "You are the AI Coach inside Ihsan, a personal health/fitness/nutrition tracker for a single user.",
    `Today's date is ${today} (YYYY-MM-DD). Resolve any relative date range ("this week", "last 7 days", "this month") to concrete YYYY-MM-DD dates yourself before calling a tool — tools only accept concrete dates.`,
    "You have read-only tools to pull the user's real logged data (nutrition, training, weight, measurements, goals, habits).",
    "Always call the relevant tools before answering questions about the user's progress, trends, or performance — never guess or make up numbers.",
    "Cite the actual numbers you pulled in your answer. Be direct and concise, like a knowledgeable coach, not a generic chatbot.",
    "You cannot log meals, edit workouts, or change goals — if asked to do something like that, say you can only advise, not act, and tell the user what to do.",
    "You are not a doctor — for anything that sounds like a medical concern, say so plainly and suggest they see one.",
  ].join(" ");
}

function toLlmRole(role: ChatMessageRole): LlmMessageRole {
  switch (role) {
    case "USER":
      return "user";
    case "ASSISTANT":
      return "assistant";
    case "SYSTEM":
      return "system";
    case "TOOL":
      return "tool";
  }
}

function toLlmMessage(message: ChatMessageEntity): LlmMessage {
  return {
    role: toLlmRole(message.role),
    content: message.content,
    toolCalls: message.toolCalls ?? undefined,
    toolCallId: message.toolCallId ?? undefined,
  };
}

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY) private readonly chats: ChatRepositoryPort,
    @Inject(LLM_CLIENT) private readonly llm: LlmClientPort,
    @Inject(COACH_TOOLS) private readonly tools: CoachTool[],
  ) {}

  async execute(userId: string, conversationId: string, content: string, today: string): Promise<string> {
    const conversation = await this.chats.findConversationById(conversationId, userId);
    if (!conversation) throw new NotFoundError("Conversation", conversationId);

    await this.chats.appendMessage(conversationId, { role: "USER", content });
    const history = await this.chats.findMessagesByConversation(conversationId);

    const messages: LlmMessage[] = [
      { role: "system", content: buildSystemPrompt(today) },
      ...history.map(toLlmMessage),
    ];
    const toolDefinitions = this.tools.map((tool) => tool.definition);
    const toolsByName = new Map(this.tools.map((tool) => [tool.definition.name, tool]));

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      const result = await this.llm.complete(messages, toolDefinitions);

      if (result.toolCalls.length === 0) {
        const finalText = result.content ?? "";
        await this.chats.appendMessage(conversationId, { role: "ASSISTANT", content: finalText });
        return finalText;
      }

      messages.push({ role: "assistant", content: result.content ?? "", toolCalls: result.toolCalls });
      await this.chats.appendMessage(conversationId, {
        role: "ASSISTANT",
        content: result.content ?? "",
        toolCalls: result.toolCalls,
      });

      for (const call of result.toolCalls) {
        const tool = toolsByName.get(call.name);
        const output = await this.runTool(tool, call.name, userId, call.arguments);
        const toolContent = JSON.stringify(output);
        messages.push({ role: "tool", content: toolContent, toolCallId: call.id, toolName: call.name });
        await this.chats.appendMessage(conversationId, {
          role: "TOOL",
          content: toolContent,
          toolCallId: call.id,
          toolName: call.name,
        });
      }
    }

    const fallback = "I gathered your data but couldn't finish putting together an answer — try asking again, maybe more specifically.";
    await this.chats.appendMessage(conversationId, { role: "ASSISTANT", content: fallback });
    return fallback;
  }

  private async runTool(
    tool: CoachTool | undefined,
    name: string,
    userId: string,
    rawArguments: string,
  ): Promise<unknown> {
    if (!tool) return { error: `Unknown tool: ${name}` };
    try {
      const args = rawArguments ? JSON.parse(rawArguments) : {};
      return await tool.execute(userId, args);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Tool execution failed" };
    }
  }
}
