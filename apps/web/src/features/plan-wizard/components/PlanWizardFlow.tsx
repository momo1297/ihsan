"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProposedPlan, WizardChatMessage } from "@ihsan/contracts";
import { Button } from "@/components/ui/button";
import { WizardChat } from "./WizardChat";
import { PlanPreview } from "./PlanPreview";

type Phase = "chat" | "proposal" | "applied";

export function PlanWizardFlow({ onApplied }: { onApplied?: () => void }) {
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

  function handleApplied() {
    setPhase("applied");
    onApplied?.();
  }

  if (phase === "chat") {
    return <WizardChat key={chatKey} initialHistory={history} onProposal={handleProposal} />;
  }

  if (phase === "proposal" && plan) {
    return <PlanPreview plan={plan} onApplied={handleApplied} onAdjust={handleAdjust} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-body">
        Your program is active, your nutrition target is set, and a meal template is ready — apply it to today
        from the Nutrition page whenever you like.
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
  );
}
