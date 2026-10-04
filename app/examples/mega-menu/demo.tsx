"use client"

import { useState } from "react"

import { MegaMenu } from "@/registry/ui/mega-menu"
import { cn } from "@/lib/utils"

import { storeMenu } from "./data"

export function Demo() {
  const [value, setValue] = useState<string | null>(null)
  const [openOn, setOpenOn] = useState<"hover" | "click">("hover")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Abrir con">
        {(["hover", "click"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={openOn === option}
            onClick={() => setOpenOn(option)}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-sm",
              openOn === option ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-muted/30 p-3">
        <MegaMenu label="Store" items={storeMenu} openOn={openOn} value={value} onValueChange={setValue} />
        <div className="min-h-72" />
      </div>
      <p className="text-sm text-muted-foreground">
        Panel: <span className="text-foreground">{value ?? "cerrado"}</span>
      </p>
    </div>
  )
}
