"use client"

import { useMinWidth } from "@/registry/hooks/use-min-width"

export default function Preview() {
  const wide = useMinWidth(768)
  return (
    <div className="flex h-full items-center bg-background p-3">
      <p className="text-sm">
        768px: <span className="font-medium">{wide ? "ancho" : "estrecho"}</span>
      </p>
    </div>
  )
}
