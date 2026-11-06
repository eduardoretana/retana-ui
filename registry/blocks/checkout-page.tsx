"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  applyCoupon,
  findCoupon,
  formatMoney,
  methodPrice,
  recalcTotals,
  resolveCheckoutLabels,
  type CheckoutDraft,
  type CheckoutLabels,
  type CheckoutLayout,
  type CheckoutLine,
  type CheckoutMethod,
  type CheckoutOrder,
  type CheckoutStatus,
  type CouponOffer,
} from "@/registry/retana/lib/checkout"
import { useMinWidth } from "@/registry/retana/hooks/use-min-width"
import { BottomSheet } from "@/registry/retana/ui/bottom-sheet"
import { CheckoutForm } from "@/registry/retana/ui/checkout-form"
import { OrderSummary } from "@/registry/retana/ui/order-summary"

const WIDE = 1024

export type CheckoutPresetCoupon = {
  code: string
  error?: "invalid" | "already-applied"
}

export type CheckoutPageProps = {
  lines?: readonly CheckoutLine[]
  layout?: CheckoutLayout
  currency?: string
  locale?: string
  status?: CheckoutStatus
  shippingMethods?: readonly CheckoutMethod[]
  paymentMethods?: readonly CheckoutMethod[]
  coupons?: readonly CouponOffer[]
  defaultValues?: Partial<CheckoutDraft>
  presetCoupon?: CheckoutPresetCoupon
  taxCents?: number
  labels?: Partial<CheckoutLabels>
  showStepper?: boolean
  onQtyChange?: (id: string, qty: number) => void
  onRemove?: (id: string) => void
  onApplyCoupon?: (code: string) => void | Promise<void>
  onPlaceOrder?: (order: CheckoutOrder) => void | Promise<void>
  onRetry?: () => void
  onBackToStore?: () => void
  storeHref?: string
  className?: string
}

function blankDraft(partial?: Partial<CheckoutDraft>, couponCode = ""): CheckoutDraft {
  return {
    email: "",
    phone: "",
    name: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
    shippingMethodId: "",
    paymentMethodId: "",
    ...partial,
    couponCode: partial?.couponCode ?? couponCode,
  }
}

