import { buildDateRange } from "./date-range-builder.service";

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
});
