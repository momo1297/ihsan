"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";
import { WeightSection } from "@/features/progress/components/WeightSection";
import { MeasurementSection } from "@/features/progress/components/MeasurementSection";
import { BodyCompositionCard } from "@/features/progress/components/BodyCompositionCard";

export default function ProgressPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
        <h1 className="text-title font-semibold">Progress</h1>

        <Card>
          <CardHeader>
            <CardTitle>Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightSection />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Body composition</CardTitle>
          </CardHeader>
          <CardContent>
            <BodyCompositionCard />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Measurements</CardTitle>
          </CardHeader>
          <CardContent>
            <MeasurementSection />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
