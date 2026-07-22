import { Inject, Injectable } from "@nestjs/common";
import { ChatConversationEntity } from "../../domain/entities/chat-conversation.entity";
import { CHAT_REPOSITORY, ChatRepositoryPort } from "../ports/chat.repository.port";

@Injectable()
export class CreateConversationUseCase {
  constructor(@Inject(CHAT_REPOSITORY) private readonly chats: ChatRepositoryPort) {}

  async execute(userId: string): Promise<ChatConversationEntity> {
    return this.chats.createConversation(userId);
  }
}
