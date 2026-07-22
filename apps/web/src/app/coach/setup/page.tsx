"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProposedPlan, WizardChatMessage } from "@ihsan/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { WizardChat } from "@/features/plan-wizard/components/WizardChat";
import { PlanPreview } from "@/features/plan-wizard/components/PlanPreview";

type Phase = "chat" | "proposal" | "applied";

export default function PlanWizardPage() {
  const [phase, setPhase] = useState<Phase>("chat");
  const [plan, setPlan] = useState<ProposedPlan | null>(null);
  const [history, setHistory] = useState<WizardChatMessage[] | undefined>(undefined);
  const [chatKey, setChatKey] = useState(0);

  function handleProposal(newPlan: ProposedPlan, newHistory: WizardChatMessage[]) {
    setPlan(newPlan);
    setHistory(newHistory);
    setPhase("proposal");
  }

  function handleAdjust() {
    setChatKey((key) => key + 1);
    setPhase("chat");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-8">
        <h1 className="text-title font-semibold">Plan setup</h1>

        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle>{phase === "applied" ? "Done!" : "Talk to your coach"}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {phase === "chat" && <WizardChat key={chatKey} initialHistory={history} onProposal={handleProposal} />}

            {phase === "proposal" && plan && (
              <PlanPreview plan={plan} onApplied={() => setPhase("applied")} onAdjust={handleAdjust} />
            )}

            {phase === "applied" && (
              <div className="flex flex-col gap-3">
                <p className="text-body">
                  Your program is active, your nutrition target is set, and a meal template is ready — apply it to
                  today from the Nutrition page whenever you like.
                </p>
                <div className="flex gap-3">
                  <Button asChild size="sm">
                    <Link href="/training">Go to Training</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/nutrition">Go to Nutrition</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
