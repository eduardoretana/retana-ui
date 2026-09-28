"use client"

import * as React from "react"

export type ThemeChoice = "light" | "dark" | "system"

export type ThemeController = {
  theme: ThemeChoice
  setTheme: (theme: ThemeChoice) => void
  resolvedTheme?: "light" | "dark"
}

const ORDER: ThemeChoice[] = ["light", "dark", "system"]
const listeners = new Set<() => void>()

function readStored(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem("theme")
    if (stored === "light" || stored === "dark" || stored === "system") return stored
  } catch {
    /* private mode */
  }
  return "system"
}

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  media.addEventListener("change", onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
    media.removeEventListener("change", onStoreChange)
  }
}

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function applyClass(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "system" && systemPrefersDark())
  document.documentElement.classList.toggle("dark", dark)
  return dark ? "dark" : "light"
}

/**
 * Theme hook-in.
 *
 * Pass the host's next-themes controller (`{ theme, setTheme, resolvedTheme }`)
 * when the app already has one. With no controller, this toggles the `dark`
 * class on `<html>` and stores the choice under `localStorage.theme`.
 */
export function useAdminTheme(controller?: ThemeController) {
  const stored = React.useSyncExternalStore(subscribe, readStored, () => "system" as const)
  const systemDark = React.useSyncExternalStore(subscribe, systemPrefersDark, () => false)
  const localResolved = stored === "dark" || (stored === "system" && systemDark) ? "dark" : "light"

  React.useEffect(() => {
    if (controller) return
    applyClass(stored)
  }, [controller, stored])

  const theme = controller?.theme ?? stored
  const resolvedTheme = controller?.resolvedTheme ?? localResolved

  const setTheme = React.useCallback(
    (next: ThemeChoice) => {
      if (controller) {
        controller.setTheme(next)
        return
      }
      try {
        window.localStorage.setItem("theme", next)
      } catch {
        /* private mode */
      }
      applyClass(next)
      emit()
    },
    [controller],
  )

  const cycle = React.useCallback(() => {
    const index = ORDER.indexOf(theme)
    const next = ORDER[(index + 1) % ORDER.length] ?? "system"
    setTheme(next)
  }, [setTheme, theme])

  return { theme, resolvedTheme, setTheme, cycle }
}
