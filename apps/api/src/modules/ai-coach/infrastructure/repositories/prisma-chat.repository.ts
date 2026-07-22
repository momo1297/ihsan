import { Inject, Injectable } from "@nestjs/common";
import type { ChatRole as PrismaChatRole, PrismaClient, Prisma } from "@ihsan/database";
import { PRISMA_CLIENT } from "../../../../shared/database/prisma.module";
import { ChatConversationEntity } from "../../domain/entities/chat-conversation.entity";
import { ChatMessageEntity, ChatMessageRole, ChatToolCallRecord } from "../../domain/entities/chat-message.entity";
import { AppendMessageInput, ChatRepositoryPort } from "../../application/ports/chat.repository.port";

type ConversationRow = { id: string; userId: string; title: string | null; createdAt: Date };

type MessageRow = {
  id: string;
  conversationId: string;
  role: PrismaChatRole;
  content: string;
  toolCalls: Prisma.JsonValue | null;
  toolCallId: string | null;
  toolName: string | null;
  createdAt: Date;
};

function toConversationEntity(row: ConversationRow): ChatConversationEntity {
  return new ChatConversationEntity(row.id, row.userId, row.title, row.createdAt);
}

function toMessageEntity(row: MessageRow): ChatMessageEntity {
  return new ChatMessageEntity(
    row.id,
    row.conversationId,
    row.role as ChatMessageRole,
    row.content,
    (row.toolCalls as ChatToolCallRecord[] | null) ?? null,
    row.toolCallId,
    row.createdAt,
  );
}

@Injectable()
export class PrismaChatRepository implements ChatRepositoryPort {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async createConversation(userId: string, title?: string | null): Promise<ChatConversationEntity> {
    const row = await this.prisma.chatConversation.create({ data: { userId, title } });
    return toConversationEntity(row);
  }

  async findConversationById(id: string, userId: string): Promise<ChatConversationEntity | null> {
    const row = await this.prisma.chatConversation.findFirst({ where: { id, userId } });
    return row ? toConversationEntity(row) : null;
  }

  async findManyConversationsByUser(userId: string): Promise<ChatConversationEntity[]> {
    const rows = await this.prisma.chatConversation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toConversationEntity);
  }

  async appendMessage(conversationId: string, input: AppendMessageInput): Promise<ChatMessageEntity> {
    const row = await this.prisma.chatMessage.create({
      data: {
        conversationId,
        role: input.role,
        content: input.content,
        toolCalls: input.toolCalls ? (input.toolCalls as unknown as Prisma.InputJsonValue) : undefined,
        toolCallId: input.toolCallId ?? undefined,
        toolName: input.toolName ?? undefined,
      },
    });
    return toMessageEntity(row);
  }

  async findMessagesByConversation(conversationId: string): Promise<ChatMessageEntity[]> {
    const rows = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toMessageEntity);
  }
}
