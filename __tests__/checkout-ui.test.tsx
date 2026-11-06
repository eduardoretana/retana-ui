import { readFileSync } from "node:fs"
import type { ComponentProps } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { formatMoney, type CheckoutDraft, type CheckoutLine, type CheckoutMethod } from "@/registry/retana/lib/checkout"
import { CheckoutPage } from "@/registry/blocks/checkout-page"

const lines: CheckoutLine[] = [
  { id: "a", title: "Producto A", variant: "Chico", qty: 2, unitPrice: 1500 },
  { id: "b", title: "Producto B", qty: 1, unitPrice: 400 },
]

const shipping: CheckoutMethod[] = [
  { id: "standard", label: "Envío estándar", description: "Llega en cinco días", priceCents: 990, icon: "truck" },
  { id: "express", label: "Envío exprés", description: "Llega mañana", priceCents: 2490, icon: "fast" },
]

const payments: CheckoutMethod[] = [
  { id: "card", label: "Tarjeta", description: "Débito o crédito", icon: "card" },
  { id: "transfer", label: "Transferencia", description: "Banco del comprador", icon: "bank" },
]

const draft: Partial<CheckoutDraft> = {
  email: "ana@ejemplo.test",
  phone: "+522221234567",
  name: "Ana Solís",
  line1: "Calle Norte 10",
  city: "Ciudad Demo",
  region: "DEMO",
  postalCode: "00000",
  country: "México",
  shippingMethodId: "standard",
  paymentMethodId: "card",
}

const money = (cents: number) => formatMoney(cents, "es-MX", "MXN")

function page(props: Partial<ComponentProps<typeof CheckoutPage>> = {}) {
  return (
    <CheckoutPage
      lines={lines}
      shippingMethods={shipping}
      paymentMethods={payments}
      coupons={[{ code: "ahorra10", kind: "percent", value: 10 }]}
      defaultValues={draft}
      {...props}
    />
  )
}

describe("CheckoutPage layouts", () => {
  it("renders a single page with the summary and labeled fields", () => {
    render(page({ layout: "single" }))
    expect(screen.getByRole("heading", { name: "Resumen del pedido" })).toBeInTheDocument()
    expect(screen.getByText("Producto A")).toBeInTheDocument()
    expect(screen.getByLabelText("Correo")).toBeInTheDocument()
    expect(screen.getByLabelText("Teléfono")).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /Envío estándar/ })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /Tarjeta/ })).toBeInTheDocument()
    expect(screen.queryByRole("navigation", { name: "Progreso del pedido" })).not.toBeInTheDocument()
    expect(screen.getAllByText(money(4390)).length).toBeGreaterThan(0)
  })

  it("stacks two columns behind a summary sheet and shows a stepper on the accordion", () => {
    const { rerender } = render(page({ layout: "two-column" }))
    const root = screen.getByRole("region", { name: "Pago del pedido" })
    expect(root).toHaveAttribute("data-layout", "two-column")
    expect(root).toHaveAttribute("data-stacked", "true")
    expect(screen.getByRole("button", { name: "Ver resumen" })).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Progreso del pedido" })).toBeInTheDocument()

    rerender(page({ layout: "accordion" }))
    expect(screen.getByRole("button", { name: "Contacto" })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("button", { name: "Envío" })).toBeInTheDocument()
    expect(screen.getByLabelText("Correo")).toBeInTheDocument()
  })

  it("speaks English when the locale is EN", () => {
    render(page({ locale: "en", currency: "USD" }))
    expect(screen.getByRole("region", { name: "Checkout" })).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Place order" })).toBeInTheDocument()
  })
})

