"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"

/**
 * Shareable peek / full state for Next.js App Router.
 *
 * `?member=emma` opens peek. `?member=emma&view=full` opens expanded.
 * Browser back collapses full → peek, then closes. The close button and
 * click-outside jump straight back to the page underneath when this hook
 * pushed those entries.
 *
 * The panel component does not depend on this hook or on Next.js.
 */

export type LayeredPanelMode = "peek" | "full"

export type UseLayeredPanelUrlStateOptions = {
  /** Query key for the record id. Example: "member" → ?member=emma */
  param?: string
  /** Query key for the expanded view. Example: "view" → &view=full */
  viewParam?: string
  /** Value that means full mode. Default: "full". */
  fullValue?: string
}

export type UseLayeredPanelUrlStateReturn = {
  id: string | null
  open: boolean
  mode: LayeredPanelMode
  openItem: (id: string) => void
  close: () => void
  setMode: (mode: LayeredPanelMode) => void
  /** Drop-in for `<LayeredPanel onOpenChange>`. `true` is ignored; opening needs an id. */
  onOpenChange: (open: boolean) => void
  /** Drop-in for `<LayeredPanel onModeChange>`. */
  onModeChange: (mode: LayeredPanelMode) => void
}

type HistoryState = { lpDepth?: number }

function readDepth() {
  if (typeof window === "undefined") return 0
  const state = window.history.state as HistoryState | null
  return typeof state?.lpDepth === "number" ? state.lpDepth : 0
}

export function useLayeredPanelUrlState(
  options: UseLayeredPanelUrlStateOptions = {},
): UseLayeredPanelUrlStateReturn {
  const { param = "id", viewParam = "view", fullValue = "full" } = options
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()

  const id = searchParams.get(param)
  const open = Boolean(id)
  const mode: LayeredPanelMode =
    searchParams.get(viewParam) === fullValue ? "full" : "peek"

  const locationRef = React.useRef({ pathname, search })
  const depthRef = React.useRef(0)
  const pendingRef = React.useRef(false)
  const modeRef = React.useRef(mode)
  const idRef = React.useRef(id)
  const openRef = React.useRef(open)

  React.useEffect(() => {
    locationRef.current = { pathname, search }
    modeRef.current = mode
    idRef.current = id
    openRef.current = open
  }, [id, mode, open, pathname, search])

  React.useEffect(() => {
    const onPop = () => {
      pendingRef.current = false
      depthRef.current = readDepth()
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  const write = React.useCallback(
    (
      method: "push" | "replace",
      next: { id: string | null; mode: LayeredPanelMode },
    ) => {
      const params = new URLSearchParams(locationRef.current.search)
      if (next.id) params.set(param, next.id)
      else params.delete(param)

      if (next.id && next.mode === "full") params.set(viewParam, fullValue)
      else params.delete(viewParam)

      const qs = params.toString()
      const url = qs
        ? `${locationRef.current.pathname}?${qs}`
        : locationRef.current.pathname

      if (method === "push") {
        depthRef.current += 1
        window.history.pushState({ lpDepth: depthRef.current }, "", url)
        return
      }

      window.history.replaceState({ lpDepth: depthRef.current }, "", url)
    },
    [fullValue, param, viewParam],
  )

  const setMode = React.useCallback(
    (next: LayeredPanelMode) => {
      if (pendingRef.current || next === modeRef.current || !idRef.current) {
        return
      }
      modeRef.current = next
      if (next === "full") {
        write("push", { id: idRef.current, mode: "full" })
        return
      }
      if (depthRef.current > 0) {
        pendingRef.current = true
        window.history.back()
        window.setTimeout(() => {
          pendingRef.current = false
        }, 400)
        return
      }
      write("replace", { id: idRef.current, mode: "peek" })
    },
    [write],
  )

  const close = React.useCallback(() => {
    if (pendingRef.current) return
    const steps = depthRef.current
    if (steps > 0) {
      pendingRef.current = true
      window.history.go(-steps)
      window.setTimeout(() => {
        pendingRef.current = false
      }, 400)
      return
    }
    if (!openRef.current) return
    idRef.current = null
    modeRef.current = "peek"
    openRef.current = false
    write("replace", { id: null, mode: "peek" })
  }, [write])

  const openItem = React.useCallback(
    (nextId: string) => {
      if (!nextId || pendingRef.current) return
      if (
        openRef.current &&
        idRef.current === nextId &&
        modeRef.current === "peek"
      ) {
        return
      }
      idRef.current = nextId
      modeRef.current = "peek"
      openRef.current = true
      write("push", { id: nextId, mode: "peek" })
    },
    [write],
  )

  const onOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) close()
    },
    [close],
  )

  return {
    id,
    open,
    mode,
    openItem,
    close,
    setMode,
    onOpenChange,
    onModeChange: setMode,
  }
}
