import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError } from "../../../../shared/errors/domain-errors";
import { ChatMessageEntity } from "../../domain/entities/chat-message.entity";
import { CHAT_REPOSITORY, ChatRepositoryPort } from "../ports/chat.repository.port";

@Injectable()
export class ListMessagesUseCase {
  constructor(@Inject(CHAT_REPOSITORY) private readonly chats: ChatRepositoryPort) {}

  async execute(conversationId: string, userId: string): Promise<ChatMessageEntity[]> {
    const conversation = await this.chats.findConversationById(conversationId, userId);
    if (!conversation) throw new NotFoundError("Conversation", conversationId);

    const messages = await this.chats.findMessagesByConversation(conversationId);
    return messages.filter(
      (message) => (message.role === "USER" || message.role === "ASSISTANT") && message.content.trim().length > 0,
    );
  }
}
