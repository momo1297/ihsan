"use client";

import { useMutation } from "@tanstack/react-query";
import type { ApplyPlanRequest, ApplyPlanResult, WizardChatRequest, WizardChatResponse } from "@ihsan/contracts";
import { useAuthedApi } from "@/lib/use-authed-api";

export function useSendWizardMessage() {
  const api = useAuthedApi();
  return useMutation({
    mutationFn: (input: WizardChatRequest) =>
      api<WizardChatResponse>("/plan-wizard/chat", { method: "POST", body: JSON.stringify(input) }),
  });
}

export function useApplyPlan() {
  const api = useAuthedApi();
  return useMutation({
    mutationFn: (input: ApplyPlanRequest) =>
      api<ApplyPlanResult>("/plan-wizard/apply", { method: "POST", body: JSON.stringify(input) }),
  });
}
