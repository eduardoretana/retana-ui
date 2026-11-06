import type { SceneLocale } from "@/app/catalog/scene-types"
import {
  checkoutLabelsEn,
  checkoutLabelsEs,
  type CheckoutDraft,
  type CheckoutLabels,
  type CheckoutLayout,
  type CheckoutLine,
  type CheckoutMethod,
  type CheckoutStatus,
  type CouponOffer,
} from "@/registry/retana/lib/checkout"

export const coupons: readonly CouponOffer[] = [{ code: "ahorra10", kind: "percent", value: 10 }]

type Pair = { es: string; en: string }

type LineSeed = {
  id: string
  title: Pair
  variant?: Pair
  qty: number
  unitPrice: number
}

const products: readonly LineSeed[] = [
  { id: "a", title: { es: "Producto A", en: "Product A" }, variant: { es: "Chico", en: "Small" }, qty: 2, unitPrice: 1500 },
  { id: "b", title: { es: "Producto B", en: "Product B" }, qty: 1, unitPrice: 400 },
]

type MethodSeed = {
  id: string
  label: Pair
  description: Pair
  priceCents?: number
  icon: CheckoutMethod["icon"]
}

const shippingSeeds: readonly MethodSeed[] = [
  { id: "standard", label: { es: "Envío estándar", en: "Standard shipping" }, description: { es: "Llega en cinco días", en: "Arrives in five days" }, priceCents: 990, icon: "truck" },
  { id: "express", label: { es: "Envío exprés", en: "Express shipping" }, description: { es: "Llega mañana", en: "Arrives tomorrow" }, priceCents: 2490, icon: "fast" },
  { id: "pickup", label: { es: "Recoger", en: "Pickup" }, description: { es: "Sin costo en el local", en: "No charge at the counter" }, priceCents: 0, icon: "store" },
]

const paymentSeeds: readonly MethodSeed[] = [
  { id: "card", label: { es: "Tarjeta", en: "Card" }, description: { es: "Débito o crédito", en: "Debit or credit" }, icon: "card" },
  { id: "transfer", label: { es: "Transferencia", en: "Bank transfer" }, description: { es: "Desde el banco de quien compra", en: "From the buyer's bank" }, icon: "bank" },
  { id: "counter", label: { es: "Pago en tienda", en: "Pay in store" }, description: { es: "Al pasar a recoger", en: "When you pick up" }, icon: "cash" },
]

function text(locale: SceneLocale, pair: Pair) {
  return locale === "en" ? pair.en : pair.es
}

export function linesFor(locale: SceneLocale, seeds: readonly LineSeed[] = products): CheckoutLine[] {
  return seeds.map((seed) => ({
    id: seed.id,
    title: text(locale, seed.title),
    variant: seed.variant ? text(locale, seed.variant) : undefined,
    qty: seed.qty,
    unitPrice: seed.unitPrice,
  }))
}

function methodsFor(locale: SceneLocale, seeds: readonly MethodSeed[]): CheckoutMethod[] {
  return seeds.map((seed) => ({
    id: seed.id,
    label: text(locale, seed.label),
    description: text(locale, seed.description),
    priceCents: seed.priceCents,
    icon: seed.icon,
  }))
}

export function shippingFor(locale: SceneLocale) {
  return methodsFor(locale, shippingSeeds)
}

export function paymentFor(locale: SceneLocale) {
  return methodsFor(locale, paymentSeeds)
}

export function labelsFor(locale: SceneLocale): CheckoutLabels {
  return locale === "en" ? checkoutLabelsEn : checkoutLabelsEs
}

export const filledDraft: CheckoutDraft = {
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

export type CheckoutFixture = {
  status?: CheckoutStatus
  layout?: CheckoutLayout
  lines?: "filled" | "none"
  draft?: Partial<CheckoutDraft>
  preset?: { code: string; error?: "invalid" | "already-applied" }
}

export const filled: CheckoutFixture = { lines: "filled", draft: filledDraft, layout: "single" }

export const empty: CheckoutFixture = { lines: "none", status: "empty" }

export const loading: CheckoutFixture = { lines: "filled", status: "loading" }

export const error: CheckoutFixture = { lines: "filled", status: "error" }

export const couponInvalid: CheckoutFixture = {
  lines: "filled",
  draft: { ...filledDraft, couponCode: "no-existe" },
  preset: { code: "no-existe", error: "invalid" },
}

export const couponApplied: CheckoutFixture = {
  lines: "filled",
  draft: { ...filledDraft, couponCode: "ahorra10" },
  preset: { code: "ahorra10" },
}

export const submitting: CheckoutFixture = { lines: "filled", draft: filledDraft, status: "submitting" }

export const success: CheckoutFixture = { lines: "filled", draft: filledDraft, status: "success" }

export const twoColumn: CheckoutFixture = { ...filled, layout: "two-column" }

export const accordion: CheckoutFixture = { ...filled, layout: "accordion" }
