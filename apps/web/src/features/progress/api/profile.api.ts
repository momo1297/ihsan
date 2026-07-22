"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateUserProfileInput, User } from "@ihsan/contracts";
import { useAuthedApi } from "@/lib/use-authed-api";

const ME_KEY = ["me"] as const;

export function useMe() {
  const api = useAuthedApi();
  return useQuery({
    queryKey: ME_KEY,
    queryFn: () => api<User>("/me"),
  });
}

export function useUpdateProfile() {
  const api = useAuthedApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserProfileInput) => api<User>("/me", { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ME_KEY });
      queryClient.invalidateQueries({ queryKey: ["body-composition"] });
    },
  });
}
