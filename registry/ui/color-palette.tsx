"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export type PaletteSwatch = {
  id: string
  label: string
  /** Any CSS color the host already uses. The palette does not invent a theme. */
  value: string
}

export type ColorPaletteProps = {
  swatches: readonly PaletteSwatch[]
  onCopy?: (swatch: PaletteSwatch) => void
  copyLabel?: string
  copiedLabel?: string
  className?: string
}

export function ColorPalette({
  swatches,
  onCopy,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  className,
}: ColorPaletteProps) {
  const [copied, setCopied] = React.useState<string | null>(null)
  const timer = React.useRef<number>(0)

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy(swatch: PaletteSwatch) {
    try {
      await navigator.clipboard.writeText(swatch.value)
    } catch {
      return
    }
    onCopy?.(swatch)
    setCopied(swatch.id)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(null), 1400)
  }

  return (
    <ul data-slot="color-palette" className={cn("grid grid-cols-4 gap-2", className)}>
      {swatches.map((swatch) => {
        const isCopied = copied === swatch.id
        return (
          <li key={swatch.id}>
            <button
              type="button"
              onClick={() => void copy(swatch)}
              aria-label={`${copyLabel} ${swatch.label}`}
              className="flex w-full flex-col gap-1 rounded-lg p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className="relative grid aspect-square place-items-center rounded-md border border-border"
                style={{ background: swatch.value }}
              >
                {isCopied ? (
                  <Check className="size-4 rounded-full bg-background p-0.5 text-foreground" aria-hidden />
                ) : null}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {isCopied ? copiedLabel : swatch.label}
              </span>
            </button>
          </li>
        )
      })}
      <span className="sr-only" role="status">
        {copied ? copiedLabel : ""}
      </span>
    </ul>
  )
}
