"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChatMessage } from "@ihsan/contracts";
import { useAuthedApi } from "@/lib/use-authed-api";
import { API_URL } from "@/lib/api-client";

function messagesKey(conversationId: string) {
  return ["coach-messages", conversationId] as const;
}

export function useMessages(conversationId: string) {
  const api = useAuthedApi();
  return useQuery({
    queryKey: messagesKey(conversationId),
    queryFn: () => api<ChatMessage[]>(`/coach/conversations/${conversationId}/messages`),
  });
}

interface StreamEvent {
  type: "chunk" | "done" | "error";
  text?: string;
  message?: string;
}

export function useSendCoachMessage(conversationId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [streamingText, setStreamingText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (content: string) => {
      setIsSending(true);
      setStreamingText("");
      setError(null);

      try {
        const token = await getToken();
        const response = await fetch(`${API_URL}/coach/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok || !response.body) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error?.message ?? "Failed to send message");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as StreamEvent;
            if (event.type === "chunk" && event.text) {
              setStreamingText((current) => current + event.text);
            } else if (event.type === "error") {
              throw new Error(event.message ?? "The coach ran into an error");
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        await queryClient.invalidateQueries({ queryKey: messagesKey(conversationId) });
        setStreamingText("");
        setIsSending(false);
      }
    },
    [conversationId, getToken, queryClient],
  );

  return { send, streamingText, isSending, error };
}
