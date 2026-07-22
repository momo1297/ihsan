import { NotFoundError } from "../../../../shared/errors/domain-errors";
import { ChatConversationEntity } from "../../domain/entities/chat-conversation.entity";
import { ChatMessageEntity } from "../../domain/entities/chat-message.entity";
import { AppendMessageInput, ChatRepositoryPort } from "../ports/chat.repository.port";
import { LlmClientPort, LlmCompletionResult, LlmMessage, LlmToolDefinition } from "../ports/llm-client.port";
import { CoachTool } from "../tools/coach-tool.interface";
import { SendMessageUseCase } from "./send-message.use-case";

class FakeChatRepository implements ChatRepositoryPort {
  public messages: ChatMessageEntity[] = [];
  private readonly conversation: ChatConversationEntity;

  constructor(conversationId: string, userId: string) {
    this.conversation = new ChatConversationEntity(conversationId, userId, null, new Date());
  }

  async createConversation(): Promise<ChatConversationEntity> {
    throw new Error("not needed for this test");
  }

  async findConversationById(id: string, userId: string): Promise<ChatConversationEntity | null> {
    return this.conversation.id === id && this.conversation.userId === userId ? this.conversation : null;
  }

  async findManyConversationsByUser(): Promise<ChatConversationEntity[]> {
    throw new Error("not needed for this test");
  }

  async appendMessage(conversationId: string, input: AppendMessageInput): Promise<ChatMessageEntity> {
    const message = new ChatMessageEntity(
      `msg-${this.messages.length + 1}`,
      conversationId,
      input.role,
      input.content,
      input.toolCalls ?? null,
      input.toolCallId ?? null,
      new Date(),
    );
    this.messages.push(message);
    return message;
  }

  async findMessagesByConversation(): Promise<ChatMessageEntity[]> {
    return this.messages;
  }
}

class FakeLlmClient implements LlmClientPort {
  private callIndex = 0;
  public receivedMessages: LlmMessage[][] = [];

  constructor(private readonly responses: LlmCompletionResult[]) {}

  async complete(messages: LlmMessage[], _tools: LlmToolDefinition[]): Promise<LlmCompletionResult> {
    this.receivedMessages.push(messages);
    const response = this.responses[this.callIndex] ?? { content: "", toolCalls: [] };
    this.callIndex++;
    return response;
  }
}

class FakeTool implements CoachTool {
  public calls: { userId: string; args: Record<string, unknown> }[] = [];
  readonly definition = {
    name: "getWeightTrend",
    description: "test tool",
    parameters: { type: "object", properties: {} },
  };

  async execute(userId: string, args: Record<string, unknown>): Promise<unknown> {
    this.calls.push({ userId, args });
    return { weightKg: 80 };
  }
}

describe("SendMessageUseCase", () => {
  it("returns the assistant's answer directly when no tools are needed", async () => {
    const chats = new FakeChatRepository("conv-1", "user-1");
    const llm = new FakeLlmClient([{ content: "You're doing great!", toolCalls: [] }]);
    const useCase = new SendMessageUseCase(chats, llm, []);

    const result = await useCase.execute("user-1", "conv-1", "How am I doing?", "2026-07-22");

    expect(result).toBe("You're doing great!");
    expect(chats.messages.map((m) => m.role)).toEqual(["USER", "ASSISTANT"]);
  });

  it("executes a requested tool and feeds the result back before answering", async () => {
    const chats = new FakeChatRepository("conv-1", "user-1");
    const tool = new FakeTool();
    const llm = new FakeLlmClient([
      {
        content: "",
        toolCalls: [{ id: "call-1", name: "getWeightTrend", arguments: '{"from":"2026-07-01","to":"2026-07-22"}' }],
      },
      { content: "You're down 2kg this month.", toolCalls: [] },
    ]);
    const useCase = new SendMessageUseCase(chats, llm, [tool]);

    const result = await useCase.execute("user-1", "conv-1", "How's my weight trend?", "2026-07-22");

    expect(result).toBe("You're down 2kg this month.");
    expect(tool.calls).toEqual([{ userId: "user-1", args: { from: "2026-07-01", to: "2026-07-22" } }]);
    expect(chats.messages.map((m) => m.role)).toEqual(["USER", "ASSISTANT", "TOOL", "ASSISTANT"]);
  });

  it("throws NotFoundError when the conversation doesn't belong to the user", async () => {
    const chats = new FakeChatRepository("conv-1", "user-1");
    const llm = new FakeLlmClient([]);
    const useCase = new SendMessageUseCase(chats, llm, []);

    await expect(useCase.execute("other-user", "conv-1", "hi", "2026-07-22")).rejects.toThrow(NotFoundError);
  });

  it("returns a fallback message if the tool loop never terminates", async () => {
    const chats = new FakeChatRepository("conv-1", "user-1");
    const tool = new FakeTool();
    const alwaysToolCall: LlmCompletionResult = {
      content: "",
      toolCalls: [{ id: "call-x", name: "getWeightTrend", arguments: "{}" }],
    };
    const llm = new FakeLlmClient(Array.from({ length: 10 }, () => alwaysToolCall));
    const useCase = new SendMessageUseCase(chats, llm, [tool]);

    const result = await useCase.execute("user-1", "conv-1", "loop forever", "2026-07-22");

    expect(result).toMatch(/couldn't finish/i);
  });
});
