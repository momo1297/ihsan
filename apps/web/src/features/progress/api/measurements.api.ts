"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LogMeasurementInput, Measurement } from "@ihsan/contracts";
import { useAuthedApi } from "@/lib/use-authed-api";

const MEASUREMENTS_KEY = ["measurements"] as const;

export function useMeasurements(from?: string, to?: string) {
  const api = useAuthedApi();
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();

  return useQuery({
    queryKey: [...MEASUREMENTS_KEY, from, to],
    queryFn: () => api<Measurement[]>(`/measurements${query ? `?${query}` : ""}`),
  });
}

export function useLogMeasurement() {
  const api = useAuthedApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LogMeasurementInput) =>
      api<Measurement>("/measurements", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEASUREMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["body-composition"] });
    },
  });
}
