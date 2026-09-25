"use client"

import { useRef, useState } from "react"

import { cn } from "@/lib/utils"

const widths = [
  { id: "full", label: "Full", className: "w-full" },
  { id: "tablet", label: "768", className: "w-[768px]" },
  { id: "mobile", label: "390", className: "w-[390px]" },
] as const

export function PreviewStage({ src, title }: { src: string; title: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [width, setWidth] = useState<(typeof widths)[number]["id"]>("full")
  const [dark, setDark] = useState(false)
  const selected = widths.find((option) => option.id === width) ?? widths[0]

  function paint(next: boolean) {
    const root = frameRef.current?.contentDocument?.documentElement
    if (!root) return
    root.classList.toggle("dark", next)
    setDark(next)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <p className="mr-auto text-sm font-medium">Preview</p>
        <div className="flex gap-1" role="group" aria-label="Preview width">
          {widths.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={width === option.id}
              onClick={() => setWidth(option.id)}
              className={cn(
                "rounded-md px-2 py-1 text-xs",
                width === option.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={dark}
          onClick={() => paint(!dark)}
          className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {dark ? "Light" : "Dark"}
        </button>
      </div>
      <div className="flex justify-center overflow-auto bg-muted/30 p-3">
        <iframe
          ref={frameRef}
          title={title}
          src={src}
          onLoad={() => paint(document.documentElement.classList.contains("dark"))}
          className={cn(
            "h-[720px] max-w-full rounded-lg border border-border bg-background",
            selected.className,
          )}
        />
      </div>
    </div>
  )
}
