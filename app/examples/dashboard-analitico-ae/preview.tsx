"use client"

import { DashboardAnaliticoAe } from "@/registry/blocks/ae/dashboard-analitico-ae"

export default function Preview() {
  return (
    <div className="ae-ember h-full overflow-hidden bg-background">
      <div className="origin-top-left scale-[0.3] [width:333%]">
        <DashboardAnaliticoAe />
      </div>
    </div>
  )
}
