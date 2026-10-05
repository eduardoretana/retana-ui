"use client"

/** Adapted from Gauge UI (MIT). https://github.com/thordursk/gauge-ui */

import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type SceneIconType = LucideIcon

/** Lucide stand-in for the icon slots the scenes used to take from Hugeicons. */
export function SceneIcon({
  icon: Icon,
  className,
  strokeWidth,
  ...props
}: {
  icon: LucideIcon
  strokeWidth?: number
} & React.SVGProps<SVGSVGElement>) {
  return (
    <Icon
      strokeWidth={strokeWidth}
      {...props}
      className={cn(className)}
      aria-hidden={props["aria-label"] ? undefined : true}
    />
  )
}
