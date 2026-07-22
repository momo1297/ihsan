import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import {
  LlmClientPort,
  LlmCompletionResult,
  LlmMessage,
  LlmToolDefinition,
} from "../../application/ports/llm-client.port";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct";

function toOpenAiMessage(message: LlmMessage): ChatCompletionMessageParam {
  if (message.role === "tool") {
    return { role: "tool", content: message.content, tool_call_id: message.toolCallId ?? "" };
  }
  if (message.role === "assistant") {
    return {
      role: "assistant",
      content: message.content || null,
      tool_calls: message.toolCalls?.length
        ? message.toolCalls.map((call) => ({
            id: call.id,
            type: "function",
            function: { name: call.name, arguments: call.arguments },
          }))
        : undefined,
    };
  }
  return { role: message.role, content: message.content };
}

function toOpenAiTool(tool: LlmToolDefinition): ChatCompletionTool {
  return {
    type: "function",
    function: { name: tool.name, description: tool.description, parameters: tool.parameters },
  };
}

@Injectable()
export class OpenRouterLlmClient implements LlmClientPort {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY ?? "",
      baseURL: OPENROUTER_BASE_URL,
    });
    this.model = process.env.AI_COACH_MODEL ?? DEFAULT_MODEL;
  }

  async complete(messages: LlmMessage[], tools: LlmToolDefinition[]): Promise<LlmCompletionResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map(toOpenAiMessage),
      tools: tools.length > 0 ? tools.map(toOpenAiTool) : undefined,
    });

    const choice = response.choices[0]?.message;
    if (!choice) return { content: "", toolCalls: [] };

    const toolCalls = (choice.tool_calls ?? [])
      .filter((call) => call.type === "function")
      .map((call) => ({
        id: call.id,
        name: call.function.name,
        arguments: call.function.arguments,
      }));

    return { content: choice.content ?? null, toolCalls };
  }
}
