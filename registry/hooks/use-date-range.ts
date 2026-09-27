"use client"

import * as React from "react"

import {
  RANGE_OPTIONS,
  resolveRange,
  type RangeKey,
  type ResolvedRange,
} from "@/registry/retana/lib/date-range"

export function useDateRange(initial: RangeKey = "7d", timeZone = "UTC", referenceNow?: number) {
  const [key, setKeyState] = React.useState<RangeKey>(initial)
  const [now, setNow] = React.useState(() => referenceNow ?? Date.now())
  const clock = referenceNow ?? now

  const range: ResolvedRange = React.useMemo(
    () => resolveRange(key, clock, timeZone),
    [clock, key, timeZone],
  )

  const setKey = React.useCallback((next: RangeKey) => {
    if (referenceNow == null) setNow(Date.now())
    setKeyState(next)
  }, [referenceNow])

  return { key, setKey, range, options: RANGE_OPTIONS, now: clock }
}
