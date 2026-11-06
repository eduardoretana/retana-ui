"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  formatMoney,
  lineCents,
  resolveCheckoutLabels,
  type CheckoutLabels,
  type CheckoutLine,
  type CheckoutTotals,
} from "@/registry/retana/lib/checkout"
import { NumberField } from "@/registry/retana/ui/number-field"

export type OrderSummaryStatus = "ready" | "empty" | "loading" | "error"

export type OrderSummaryProps = {
  lines: readonly CheckoutLine[]
  totals: CheckoutTotals
  currency?: string
  locale?: string
  status?: OrderSummaryStatus
  onQtyChange?: (id: string, qty: number) => void
  onRemove?: (id: string) => void
  onBackToStore?: () => void
  onRetry?: () => void
  storeHref?: string
  labels?: Partial<CheckoutLabels>
  className?: string
}

function Money({ cents, locale, currency }: { cents: number; locale: string; currency: string }) {
  return <span className="text-end tabular-nums">{formatMoney(cents, locale, currency)}</span>
}

function TotalRow({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className={cn("flex min-w-0 items-baseline justify-between gap-3", strong && "text-base font-medium")}>
      <dt className={strong ? undefined : "text-muted-foreground"}>{label}</dt>
      <dd className="min-w-0 text-end">{value}</dd>
    </div>
  )
}

export function OrderSummary({
  lines,
  totals,
  currency = "MXN",
  locale = "es-MX",
  status = "ready",
  onQtyChange,
  onRemove,
  onBackToStore,
  onRetry,
  storeHref,
  labels,
  className,
}: OrderSummaryProps) {
  const copy = resolveCheckoutLabels(locale, labels)
  const titleId = React.useId()
  const empty = status === "empty" || (status === "ready" && lines.length === 0)
  const view = empty ? "empty" : status

  return (
    <section
      data-slot="order-summary"
      data-status={view}
      aria-labelledby={titleId}
      aria-busy={view === "loading" ? true : undefined}
      className={cn("min-w-0 rounded-xl border border-border bg-card p-4 text-card-foreground", className)}
    >
      <h2 id={titleId} className="text-base font-medium">
        {copy.summaryTitle}
      </h2>

      {view === "loading" ? (
        <div className="mt-4 grid gap-3">
          <p className="sr-only">{copy.loading}</p>
          <Skeleton className="h-11 w-full motion-reduce:animate-none" />
          <Skeleton className="h-11 w-full motion-reduce:animate-none" />
          <Skeleton className="ms-auto h-4 w-28 motion-reduce:animate-none" />
        </div>
      ) : null}

      {view === "error" ? (
        <div role="alert" className="mt-4 grid gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <p>{copy.errorTitle}</p>
          <Button type="button" variant="outline" className="min-h-11 justify-self-start bg-background" onClick={onRetry}>
            {copy.retry}
          </Button>
        </div>
      ) : null}

      {view === "empty" ? (
        <div className="mt-4 grid gap-3">
          <p className="font-medium">{copy.emptyTitle}</p>
          <p className="text-sm text-muted-foreground">{copy.emptyBody}</p>
          {storeHref ? (
            <Button asChild className="min-h-11 w-full">
              <a href={storeHref}>{copy.backToStore}</a>
            </Button>
          ) : (
            <Button type="button" className="min-h-11 w-full" onClick={onBackToStore}>
              {copy.backToStore}
            </Button>
          )}
        </div>
      ) : null}

      {view === "ready" ? (
        <>
          <ul className="mt-4 grid gap-3">
            {lines.map((line) => (
              <li key={line.id} className="flex min-w-0 flex-wrap items-start gap-3 border-b border-border pb-3">
                {line.imageUrl ? (
                  // The host supplies the URL. This file cannot depend on next/image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={line.imageUrl} alt="" className="size-11 shrink-0 rounded-md object-cover" />
                ) : (
                  <span className="grid size-11 shrink-0 place-items-center rounded-md bg-muted text-xs font-medium text-muted-foreground" aria-hidden="true">
                    {line.title.slice(0, 1)}
                  </span>
                )}
                <div className="min-w-0 flex-1 basis-40">
                  <p className="break-words font-medium">{line.title}</p>
                  {line.variant ? <p className="break-words text-xs text-muted-foreground">{line.variant}</p> : null}
                  <p className="mt-1 text-sm">
                    <Money cents={lineCents(line)} locale={locale} currency={currency} />
                  </p>
                </div>
                <NumberField
                  label={`${copy.quantity}, ${line.title}`}
                  size="sm"
                  min={1}
                  max={99}
                  value={line.qty}
                  locale={locale}
                  onValueChange={(qty) => onQtyChange?.(line.id, qty)}
                  disabled={!onQtyChange}
                  classNames={{ step: "size-11", root: "max-w-none" }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="size-11"
                  aria-label={`${copy.remove} ${line.title}`}
                  disabled={!onRemove}
                  onClick={() => onRemove?.(line.id)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid gap-2 text-sm">
            <TotalRow label={copy.subtotal} value={<Money cents={totals.subtotal} locale={locale} currency={currency} />} />
            <TotalRow label={copy.shipping} value={<Money cents={totals.shipping} locale={locale} currency={currency} />} />
            {totals.discount > 0 ? (
              <TotalRow label={copy.discount} value={<Money cents={-totals.discount} locale={locale} currency={currency} />} />
            ) : null}
            {totals.tax != null ? <TotalRow label={copy.tax} value={<Money cents={totals.tax} locale={locale} currency={currency} />} /> : null}
            <TotalRow
              strong
              label={copy.total}
              value={
                <span className="text-end font-medium tabular-nums" aria-live="polite">
                  {formatMoney(totals.total, locale, currency)}
                </span>
              }
            />
          </dl>
        </>
      ) : null}
    </section>
  )
}
