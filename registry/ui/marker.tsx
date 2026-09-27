"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type MarkerProps = {
  children: React.ReactNode
  className?: string
  highlightClassName?: string
}

export function Marker({ children, className, highlightClassName }: MarkerProps) {
  return (
    <span data-slot="marker" className={cn("relative inline", className)}>
      <style>{"@keyframes retana-marker{from{transform:scaleX(0)}to{transform:scaleX(1)}}"}</style>
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-[0.08em] h-[0.45em] origin-left rounded-sm bg-primary/25 motion-safe:animate-[retana-marker_700ms_ease-out_both]",
          highlightClassName,
        )}
      />
      <span className="relative">{children}</span>
    </span>
  )
}
