import type { Exercise, PersonalRecord, Program, Session, WorkoutDay } from "@ihsan/contracts";
import { ExerciseEntity } from "../domain/entities/exercise.entity";
import { ProgramEntity, WorkoutDayLine } from "../domain/entities/program.entity";
import { WorkoutSessionEntity } from "../domain/entities/workout-session.entity";
import { PersonalRecordEntry } from "../application/ports/personal-record.repository.port";

export function toWorkoutDayDto(day: WorkoutDayLine): WorkoutDay {
  return {
    id: day.id,
    name: day.name,
    dayOrder: day.dayOrder,
    exercises: day.exercises.map((line) => ({
      id: line.id,
      exerciseId: line.exerciseId,
      exerciseName: line.exerciseName,
      order: line.order,
      targetSets: line.targetSets,
      targetRepsMin: line.targetRepsMin,
      targetRepsMax: line.targetRepsMax,
      restSeconds: line.restSeconds ?? undefined,
    })),
  };
}

export function toExerciseDto(entity: ExerciseEntity): Exercise {
  return {
    id: entity.id,
    userId: entity.userId,
    name: entity.name,
    muscleGroup: entity.muscleGroup,
    equipment: entity.equipment ?? undefined,
    createdAt: entity.createdAt.toISOString(),
  };
}

export function toProgramDto(entity: ProgramEntity): Program {
  return {
    id: entity.id,
    userId: entity.userId,
    name: entity.name,
    isActive: entity.isActive,
    days: entity.days.map((day) => ({
      id: day.id,
      name: day.name,
      dayOrder: day.dayOrder,
      exercises: day.exercises.map((line) => ({
        id: line.id,
        exerciseId: line.exerciseId,
        exerciseName: line.exerciseName,
        order: line.order,
        targetSets: line.targetSets,
        targetRepsMin: line.targetRepsMin,
        targetRepsMax: line.targetRepsMax,
        restSeconds: line.restSeconds ?? undefined,
      })),
    })),
    createdAt: entity.createdAt.toISOString(),
  };
}

export function toPersonalRecordDto(entry: PersonalRecordEntry): PersonalRecord {
  return {
    id: entry.id,
    exerciseId: entry.exerciseId,
    exerciseName: entry.exerciseName,
    type: entry.type,
    value: entry.value,
    achievedAt: entry.achievedAt.toISOString(),
  };
}

export function toSessionDto(entity: WorkoutSessionEntity): Session {
  return {
    id: entity.id,
    userId: entity.userId,
    date: entity.date,
    programId: entity.programId,
    workoutDayId: entity.workoutDayId,
    startedAt: entity.startedAt ? entity.startedAt.toISOString() : null,
    completedAt: entity.completedAt ? entity.completedAt.toISOString() : null,
    notes: entity.notes,
    setLogs: entity.setLogs.map((set) => ({
      id: set.id,
      workoutSessionId: entity.id,
      exerciseId: set.exerciseId,
      setNumber: set.setNumber,
      reps: set.reps,
      weightKg: set.weightKg,
      rpe: set.rpe ?? undefined,
      isWarmup: set.isWarmup,
      createdAt: entity.createdAt.toISOString(),
    })),
    createdAt: entity.createdAt.toISOString(),
  };
}
