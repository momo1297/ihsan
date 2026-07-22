export const LLM_CLIENT = "LLM_CLIENT";

export type LlmMessageRole = "system" | "user" | "assistant" | "tool";

export interface LlmToolCall {
  id: string;
  name: string;
  /** Raw JSON string of arguments, as the model produced it. */
  arguments: string;
}

export interface LlmMessage {
  role: LlmMessageRole;
  /** Empty string for an assistant message that is only requesting tool calls. */
  content: string;
  /** Present when role is "assistant" and the model wants to call tools. */
  toolCalls?: LlmToolCall[];
  /** Present when role is "tool" — which call this message answers. */
  toolCallId?: string;
  /** Present when role is "tool" — the tool's name. */
  toolName?: string;
}

export interface LlmToolDefinition {
  name: string;
  description: string;
  /** JSON Schema for the tool's arguments object. */
  parameters: Record<string, unknown>;
}

export interface LlmCompletionResult {
  content: string | null;
  toolCalls: LlmToolCall[];
}

/**
 * Provider-agnostic tool-calling chat completion. Any LLM API that can take a message history
 * and a tool list and return either text or tool calls can implement this — swapping providers
 * means swapping this adapter, nothing in the application layer changes.
 */
export interface LlmClientPort {
  complete(messages: LlmMessage[], tools: LlmToolDefinition[]): Promise<LlmCompletionResult>;
}
