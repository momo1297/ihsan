import { Inject, Injectable } from "@nestjs/common";
import type { PrismaClient } from "@ihsan/database";
import { LogMeasurementInput } from "@ihsan/contracts";
import { PRISMA_CLIENT } from "../../../../shared/database/prisma.module";
import { MeasurementEntity } from "../../domain/entities/measurement.entity";
import { MeasurementRepositoryPort } from "../../application/ports/measurement.repository.port";

type MeasurementRow = {
  id: string;
  userId: string;
  date: Date;
  waistCm: number | null;
  neckCm: number | null;
  hipsCm: number | null;
  chestCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  notes: string | null;
  createdAt: Date;
};

function toEntity(row: MeasurementRow): MeasurementEntity {
  return new MeasurementEntity(
    row.id,
    row.userId,
    row.date.toISOString().slice(0, 10),
    row.waistCm,
    row.neckCm,
    row.hipsCm,
    row.chestCm,
    row.armCm,
    row.thighCm,
    row.notes,
    row.createdAt,
  );
}

@Injectable()
export class PrismaMeasurementRepository implements MeasurementRepositoryPort {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async upsert(userId: string, input: LogMeasurementInput): Promise<MeasurementEntity> {
    const date = new Date(input.date);
    const data = {
      waistCm: input.waistCm,
      neckCm: input.neckCm,
      hipsCm: input.hipsCm,
      chestCm: input.chestCm,
      armCm: input.armCm,
      thighCm: input.thighCm,
      notes: input.notes,
    };
    const row = await this.prisma.measurement.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, ...data },
      update: data,
    });
    return toEntity(row);
  }

  async findManyByUserInRange(userId: string, from?: string, to?: string): Promise<MeasurementEntity[]> {
    const rows = await this.prisma.measurement.findMany({
      where: {
        userId,
        date: { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined },
      },
      orderBy: { date: "asc" },
    });
    return rows.map(toEntity);
  }

  async findByDate(userId: string, date: string): Promise<MeasurementEntity | null> {
    const row = await this.prisma.measurement.findUnique({ where: { userId_date: { userId, date: new Date(date) } } });
    return row ? toEntity(row) : null;
  }
}
