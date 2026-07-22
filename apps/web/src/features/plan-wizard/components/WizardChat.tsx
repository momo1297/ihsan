"use client";

import { useState } from "react";
import type { ProposedPlan, WizardChatMessage } from "@ihsan/contracts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSendWizardMessage } from "../api/wizard.api";

const GREETING: WizardChatMessage = {
  role: "assistant",
  content:
    "Hi! Let's build you a training program and nutrition targets. First — how many days a week do you want to train?",
};

export function WizardChat({
  initialHistory,
  onProposal,
}: {
  initialHistory?: WizardChatMessage[];
  onProposal: (plan: ProposedPlan, history: WizardChatMessage[]) => void;
}) {
  const [history, setHistory] = useState<WizardChatMessage[]>(initialHistory ?? [GREETING]);
  const [draft, setDraft] = useState("");
  const sendMessage = useSendWizardMessage();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim() || sendMessage.isPending) return;
    const content = draft;
    const priorHistory = history;
    setDraft("");
    setHistory([...priorHistory, { role: "user", content }]);

    sendMessage.mutate(
      { history: priorHistory, content },
      {
        onSuccess: (response) => {
          if (response.type === "proposal") {
            onProposal(response.plan, response.history);
          } else {
            setHistory(response.history);
          }
        },
      },
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {history.map((message, index) => (
          <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[75%] whitespace-pre-wrap rounded-lg px-3 py-2 text-body",
                message.role === "user" ? "bg-brand text-brand-foreground" : "bg-surface text-text-primary",
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        {sendMessage.isPending && <p className="text-caption text-text-tertiary">Thinking...</p>}
        {sendMessage.isError && <p className="text-caption text-destructive">Something went wrong — try again.</p>}
      </div>

      <form className="flex items-end gap-2" onSubmit={handleSubmit}>
        <Textarea
          className="min-h-12"
          placeholder="Type your answer..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" disabled={sendMessage.isPending || !draft.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
