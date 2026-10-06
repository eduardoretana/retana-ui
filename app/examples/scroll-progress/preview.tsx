"use client"

import { useEffect, useRef } from "react"

import { ScrollProgress } from "@/registry/ui/scroll-progress"

export default function Preview() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    node.scrollTop = (node.scrollHeight - node.clientHeight) * 0.55
  }, [])
  return (
    <div ref={ref} className="h-full overflow-y-auto bg-background">
      <ScrollProgress container={ref} label="Lectura" showValue />
      <div className="h-64" />
    </div>
  )
}
