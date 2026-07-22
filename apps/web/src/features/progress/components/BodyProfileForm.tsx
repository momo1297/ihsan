"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Sex, User } from "@ihsan/contracts";
import { useMe, useUpdateProfile } from "../api/profile.api";

export function BodyProfileForm() {
  const { data: me, isLoading } = useMe();

  if (isLoading || !me) return <p className="text-text-secondary">Loading profile...</p>;

  return <BodyProfileFields me={me} />;
}

function BodyProfileFields({ me }: { me: User }) {
  const updateProfile = useUpdateProfile();
  const [heightCm, setHeightCm] = useState(me.heightCm ? String(me.heightCm) : "");
  const [sex, setSex] = useState<Sex | "">(me.sex ?? "");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    updateProfile.mutate({
      heightCm: heightCm ? Number(heightCm) : undefined,
      sex: sex || undefined,
    });
  }

  const isComplete = Boolean(me.heightCm && me.sex);

  return (
    <form className="flex flex-wrap items-end gap-3" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label>Height (cm)</Label>
        <Input
          type="number"
          className="w-28"
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Sex</Label>
        <Select value={sex} onValueChange={(v) => setSex(v as Sex)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Choose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MALE">Male</SelectItem>
            <SelectItem value="FEMALE">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="sm" disabled={updateProfile.isPending || !heightCm || !sex}>
        {updateProfile.isPending ? "Saving..." : "Save"}
      </Button>
      {!isComplete && (
        <p className="w-full text-caption text-text-tertiary">
          Needed to estimate body fat % from your measurements (U.S. Navy method).
        </p>
      )}
    </form>
  );
}
