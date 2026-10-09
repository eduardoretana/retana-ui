"use client"

import { ScrollLinked } from "@/registry/ui/scroll-linked"

export default function Preview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <ScrollLinked preset="rise" className="w-full rounded-xl border border-border bg-card p-3">
        <p className="text-sm font-medium">El esmalte sube con el scroll</p>
      </ScrollLinked>
    </div>
  )
}
