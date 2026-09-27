"use client"

import * as React from "react"

import {
  RANGE_OPTIONS,
  resolveRange,
  type RangeKey,
  type ResolvedRange,
} from "@/registry/retana/lib/date-range"

export function useDateRange(initial: RangeKey = "7d", timeZone = "UTC") {
  const [key, setKeyState] = React.useState<RangeKey>(initial)
  const [now, setNow] = React.useState(() => Date.now())

  const range: ResolvedRange = React.useMemo(
    () => resolveRange(key, now, timeZone),
    [key, now, timeZone],
  )

  const setKey = React.useCallback((next: RangeKey) => {
    setNow(Date.now())
    setKeyState(next)
  }, [])

  return { key, setKey, range, options: RANGE_OPTIONS, now }
}
