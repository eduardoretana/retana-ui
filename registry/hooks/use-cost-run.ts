"use client"

import * as React from "react"

import { applyRunEvent, type Run, type RunEvent } from "@/registry/retana/lib/cost-waterfall"

export type CostRunStream = {
  run: Run
  error: string | null
}

/** Applies an async event stream. A new iterable restarts from `initial`. */
export function useCostRun(initial: Run, events?: AsyncIterable<RunEvent> | null): CostRunStream {
  const [run, setRun] = React.useState(initial)
  const [error, setError] = React.useState<string | null>(null)
  const initialRef = React.useRef(initial)

  React.useEffect(() => {
    initialRef.current = initial
  }, [initial])

  React.useEffect(() => {
    if (!events) {
      setRun(initialRef.current)
      return
    }
    let cancelled = false
    let current = initialRef.current
    setRun(current)
    setError(null)
    ;(async () => {
      try {
        for await (const event of events) {
          if (cancelled) return
          current = applyRunEvent(current, event)
          setRun(current)
        }
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "stream")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [events])

  return { run: events ? run : initial, error }
}