export function CheckoutPage({
  lines = [],
  layout = "single",
  currency = "MXN",
  locale = "es-MX",
  status,
  shippingMethods = [],
  paymentMethods = [],
  coupons = [],
  defaultValues,
  presetCoupon,
  taxCents,
  labels,
  showStepper,
  onQtyChange,
  onRemove,
  onApplyCoupon,
  onPlaceOrder,
  onRetry,
  onBackToStore,
  storeHref,
  className,
}: CheckoutPageProps) {
  const copy = resolveCheckoutLabels(locale, labels)
  const wide = useMinWidth(WIDE)
  const [qty, setQty] = React.useState<Record<string, number>>({})
  const [removed, setRemoved] = React.useState<string[]>([])
  const [draft, setDraft] = React.useState(() => blankDraft(defaultValues, presetCoupon?.code ?? ""))
  const [applied, setApplied] = React.useState<CouponOffer | null>(() =>
    presetCoupon && !presetCoupon.error ? findCoupon(coupons, presetCoupon.code) : null,
  )
  const [couponKind, setCouponKind] = React.useState<"invalid" | "already-applied" | null>(presetCoupon?.error ?? null)
  const [placed, setPlaced] = React.useState(false)

  const viewLines = lines
    .filter((line) => !removed.includes(line.id))
    .map((line) => ({ ...line, qty: qty[line.id] ?? line.qty }))
  const shipping = methodPrice(shippingMethods, draft.shippingMethodId)
  const totals = applied
    ? applyCoupon(viewLines, shipping, applied, { taxCents }).totals
    : recalcTotals(viewLines, shipping, 0, taxCents)

  const viewStatus: CheckoutStatus = placed
    ? "success"
    : status === "loading" || status === "error" || status === "submitting" || status === "success"
      ? status
      : viewLines.length === 0
        ? "empty"
        : "ready"

  const couponError =
    couponKind === "invalid" ? copy.couponInvalid : couponKind === "already-applied" ? copy.couponAlready : null
  const stack = layout === "two-column" && !wide
  const interactive = viewStatus === "ready" || viewStatus === "submitting"

  function changeQty(id: string, next: number) {
    setQty((current) => ({ ...current, [id]: next }))
    onQtyChange?.(id, next)
  }

  function removeLine(id: string) {
    setRemoved((current) => [...current, id])
    onRemove?.(id)
  }

  async function apply(code: string) {
    const offer = findCoupon(coupons, code)
    const result = applyCoupon(viewLines, shipping, offer, {
      appliedCode: applied?.code ?? null,
      discountCents: applied ? totals.discount : 0,
      taxCents,
    })
    if (result.error) {
      setCouponKind(result.error)
      return
    }
    setApplied(offer)
    setCouponKind(null)
    setDraft((current) => ({ ...current, couponCode: offer?.code ?? code }))
    await onApplyCoupon?.(code)
  }

  async function place(next: CheckoutDraft) {
    await onPlaceOrder?.({
      lines: viewLines,
      draft: next,
      couponCode: applied?.code ?? null,
      totals,
    })
    setPlaced(true)
  }

  const summary = (
    <OrderSummary
      lines={viewLines}
      totals={totals}
      currency={currency}
      locale={locale}
      labels={copy}
      status={viewStatus === "empty" || viewStatus === "loading" || viewStatus === "error" ? viewStatus : "ready"}
      onQtyChange={interactive ? changeQty : undefined}
      onRemove={interactive ? removeLine : undefined}
      onBackToStore={onBackToStore}
      onRetry={onRetry}
      storeHref={storeHref}
    />
  )

  const form = (
    <CheckoutForm
      layout={layout}
      draft={draft}
      onDraftChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
      shippingMethods={shippingMethods}
      paymentMethods={paymentMethods}
      currency={currency}
      locale={locale}
      labels={copy}
      couponError={couponError}
      appliedCoupon={applied?.code ?? null}
      onApplyCoupon={apply}
      onSubmit={place}
      onBackToStore={onBackToStore}
      showStepper={showStepper}
      busy={viewStatus === "submitting"}
    />
  )

  return (
    <section
      data-slot="checkout-page"
      data-layout={layout}
      data-status={viewStatus}
      data-stacked={stack ? "true" : "false"}
      aria-label={copy.formLabel}
      aria-busy={viewStatus === "loading" || viewStatus === "submitting" ? true : undefined}
      className={cn("grid min-w-0 max-w-full gap-4", className)}
    >
      {viewStatus === "success" ? (
        <div role="status" className="grid min-w-0 justify-items-start gap-2 rounded-xl border border-border bg-card p-6 text-card-foreground">
          <Check className="size-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-medium">{copy.successTitle}</h2>
          <p className="max-w-prose text-sm text-muted-foreground">{copy.successBody}</p>
          <p className="text-end text-base font-medium tabular-nums">{formatMoney(totals.total, locale, currency)}</p>
        </div>
      ) : null}

      {!interactive && viewStatus !== "success" ? summary : null}

      {interactive && stack ? (
        <>
          <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{copy.summaryTitle}</p>
              <p className="font-medium tabular-nums">{formatMoney(totals.total, locale, currency)}</p>
            </div>
            <BottomSheet
              title={copy.summaryTitle}
              closeLabel={copy.closeSummary}
              trigger={
                <button
                  type="button"
                  className="inline-flex min-h-11 shrink-0 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {copy.viewSummary}
                </button>
              }
            >
              {summary}
            </BottomSheet>
          </div>
          {form}
        </>
      ) : null}

      {interactive && !stack && layout === "two-column" ? (
        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
          {form}
          {summary}
        </div>
      ) : null}

      {interactive && !stack && layout !== "two-column" ? (
        <div className="grid min-w-0 gap-6">
          {summary}
          {form}
        </div>
      ) : null}
    </section>
  )
}
