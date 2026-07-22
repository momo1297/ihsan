"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { todayDateString } from "@/lib/utils";
import { useLogMeasurement, useMeasurements } from "../api/measurements.api";

const FIELDS = [
  { key: "waistCm", label: "Waist (cm)" },
  { key: "neckCm", label: "Neck (cm)" },
  { key: "hipsCm", label: "Hips (cm)" },
  { key: "chestCm", label: "Chest (cm)" },
  { key: "armCm", label: "Arm (cm)" },
  { key: "thighCm", label: "Thigh (cm)" },
] as const;

export function MeasurementSection() {
  const { data: measurements, isLoading } = useMeasurements();
  const logMeasurement = useLogMeasurement();
  const [values, setValues] = useState<Record<string, string>>({});

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const hasAny = FIELDS.some((f) => values[f.key]);
    if (!hasAny) return;
    logMeasurement.mutate(
      {
        date: todayDateString(),
        waistCm: values.waistCm ? Number(values.waistCm) : undefined,
        neckCm: values.neckCm ? Number(values.neckCm) : undefined,
        hipsCm: values.hipsCm ? Number(values.hipsCm) : undefined,
        chestCm: values.chestCm ? Number(values.chestCm) : undefined,
        armCm: values.armCm ? Number(values.armCm) : undefined,
        thighCm: values.thighCm ? Number(values.thighCm) : undefined,
      },
      { onSuccess: () => setValues({}) },
    );
  }

  const recent = [...(measurements ?? [])].reverse().slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      <form className="flex flex-wrap items-end gap-3" onSubmit={handleSubmit}>
        {FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <Label>{field.label}</Label>
            <Input
              type="number"
              step="0.1"
              className="w-24"
              value={values[field.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
            />
          </div>
        ))}
        <Button type="submit" disabled={logMeasurement.isPending}>
          {logMeasurement.isPending ? "Saving..." : "Log measurements"}
        </Button>
      </form>

      {isLoading ? (
        <p className="text-text-secondary">Loading history...</p>
      ) : recent.length === 0 ? (
        <p className="text-text-secondary">No measurements logged yet.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {recent.map((m) => (
            <li key={m.id} className="rounded-md border border-border bg-surface px-3 py-2 text-caption text-text-secondary">
              {m.date}
              {[
                m.waistCm && `waist ${m.waistCm}cm`,
                m.neckCm && `neck ${m.neckCm}cm`,
                m.hipsCm && `hips ${m.hipsCm}cm`,
                m.chestCm && `chest ${m.chestCm}cm`,
                m.armCm && `arm ${m.armCm}cm`,
                m.thighCm && `thigh ${m.thighCm}cm`,
              ]
                .filter(Boolean)
                .map((part) => ` · ${part}`)
                .join("")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
