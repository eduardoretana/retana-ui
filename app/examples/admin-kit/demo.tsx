"use client"

import { useTheme } from "next-themes"

import { AdminKit } from "@/registry/blocks/admin-kit"
import type { ThemeChoice } from "@/registry/hooks/use-admin-theme"

function choice(value: string | undefined): ThemeChoice {
  if (value === "light" || value === "dark" || value === "system") return value
  return "system"
}

export function AdminKitDemo() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <AdminKit
      showToaster={false}
      themeController={{
        theme: choice(theme),
        setTheme: (next) => setTheme(next),
        resolvedTheme: resolvedTheme === "dark" ? "dark" : "light",
      }}
    />
  )
}
