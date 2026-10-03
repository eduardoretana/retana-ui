"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"

import type { UrlAdapter } from "@/registry/retana/hooks/use-multi-view"

/**
 * Next.js App Router adapter for `useMultiView`.
 * Reads `useSearchParams` and writes with `history.replaceState`, so the
 * view state stays shareable without a navigation. The hook file that owns
 * view state does not import Next.
 */
export function useNextMultiViewAdapter(): UrlAdapter {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const locationRef = React.useRef({ pathname, search })

  React.useEffect(() => {
    locationRef.current = { pathname, search }
  }, [pathname, search])

  const [adapter] = React.useState<UrlAdapter>(() => ({
    get(key) {
      return new URLSearchParams(locationRef.current.search).get(key)
    },
    set(key, value) {
      const params = new URLSearchParams(locationRef.current.search)
      if (value == null || value === "") params.delete(key)
      else params.set(key, value)
      const qs = params.toString()
      locationRef.current = { pathname: locationRef.current.pathname, search: qs }
      const url = qs ? `${locationRef.current.pathname}?${qs}` : locationRef.current.pathname
      window.history.replaceState(window.history.state, "", url)
    },
  }))

  return adapter
}
