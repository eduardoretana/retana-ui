"use client"

import { useId, useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from "react"

/** Shared highlight travel time. Override with the `--mb-dur` custom property. */
export const MAGNETIC_BENTO_DURATION = "450ms"

/**
 * Ease with a slight overshoot so the highlight stretches past the card, then settles.
 * Override with the `--mb-ease` custom property.
 */
export const MAGNETIC_BENTO_EASE = "linear(0, 0.35 12%, 0.82 30%, 1.06 46%, 0.98 64%, 1)"

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)"

export type IndicatorBox = {
  x: number
  y: number
  width: number
  height: number
}

/** True when the browser accepts CSS anchor names. The fallback measures the card instead. */
export function supportsAnchorPositioning() {
  try {
    return typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("anchor-name: --x")
  } catch {
    return false
  }
}

/** `useId` can contain colons. Anchor names are dashed idents. */
export function anchorNameFromReactId(id: string) {
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "") || "grid"
  return `--mb-${safe}`
}

export function measureIndicator(root: HTMLElement, item: HTMLElement): IndicatorBox {
  const rootBox = root.getBoundingClientRect()
  const itemBox = item.getBoundingClientRect()
  return {
    x: itemBox.left - rootBox.left,
    y: itemBox.top - rootBox.top,
    width: itemBox.width,
    height: itemBox.height,
  }
}

function subscribeReduced(onChange: () => void) {
  const media = window.matchMedia(REDUCE_QUERY)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCE_QUERY).matches, () => false)
}

function subscribeSupport() {
  return () => {}
}

export function useAnchorPositioningSupport() {
  return useSyncExternalStore(subscribeSupport, supportsAnchorPositioning, () => false)
}

function escapeAttr(value: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value)
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function clearFallback(indicator: HTMLElement) {
  for (const property of ["left", "top", "width", "height", "transform", "transition"]) {
    indicator.style.removeProperty(property)
  }
}

/**
 * Names one anchor for this grid and, when anchor positioning is missing,
 * sizes the indicator from the active card. Resize remeasures without the stretch.
 */
export function useMagneticIndicator(
  gridRef: RefObject<HTMLElement | null>,
  indicatorRef: RefObject<HTMLElement | null>,
  activeKey: string | null,
) {
  const anchorName = anchorNameFromReactId(useId())
  const supported = useAnchorPositioningSupport()
  const reduced = usePrefersReducedMotion()
  const seen = useRef(false)
  const previous = useRef<string | null>(null)
  const placeRef = useRef<(move: boolean) => void>(() => {})

  useLayoutEffect(() => {
    placeRef.current = (move: boolean) => {
      const grid = gridRef.current
      const indicator = indicatorRef.current
      if (!grid || !indicator) return
      const liveAnchor = supportsAnchorPositioning()
      const items = grid.querySelectorAll<HTMLElement>("[data-slot='magnetic-bento-item']")
      for (const item of items) {
        if (liveAnchor && item.dataset.value === activeKey) item.style.setProperty("anchor-name", anchorName)
        else item.style.removeProperty("anchor-name")
      }
      if (liveAnchor) {
        clearFallback(indicator)
        previous.current = activeKey
        return
      }
      if (!activeKey) {
        clearFallback(indicator)
        previous.current = null
        seen.current = false
        return
      }
      const item = grid.querySelector<HTMLElement>(
        `[data-slot="magnetic-bento-item"][data-value="${escapeAttr(activeKey)}"]`,
      )
      if (!item) return
      const box = measureIndicator(grid, item)
      const animate = move && seen.current && !reduced && previous.current !== null && previous.current !== activeKey
      indicator.style.left = "0px"
      indicator.style.top = "0px"
      indicator.style.width = `${box.width}px`
      indicator.style.height = `${box.height}px`
      indicator.style.transform = `translate3d(${box.x}px, ${box.y}px, 0px)`
      indicator.style.transition = animate
        ? "transform var(--mb-dur) var(--mb-ease), width var(--mb-dur) var(--mb-ease), height var(--mb-dur) var(--mb-ease)"
        : reduced
          ? "opacity 120ms linear"
          : "none"
      seen.current = true
      previous.current = activeKey
    }
    placeRef.current(true)
  }, [activeKey, anchorName, gridRef, indicatorRef, reduced, supported])

  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const onResize = () => placeRef.current(false)
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null
    observer?.observe(grid)
    window.addEventListener("resize", onResize)
    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", onResize)
    }
  }, [gridRef])

  return { anchorName, supported, reduced }
}
