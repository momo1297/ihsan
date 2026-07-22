"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { todayDateString } from "@/lib/utils";
import { useLogWeight, useWeightEntries } from "../api/weight-entries.api";
import { WeightHistoryChart } from "./WeightHistoryChart";

function daysAgoDateString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export function WeightSection() {
  const from = daysAgoDateString(90);
  const { data: entries, isLoading } = useWeightEntries(from);
  const logWeight = useLogWeight();
  const [weightKg, setWeightKg] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!weightKg) return;
    logWeight.mutate({ date: todayDateString(), weightKg: Number(weightKg) }, { onSuccess: () => setWeightKg("") });
  }

  const latest = entries?.[entries.length - 1];

  return (
    <div className="flex flex-col gap-4">
      <form className="flex flex-wrap items-end gap-3" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <Label>Today&apos;s weight (kg)</Label>
          <Input
            type="number"
            step="0.1"
            className="w-32"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={logWeight.isPending || !weightKg}>
          {logWeight.isPending ? "Saving..." : "Log weight"}
        </Button>
        {latest && <span className="text-caption text-text-secondary">Latest: {latest.weightKg}kg on {latest.date}</span>}
      </form>

      {isLoading ? (
        <p className="text-text-secondary">Loading history...</p>
      ) : (
        <WeightHistoryChart entries={entries ?? []} />
      )}
    </div>
  );
}
