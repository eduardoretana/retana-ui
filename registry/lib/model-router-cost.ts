/**
 * Local per-1K blend for the model router. Kept in its own module so the
 * router can later call the cost-waterfall pricing core without growing a
 * second pricer.
 *
 * Candidate: `cost-waterfall` (separate branch, not imported here) will expose
 * an injectable core priced per 1M tokens — input, output, cache read, and
 * cache write — with a configurable currency. When that core is on CPL, the
 * host should turn those four rates into one `amountPer1k` and pass it in.
 * This function only weights shares. It does not price those rates, convert
 * currencies, or describe cost per step.
 *
 * Display goes through `formatRouterAmount` (`Intl.NumberFormat`). The amount
 * is already in `currency`. USD and MXN are both valid codes; the formatter
 * does not assume one of them.
 */

export type CostSlice = {
  /** Traffic share in percent points. */
  share: number
  /** Amount per 1,000 tokens, already in the caller's currency. */
  amountPer1k: number
}

/** Share-weighted amount per 1K. Missing or non-finite slices contribute nothing. */
export function blendCostPer1k(slices: readonly CostSlice[]): number {
  let total = 0
  for (const slice of slices) {
    if (!Number.isFinite(slice.share) || !Number.isFinite(slice.amountPer1k)) continue
    total += (slice.share / 100) * slice.amountPer1k
  }
  return total
}

export type RouterMoneyFormat = {
  locale: string
  currency: string
}

/** Formats a per-1K amount. Fraction digits stay at 4 so small token prices remain visible. */
export function formatRouterAmount(amount: number, format: RouterMoneyFormat): string {
  return new Intl.NumberFormat(format.locale, {
    style: "currency",
    currency: format.currency,
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(amount)
}
