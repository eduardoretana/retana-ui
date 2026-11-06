/**
 * Checkout math and copy. Money is integer cents. Clean-room: no template
 * data, prices, or brand names. See NOTICE.
 */

export type CheckoutLine = {
  id: string
  title: string
  variant?: string
  qty: number
  unitPrice: number
  imageUrl?: string
}

export type CheckoutTotals = {
  subtotal: number
  shipping: number
  discount: number
  tax?: number
  total: number
}

export type CouponKind = "percent" | "amount"

export type CouponOffer = {
  code: string
  kind: CouponKind
  /** Percent points (1–100) or a fixed discount in cents. */
  value: number
}

export type CouponError = "invalid" | "already-applied"

export type ApplyCouponState = {
  appliedCode?: string | null
  discountCents?: number
  taxCents?: number
}

export type CheckoutIcon = "truck" | "fast" | "store" | "card" | "bank" | "cash"

export type CheckoutMethod = {
  id: string
  label: string
  description?: string
  priceCents?: number
  icon?: CheckoutIcon
}

export type CheckoutDraft = {
  email: string
  phone: string
  name: string
  line1: string
  line2: string
  city: string
  region: string
  postalCode: string
  country: string
  shippingMethodId: string
  paymentMethodId: string
  couponCode: string
}

export type CheckoutField = Exclude<keyof CheckoutDraft, "line2" | "couponCode">

export type CheckoutLayout = "single" | "two-column" | "accordion"

export type CheckoutStatus = "ready" | "empty" | "loading" | "error" | "submitting" | "success"

export type CheckoutOrder = {
  lines: CheckoutLine[]
  draft: CheckoutDraft
  couponCode: string | null
  totals: CheckoutTotals
}

export type CheckoutLabels = {
  formLabel: string
  summaryTitle: string
  contactTitle: string
  shippingTitle: string
  paymentTitle: string
  couponTitle: string
  email: string
  phone: string
  fullName: string
  line1: string
  line2: string
  city: string
  region: string
  postalCode: string
  country: string
  coupon: string
  applyCoupon: string
  couponInvalid: string
  couponApplied: string
  couponAlready: string
  remove: string
  quantity: string
  subtotal: string
  shipping: string
  discount: string
  tax: string
  total: string
  emptyTitle: string
  emptyBody: string
  backToStore: string
  loading: string
  errorTitle: string
  retry: string
  placeOrder: string
  placingOrder: string
  orderPlaced: string
  successTitle: string
  successBody: string
  viewSummary: string
  closeSummary: string
  required: string
  emailInvalid: string
  phoneInvalid: string
  shippingRequired: string
  paymentRequired: string
  stepContact: string
  stepShipping: string
  stepPayment: string
  stepsLabel: string
  stepsComplete: string
  free: string
  orderHint: string
}

export const checkoutLabelsEs: CheckoutLabels = {
  formLabel: "Pago del pedido",
  summaryTitle: "Resumen del pedido",
  contactTitle: "Contacto",
  shippingTitle: "Envío",
  paymentTitle: "Pago",
  couponTitle: "Cupón",
  email: "Correo",
  phone: "Teléfono",
  fullName: "Nombre",
  line1: "Calle y número",
  line2: "Interior",
  city: "Ciudad",
  region: "Estado",
  postalCode: "Código postal",
  country: "País",
  coupon: "Código de cupón",
  applyCoupon: "Aplicar",
  couponInvalid: "Ese cupón no es válido.",
  couponApplied: "Cupón aplicado",
  couponAlready: "Ese cupón ya está aplicado.",
  remove: "Quitar",
  quantity: "Cantidad",
  subtotal: "Subtotal",
  shipping: "Envío",
  discount: "Descuento",
  tax: "Impuesto",
  total: "Total",
  emptyTitle: "El pedido está vacío",
  emptyBody: "Agrega un producto para continuar.",
  backToStore: "Volver a la tienda",
  loading: "Cargando el pedido",
  errorTitle: "No pudimos cargar el pedido.",
  retry: "Reintentar",
  placeOrder: "Confirmar pedido",
  placingOrder: "Confirmando",
  orderPlaced: "Pedido confirmado",
  successTitle: "Pedido confirmado",
  successBody: "Guardamos el pedido. No se hizo ningún cargo.",
  viewSummary: "Ver resumen",
  closeSummary: "Cerrar",
  required: "Este campo es obligatorio.",
  emailInvalid: "Escribe un correo válido.",
  phoneInvalid: "Escribe un teléfono válido.",
  shippingRequired: "Elige un método de envío.",
  paymentRequired: "Elige un método de pago.",
  stepContact: "Contacto",
  stepShipping: "Envío",
  stepPayment: "Pago",
  stepsLabel: "Progreso del pedido",
  stepsComplete: "Datos listos",
  free: "Sin costo",
  orderHint: "Revisa el total antes de confirmar.",
}

