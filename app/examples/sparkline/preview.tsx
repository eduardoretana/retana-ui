"use client"

import { Sparkline } from "@/registry/ui/sparkline"

export default function SparklinePreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <Sparkline className="w-full" data={[18, 22, 19, 28, 24, 31]} label="Horno" value="31" change="+7" />
    </div>
  )
}
