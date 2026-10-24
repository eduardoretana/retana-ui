"use client"

/**
 * Feature detection for CSS scroll-driven animations. Clean-room.
 * The server snapshot is false, so the first paint uses the hook path.
 */

import { useSyncExternalStore } from "react"

export type AnimationTimelineKind = "scroll()" | "view()"

/** True when the browser can drive an animation from the named timeline. */
export function supportsAnimationTimeline(kind: AnimationTimelineKind) {
  return typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("animation-timeline", kind)
}

/** Client-only support flag. Hydration matches the server (unsupported) and then upgrades. */
export function useAnimationTimeline(kind: AnimationTimelineKind) {
  return useSyncExternalStore(
    () => () => {},
    () => supportsAnimationTimeline(kind),
    () => false,
  )
}
