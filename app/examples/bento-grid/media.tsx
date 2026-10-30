import type { ReactNode } from "react"
import { Box, Droplets, Flame, Images } from "lucide-react"

import type { BentoIconName } from "./fixtures"

export const bentoIcons: Record<BentoIconName, ReactNode> = {
  flame: <Flame className="size-4" aria-hidden="true" />,
  drops: <Droplets className="size-4" aria-hidden="true" />,
  box: <Box className="size-4" aria-hidden="true" />,
  frames: <Images className="size-4" aria-hidden="true" />,
}

function Well({ children }: { children: ReactNode }) {
  return <div className="flex h-full min-h-40 items-center justify-center gap-3 p-3">{children}</div>
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-lg bg-background px-2.5 py-1.5 text-xs text-muted-foreground ring-1 ring-foreground/10">
      {children}
    </span>
  )
}

function Mark({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-foreground/10">
      {children}
    </span>
  )
}

/** Original studio sketches. They are not assets from the reference. */
export function BentoSketch({ id }: { id: string }) {
  if (id === "esmalte") {
    return (
      <Well>
        <Mark>
          <Droplets className="size-5" aria-hidden="true" />
        </Mark>
        <div className="flex flex-col gap-2">
          <Chip>1.180°</Chip>
          <Chip>Sábado</Chip>
        </div>
      </Well>
    )
  }
  if (id === "empaque") {
    return (
      <Well>
        <Mark>
          <Box className="size-5" aria-hidden="true" />
        </Mark>
        <div className="h-16 w-px bg-border" />
        <div className="flex flex-col gap-2">
          <Chip>12 cajas</Chip>
          <Chip>Andén 2</Chip>
        </div>
      </Well>
    )
  }
  if (id === "muro") {
    return (
      <Well>
        <Mark>
          <Images className="size-5" aria-hidden="true" />
        </Mark>
        <div className="grid grid-cols-2 gap-1.5">
          <span className="size-8 rounded-md bg-background ring-1 ring-foreground/10" />
          <span className="size-8 rounded-md bg-background ring-1 ring-foreground/10" />
          <span className="size-8 rounded-md bg-background ring-1 ring-foreground/10" />
          <span className="size-8 rounded-md bg-background ring-1 ring-foreground/10" />
        </div>
      </Well>
    )
  }
  return (
    <Well>
      <Mark>
        <Flame className="size-5" aria-hidden="true" />
      </Mark>
      <div className="h-px w-10 bg-border" />
      <Chip>Turno 06:00</Chip>
    </Well>
  )
}
