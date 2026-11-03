"use client"

import * as React from "react"

function subscribe(onStoreChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)")
  query.addEventListener("change", onStoreChange)
  return () => query.removeEventListener("change", onStoreChange)
}

function snapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** True when the reader asked for reduced motion. False during SSR. */
export function useReducedMotion() {
  return React.useSyncExternalStore(subscribe, snapshot, () => false)
}
