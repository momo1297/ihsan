import { CreateHabitInput, UpdateHabitInput } from "@ihsan/contracts";
import { HabitEntity } from "../../domain/entities/habit.entity";
import { HabitRepositoryPort } from "../ports/habit.repository.port";
import { GetHabitAdherenceUseCase } from "./get-habit-adherence.use-case";

class FakeHabitRepository implements HabitRepositoryPort {
  constructor(private readonly habits: HabitEntity[]) {}
  async create(_userId: string, _input: CreateHabitInput): Promise<HabitEntity> {
    throw new Error("not needed for this test");
  }
  async update(_id: string, _userId: string, _input: UpdateHabitInput): Promise<HabitEntity> {
    throw new Error("not needed for this test");
  }
  async findById(): Promise<HabitEntity | null> {
    throw new Error("not needed for this test");
  }
  async findManyActiveByUser(): Promise<HabitEntity[]> {
    return this.habits;
  }
  async upsertLog(): Promise<void> {
    throw new Error("not needed for this test");
  }
}

describe("GetHabitAdherenceUseCase", () => {
  it("computes completed count and dates within the range only", async () => {
    const habit = new HabitEntity(
      "habit-1",
      "user-1",
      "Meditate",
      true,
      ["2026-07-18", "2026-07-20", "2026-07-22", "2099-01-01"],
      new Date(),
    );
    const useCase = new GetHabitAdherenceUseCase(new FakeHabitRepository([habit]));

    const result = await useCase.execute("user-1", "2026-07-19", "2026-07-22");

    expect(result).toEqual([
      {
        habitName: "Meditate",
        totalDays: 4,
        completedCount: 2,
        completedDates: ["2026-07-20", "2026-07-22"],
      },
    ]);
  });

  it("returns an empty array when there are no active habits", async () => {
    const useCase = new GetHabitAdherenceUseCase(new FakeHabitRepository([]));
    const result = await useCase.execute("user-1", "2026-07-19", "2026-07-22");
    expect(result).toEqual([]);
  });
});