export const checkoutLabelsEn: CheckoutLabels = {
  formLabel: "Checkout",
  summaryTitle: "Order summary",
  contactTitle: "Contact",
  shippingTitle: "Shipping",
  paymentTitle: "Payment",
  couponTitle: "Coupon",
  email: "Email",
  phone: "Phone",
  fullName: "Full name",
  line1: "Street address",
  line2: "Apartment",
  city: "City",
  region: "State",
  postalCode: "Postal code",
  country: "Country",
  coupon: "Coupon code",
  applyCoupon: "Apply",
  couponInvalid: "That coupon is not valid.",
  couponApplied: "Coupon applied",
  couponAlready: "That coupon is already applied.",
  remove: "Remove",
  quantity: "Quantity",
  subtotal: "Subtotal",
  shipping: "Shipping",
  discount: "Discount",
  tax: "Tax",
  total: "Total",
  emptyTitle: "Your order is empty",
  emptyBody: "Add a product to continue.",
  backToStore: "Back to the store",
  loading: "Loading the order",
  errorTitle: "We couldn't load the order.",
  retry: "Try again",
  placeOrder: "Place order",
  placingOrder: "Placing order",
  orderPlaced: "Order placed",
  successTitle: "Order placed",
  successBody: "We saved the order. Nothing was charged.",
  viewSummary: "View summary",
  closeSummary: "Close",
  required: "This field is required.",
  emailInvalid: "Enter a valid email.",
  phoneInvalid: "Enter a valid phone number.",
  shippingRequired: "Choose a shipping method.",
  paymentRequired: "Choose a payment method.",
  stepContact: "Contact",
  stepShipping: "Shipping",
  stepPayment: "Payment",
  stepsLabel: "Checkout progress",
  stepsComplete: "Details ready",
  free: "Free",
  orderHint: "Review the total before placing the order.",
}

export function checkoutLabelsFor(locale?: string) {
  return (locale ?? "es-MX").toLowerCase().startsWith("es") ? checkoutLabelsEs : checkoutLabelsEn
}

export function resolveCheckoutLabels(locale?: string, labels?: Partial<CheckoutLabels>): CheckoutLabels {
  return { ...checkoutLabelsFor(locale), ...labels }
}

function whole(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.trunc(value)
}

function nonNegative(value: number) {
  return Math.max(0, whole(value))
}

export function lineCents(line: CheckoutLine) {
  if (!Number.isInteger(line.qty) || line.qty <= 0) return 0
  return line.qty * nonNegative(line.unitPrice)
}

export function recalcTotals(
  lines: readonly CheckoutLine[],
  shippingCents: number,
  discountCents: number,
  taxCents?: number,
): CheckoutTotals {
  const subtotal = lines.reduce((sum, line) => sum + lineCents(line), 0)
  const shipping = nonNegative(shippingCents)
  const discount = nonNegative(discountCents)
  const total = subtotal + shipping - discount + (taxCents === undefined ? 0 : nonNegative(taxCents))
  const totals: CheckoutTotals = { subtotal, shipping, discount, total }
  if (taxCents !== undefined) totals.tax = nonNegative(taxCents)
  return totals
}

function codeKey(code: string) {
  return code.trim().toLocaleLowerCase("en")
}

function validOffer(coupon: CouponOffer | null): coupon is CouponOffer {
  if (!coupon || typeof coupon.code !== "string" || !coupon.code.trim()) return false
  if (coupon.kind !== "percent" && coupon.kind !== "amount") return false
  if (!Number.isInteger(coupon.value) || coupon.value <= 0) return false
  if (coupon.kind === "percent" && coupon.value > 100) return false
  return true
}

function discountOf(subtotal: number, coupon: CouponOffer) {
  if (coupon.kind === "percent") return Math.round((subtotal * coupon.value) / 100)
  return coupon.value
}

export function applyCoupon(
  lines: readonly CheckoutLine[],
  shippingCents: number,
  coupon: CouponOffer | null,
  state?: ApplyCouponState,
): { totals: CheckoutTotals; error?: CouponError } {
  const taxCents = state?.taxCents
  const kept = state?.discountCents ?? 0
  if (!validOffer(coupon)) {
    return { totals: recalcTotals(lines, shippingCents, kept, taxCents), error: "invalid" }
  }
  const discount = discountOf(recalcTotals(lines, shippingCents, 0, taxCents).subtotal, coupon)
  if (state?.appliedCode && codeKey(state.appliedCode) === codeKey(coupon.code)) {
    return {
      totals: recalcTotals(lines, shippingCents, state.discountCents ?? discount, taxCents),
      error: "already-applied",
    }
  }
  return { totals: recalcTotals(lines, shippingCents, discount, taxCents) }
}

export function formatMoney(cents: number, locale: string, currency: string) {
  const amount = (Number.isFinite(cents) ? Math.trunc(cents) : 0) / 100
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount)
}

export function methodPrice(methods: readonly Pick<CheckoutMethod, "id" | "priceCents">[], id: string) {
  return nonNegative(methods.find((method) => method.id === id)?.priceCents ?? 0)
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE = /^\+[1-9]\d{7,14}$/

export function isCheckoutEmail(value: string) {
  return EMAIL.test(value.trim())
}

export function isCheckoutPhone(value: string) {
  return PHONE.test(value.trim())
}

export function checkoutFieldErrors(draft: CheckoutDraft, labels: CheckoutLabels): Partial<Record<CheckoutField, string>> {
  const errors: Partial<Record<CheckoutField, string>> = {}
  const missing = (value: string) => !value.trim()
  if (missing(draft.email)) errors.email = labels.required
  else if (!isCheckoutEmail(draft.email)) errors.email = labels.emailInvalid
  if (missing(draft.phone)) errors.phone = labels.required
  else if (!isCheckoutPhone(draft.phone)) errors.phone = labels.phoneInvalid
  if (missing(draft.name)) errors.name = labels.required
  if (missing(draft.line1)) errors.line1 = labels.required
  if (missing(draft.city)) errors.city = labels.required
  if (missing(draft.region)) errors.region = labels.required
  if (missing(draft.postalCode)) errors.postalCode = labels.required
  if (missing(draft.country)) errors.country = labels.required
  if (!draft.shippingMethodId) errors.shippingMethodId = labels.shippingRequired
  if (!draft.paymentMethodId) errors.paymentMethodId = labels.paymentRequired
  return errors
}

export function findCoupon(coupons: readonly CouponOffer[], code: string) {
  const key = codeKey(code)
  if (!key) return null
  return coupons.find((coupon) => codeKey(coupon.code) === key) ?? null
}
