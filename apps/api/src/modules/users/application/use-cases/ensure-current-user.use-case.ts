import { Inject, Injectable } from "@nestjs/common";
import { getClerkClient } from "../../../../shared/clerk/clerk-client";
import { UserEntity } from "../../domain/entities/user.entity";
import { USER_REPOSITORY, UserRepositoryPort } from "../ports/user.repository.port";

/**
 * Resolves the current user, provisioning it on first sight if the Clerk
 * `user.created` webhook hasn't synced it yet (e.g. no public webhook URL
 * configured in local dev). The webhook remains the source of truth for
 * profile updates; this is only a bootstrap fallback.
 */
@Injectable()
export class EnsureCurrentUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort) {}

  async execute(clerkId: string): Promise<UserEntity> {
    const existing = await this.userRepository.findByClerkId(clerkId);
    if (existing) {
      return existing;
    }

    const clerkUser = await getClerkClient().users.getUser(clerkId);
    const primaryEmail = clerkUser.emailAddresses.find(
      (address) => address.id === clerkUser.primaryEmailAddressId,
    );
    const email = primaryEmail?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      throw new Error(`Clerk user ${clerkId} has no email address`);
    }
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

    return this.userRepository.upsertFromClerk({ clerkId, email, name });
  }
}
