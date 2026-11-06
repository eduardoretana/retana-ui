import { describe, expect, it } from "vitest"

import {
  applyCoupon,
  checkoutFieldErrors,
  checkoutLabelsEs,
  formatMoney,
  recalcTotals,
  type CheckoutDraft,
  type CheckoutLine,
  type CouponOffer,
} from "@/registry/retana/lib/checkout"

const lines: CheckoutLine[] = [
  { id: "a", title: "Producto A", variant: "Chico", qty: 2, unitPrice: 1500 },
  { id: "b", title: "Producto B", qty: 1, unitPrice: 400 },
]

const tenPercent: CouponOffer = { code: "ahorra10", kind: "percent", value: 10 }
const fivePesos: CouponOffer = { code: "cinco", kind: "amount", value: 500 }

describe("recalcTotals", () => {
  it("sums line cents, shipping, and optional tax, then subtracts the discount", () => {
    expect(recalcTotals(lines, 990, 0)).toEqual({
      subtotal: 3400,
      shipping: 990,
      discount: 0,
      total: 4390,
    })
    expect(recalcTotals(lines, 990, 340, 544)).toEqual({
      subtotal: 3400,
      shipping: 990,
      discount: 340,
      tax: 544,
      total: 4594,
    })
  })

  it("ignores quantities that are not positive integers and negative money", () => {
    const messy: CheckoutLine[] = [
      ...lines,
      { id: "zero", title: "Cero", qty: 0, unitPrice: 9999 },
      { id: "frac", title: "Fracción", qty: 1.5, unitPrice: 800 },
      { id: "neg", title: "Negativo", qty: -2, unitPrice: 800 },
      { id: "bad-price", title: "Precio", qty: 1, unitPrice: -50 },
    ]
    expect(recalcTotals(messy, -10, -5).subtotal).toBe(3400)
    expect(recalcTotals(messy, -10, -5)).toMatchObject({ shipping: 0, discount: 0, total: 3400 })
  })

  it("does not mutate the lines it reads", () => {
    const snapshot = structuredClone(lines)
    recalcTotals(lines, 100, 50)
    expect(lines).toEqual(snapshot)
  })
})

describe("applyCoupon", () => {
  it("leaves totals unchanged when the coupon is invalid", () => {
    const before = recalcTotals(lines, 990, 200, 100)
    const missing = applyCoupon(lines, 990, null, { discountCents: 200, taxCents: 100, appliedCode: "cinco" })
    expect(missing.error).toBe("invalid")
    expect(missing.totals).toEqual(before)

    const broken: CouponOffer = { code: "  ", kind: "percent", value: 10 }
    const blank = applyCoupon(lines, 990, broken, { discountCents: 200, taxCents: 100, appliedCode: "cinco" })
    expect(blank.error).toBe("invalid")
    expect(blank.totals).toEqual(before)

    const wild: CouponOffer = { code: "todo", kind: "percent", value: 140 }
    expect(applyCoupon(lines, 990, wild).error).toBe("invalid")
    expect(applyCoupon(lines, 990, wild).totals).toEqual(recalcTotals(lines, 990, 0))
  })

  it("applies a valid coupon once and refuses a second application", () => {
    const first = applyCoupon(lines, 990, tenPercent, { taxCents: 544 })
    expect(first.error).toBeUndefined()
    expect(first.totals).toEqual({
      subtotal: 3400,
      shipping: 990,
      discount: 340,
      tax: 544,
      total: 4594,
    })

    const second = applyCoupon(lines, 990, { ...tenPercent, code: "AHORRA10" }, {
      appliedCode: "ahorra10",
      discountCents: first.totals.discount,
      taxCents: 544,
    })
    expect(second.error).toBe("already-applied")
    expect(second.totals).toEqual(first.totals)

    const amount = applyCoupon(lines, 990, fivePesos)
    expect(amount.error).toBeUndefined()
    expect(amount.totals.discount).toBe(500)
    expect(amount.totals.total).toBe(3400 + 990 - 500)
  })
})

const complete: CheckoutDraft = {
  email: "ana@ejemplo.test",
  phone: "+522221234567",
  name: "Ana Solís",
  line1: "Calle Norte 10",
  line2: "",
  city: "Ciudad Demo",
  region: "DEMO",
  postalCode: "00000",
  country: "México",
  shippingMethodId: "standard",
  paymentMethodId: "card",
  couponCode: "",
}

describe("checkoutFieldErrors", () => {
  it("names missing fields and accepts a complete draft", () => {
    const empty = checkoutFieldErrors(
      { ...complete, email: "", phone: "", name: " ", line1: "", city: "", region: "", postalCode: "", country: "", shippingMethodId: "", paymentMethodId: "" },
      checkoutLabelsEs,
    )
    expect(empty.email).toBe(checkoutLabelsEs.required)
    expect(empty.phone).toBe(checkoutLabelsEs.required)
    expect(empty.name).toBe(checkoutLabelsEs.required)
    expect(empty.shippingMethodId).toBe(checkoutLabelsEs.shippingRequired)
    expect(empty.paymentMethodId).toBe(checkoutLabelsEs.paymentRequired)
    expect(checkoutFieldErrors({ ...complete, email: "no-es-correo" }, checkoutLabelsEs).email).toBe(checkoutLabelsEs.emailInvalid)
    expect(checkoutFieldErrors({ ...complete, phone: "+52" }, checkoutLabelsEs).phone).toBe(checkoutLabelsEs.phoneInvalid)
    expect(checkoutFieldErrors(complete, checkoutLabelsEs)).toEqual({})
  })
})

describe("formatMoney", () => {
  it("formats integer cents for es-MX and EN", () => {
    expect(formatMoney(123456, "es-MX", "MXN")).toBe(
      new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(1234.56),
    )
    expect(formatMoney(123456, "en", "USD")).toBe(
      new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(1234.56),
    )
    expect(formatMoney(-50, "en", "USD")).toBe(
      new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(-0.5),
    )
  })
})
