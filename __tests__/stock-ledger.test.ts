import { describe, expect, it } from "vitest"

import {
  balanceAccessibleName,
  balanceBy,
  balanceKey,
  belowReorder,
  formatBalance,
  formatSignedQuantity,
  movementTotals,
  quantityAccessibleName,
  runningBalances,
  toTransferPair,
  validateMovement,
  type StockMovement,
} from "@/registry/lib/stock-ledger"

function movement(partial: Partial<StockMovement> & Pick<StockMovement, "id" | "at" | "qty">): StockMovement {
  return {
    sku: "SKU-0001",
    warehouseId: "norte",
    kind: partial.qty < 0 ? "out" : "in",
    ...partial,
  }
}

const at = (day: number, hour = 0) => `2026-03-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00.000Z`

describe("runningBalances", () => {
  it("returns an empty ledger for no movements", () => {
    expect(runningBalances([])).toEqual([])
  })

  it("sets the first receipt as the balance", () => {
    const rows = runningBalances([movement({ id: "a", at: at(1), qty: 40, kind: "in" })])
    expect(rows).toHaveLength(1)
    expect(rows[0]?.balance).toBe(40)
    expect(rows[0]?.negative).toBe(false)
  })

  it("accumulates in then out for one sku and warehouse", () => {
    const rows = runningBalances([
      movement({ id: "a", at: at(1), qty: 40, kind: "in" }),
      movement({ id: "b", at: at(2), qty: -12, kind: "out" }),
    ])
    expect(rows.map((row) => row.balance)).toEqual([40, 28])
  })

  it("orders a later timestamp that was listed first", () => {
    const rows = runningBalances([
      movement({ id: "b", at: at(2), qty: -12, kind: "out" }),
      movement({ id: "a", at: at(1), qty: 40, kind: "in" }),
    ])
    expect(rows.map((row) => row.movement.id)).toEqual(["a", "b"])
    expect(rows.map((row) => row.balance)).toEqual([40, 28])
  })

  it("breaks timestamp ties by id, keeping the original order when both match", () => {
    const rows = runningBalances([
      movement({ id: "b", at: at(1), qty: 5, kind: "in" }),
      movement({ id: "a", at: at(1), qty: 7, kind: "in" }),
      movement({ id: "a", at: at(1), qty: 1, kind: "adjust" }),
    ])
    expect(rows.map((row) => [row.movement.id, row.movement.qty])).toEqual([
      ["a", 7],
      ["a", 1],
      ["b", 5],
    ])
    expect(rows.map((row) => row.balance)).toEqual([7, 8, 13])
  })

  it("keeps a separate balance per sku and per warehouse", () => {
    const rows = runningBalances([
      movement({ id: "a", at: at(1), sku: "SKU-0001", warehouseId: "norte", qty: 10, kind: "in" }),
      movement({ id: "b", at: at(1, 1), sku: "SKU-0002", warehouseId: "norte", qty: 4, kind: "in" }),
      movement({ id: "c", at: at(1, 2), sku: "SKU-0001", warehouseId: "sur", qty: 6, kind: "in" }),
      movement({ id: "d", at: at(1, 3), sku: "SKU-0001", warehouseId: "norte", qty: -3, kind: "out" }),
    ])
    expect(rows.map((row) => row.balance)).toEqual([10, 4, 6, 7])
  })

  it("applies a transfer as an out and an in without changing the global sum", () => {
    const [out, inn] = toTransferPair({
      sku: "SKU-0001",
      fromWarehouseId: "norte",
      toWarehouseId: "sur",
      qty: 4,
      at: at(2),
      transferId: "tr-1",
    })
    const rows = runningBalances([
      movement({ id: "open", at: at(1), qty: 10, kind: "in" }),
      out,
      inn,
    ])
    expect(rows.find((row) => row.movement.id === "tr-1:out")?.balance).toBe(6)
    expect(rows.find((row) => row.movement.id === "tr-1:in")?.balance).toBe(4)
    expect(out.qty + inn.qty).toBe(0)
  })

  it("marks a historical negative balance and the recovery after it", () => {
    const rows = runningBalances([
      movement({ id: "a", at: at(1), qty: 5, kind: "in" }),
      movement({ id: "b", at: at(2), qty: -8, kind: "adjust" }),
      movement({ id: "c", at: at(3), qty: 4, kind: "in" }),
    ])
    expect(rows.map((row) => [row.balance, row.negative])).toEqual([
      [5, false],
      [-3, true],
      [1, false],
    ])
  })

  it("filters by warehouse after the balance for that key is complete", () => {
    const rows = runningBalances(
      [
        movement({ id: "a", at: at(1), warehouseId: "norte", qty: 10, kind: "in" }),
        movement({ id: "b", at: at(2), warehouseId: "sur", qty: 6, kind: "in" }),
        movement({ id: "c", at: at(3), warehouseId: "norte", qty: -2, kind: "out" }),
      ],
      { warehouseId: "norte" },
    )
    expect(rows.map((row) => row.movement.id)).toEqual(["a", "c"])
    expect(rows.map((row) => row.balance)).toEqual([10, 8])
  })

  it("filters by sku", () => {
    const rows = runningBalances(
      [
        movement({ id: "a", at: at(1), sku: "SKU-0001", qty: 3, kind: "in" }),
        movement({ id: "b", at: at(2), sku: "SKU-0002", qty: 9, kind: "in" }),
      ],
      { sku: "SKU-0002" },
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]?.movement.sku).toBe("SKU-0002")
    expect(rows[0]?.balance).toBe(9)
  })

  it("does not let a later movement rewrite an earlier row", () => {
    const rows = runningBalances([
      movement({ id: "a", at: at(1), qty: 2, kind: "in" }),
      movement({ id: "b", at: at(2), qty: 5, kind: "in" }),
    ])
    expect(rows[0]?.balance).toBe(2)
  })

  it("balances five thousand movements in under 200ms", () => {
    const movements = Array.from({ length: 5000 }, (_, index) =>
      movement({
        id: String(index).padStart(5, "0"),
        at: new Date(Date.UTC(2020, 0, 1) + index * 1000).toISOString(),
        sku: `SKU-${String(index % 50).padStart(4, "0")}`,
        warehouseId: Math.floor(index / 50) % 2 === 0 ? "norte" : "sur",
        qty: 1,
        kind: "in",
      }),
    )
    const start = performance.now()
    const rows = runningBalances(movements)
    const totals = balanceBy(movements)
    const elapsed = performance.now() - start
    expect(rows).toHaveLength(5000)
    expect(totals.size).toBe(100)
    expect(elapsed).toBeLessThan(200)
  })
})

