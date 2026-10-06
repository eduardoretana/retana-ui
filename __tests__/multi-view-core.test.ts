import { describe, expect, it } from "vitest"

import {
  addDays,
  barPlacement,
  decodeFilters,
  encodeFilters,
  filterRecords,
  formatCurrency,
  formatDateLabel,
  groupRecordsWithSum,
  monthGrid,
  moveRange,
  coerceEnabledViews,
  recordsToCsv,
  resizeRange,
  searchRecords,
  sortRecords,
  timelineTicks,
  validateDraft,
  weekdayLabels,
  type FieldDef,
  type MultiRecord,
} from "@/registry/lib/multi-view"

const fields: FieldDef[] = [
  { id: "name", label: "Name", type: "text" },
  { id: "amount", label: "Amount", type: "currency", currency: "USD" },
  {
    id: "stage",
    label: "Stage",
    type: "status",
    options: [
      { value: "new", label: "New" },
      { value: "won", label: "Won" },
    ],
  },
  { id: "close", label: "Close", type: "date" },
  { id: "owner", label: "Owner", type: "person" },
]

const rows: MultiRecord[] = [
  { id: "a", name: "Órbita", amount: 42000, stage: "new", close: "2026-03-15", owner: { name: "Inés" } },
  { id: "b", name: "Mesa", amount: 9000, stage: "won", close: "2026-03-20" },
  { id: "c", name: "=cmd", amount: null, stage: "new" },
]

describe("multi-view helpers", () => {
  it("formats compact currency and calendar dates without shifting the day", () => {
    expect(formatCurrency(42000, "en-US")).toBe("$42K")
    expect(formatCurrency(42000, "es-MX")).toContain("42")
    expect(formatDateLabel("2026-03-15", "en-US")).toBe("Mar 15, 2026")
    expect(addDays("2026-03-08", 1)).toBe("2026-03-09")
  })

  it("searches without accents and filters, sorts, and groups", () => {
    expect(searchRecords(rows, fields, "orbita").map((row) => row.id)).toEqual(["a"])
    expect(
      filterRecords(rows, fields, [{ id: "1", field: "stage", op: "is", value: "won" }]).map((row) => row.id),
    ).toEqual(["b"])
    expect(
      filterRecords(rows, fields, [{ id: "2", field: "close", op: "empty" }]).map((row) => row.id),
    ).toEqual(["c"])
    expect(sortRecords(rows, fields, { field: "amount", direction: "asc" }).map((row) => row.id)).toEqual([
      "b",
      "a",
      "c",
    ])
    const groups = groupRecordsWithSum(rows, fields, "stage", "amount", { includeEmpty: true })
    expect(groups.map((group) => group.key)).toEqual(["new", "won"])
    expect(groups[0]?.sum).toBe(42000)
  })

  it("builds a Monday-first month and moves a timeline bar by one day", () => {
    const days = monthGrid(2026, 2, 1)
    expect(days).toHaveLength(42)
    expect(days[0]?.iso).toBe("2026-02-23")
    expect(weekdayLabels("en-US", 1)[0]).toBe("Mon")
    expect(weekdayLabels("en-US", 0)[0]).toBe("Sun")
    expect(moveRange("2026-04-01", "2026-04-10", "day", 1)).toEqual({
      start: "2026-04-02",
      end: "2026-04-11",
    })
    expect(resizeRange("2026-04-01", "2026-04-10", "end", "day", 1)).toEqual({
      start: "2026-04-01",
      end: "2026-04-11",
    })
    expect(barPlacement("2026-04-01", "2026-04-01", "2026-04-01", "day")?.span).toBe(1)
    expect(timelineTicks("2026-04-01", "2026-04-03", "day", "en-US").map((tick) => tick.iso)).toEqual([
      "2026-04-01",
      "2026-04-02",
      "2026-04-03",
    ])
  })

  it("exports csv and round-trips filters", () => {
    const csv = recordsToCsv(rows, fields, "en-US")
    expect(csv).toContain("'=cmd")
    const filters = [{ id: "1", field: "stage", op: "is" as const, value: "new" }]
    expect(decodeFilters(encodeFilters(filters))[0]).toMatchObject({ field: "stage", op: "is", value: "new" })
  })

  it("keeps at least one enabled view", () => {
    expect(coerceEnabledViews(["gallery", "table"], ["table", "board"])).toEqual(["table"])
    expect(coerceEnabledViews([], ["table", "board"], ["board"])).toEqual(["board"])
    expect(coerceEnabledViews(["missing"], ["table", "board"])).toEqual(["table"])
  })

  it("requires a title on create", () => {
    expect(validateDraft({ amount: 1 }, fields, "name")).toMatch(/Name/)
    expect(validateDraft({ name: "Patio" }, fields, "name")).toBeNull()
  })
})
