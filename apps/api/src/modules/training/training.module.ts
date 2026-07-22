import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { ExerciseController } from "./presentation/exercise.controller";
import { ProgramController } from "./presentation/program.controller";
import { SessionController } from "./presentation/session.controller";
import { SetLogController } from "./presentation/set-log.controller";
import { PersonalRecordController } from "./presentation/personal-record.controller";

import { CreateExerciseUseCase } from "./application/use-cases/create-exercise.use-case";
import { ListExercisesUseCase } from "./application/use-cases/list-exercises.use-case";
import { GetExerciseHistoryUseCase } from "./application/use-cases/get-exercise-history.use-case";

import { CreateProgramUseCase } from "./application/use-cases/create-program.use-case";
import { UpdateProgramUseCase } from "./application/use-cases/update-program.use-case";
import { ListProgramsUseCase } from "./application/use-cases/list-programs.use-case";
import { ActivateProgramUseCase } from "./application/use-cases/activate-program.use-case";
import { GetNextSuggestionUseCase } from "./application/use-cases/get-next-suggestion.use-case";
import { GetTodaysWorkoutDayUseCase } from "./application/use-cases/get-todays-workout-day.use-case";

import { CreateSessionUseCase } from "./application/use-cases/create-session.use-case";
import { UpdateSessionUseCase } from "./application/use-cases/update-session.use-case";
import { ListSessionsUseCase } from "./application/use-cases/list-sessions.use-case";
import { LogSetUseCase } from "./application/use-cases/log-set.use-case";
import { UpdateSetUseCase } from "./application/use-cases/update-set.use-case";
import { DeleteSetUseCase } from "./application/use-cases/delete-set.use-case";

import { RecalculatePersonalRecordsUseCase } from "./application/use-cases/recalculate-personal-records.use-case";
import { ListPersonalRecordsUseCase } from "./application/use-cases/list-personal-records.use-case";

import { EXERCISE_REPOSITORY } from "./application/ports/exercise.repository.port";
import { PROGRAM_REPOSITORY } from "./application/ports/program.repository.port";
import { SESSION_REPOSITORY } from "./application/ports/session.repository.port";
import { PERSONAL_RECORD_REPOSITORY } from "./application/ports/personal-record.repository.port";

import { PrismaExerciseRepository } from "./infrastructure/repositories/prisma-exercise.repository";
import { PrismaProgramRepository } from "./infrastructure/repositories/prisma-program.repository";
import { PrismaSessionRepository } from "./infrastructure/repositories/prisma-session.repository";
import { PrismaPersonalRecordRepository } from "./infrastructure/repositories/prisma-personal-record.repository";
import { ResolveCurrentUserGuard } from "../../shared/guards/resolve-current-user.guard";

@Module({
  imports: [UsersModule],
  controllers: [
    ExerciseController,
    ProgramController,
    SessionController,
    SetLogController,
    PersonalRecordController,
  ],
  providers: [
    ResolveCurrentUserGuard,
    CreateExerciseUseCase,
    ListExercisesUseCase,
    GetExerciseHistoryUseCase,
    CreateProgramUseCase,
    UpdateProgramUseCase,
    ListProgramsUseCase,
    ActivateProgramUseCase,
    GetNextSuggestionUseCase,
    GetTodaysWorkoutDayUseCase,
    CreateSessionUseCase,
    UpdateSessionUseCase,
    ListSessionsUseCase,
    LogSetUseCase,
    UpdateSetUseCase,
    DeleteSetUseCase,
    RecalculatePersonalRecordsUseCase,
    ListPersonalRecordsUseCase,
    { provide: EXERCISE_REPOSITORY, useClass: PrismaExerciseRepository },
    { provide: PROGRAM_REPOSITORY, useClass: PrismaProgramRepository },
    { provide: SESSION_REPOSITORY, useClass: PrismaSessionRepository },
    { provide: PERSONAL_RECORD_REPOSITORY, useClass: PrismaPersonalRecordRepository },
  ],
  exports: [
    ListProgramsUseCase,
    ListSessionsUseCase,
    GetTodaysWorkoutDayUseCase,
    ListPersonalRecordsUseCase,
    ListExercisesUseCase,
    GetExerciseHistoryUseCase,
  ],
})
export class TrainingModule {}
