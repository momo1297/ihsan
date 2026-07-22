export class MeasurementEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly date: string,
    public readonly waistCm: number | null,
    public readonly neckCm: number | null,
    public readonly hipsCm: number | null,
    public readonly chestCm: number | null,
    public readonly armCm: number | null,
    public readonly thighCm: number | null,
    public readonly notes: string | null,
    public readonly createdAt: Date,
  ) {}
}
