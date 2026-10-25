"use client"

/**
 * Optimistic stage overlay. The host still derives the stage with `getStage`.
 * A rejected `onMoveCandidate` drops the overlay so the card returns.
 */

import * as React from "react"

import type { AtsCandidate, AtsGetStage } from "@/registry/retana/lib/ats"

export type OptimisticMoveResult = { ok: true } | { ok: false; reason: "blocked" | "rejected" }

export function useOptimisticStage<TMeta>(
  candidates: readonly AtsCandidate<TMeta>[],
  getStage: AtsGetStage<TMeta>,
  options?: {
    canMove?: (from: string, to: string) => boolean
    onMoveCandidate?: (id: string, from: string, to: string) => void | Promise<void>
  },
) {
  const [pending, setPending] = React.useState<Record<string, string>>({})
  const tickets = React.useRef<Record<string, number>>({})
  const canMove = options?.canMove
  const onMoveCandidate = options?.onMoveCandidate

  const resolve = React.useCallback(
    (candidate: AtsCandidate<TMeta>) => pending[candidate.id] ?? getStage(candidate),
    [getStage, pending],
  )

  const caughtUp = Object.entries(pending).filter(([id, to]) => {
    const candidate = candidates.find((item) => item.id === id)
    return Boolean(candidate && getStage(candidate) === to)
  })
  if (caughtUp.length > 0) {
    const next = { ...pending }
    for (const [id] of caughtUp) delete next[id]
    setPending(next)
  }

  const move = React.useCallback(
    async (id: string, from: string, to: string): Promise<OptimisticMoveResult> => {
      if (from === to) return { ok: true }
      if (canMove && !canMove(from, to)) return { ok: false, reason: "blocked" }
      if (!onMoveCandidate) return { ok: false, reason: "blocked" }
      const ticket = (tickets.current[id] ?? 0) + 1
      tickets.current[id] = ticket
      setPending((current) => ({ ...current, [id]: to }))
      try {
        await onMoveCandidate(id, from, to)
        return { ok: true }
      } catch {
        if (tickets.current[id] === ticket) {
          setPending((current) => {
            if (!(id in current)) return current
            const next = { ...current }
            delete next[id]
            return next
          })
        }
        return { ok: false, reason: "rejected" }
      }
    },
    [canMove, onMoveCandidate],
  )

  return { resolve, move, pending }
}
