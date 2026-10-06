"use client"

import { useEffect, useRef, useState } from "react"
import { useMotionValueEvent } from "motion/react"

import { clampUnit, useScrollProgress } from "@/registry/hooks/use-scroll-progress"

export default function Preview() {
  const ref = useRef<HTMLDivElement>(null)
  const { progress } = useScrollProgress({ container: ref })
  const [value, setValue] = useState(0)
  useMotionValueEvent(progress, "change", (next) => setValue(clampUnit(next)))
  useEffect(() => {
    const node = ref.current
    if (!node) return
    node.scrollTop = (node.scrollHeight - node.clientHeight) * 0.45
  }, [])

  return (
    <div ref={ref} className="h-full overflow-y-auto bg-background">
      <p className="sticky top-0 bg-background px-3 py-2 text-sm tabular-nums">{Math.round(value * 100) / 100}</p>
      <div className="h-48" />
    </div>
  )
}
