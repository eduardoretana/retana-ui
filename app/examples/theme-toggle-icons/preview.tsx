"use client"

import * as React from "react"

import { ThemeToggleIcon } from "@/registry/ui/theme-toggle-icons"

export default function Preview() {
  const [on, setOn] = React.useState(false)
  return (
    <div className="grid h-full place-items-center bg-background">
      <ThemeToggleIcon
        name="eclipse"
        toggled={on}
        aria-label="Eclipse"
        className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-foreground"
        onClick={() => setOn((value) => !value)}
      />
    </div>
  )
}
