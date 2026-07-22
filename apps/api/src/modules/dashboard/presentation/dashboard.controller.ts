import { Controller, Get, UseGuards } from "@nestjs/common";
import { ClerkAuthGuard } from "../../../shared/guards/clerk-auth.guard";
import { ResolveCurrentUserGuard } from "../../../shared/guards/resolve-current-user.guard";
import { CurrentUser } from "../../../shared/decorators/current-user.decorator";
import { todayDateString } from "../../../shared/utils/today.util";
import { UserEntity } from "../../users/domain/entities/user.entity";
import { GetDashboardUseCase } from "../application/use-cases/get-dashboard.use-case";
import { toDashboardDto } from "./dashboard.mapper";

@Controller("dashboard")
@UseGuards(ClerkAuthGuard, ResolveCurrentUserGuard)
export class DashboardController {
  constructor(private readonly getDashboard: GetDashboardUseCase) {}

  @Get()
  async get(@CurrentUser() user: UserEntity) {
    const result = await this.getDashboard.execute(user.id, todayDateString(), user.weightUnit);
    return toDashboardDto(result);
  }
}
