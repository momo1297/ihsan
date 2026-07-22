/** All calendar dates from `from` to `to` inclusive, ascending. */
export function buildDateRange(from: string, to: string): string[] {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const start = Date.UTC(fy ?? 0, (fm ?? 1) - 1, fd ?? 1);
  const end = Date.UTC(ty ?? 0, (tm ?? 1) - 1, td ?? 1);

  const days: string[] = [];
  for (let cursor = start; cursor <= end; cursor += 24 * 60 * 60 * 1000) {
    days.push(new Date(cursor).toISOString().slice(0, 10));
  }
  return days;
}
