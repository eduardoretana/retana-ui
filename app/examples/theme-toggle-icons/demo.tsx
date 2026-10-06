"use client"

import * as React from "react"

import { ThemeToggleIcon, themeToggleIconNames } from "@/registry/ui/theme-toggle-icons"

export function Demo() {
  const [on, setOn] = React.useState<Record<string, boolean>>({})
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {themeToggleIconNames.map((name) => (
        <ThemeToggleIcon
          key={name}
          name={name}
          toggled={on[name] ?? false}
          duration={500}
          aria-label={name}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          onClick={() => setOn((current) => ({ ...current, [name]: !current[name] }))}
        >
          <span className="truncate">{name}</span>
        </ThemeToggleIcon>
      ))}
    </div>
  )
}
