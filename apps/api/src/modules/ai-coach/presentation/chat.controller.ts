import { Body, Controller, Get, Param, Post, Res, UseGuards, UsePipes } from "@nestjs/common";
import type { Response } from "express";
import { sendMessageSchema, SendMessageInput } from "@ihsan/contracts";
import { ClerkAuthGuard } from "../../../shared/guards/clerk-auth.guard";
import { ResolveCurrentUserGuard } from "../../../shared/guards/resolve-current-user.guard";
import { CurrentUser } from "../../../shared/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { todayDateString } from "../../../shared/utils/today.util";
import { UserEntity } from "../../users/domain/entities/user.entity";
import { CreateConversationUseCase } from "../application/use-cases/create-conversation.use-case";
import { ListConversationsUseCase } from "../application/use-cases/list-conversations.use-case";
import { ListMessagesUseCase } from "../application/use-cases/list-messages.use-case";
import { SendMessageUseCase } from "../application/use-cases/send-message.use-case";
import { toConversationDto, toMessageDto } from "./ai-coach.mapper";

const STREAM_CHUNK_SIZE = 12;
const STREAM_CHUNK_DELAY_MS = 15;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Controller("coach")
@UseGuards(ClerkAuthGuard, ResolveCurrentUserGuard)
export class ChatController {
  constructor(
    private readonly createConversation: CreateConversationUseCase,
    private readonly listConversations: ListConversationsUseCase,
    private readonly listMessages: ListMessagesUseCase,
    private readonly sendMessage: SendMessageUseCase,
  ) {}

  @Get("conversations")
  async list(@CurrentUser() user: UserEntity) {
    const conversations = await this.listConversations.execute(user.id);
    return conversations.map(toConversationDto);
  }

  @Post("conversations")
  async create(@CurrentUser() user: UserEntity) {
    const conversation = await this.createConversation.execute(user.id);
    return toConversationDto(conversation);
  }

  @Get("conversations/:id/messages")
  async messages(@CurrentUser() user: UserEntity, @Param("id") id: string) {
    const messages = await this.listMessages.execute(id, user.id);
    return messages.map(toMessageDto);
  }

  @Post("conversations/:id/messages")
  @UsePipes(new ZodValidationPipe(sendMessageSchema))
  async postMessage(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string,
    @Body() body: SendMessageInput,
    @Res({ passthrough: false }) res: Response,
  ) {
    const finalText = await this.sendMessage.execute(user.id, id, body.content, todayDateString());

    res.setHeader("Content-Type", "application/x-ndjson");
    res.setHeader("Cache-Control", "no-cache");

    for (let i = 0; i < finalText.length; i += STREAM_CHUNK_SIZE) {
      res.write(JSON.stringify({ type: "chunk", text: finalText.slice(i, i + STREAM_CHUNK_SIZE) }) + "\n");
      await sleep(STREAM_CHUNK_DELAY_MS);
    }
    res.write(JSON.stringify({ type: "done" }) + "\n");
    res.end();
  }
}
