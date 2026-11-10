"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 * Extiende segmented-control. Si las opciones caben, aprieta el relleno.
 * Si no, la pista se desplaza y desvanece los bordes. El texto no se corta.
 */

import { useLayoutEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import { SegmentedControl, type SegmentedControlProps } from "@/registry/retana/ui/segmented-control"

export type SegmentedFilterProps = SegmentedControlProps & {
  status?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
}

function maskImage(fadeStart: boolean, fadeEnd: boolean) {
  const left = fadeStart ? "transparent" : "var(--foreground)"
  const right = fadeEnd ? "transparent" : "var(--foreground)"
  return `linear-gradient(to right, ${left}, var(--foreground) 1rem, var(--foreground) calc(100% - 1rem), ${right})`
}

export function SegmentedFilter({
  classNames,
  status = "ready",
  emptyLabel = "Sin filtros",
  loadingLabel = "Cargando filtros",
  error,
  options,
  value,
  ...props
}: SegmentedFilterProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const track = rootRef.current?.querySelector<HTMLElement>("[data-slot=segmented-control-track]")
    if (!track) return
    const paint = () => {
      track.dataset.compact = "false"
      if (track.scrollWidth - track.clientWidth > 1) track.dataset.compact = "true"
      const overflow = track.scrollWidth - track.clientWidth > 1
      track.dataset.overflow = overflow ? "true" : "false"
      const fadeStart = overflow && track.scrollLeft > 1
      const fadeEnd = overflow && track.scrollWidth - track.clientWidth - track.scrollLeft > 1
      track.style.maskImage = overflow ? maskImage(fadeStart, fadeEnd) : ""
      const button = track.querySelector<HTMLElement>('[aria-pressed="true"]')
      if (!overflow || !button) return
      const room = 12
      const start = button.offsetLeft - room
      const end = button.offsetLeft + button.offsetWidth + room - track.clientWidth
      const left = track.scrollLeft > start ? start : track.scrollLeft < end ? end : track.scrollLeft
      if (left !== track.scrollLeft) track.scrollTo({ left: Math.max(0, left), behavior: "auto" })
    }
    paint()
    track.addEventListener("scroll", paint, { passive: true })
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(paint)
    observer?.observe(track)
    return () => {
      track.removeEventListener("scroll", paint)
      observer?.disconnect()
    }
  }, [options, value])

  if (status === "loading") {
    return <div role="status" aria-label={loadingLabel} className="h-11 animate-pulse rounded-lg bg-muted" />
  }
  if (status === "error") {
    return <p role="alert" className="text-sm text-destructive">{error}</p>
  }
  if (status === "empty" || options.length === 0) {
    return <p role="status" className="text-sm text-muted-foreground">{emptyLabel}</p>
  }
  return (
    <div ref={rootRef} data-slot="segmented-filter" className="w-full min-w-0 max-w-full">
      <SegmentedControl
        {...props}
        value={value}
        options={options}
        className="w-full"
        classNames={{
          ...classNames,
          root: cn("flex w-full min-w-0 max-w-full", classNames?.root),
          track: cn("w-full min-w-0 group/filter", classNames?.track),
          option: cn(
            "min-h-11 max-w-none shrink-0 whitespace-nowrap group-data-[compact=true]/filter:px-2",
            classNames?.option,
          ),
          label: cn("whitespace-nowrap", classNames?.label),
        }}
      />
    </div>
  )
}
