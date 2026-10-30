"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"

import { themeFromQuery } from "@/app/catalog/scene-query"

function ThemeQueryInner() {
  const params = useSearchParams()
  const { setTheme } = useTheme()
  const theme = themeFromQuery(params.get("theme"))

  useEffect(() => {
    if (theme) setTheme(theme)
  }, [setTheme, theme])

  return null
}

/** Applies `?theme=light|dark` without a navigation. */
export function ThemeQuery() {
  return (
    <Suspense fallback={null}>
      <ThemeQueryInner />
    </Suspense>
  )
}
