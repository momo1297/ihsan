export class WeightEntryEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly date: string,
    public readonly weightKg: number,
    public readonly createdAt: Date,
  ) {}
}
