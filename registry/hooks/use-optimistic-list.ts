"use client"

import * as React from "react"

import { reorderVisible } from "@/registry/retana/lib/reorder"

export type ListNotify = {
  success: (message: string) => void
  error: (message: string) => void
}

type UseOptimisticListOptions<T extends { id: string }> = {
  items: readonly T[]
  onReorder: (ids: readonly string[]) => Promise<void> | void
  notify?: ListNotify
  savedMessage?: string
  errorMessage?: string
}

/**
 * Shows the next order immediately. If `onReorder` rejects, the previous
 * order is restored and `notify.error` runs.
 */
export function useOptimisticList<T extends { id: string }>({
  items,
  onReorder,
  notify,
  savedMessage = "Order saved",
  errorMessage = "Could not save the order",
}: UseOptimisticListOptions<T>) {
  const idsKey = items.map((item) => item.id).join("\0")
  const [order, setOrder] = React.useState(() => items.map((item) => item.id))
  const [seen, setSeen] = React.useState(idsKey)
  const [pending, setPending] = React.useState(false)
  const inFlight = React.useRef(false)

  if (seen !== idsKey) {
    setSeen(idsKey)
    setOrder(items.map((item) => item.id))
  }

  const byId = React.useMemo(() => new Map(items.map((item) => [item.id, item])), [items])
  const ordered = order.map((id) => byId.get(id)).filter((item): item is T => item != null)

  const commit = React.useCallback(
    async (next: readonly string[]) => {
      if (inFlight.current) return
      const before = order
      if (before.join("\0") === next.join("\0")) return
      inFlight.current = true
      setOrder([...next])
      setPending(true)
      try {
        await onReorder(next)
        notify?.success(savedMessage)
      } catch (error) {
        setOrder(before)
        const message = error instanceof Error && error.message ? error.message : errorMessage
        notify?.error(message)
      } finally {
        inFlight.current = false
        setPending(false)
      }
    },
    [errorMessage, notify, onReorder, order, savedMessage],
  )

  const moveVisible = React.useCallback(
    (visibleIds: readonly string[], activeId: string, overId: string) => {
      const next = reorderVisible(order, visibleIds, activeId, overId)
      void commit(next)
    },
    [commit, order],
  )

  return { items: ordered, order, pending, commit, moveVisible }
}