describe("CheckoutPage states", () => {
  it("offers a way back when the order is empty", () => {
    const onBackToStore = vi.fn()
    render(page({ lines: [], onBackToStore }))
    expect(screen.getByRole("region", { name: "Pago del pedido" })).toHaveAttribute("data-status", "empty")
    expect(screen.getByText("El pedido está vacío")).toBeInTheDocument()
    return userEvent.click(screen.getByRole("button", { name: "Volver a la tienda" })).then(() => {
      expect(onBackToStore).toHaveBeenCalledOnce()
    })
  })

  it("keeps a stable loading skeleton and an error the reader can retry", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(page({ status: "loading" }))
    const loading = screen.getByRole("region", { name: "Pago del pedido" })
    expect(loading).toHaveAttribute("aria-busy", "true")
    expect(loading.querySelectorAll("[data-slot=skeleton]").length).toBeGreaterThan(0)

    rerender(page({ status: "error", onRetry }))
    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar el pedido.")
    await user.click(screen.getByRole("button", { name: "Reintentar" }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("does not change the total for an invalid coupon and applies a valid one once", async () => {
    const user = userEvent.setup()
    render(page())
    const coupon = screen.getByLabelText("Código de cupón")
    await user.type(coupon, "no-existe")
    await user.click(screen.getByRole("button", { name: "Aplicar" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Ese cupón no es válido.")
    expect(screen.getAllByText(money(4390)).length).toBeGreaterThan(0)

    await user.clear(coupon)
    await user.type(coupon, "ahorra10")
    await user.click(screen.getByRole("button", { name: "Aplicar" }))
    expect(screen.getByText("Cupón aplicado: ahorra10")).toBeInTheDocument()
    expect(screen.getAllByText(money(4050)).length).toBeGreaterThan(0)

    await user.click(screen.getByRole("button", { name: "Aplicar" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Ese cupón ya está aplicado.")
    expect(screen.getAllByText(money(4050)).length).toBeGreaterThan(0)
  })

  it("marks the page busy while submitting and sends the order", async () => {
    const user = userEvent.setup()
    const onPlaceOrder = vi.fn(() => new Promise<void>(() => undefined))
    const { rerender } = render(page({ status: "submitting", onPlaceOrder }))
    expect(screen.getByRole("region", { name: "Pago del pedido" })).toHaveAttribute("aria-busy", "true")

    rerender(page({ onPlaceOrder: vi.fn().mockResolvedValue(undefined) }))
    await user.click(screen.getByRole("button", { name: "Confirmar pedido" }))
    expect(await screen.findByRole("status")).toHaveTextContent("Pedido confirmado")
  })

  it("announces missing fields and does not place the order", async () => {
    const user = userEvent.setup()
    const onPlaceOrder = vi.fn()
    render(page({ defaultValues: { email: "" } }))
    await user.click(screen.getByRole("button", { name: "Confirmar pedido" }))
    expect((await screen.findAllByRole("alert")).some((node) => node.textContent?.includes("Este campo es obligatorio."))).toBe(true)
    expect(onPlaceOrder).not.toHaveBeenCalled()
  })
})

describe("checkout reuse and clean-room", () => {
  it("imports the CPL pieces and records the Pro reference without copying it", () => {
    const form = readFileSync("registry/ui/checkout-form.tsx", "utf8")
    const summary = readFileSync("registry/ui/order-summary.tsx", "utf8")
    const pageSource = readFileSync("registry/blocks/checkout-page.tsx", "utf8")
    const notice = readFileSync("NOTICE", "utf8")
    for (const piece of ["stepper", "radio-cards", "phone-input", "action-button", "action-footer"]) {
      expect(form).toContain(`@/registry/retana/ui/${piece}`)
    }
    expect(summary).toContain("@/registry/retana/ui/number-field")
    expect(pageSource).toContain("@/registry/retana/ui/bottom-sheet")
    expect(form + summary + pageSource).not.toMatch(/shadcnstudio|visa|mastercard|paypal|stripe/i)
    expect(notice).toMatch(/clean-room/i)
    expect(notice).toContain("https://shadcnstudio.com/blocks/ecommerce/checkout-page")
    expect(notice).toContain("https://shadcnstudio.com/license")
  })
})
