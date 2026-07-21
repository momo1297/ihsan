import { Inject, Injectable } from "@nestjs/common";
import { UserEntity } from "../../domain/entities/user.entity";
import {
  UpdateUserProfileInput,
  USER_REPOSITORY,
  UserRepositoryPort,
} from "../ports/user.repository.port";
import { EnsureCurrentUserUseCase } from "./ensure-current-user.use-case";

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    private readonly ensureCurrentUser: EnsureCurrentUserUseCase,
  ) {}

  async execute(clerkId: string, input: UpdateUserProfileInput): Promise<UserEntity> {
    const user = await this.ensureCurrentUser.execute(clerkId);
    return this.userRepository.updateProfile(user.id, input);
  }
}