describe("balanceBy", () => {
  it("keeps the latest balance for each sku and warehouse", () => {
    const totals = balanceBy([
      movement({ id: "a", at: at(2), sku: "SKU-0001", warehouseId: "norte", qty: -2, kind: "out" }),
      movement({ id: "b", at: at(1), sku: "SKU-0001", warehouseId: "norte", qty: 10, kind: "in" }),
      movement({ id: "c", at: at(1), sku: "SKU-0001", warehouseId: "sur", qty: 4, kind: "in" }),
    ])
    expect(totals.get(balanceKey("SKU-0001", "norte"))).toBe(8)
    expect(totals.get(balanceKey("SKU-0001", "sur"))).toBe(4)
    expect(totals.has(balanceKey("SKU-0002", "norte"))).toBe(false)
  })
})

describe("validateMovement", () => {
  const balances = new Map([[balanceKey("SKU-0001", "norte"), 5]])

  it("rejects a zero quantity", () => {
    const issues = validateMovement(
      { sku: "SKU-0001", warehouseId: "norte", kind: "adjust", qty: 0, reason: "conteo" },
      balances,
    )
    expect(issues).toContainEqual({ field: "qty", code: "qty_zero" })
  })

  it("rejects a non-integer quantity", () => {
    expect(
      validateMovement({ sku: "SKU-0001", warehouseId: "norte", kind: "in", qty: 1.5 }, balances).some(
        (issue) => issue.code === "qty_not_integer",
      ),
    ).toBe(true)
  })

  it("rejects an outbound movement larger than the available balance", () => {
    const issues = validateMovement({ sku: "SKU-0001", warehouseId: "norte", kind: "out", qty: -9 }, balances)
    expect(issues).toContainEqual({ field: "qty", code: "insufficient" })
  })

  it("rejects a positive outbound magnitude the same way", () => {
    const issues = validateMovement({ sku: "SKU-0001", warehouseId: "norte", kind: "out", qty: 9 }, balances)
    expect(issues).toContainEqual({ field: "qty", code: "insufficient" })
  })

  it("rejects a transfer whose origin and destination match", () => {
    const issues = validateMovement(
      {
        sku: "SKU-0001",
        warehouseId: "norte",
        destinationWarehouseId: "norte",
        kind: "transfer",
        qty: 2,
      },
      balances,
    )
    expect(issues).toContainEqual({ field: "destinationWarehouseId", code: "same_warehouse" })
  })

  it("requires a reason on an adjustment", () => {
    const missing = validateMovement(
      { sku: "SKU-0001", warehouseId: "norte", kind: "adjust", qty: -1, reason: "   " },
      balances,
    )
    expect(missing).toContainEqual({ field: "reason", code: "reason_required" })
  })

  it("requires sku, warehouse, and a transfer destination", () => {
    const issues = validateMovement(
      { sku: " ", warehouseId: "", kind: "transfer", qty: 1 },
      balances,
    )
    expect(issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(["required", "required", "required"]))
    expect(issues.map((issue) => issue.field)).toEqual(
      expect.arrayContaining(["sku", "warehouseId", "destinationWarehouseId"]),
    )
  })

  it("accepts an adjustment that stays within stock and a transfer that clears the origin", () => {
    expect(
      validateMovement(
        { sku: "SKU-0001", warehouseId: "norte", kind: "adjust", qty: -5, reason: "conteo" },
        balances,
      ),
    ).toEqual([])
    expect(
      validateMovement(
        {
          sku: "SKU-0001",
          warehouseId: "norte",
          destinationWarehouseId: "sur",
          kind: "transfer",
          qty: 5,
        },
        balances,
      ),
    ).toEqual([])
  })

  it("treats a missing balance as zero", () => {
    const issues = validateMovement({ sku: "SKU-0009", warehouseId: "sur", kind: "out", qty: -1 }, new Map())
    expect(issues).toContainEqual({ field: "qty", code: "insufficient" })
  })
})

