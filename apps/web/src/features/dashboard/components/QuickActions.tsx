import Link from "next/link";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild size="sm">
        <Link href="/nutrition">Log meal</Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href="/progress">Log weight</Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href="/training">Start workout</Link>
      </Button>
      <Button size="sm" variant="ghost" disabled title="Coming in a future sprint">
        AI Coach
      </Button>
    </div>
  );
}
