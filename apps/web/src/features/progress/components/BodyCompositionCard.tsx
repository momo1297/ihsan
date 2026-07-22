"use client";

import { todayDateString } from "@/lib/utils";
import { useBodyComposition } from "../api/body-composition.api";
import { BodyProfileForm } from "./BodyProfileForm";

export function BodyCompositionCard() {
  const today = todayDateString();
  const { data: composition, isLoading } = useBodyComposition(today);

  return (
    <div className="flex flex-col gap-4">
      <BodyProfileForm />

      {isLoading ? (
        <p className="text-text-secondary">Calculating...</p>
      ) : composition?.estimatedBodyFatPercent != null ? (
        <div className="flex gap-6">
          <div>
            <p className="text-caption text-text-tertiary">Estimated body fat</p>
            <p className="text-title font-semibold">{composition.estimatedBodyFatPercent}%</p>
          </div>
          {composition.estimatedLeanMassKg != null && (
            <div>
              <p className="text-caption text-text-tertiary">Estimated lean mass</p>
              <p className="text-title font-semibold">{composition.estimatedLeanMassKg}kg</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-text-secondary">
          Log your height, sex, and today&apos;s waist/neck (and hips, if female) measurements to see an estimate.
        </p>
      )}
    </div>
  );
}
