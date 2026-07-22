"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";
import { todayDateString } from "@/lib/utils";
import { HabitsList } from "@/features/habits/components/HabitsList";
import { HabitForm } from "@/features/habits/components/HabitForm";
import { WeightGoalCard } from "@/features/goals/components/WeightGoalCard";
import { MealsList } from "@/features/nutrition/components/MealsList";
import { useDashboard } from "@/features/dashboard/api/dashboard.api";
import { TodaysWorkoutCard } from "@/features/dashboard/components/TodaysWorkoutCard";
import { MacrosRemainingBar } from "@/features/dashboard/components/MacrosRemainingBar";
import { WeightGoalSummary } from "@/features/dashboard/components/WeightGoalSummary";
import { WeeklyRollupCard } from "@/features/dashboard/components/WeeklyRollupCard";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { usePrograms } from "@/features/training/api/programs.api";
import { PlanWizardFlow } from "@/features/plan-wizard/components/PlanWizardFlow";

export default function HomePage() {
  const today = todayDateString();
  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard();

  const hasActiveProgram = (programs ?? []).some((program) => program.isActive);

  if (programsLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <p className="p-8 text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (!hasActiveProgram) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-8">
          <h1 className="text-title font-semibold">Welcome to Ihsan</h1>
          <p className="text-text-secondary">
            Let&apos;s set up your training program and nutrition targets first — this becomes your daily dashboard
            once that&apos;s done.
          </p>
          <Card className="flex flex-1 flex-col">
            <CardHeader>
              <CardTitle>Talk to your coach</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <PlanWizardFlow />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-title font-semibold">Dashboard</h1>
          <QuickActions />
        </div>

        {dashboardLoading || !dashboard ? (
          <p className="text-text-secondary">Loading your day...</p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Today&apos;s workout</CardTitle>
                </CardHeader>
                <CardContent>
                  <TodaysWorkoutCard workoutDay={dashboard.today.workoutDay} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nutrition</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <MacrosRemainingBar
                      label="CALORIES"
                      remaining={dashboard.nutrition.caloriesRemaining}
                      consumed={dashboard.nutrition.consumed.calories}
                      target={dashboard.nutrition.target.calories}
                      unit="kcal"
                    />
                    <MacrosRemainingBar
                      label="PROTEIN"
                      remaining={dashboard.nutrition.proteinRemainingGrams}
                      consumed={dashboard.nutrition.consumed.proteinGrams}
                      target={dashboard.nutrition.target.proteinGrams}
                      unit="g"
                    />
                  </div>
                  <MealsList date={today} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Weight & goal</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <WeightGoalSummary weight={dashboard.weight} />
                <WeightGoalCard />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>This week</CardTitle>
              </CardHeader>
              <CardContent>
                <WeeklyRollupCard weeklyProgress={dashboard.weeklyProgress} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s habits</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <HabitsList />
                <HabitForm />
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
