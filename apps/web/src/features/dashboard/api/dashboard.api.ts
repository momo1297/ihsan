"use client";

import { useQuery } from "@tanstack/react-query";
import type { Dashboard } from "@ihsan/contracts";
import { useAuthedApi } from "@/lib/use-authed-api";

export function useDashboard() {
  const api = useAuthedApi();
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<Dashboard>("/dashboard"),
  });
}
