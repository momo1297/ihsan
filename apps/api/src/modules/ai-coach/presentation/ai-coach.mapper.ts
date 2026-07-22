import type { ChatConversation, ChatMessage } from "@ihsan/contracts";
import { ChatConversationEntity } from "../domain/entities/chat-conversation.entity";
import { ChatMessageEntity } from "../domain/entities/chat-message.entity";

export function toConversationDto(entity: ChatConversationEntity): ChatConversation {
  return {
    id: entity.id,
    userId: entity.userId,
    title: entity.title,
    createdAt: entity.createdAt.toISOString(),
  };
}

export function toMessageDto(entity: ChatMessageEntity): ChatMessage {
  return {
    id: entity.id,
    conversationId: entity.conversationId,
    role: entity.role,
    content: entity.content,
    createdAt: entity.createdAt.toISOString(),
  };
}
