"use client"

import * as React from "react"

/**
 * Warn before the tab closes while `dirty` is true.
 * Returns the same flag so a sticky bar can read it.
 */
export function useUnsavedChanges(dirty: boolean, message = "You have unsaved changes.") {
  React.useEffect(() => {
    if (!dirty || typeof window === "undefined") return
    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = message
    }
    window.addEventListener("beforeunload", onLeave)
    return () => window.removeEventListener("beforeunload", onLeave)
  }, [dirty, message])

  return dirty
}
