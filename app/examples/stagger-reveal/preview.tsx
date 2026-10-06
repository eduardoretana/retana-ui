"use client"

import { StaggerItem, StaggerReveal } from "@/registry/ui/stagger-reveal"

const rows = ["Ceniza", "Feldespato", "Sílice"]

export default function Preview() {
  return (
    <StaggerReveal className="flex h-full flex-col justify-center gap-2 bg-background p-3">
      {rows.map((row) => (
        <StaggerItem key={row} className="rounded-md border border-border bg-card px-3 py-2 text-sm">
          {row}
        </StaggerItem>
      ))}
    </StaggerReveal>
  )
}
