"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { presenceColor, readPresenceInfo, useOthers, type PresenceInfo } from "@/registry/retana/lib/presence"

export type PresenceOutlineProps = {
  selection: string
  field?: string
  children: ReactNode
  className?: string
  labelClassName?: string
}

function readField(presence: unknown, field: string) {
  if (!presence || typeof presence !== "object") return null
  const value = (presence as Record<string, unknown>)[field]
  return typeof value === "string" ? value : null
}

export function PresenceOutline({
  selection,
  field = "selection",
  children,
  className,
  labelClassName,
}: PresenceOutlineProps) {
  const others = useOthers<Record<string, unknown>, PresenceInfo>()
  const holders = others.filter((user) => readField(user.presence, field) === selection)
  const first = holders[0]
  const info = first ? readPresenceInfo(first.info) : null
  const color = first && info ? presenceColor(first.userId, info.color) : undefined
  const extra = holders.length - 1
  const label = info ? (extra > 0 ? `${info.name} +${extra}` : info.name) : ""

  return (
    <div
      className={cn("relative min-w-0 rounded-md", holders.length > 0 && "mt-2 pt-3", className)}
      style={color ? { boxShadow: `0 0 0 2px ${color}` } : undefined}
    >
      {label ? (
        <span
          className={cn(
            "absolute -top-2 start-2 z-10 max-w-[calc(100%-1rem)] truncate rounded bg-background px-1 text-xs",
            labelClassName,
          )}
          style={{ color }}
        >
          {label}
        </span>
      ) : null}
      {children}
    </div>
  )
}
