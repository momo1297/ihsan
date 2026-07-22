"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";
import { PlanWizardFlow } from "@/features/plan-wizard/components/PlanWizardFlow";

export default function PlanWizardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-8">
        <h1 className="text-title font-semibold">Plan setup</h1>

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
