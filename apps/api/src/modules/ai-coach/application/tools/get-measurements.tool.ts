import { Injectable } from "@nestjs/common";
import { ListMeasurementsUseCase } from "../../../progress/application/use-cases/list-measurements.use-case";
import { CoachTool, DATE_RANGE_SCHEMA } from "./coach-tool.interface";

interface Args {
  from: string;
  to: string;
}

@Injectable()
export class GetMeasurementsTool implements CoachTool {
  readonly definition = {
    name: "getMeasurements",
    description: "Get logged body circumference measurements (waist, neck, hips, chest, arm, thigh) for a date range.",
    parameters: DATE_RANGE_SCHEMA,
  };

  constructor(private readonly listMeasurements: ListMeasurementsUseCase) {}

  async execute(userId: string, args: Record<string, unknown>): Promise<unknown> {
    const { from, to } = args as unknown as Args;
    const measurements = await this.listMeasurements.execute(userId, from, to);
    return measurements.map((m) => ({
      date: m.date,
      waistCm: m.waistCm,
      neckCm: m.neckCm,
      hipsCm: m.hipsCm,
      chestCm: m.chestCm,
      armCm: m.armCm,
      thighCm: m.thighCm,
    }));
  }
}
