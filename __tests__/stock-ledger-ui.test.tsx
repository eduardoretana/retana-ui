import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axe from "axe-core"
import { useState, type ComponentProps, type ReactElement } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { balanceKey, type StockMovement } from "@/registry/lib/stock-ledger"
import { StockLedger, emptyStockLedgerFilters } from "@/registry/ui/stock-ledger"
import { StockMovementDialog } from "@/registry/ui/stock-movement-dialog"

const warehouses = [
  { id: "norte", label: "Almacén Norte" },
  { id: "sur", label: "Almacén Sur" },
]

const movements: StockMovement[] = [
  {
    id: "in-1",
    at: "2026-03-01T15:00:00.000Z",
    sku: "SKU-0001",
    warehouseId: "norte",
    kind: "in",
    qty: 40,
    ref: "OC-100",
  },
  {
    id: "out-1",
    at: "2026-03-02T15:00:00.000Z",
    sku: "SKU-0001",
    warehouseId: "norte",
    kind: "out",
    qty: -12,
    ref: "OV-100",
  },
  {
    id: "in-sur",
    at: "2026-03-03T15:00:00.000Z",
    sku: "SKU-0001",
    warehouseId: "sur",
    kind: "in",
    qty: 10,
    ref: "OC-200",
  },
]

function wideScreen() {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query === "(min-width: 640px)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  )
}

