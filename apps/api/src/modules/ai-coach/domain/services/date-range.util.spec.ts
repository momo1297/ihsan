import { buildDateRange } from "./date-range.util";

describe("buildDateRange", () => {
  it("returns a single day when from equals to", () => {
    expect(buildDateRange("2026-07-22", "2026-07-22")).toEqual(["2026-07-22"]);
  });

  it("returns all days inclusive, ascending", () => {
    expect(buildDateRange("2026-07-20", "2026-07-23")).toEqual([
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
    ]);
  });

  it("rolls across a month boundary", () => {
    expect(buildDateRange("2026-02-27", "2026-03-01")).toEqual(["2026-02-27", "2026-02-28", "2026-03-01"]);
  });
});
