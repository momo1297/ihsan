"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LogWeightInput, WeightEntry } from "@ihsan/contracts";
import { useAuthedApi } from "@/lib/use-authed-api";

const WEIGHT_ENTRIES_KEY = ["weight-entries"] as const;

export function useWeightEntries(from?: string, to?: string) {
  const api = useAuthedApi();
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();

  return useQuery({
    queryKey: [...WEIGHT_ENTRIES_KEY, from, to],
    queryFn: () => api<WeightEntry[]>(`/weight-entries${query ? `?${query}` : ""}`),
  });
}

export function useLogWeight() {
  const api = useAuthedApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LogWeightInput) => api<WeightEntry>("/weight-entries", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEIGHT_ENTRIES_KEY });
      queryClient.invalidateQueries({ queryKey: ["body-composition"] });
    },
  });
}
