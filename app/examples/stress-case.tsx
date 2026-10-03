import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function StressCase({
  label,
  children,
  width,
  className,
}: {
  label: string
  children: ReactNode
  width?: number | string
  className?: string
}) {
  return (
    <section className="flex min-w-0 flex-col gap-2">
      <h2 className="text-sm font-medium">{label}</h2>
      <div className={cn("max-w-full overflow-x-auto contain-paint", className)}>
        <div style={width != null ? { width } : undefined}>{children}</div>
      </div>
    </section>
  )
}
