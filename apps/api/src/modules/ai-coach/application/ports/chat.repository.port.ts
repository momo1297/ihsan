import { ChatConversationEntity } from "../../domain/entities/chat-conversation.entity";
import { ChatMessageEntity, ChatMessageRole, ChatToolCallRecord } from "../../domain/entities/chat-message.entity";

export const CHAT_REPOSITORY = "CHAT_REPOSITORY";

export interface AppendMessageInput {
  role: ChatMessageRole;
  content: string;
  toolCalls?: ChatToolCallRecord[] | null;
  toolCallId?: string | null;
  toolName?: string | null;
}

export interface ChatRepositoryPort {
  createConversation(userId: string, title?: string | null): Promise<ChatConversationEntity>;
  findConversationById(id: string, userId: string): Promise<ChatConversationEntity | null>;
  findManyConversationsByUser(userId: string): Promise<ChatConversationEntity[]>;
  appendMessage(conversationId: string, input: AppendMessageInput): Promise<ChatMessageEntity>;
  findMessagesByConversation(conversationId: string): Promise<ChatMessageEntity[]>;
}
