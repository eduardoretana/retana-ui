"use client"

/** Clean-room estimate and price. Hours against history, then a receipt you can follow. */

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import {
  clampPrice,
  estimateAmount,
  estimateTotals,
  formatHours,
  formatMoney,
  priceTotal,
  shareRatio,
  type EstimateLine,
  type PriceLine,
} from "@/registry/retana/lib/proposal"

export type CapacityCell = {
  id: string
  label: string
  /** 0–1 */
  load: number
}

export type ProposalEstimateProps = {
  view?: "effort" | "price" | "all"
  lines: readonly EstimateLine[]
  capacity: readonly CapacityCell[]
  capacityLabel?: string
  priceMin: number
  priceMax: number
  price: number
  onPriceChange?: (value: number) => void
  suggested: number
  confidence: string
  receipt: readonly PriceLine[]
  onUseSuggested?: () => void
  locale?: string
  currency?: string
  phaseLabel?: string
  hoursLabel?: string
  amountLabel?: string
  historyLabel?: string
  totalLabel?: string
  rangeLabel?: string
  suggestedLabel?: string
  useSuggestedLabel?: string
  receiptLabel?: string
  className?: string
}

export function ProposalEstimate({
  view = "all",
  lines,
  capacity,
  capacityLabel = "Next two weeks",
  priceMin,
  priceMax,
  price,
  onPriceChange,
  suggested,
  confidence,
  receipt,
  onUseSuggested,
  locale = "en-US",
  currency = "USD",
  phaseLabel = "Phase",
  hoursLabel = "Hours",
  amountLabel = "Amount",
  historyLabel = "Historical average",
  totalLabel = "Total",
  rangeLabel = "Price",
  suggestedLabel = "Suggested",
  useSuggestedLabel = "Use recommendation",
  receiptLabel = "Receipt",
  className,
}: ProposalEstimateProps) {
  const totals = estimateTotals(lines)
  const maxHours = Math.max(...lines.map((line) => Math.max(line.hours, line.historicalHours)), 1)
  const shownPrice = clampPrice(price, priceMin, priceMax)
  const showEffort = view === "all" || view === "effort"
  const showPrice = view === "all" || view === "price"

  return (
    <div data-slot="proposal-estimate" className={cn("grid min-w-0 gap-4", className)}>
      {showEffort ? (
        <>
          <div className="min-w-0 max-w-full overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[20rem] text-sm sm:min-w-[36rem]">
              <thead className="bg-muted/40 text-start text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-start font-medium">{phaseLabel}</th>
                  <th className="px-3 py-2 text-end font-medium">{hoursLabel}</th>
                  <th className="px-3 py-2 text-end font-medium">{amountLabel}</th>
                  <th className="px-3 py-2 text-start font-medium">{historyLabel}</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-t border-border">
                    <td className="px-3 py-2">{line.phase}</td>
                    <td className="px-3 py-2 text-end tabular-nums">{formatHours(line.hours, locale)}</td>
                    <td className="px-3 py-2 text-end tabular-nums">{formatMoney(estimateAmount(line), locale, currency)}</td>
                    <td className="px-3 py-2">
                      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary/70" style={{ width: `${shareRatio(line.hours, maxHours) * 100}%` }} />
                        <span
                          className="absolute top-[-3px] h-3.5 w-px bg-foreground"
                          style={{ left: `${shareRatio(line.historicalHours, maxHours) * 100}%` }}
                          aria-hidden
                        />
                      </div>
                      <span className="sr-only">
                        {historyLabel} {formatHours(line.historicalHours, locale)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border font-medium">
                  <td className="px-3 py-2">{totalLabel}</td>
                  <td className="px-3 py-2 text-end tabular-nums">{formatHours(totals.hours, locale)}</td>
                  <td className="px-3 py-2 text-end tabular-nums">{formatMoney(totals.amount, locale, currency)}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">{formatHours(totals.historicalHours, locale)}h</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <section aria-label={capacityLabel}>
            <h2 className="text-sm font-medium">{capacityLabel}</h2>
            <div className="mt-2 grid grid-cols-5 gap-1 sm:grid-cols-10">
              {capacity.map((cell) => (
                <div key={cell.id} className="min-w-0">
                  <div
                    className="aspect-square rounded-md bg-primary"
                    style={{ opacity: 0.15 + shareRatio(cell.load, 1) * 0.85 }}
                    title={`${cell.label} ${Math.round(cell.load * 100)}%`}
                  />
                  <p className="mt-1 truncate text-center text-[10px] text-muted-foreground">{cell.label}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
      {showPrice ? (
        <section className="grid gap-4 rounded-xl border border-border p-4 lg:grid-cols-2">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium">{rangeLabel}</h2>
              <p className="text-xs text-muted-foreground tabular-nums">
                {formatMoney(priceMin, locale, currency)} – {formatMoney(priceMax, locale, currency)}
              </p>
            </div>
            <p className="mt-2 text-2xl font-medium tabular-nums">{formatMoney(shownPrice, locale, currency)}</p>
            <Slider
              className="mt-4"
              min={priceMin}
              max={priceMax}
              step={500}
              value={[shownPrice]}
              onValueChange={(next) => onPriceChange?.(next[0] ?? shownPrice)}
              aria-label={rangeLabel}
            />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">{suggestedLabel}</span>
              <span className="text-sm font-medium tabular-nums">{formatMoney(suggested, locale, currency)}</span>
              <Badge variant="outline">{confidence}</Badge>
              <Button type="button" size="sm" variant="secondary" className="ms-auto" onClick={onUseSuggested}>
                {useSuggestedLabel}
              </Button>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium">{receiptLabel}</h2>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {receipt.map((line) => (
                <li key={line.id} data-kind={line.kind} className="flex justify-between gap-3">
                  <span className={cn("min-w-0 wrap-break-word", line.kind === "downsell" && "text-muted-foreground")}>{line.label}</span>
                  <span className={cn("shrink-0 tabular-nums", line.kind === "upsell" && "text-primary", line.kind === "downsell" && "text-destructive")}>
                    {line.amount > 0 && line.kind !== "base" ? "+" : ""}
                    {formatMoney(line.amount, locale, currency)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex justify-between border-t border-border pt-2 text-sm font-medium">
              <span>{totalLabel}</span>
              <span className="tabular-nums">{formatMoney(priceTotal(receipt), locale, currency)}</span>
            </p>
          </div>
        </section>
      ) : null}
    </div>
  )
}
