/** shadcn chart tokens. Hosts define --chart-1 … --chart-5. */
export const CHART_TONES = [1, 2, 3, 4, 5] as const

export type ChartTone = (typeof CHART_TONES)[number]

export function chartVar(tone: ChartTone = 1): string {
  return `var(--chart-${tone})`
}

export function chartBgClass(tone: ChartTone = 1): string {
  switch (tone) {
    case 1:
      return "bg-chart-1"
    case 2:
      return "bg-chart-2"
    case 3:
      return "bg-chart-3"
    case 4:
      return "bg-chart-4"
    case 5:
      return "bg-chart-5"
  }
}

export function chartFillClass(tone: ChartTone = 1): string {
  switch (tone) {
    case 1:
      return "fill-chart-1"
    case 2:
      return "fill-chart-2"
    case 3:
      return "fill-chart-3"
    case 4:
      return "fill-chart-4"
    case 5:
      return "fill-chart-5"
  }
}
