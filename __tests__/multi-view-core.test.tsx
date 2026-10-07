import { describe, expect, it } from "vitest"

import { formatCurrency, formatDateLabel } from "@/registry/lib/multi-view-core"

describe("multi-view-core", () => {
  it("formats currency and a calendar day", () => {
    expect(formatCurrency(42000, "en-US")).toMatch(/42/)
    expect(formatDateLabel("2026-04-16", "en-US")).toMatch(/2026/)
  })
})
