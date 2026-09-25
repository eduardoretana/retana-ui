"use client"

import * as React from "react"

export function useZonedTime(timeZone: string | undefined, locale = "en-US") {
  const getSnapshot = React.useCallback(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
        timeZone,
      }).format(new Date()),
    [locale, timeZone],
  )

  return React.useSyncExternalStore(
    (onStoreChange) => {
      const id = window.setInterval(onStoreChange, 30_000)
      return () => window.clearInterval(id)
    },
    getSnapshot,
    () => "--",
  )
}
