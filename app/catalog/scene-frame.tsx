import type { ReactNode } from "react"

import { scenePaddingClass, sceneSizeClass, sceneSurfaceClass, type SceneFrame } from "@/app/catalog/scene-types"
import { cn } from "@/lib/utils"

export function SceneFrameView({
  frame,
  children,
  className,
}: {
  frame: SceneFrame
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-auto min-w-0 rounded-xl border border-border",
        sceneSizeClass[frame.size],
        sceneSurfaceClass[frame.surface],
        scenePaddingClass[frame.padding],
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SceneStatus({ tone, children }: { tone: "error" | "loading"; children: ReactNode }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={cn("text-sm", tone === "error" ? "text-destructive" : "text-muted-foreground")}>
      {children}
    </p>
  )
}
