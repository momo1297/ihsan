"use client";

import { useQuery } from "@tanstack/react-query";
import type { BodyComposition } from "@ihsan/contracts";
import { useAuthedApi } from "@/lib/use-authed-api";

export function useBodyComposition(date: string) {
  const api = useAuthedApi();
  return useQuery({
    queryKey: ["body-composition", date],
    queryFn: () => api<BodyComposition>(`/progress/composition?date=${date}`),
  });
}
