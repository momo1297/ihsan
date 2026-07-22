"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";
import { ConversationList } from "@/features/coach/components/ConversationList";
import { ChatThread } from "@/features/coach/components/ChatThread";

export default function CoachPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
        <h1 className="text-title font-semibold">AI Coach</h1>

        <div className="grid flex-1 gap-6 md:grid-cols-[220px_1fr]">
          <Card>
            <CardContent>
              <ConversationList activeId={activeConversationId} onSelect={setActiveConversationId} />
            </CardContent>
          </Card>

          <Card className="flex flex-1 flex-col">
            <CardContent className="flex flex-1 flex-col">
              {activeConversationId ? (
                <ChatThread conversationId={activeConversationId} />
              ) : (
                <p className="text-text-secondary">Start a new conversation to talk to your coach.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
