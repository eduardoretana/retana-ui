"use client"

/**
 * Viewport width cutoff shared by sticky scroll pieces. Clean-room.
 * The server snapshot is the narrow layout, so the first paint does not pin.
 */

import { useSyncExternalStore } from "react"

/** True when the viewport is at least `px` CSS pixels wide. */
export function useMinWidth(px: number) {
  const width = Number.isFinite(px) ? Math.max(0, Math.round(px)) : 0
  const query = `(min-width: ${width}px)`
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener("change", onChange)
      return () => media.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
