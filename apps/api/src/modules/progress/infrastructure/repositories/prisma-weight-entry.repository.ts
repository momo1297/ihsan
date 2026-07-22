import { Inject, Injectable } from "@nestjs/common";
import type { PrismaClient } from "@ihsan/database";
import { LogWeightInput } from "@ihsan/contracts";
import { PRISMA_CLIENT } from "../../../../shared/database/prisma.module";
import { WeightEntryEntity } from "../../domain/entities/weight-entry.entity";
import { WeightEntryRepositoryPort } from "../../application/ports/weight-entry.repository.port";

type WeightEntryRow = {
  id: string;
  userId: string;
  date: Date;
  weightKg: number;
  createdAt: Date;
};

function toEntity(row: WeightEntryRow): WeightEntryEntity {
  return new WeightEntryEntity(row.id, row.userId, row.date.toISOString().slice(0, 10), row.weightKg, row.createdAt);
}

@Injectable()
export class PrismaWeightEntryRepository implements WeightEntryRepositoryPort {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async upsert(userId: string, input: LogWeightInput): Promise<WeightEntryEntity> {
    const date = new Date(input.date);
    const row = await this.prisma.weightEntry.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, weightKg: input.weightKg },
      update: { weightKg: input.weightKg },
    });
    return toEntity(row);
  }

  async findManyByUserInRange(userId: string, from?: string, to?: string): Promise<WeightEntryEntity[]> {
    const rows = await this.prisma.weightEntry.findMany({
      where: {
        userId,
        date: { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined },
      },
      orderBy: { date: "asc" },
    });
    return rows.map(toEntity);
  }

  async findByDate(userId: string, date: string): Promise<WeightEntryEntity | null> {
    const row = await this.prisma.weightEntry.findUnique({ where: { userId_date: { userId, date: new Date(date) } } });
    return row ? toEntity(row) : null;
  }

  async findLatest(userId: string): Promise<WeightEntryEntity | null> {
    const row = await this.prisma.weightEntry.findFirst({ where: { userId }, orderBy: { date: "desc" } });
    return row ? toEntity(row) : null;
  }
}