describe("StockLedger", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("reads a signed quantity in words and paints a real minus", () => {
    render(<StockLedger movements={movements} warehouses={warehouses} />)
    const inbound = screen.getByLabelText("más 40 unidades")
    const outbound = screen.getByLabelText("menos 12 unidades")
    expect(inbound).toHaveTextContent("+40")
    expect(outbound.textContent).toContain("\u2212")
    expect(outbound.textContent).not.toContain("-12")
    expect(getComputedStyle(inbound).fontVariantNumeric).toBe("tabular-nums")
    expect(getComputedStyle(inbound).textAlign).toBe("end")
    expect(getComputedStyle(screen.getByLabelText("40 unidades")).fontVariantNumeric).toBe("tabular-nums")
    expect(getComputedStyle(screen.getByLabelText("40 unidades")).textAlign).toBe("end")
    expect(screen.getAllByText("Entrada").length).toBeGreaterThan(0)
    expect(screen.getByText("Salida")).toBeInTheDocument()
    expect(screen.getByText("Saldo global")).toBeInTheDocument()
  })

  it("names the same quantity in English", () => {
    render(<StockLedger movements={movements} warehouses={warehouses} locale="en-US" />)
    expect(screen.getByLabelText("plus 40 units")).toBeInTheDocument()
    expect(screen.getByLabelText("minus 12 units")).toBeInTheDocument()
    expect(screen.getByText("Global balance")).toBeInTheDocument()
  })

  it("uses a captioned table on a wide viewport", () => {
    wideScreen()
    render(<StockLedger movements={movements} warehouses={warehouses} />)
    const table = screen.getByRole("table")
    expect(table.querySelector("caption")).toHaveTextContent("Movimientos de inventario")
    expect(within(table).getByRole("columnheader", { name: "Fecha" })).toBeInTheDocument()
    expect(within(table).getByRole("columnheader", { name: "Tipo" })).toBeInTheDocument()
    expect(within(table).getByRole("columnheader", { name: "Referencia" })).toBeInTheDocument()
    expect(within(table).getByRole("columnheader", { name: "Almacén" })).toBeInTheDocument()
    expect(within(table).getByRole("columnheader", { name: "Cantidad" })).toBeInTheDocument()
    expect(within(table).getByRole("columnheader", { name: "Saldo global" })).toBeInTheDocument()
    expect(within(table).queryByRole("checkbox")).not.toBeInTheDocument()
  })

  it("offers an adjustment from the empty state", async () => {
    const user = userEvent.setup()
    const onAdjust = vi.fn()
    render(<StockLedger movements={[]} warehouses={warehouses} onAdjust={onAdjust} />)
    expect(screen.getByText("No hay movimientos")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Registrar ajuste" }))
    expect(onAdjust).toHaveBeenCalledOnce()
  })

  it("shows a filtered empty state and clears the filters", async () => {
    const user = userEvent.setup()
    const onFiltersChange = vi.fn()
    render(
      <StockLedger
        movements={movements}
        warehouses={warehouses}
        filters={{ ...emptyStockLedgerFilters, query: "no-existe" }}
        onFiltersChange={onFiltersChange}
      />,
    )
    expect(screen.getByText("Ningún movimiento coincide")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }))
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ query: "" }))
  })

  it("labels a filtered running balance", () => {
    render(
      <StockLedger
        movements={movements}
        warehouses={warehouses}
        filters={{ ...emptyStockLedgerFilters, kind: "in", balanceScope: "filter" }}
      />,
    )
    expect(screen.getByText("Saldo del filtro")).toBeInTheDocument()
    expect(screen.queryByLabelText("menos 12 unidades")).not.toBeInTheDocument()
  })

  it("renders loading and error without the rows", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<StockLedger movements={movements} warehouses={warehouses} status="loading" />)
    expect(screen.getByText("Cargando movimientos")).toBeInTheDocument()
    expect(screen.queryByLabelText("más 40 unidades")).not.toBeInTheDocument()
    rerender(
      <StockLedger movements={movements} warehouses={warehouses} status="error" error="No se pudo leer el libro" onRetry={onRetry} />,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo leer el libro")
    await user.click(screen.getByRole("button", { name: "Reintentar" }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("marks a historical negative balance in words", () => {
    render(
      <StockLedger
        movements={[
          { id: "a", at: "2026-04-01T12:00:00.000Z", sku: "SKU-0002", warehouseId: "norte", kind: "in", qty: 2 },
          { id: "b", at: "2026-04-02T12:00:00.000Z", sku: "SKU-0002", warehouseId: "norte", kind: "adjust", qty: -5, reason: "merma" },
        ]}
        warehouses={warehouses}
      />,
    )
    expect(screen.getByText("Saldo negativo")).toBeInTheDocument()
    expect(screen.getByLabelText("menos 3 unidades, Saldo negativo")).toBeInTheDocument()
  })

  it("summarizes one sku with on hand, inbound, outbound, and net", () => {
    render(<StockLedger movements={movements} warehouses={warehouses} sku="SKU-0001" />)
    expect(screen.getByText("Disponible")).toBeInTheDocument()
    expect(screen.getByText("Entradas")).toBeInTheDocument()
    expect(screen.getByText("Salidas")).toBeInTheDocument()
    expect(screen.getByText("Neto")).toBeInTheDocument()
    expect(screen.getAllByText("38").length).toBeGreaterThan(0)
    expect(screen.getByText("50")).toBeInTheDocument()
    expect(screen.getByText("12")).toBeInTheDocument()
    expect(screen.getByText("Movimientos de SKU-0001")).toBeInTheDocument()
  })

  it("keeps a long sku inside the card", () => {
    const sku = "SKU-" + "A".repeat(80)
    render(
      <StockLedger
        movements={[{ id: "long", at: "2026-05-01T12:00:00.000Z", sku, warehouseId: "norte", kind: "in", qty: 9_999_999 }]}
        warehouses={warehouses}
      />,
    )
    expect(screen.getByText(sku)).toBeInTheDocument()
    expect(screen.getByLabelText("más 9,999,999 unidades")).toBeInTheDocument()
  })

  it("keeps the movement log for a filled ledger", () => {
    render(<StockLedger movements={movements} warehouses={warehouses} />)
    expect(screen.getByRole("log")).toBeInTheDocument()
  })
})

describe("StockMovementDialog", () => {
  const reasons = [
    { id: "count", label: "Conteo" },
    { id: "damage", label: "Merma" },
  ]
  const balances = new Map([[balanceKey("SKU-0001", "norte"), 5]])

  function renderDialog(overrides: Partial<ComponentProps<typeof StockMovementDialog>> = {}) {
    return render(
      <StockMovementDialog
        open
        onOpenChange={() => {}}
        mode="adjust"
        skus={[{ id: "SKU-0001", label: "SKU-0001" }]}
        warehouses={warehouses}
        balances={balances}
        reasons={reasons}
        onSubmit={async () => {}}
        {...overrides}
      />,
    )
  }

  it("announces an empty adjustment", async () => {
    const user = userEvent.setup()
    renderDialog({ defaultValues: { sku: "SKU-0001", warehouseId: "norte", qty: 0 } })
    await user.click(screen.getByRole("button", { name: "Guardar ajuste" }))
    expect(screen.getByText("La cantidad no puede ser cero.")).toBeInTheDocument()
    expect(screen.getByText("El ajuste necesita un motivo.")).toBeInTheDocument()
  })

  it("announces insufficient stock", async () => {
    const user = userEvent.setup()
    renderDialog({
      defaultValues: { sku: "SKU-0001", warehouseId: "norte", qty: -9, reason: "count" },
    })
    await user.click(screen.getByRole("button", { name: "Guardar ajuste" }))
    expect(screen.getByRole("alert")).toHaveTextContent("No hay suficiente existencia.")
  })

  it("announces the same origin and destination in transfer mode", async () => {
    const user = userEvent.setup()
    renderDialog({
      mode: "transfer",
      defaultValues: { sku: "SKU-0001", warehouseId: "norte", destinationWarehouseId: "norte", qty: 2 },
    })
    expect(screen.getByRole("heading", { name: "Registrar transferencia" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Guardar transferencia" }))
    expect(screen.getByRole("alert")).toHaveTextContent("El origen y el destino tienen que ser distintos.")
  })

  it("submits one adjustment", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderDialog({
      onSubmit,
      defaultValues: { sku: "SKU-0001", warehouseId: "norte", qty: 4, reason: "count" },
    })
    await user.click(screen.getByRole("button", { name: "Guardar ajuste" }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    const posted = onSubmit.mock.calls[0]?.[0] as StockMovement[]
    expect(posted).toHaveLength(1)
    expect(posted[0]).toMatchObject({ sku: "SKU-0001", warehouseId: "norte", kind: "adjust", qty: 4 })
    expect(posted[0]?.reason).toContain("Conteo")
  })

  it("submits a transfer pair with one id and a net of zero", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderDialog({
      mode: "transfer",
      onSubmit,
      balances: new Map([[balanceKey("SKU-0001", "norte"), 8]]),
      defaultValues: { sku: "SKU-0001", warehouseId: "norte", destinationWarehouseId: "sur", qty: 3, reason: "count" },
    })
    await user.click(screen.getByRole("button", { name: "Guardar transferencia" }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    const posted = onSubmit.mock.calls[0]?.[0] as StockMovement[]
    expect(posted.map((movement) => movement.kind)).toEqual(["transfer_out", "transfer_in"])
    expect(posted[0]?.transferId).toBe(posted[1]?.transferId)
    expect((posted[0]?.qty ?? 0) + (posted[1]?.qty ?? 0)).toBe(0)
  })

  it("disables the submit button while the request is in flight", async () => {
    const user = userEvent.setup()
    let resolve: (() => void) | undefined
    const onSubmit = vi.fn().mockReturnValue(new Promise<void>((done) => { resolve = done }))
    renderDialog({
      onSubmit,
      defaultValues: { sku: "SKU-0001", warehouseId: "norte", qty: 1, reason: "count" },
    })
    await user.click(screen.getByRole("button", { name: "Guardar ajuste" }))
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("button", { name: "Guardando" })).toBeDisabled()
    resolve?.()
    await waitFor(() => expect(screen.getByRole("button", { name: "Guardar ajuste" })).toBeEnabled())
  })

  it("keeps the captured quantity when saving fails", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error("falló la red"))
    renderDialog({
      onSubmit,
      defaultValues: { sku: "SKU-0001", warehouseId: "norte", qty: 4, reason: "count" },
    })
    await user.click(screen.getByRole("button", { name: "Guardar ajuste" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("falló la red")
    expect(screen.getByRole("spinbutton", { name: "Cantidad" })).toHaveAttribute("aria-valuenow", "4")
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("closes after success and returns focus to the opener", async () => {
    const user = userEvent.setup()
    function Harness() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Abrir ajuste</button>
          <StockMovementDialog
            open={open}
            onOpenChange={setOpen}
            mode="adjust"
            skus={[{ id: "SKU-0001", label: "SKU-0001" }]}
            warehouses={warehouses}
            balances={balances}
            reasons={reasons}
            defaultValues={{ sku: "SKU-0001", warehouseId: "norte", qty: 2, reason: "count" }}
            onSubmit={async () => {}}
          />
        </>
      )
    }
    render(<Harness />)
    await user.click(screen.getByRole("button", { name: "Abrir ajuste" }))
    await user.click(screen.getByRole("button", { name: "Guardar ajuste" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("button", { name: "Abrir ajuste" })).toHaveFocus()
  })

  it("shows host issues and a busy transfer before the operator submits", () => {
    renderDialog({
      mode: "transfer",
      busy: true,
      externalError: "Reintenta la transferencia",
      issues: [{ field: "qty", code: "insufficient" }],
      defaultValues: { sku: "SKU-0001", warehouseId: "norte", destinationWarehouseId: "sur", qty: 9 },
    })
    expect(screen.getByText("No hay suficiente existencia.")).toBeInTheDocument()
    expect(screen.getByText("Reintenta la transferencia")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Guardando" })).toBeDisabled()
  })
})

async function expectNoAxeViolations(ui: ReactElement) {
  const { unmount } = render(ui)
  const results = await axe.run(document.body, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
    rules: { "color-contrast": { enabled: false } },
  })
  unmount()
  expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([])
}

describe("stock ledger axe", () => {
  const reasons = [{ id: "count", label: "Conteo" }]
  const balances = new Map([[balanceKey("SKU-0001", "norte"), 5]])

  it("has no axe violations on the ledger states", async () => {
    await expectNoAxeViolations(<StockLedger movements={movements} warehouses={warehouses} />)
    await expectNoAxeViolations(<StockLedger movements={[]} warehouses={warehouses} onAdjust={() => {}} />)
    await expectNoAxeViolations(<StockLedger movements={movements} warehouses={warehouses} status="loading" />)
    await expectNoAxeViolations(<StockLedger movements={movements} warehouses={warehouses} status="error" error="No se pudo leer el libro" onRetry={() => {}} />)
    await expectNoAxeViolations(<StockLedger movements={movements} warehouses={warehouses} locale="en-US" sku="SKU-0001" />)
  })

  it("has no axe violations on the dialog states", async () => {
    const shared = {
      open: true,
      onOpenChange: () => {},
      skus: [{ id: "SKU-0001", label: "SKU-0001" }],
      warehouses,
      balances,
      reasons,
      onSubmit: async () => {},
    }
    await expectNoAxeViolations(
      <StockMovementDialog {...shared} mode="adjust" defaultValues={{ sku: "SKU-0001", warehouseId: "norte", qty: 4, reason: "count" }} />,
    )
    await expectNoAxeViolations(
      <StockMovementDialog {...shared} mode="transfer" defaultValues={{ sku: "SKU-0001", warehouseId: "norte", destinationWarehouseId: "sur", qty: 2 }} />,
    )
    await expectNoAxeViolations(
      <StockMovementDialog {...shared} mode="adjust" issues={[{ field: "qty", code: "qty_zero" }]} defaultValues={{ sku: "SKU-0001", warehouseId: "norte", qty: 0 }} />,
    )
  })
})
