"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

const rows = [
  { name: "James Carter", capacity: "90%", wide: true },
  { name: "Emma Johnson", capacity: "80%", wide: false },
  { name: "Laura Perez", capacity: "20%", wide: false },
]

/**
 * Card-sized preview for the catalog grid.
 * Local state only, so opening it does not mount a modal over the index.
 */
export default function LayeredPanelPreview() {
  const [open, setOpen] = useState(true)
  const [mode, setMode] = useState<"peek" | "full">("peek")

  return (
    <div className="relative flex h-full min-h-36 overflow-hidden bg-muted/40 p-3">
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg border border-border bg-background p-2",
          open && mode === "full" && "hidden",
        )}
      >
        {rows.map((row) => {
          const selected = open && row.name === "Emma Johnson"
          return (
            <button
              key={row.name}
              type="button"
              onClick={() => {
                setOpen(true)
                setMode("peek")
              }}
              className={cn(
                "flex items-center gap-2 rounded-md px-1.5 py-1 text-left text-[11px]",
                selected ? "bg-muted" : "hover:bg-muted/70",
              )}
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[9px] font-medium">
                {row.name.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1 truncate">{row.name}</span>
              <span className="h-1 w-10 overflow-hidden rounded-full bg-muted">
                <span
                  className={cn(
                    "block h-full rounded-full bg-foreground/70",
                    row.wide ? "w-4/5" : "w-1/5",
                  )}
                />
              </span>
              <span className="text-muted-foreground tabular-nums">{row.capacity}</span>
            </button>
          )
        })}
      </div>
      {open ? (
        <div
          className={cn(
            "ml-2 flex min-w-0 flex-col rounded-lg border border-border bg-background shadow-lg",
            mode === "full" ? "flex-1" : "w-[46%]",
          )}
        >
          <div className="flex items-start gap-2 border-b border-border px-2.5 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">Emma Johnson</p>
              <p className="text-[10px] text-muted-foreground">Designer · Available</p>
            </div>
            <button
              type="button"
              aria-label="Close preview"
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
          <div className="flex min-h-0 flex-1">
            {mode === "full" ? (
              <div className="min-w-0 flex-1 border-r border-border px-2.5 py-2 text-[10px] text-muted-foreground">
                <p className="font-medium tracking-wide uppercase">Personal</p>
                <p className="mt-1 text-foreground">emma.johnson@acme.example</p>
              </div>
            ) : null}
            <div className={cn("px-2.5 py-2", mode === "full" ? "w-[42%]" : "w-full")}>
              <p className="text-[10px] text-muted-foreground">
                Capacity is lower than usual while onboarding a new client.
              </p>
              <button
                type="button"
                onClick={() => setMode(mode === "full" ? "peek" : "full")}
                className="mt-2 w-full rounded-md bg-secondary px-2 py-1 text-[10px] font-medium text-secondary-foreground active:scale-[0.96]"
              >
                {mode === "full" ? "Close profile" : "View full profile"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
