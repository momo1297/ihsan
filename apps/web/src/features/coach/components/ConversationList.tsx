"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConversations, useCreateConversation } from "../api/conversations.api";

export function ConversationList({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const { data: conversations, isLoading } = useConversations();
  const createConversation = useCreateConversation();

  function handleNew() {
    createConversation.mutate(undefined, {
      onSuccess: (conversation) => onSelect(conversation.id),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Button type="button" size="sm" onClick={handleNew} disabled={createConversation.isPending}>
        {createConversation.isPending ? "Starting..." : "New conversation"}
      </Button>

      {isLoading ? (
        <p className="text-text-secondary">Loading...</p>
      ) : !conversations || conversations.length === 0 ? (
        <p className="text-caption text-text-tertiary">No conversations yet.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <button
                type="button"
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  "w-full rounded-md px-2.5 py-2 text-left text-caption hover:bg-accent",
                  activeId === conversation.id ? "bg-accent text-text-primary" : "text-text-secondary",
                )}
              >
                {conversation.title ?? `Conversation · ${conversation.createdAt.slice(0, 10)}`}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
