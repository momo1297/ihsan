export class ChatConversationEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly title: string | null,
    public readonly createdAt: Date,
  ) {}
}
