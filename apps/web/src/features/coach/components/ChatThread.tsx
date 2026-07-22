"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMessages, useSendCoachMessage } from "../api/messages.api";
import { MessageBubble } from "./MessageBubble";

export function ChatThread({ conversationId }: { conversationId: string }) {
  const { data: messages, isLoading } = useMessages(conversationId);
  const { send, streamingText, isSending, error } = useSendCoachMessage(conversationId);
  const [draft, setDraft] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim() || isSending) return;
    const content = draft;
    setDraft("");
    void send(content);
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {isLoading ? (
          <p className="text-text-secondary">Loading conversation...</p>
        ) : (
          <>
            {messages?.map((message) => (
              <MessageBubble key={message.id} role={message.role as "USER" | "ASSISTANT"} content={message.content} />
            ))}
            {isSending && streamingText && <MessageBubble role="ASSISTANT" content={streamingText} />}
            {isSending && !streamingText && (
              <p className="text-caption text-text-tertiary">Thinking, pulling your data...</p>
            )}
          </>
        )}
      </div>

      {error && <p className="text-caption text-destructive">{error}</p>}

      <form className="flex items-end gap-2" onSubmit={handleSubmit}>
        <Textarea
          className="min-h-12"
          placeholder="Ask about your progress, e.g. 'I feel tired, what's going on?'"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" disabled={isSending || !draft.trim()}>
          {isSending ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
