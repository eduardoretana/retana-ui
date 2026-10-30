import { seriesColor, seriesMark, seriesPatternId } from "@/registry/retana/lib/chart-series"
import { cn } from "@/lib/utils"

const MARKS = [0, 1, 2, 3, 4]

/** SVG patterns. Each series pairs a chart token with a distinct mark. */
export function SeriesPatterns({ id }: { id: string }) {
  return (
    <defs>
      {MARKS.map((mark) => (
        <pattern key={mark} id={`${id}-mark-${mark}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill={`var(--chart-${mark + 1})`} />
          {mark === 1 ? <path d="M0 6 L6 0" stroke="var(--foreground)" strokeOpacity="0.55" /> : null}
          {mark === 2 ? <circle cx="2" cy="2" r="1" fill="var(--foreground)" fillOpacity="0.55" /> : null}
          {mark === 3 ? <path d="M0 3 H6" stroke="var(--foreground)" strokeOpacity="0.5" /> : null}
          {mark === 4 ? <path d="M0 6 L6 0 M0 0 L6 6" stroke="var(--foreground)" strokeOpacity="0.45" /> : null}
        </pattern>
      ))}
    </defs>
  )
}

export function seriesPaint(prefix: string, index: number) {
  return `url(#${seriesPatternId(prefix, index)})`
}

export function SeriesSwatch({ index, className }: { index: number; className?: string }) {
  const mark = seriesMark(index)
  const image =
    mark === 1
      ? "repeating-linear-gradient(45deg, transparent, transparent 2px, var(--foreground) 2px, var(--foreground) 3px)"
      : mark === 2
        ? "radial-gradient(circle at 30% 30%, var(--foreground) 0.8px, transparent 1px)"
        : mark === 3
          ? "repeating-linear-gradient(0deg, transparent, transparent 2px, var(--foreground) 2px, var(--foreground) 3px)"
          : mark === 4
            ? "repeating-linear-gradient(45deg, transparent, transparent 2px, var(--foreground) 2px, var(--foreground) 3px), repeating-linear-gradient(-45deg, transparent, transparent 2px, var(--foreground) 2px, var(--foreground) 3px)"
            : undefined
  return (
    <span
      aria-hidden
      data-slot="chart-swatch"
      data-mark={mark}
      className={cn("inline-block size-2.5 shrink-0 rounded-[3px] ring-1 ring-foreground/15", className)}
      style={{ backgroundColor: seriesColor(index), backgroundImage: image }}
    />
  )
}
