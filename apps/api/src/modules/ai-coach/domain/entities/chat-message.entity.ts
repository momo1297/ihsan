export type ChatMessageRole = "USER" | "ASSISTANT" | "SYSTEM" | "TOOL";

export interface ChatToolCallRecord {
  id: string;
  name: string;
  arguments: string;
}

export class ChatMessageEntity {
  constructor(
    public readonly id: string,
    public readonly conversationId: string,
    public readonly role: ChatMessageRole,
    public readonly content: string,
    public readonly toolCalls: ChatToolCallRecord[] | null,
    public readonly toolCallId: string | null,
    public readonly createdAt: Date,
  ) {}
}