describe("toTransferPair", () => {
  it("builds two movements with one transfer id and a global net of zero", () => {
    const [out, inn] = toTransferPair({
      sku: "SKU-0001",
      fromWarehouseId: "norte",
      toWarehouseId: "sur",
      qty: 4,
      at: at(4),
      transferId: "tr-9",
      reason: "rebalance",
      ref: "OP-9",
    })
    expect(out).toMatchObject({
      id: "tr-9:out",
      kind: "transfer_out",
      warehouseId: "norte",
      qty: -4,
      transferId: "tr-9",
      sku: "SKU-0001",
      at: at(4),
      reason: "rebalance",
      ref: "OP-9",
    })
    expect(inn).toMatchObject({
      id: "tr-9:in",
      kind: "transfer_in",
      warehouseId: "sur",
      qty: 4,
      transferId: "tr-9",
    })
    expect(out.transferId).toBe(inn.transferId)
    expect(out.qty + inn.qty).toBe(0)
  })

  it("uses the absolute quantity so a negative draft still nets to zero", () => {
    const [out, inn] = toTransferPair({
      sku: "SKU-0001",
      fromWarehouseId: "norte",
      toWarehouseId: "sur",
      qty: -3,
      at: at(5),
      transferId: "tr-abs",
    })
    expect(out.qty).toBe(-3)
    expect(inn.qty).toBe(3)
    expect(out.reason).toBeUndefined()
  })
})

describe("belowReorder", () => {
  it("is true at the reorder point and below it", () => {
    expect(belowReorder(5, 5)).toBe(true)
    expect(belowReorder(4, 5)).toBe(true)
    expect(belowReorder(-1, 0)).toBe(true)
    expect(belowReorder(6, 5)).toBe(false)
  })
})

describe("movementTotals", () => {
  it("sums inbound, outbound, and net", () => {
    expect(
      movementTotals([
        movement({ id: "a", at: at(1), qty: 40, kind: "in" }),
        movement({ id: "b", at: at(2), qty: -12, kind: "out" }),
      ]),
    ).toEqual({ inbound: 40, outbound: 12, net: 28 })
  })
})

describe("signed quantity formatting", () => {
  it("shows a plus, a real minus, or no sign", () => {
    expect(formatSignedQuantity(40, "es-MX")).toBe("+40")
    expect(formatSignedQuantity(-12, "es-MX")).toBe("\u221212")
    expect(formatSignedQuantity(0, "es-MX")).toBe("0")
    expect(formatSignedQuantity(-12, "en-US").codePointAt(0)).toBe(0x2212)
  })

  it("groups a large quantity for es-MX and en-US", () => {
    expect(formatSignedQuantity(9_999_999, "es-MX")).toBe("+9,999,999")
    expect(formatSignedQuantity(-9_999_999, "en-US")).toBe("\u22129,999,999")
  })

  it("names the sign in words for es-MX and en-US", () => {
    expect(quantityAccessibleName(40, "unidades", "es-MX")).toBe("más 40 unidades")
    expect(quantityAccessibleName(-12, "unidades", "es-MX")).toBe("menos 12 unidades")
    expect(quantityAccessibleName(0, "unidades", "es-MX")).toBe("0 unidades")
    expect(quantityAccessibleName(40, "units", "en-US")).toBe("plus 40 units")
    expect(quantityAccessibleName(-12, "units", "en-US")).toBe("minus 12 units")
    expect(quantityAccessibleName(9_999_999, "unidades", "es-MX")).toBe("más 9,999,999 unidades")
  })

  it("formats a balance without a plus and with a real minus", () => {
    expect(formatBalance(40, "es-MX")).toBe("40")
    expect(formatBalance(0, "en-US")).toBe("0")
    expect(formatBalance(-3, "es-MX")).toBe("\u22123")
    expect(balanceAccessibleName(40, "unidades", "es-MX")).toBe("40 unidades")
    expect(balanceAccessibleName(-3, "unidades", "es-MX")).toBe("menos 3 unidades")
    expect(balanceAccessibleName(-3, "units", "en-US")).toBe("minus 3 units")
  })
})
