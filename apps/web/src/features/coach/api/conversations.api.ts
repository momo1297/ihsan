"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChatConversation } from "@ihsan/contracts";
import { useAuthedApi } from "@/lib/use-authed-api";

const CONVERSATIONS_KEY = ["coach-conversations"] as const;

export function useConversations() {
  const api = useAuthedApi();
  return useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: () => api<ChatConversation[]>("/coach/conversations"),
  });
}

export function useCreateConversation() {
  const api = useAuthedApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api<ChatConversation>("/coach/conversations", { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }),
  });
}
