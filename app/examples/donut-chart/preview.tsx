"use client"

import { plans } from "@/app/examples/arc/demo-data"
import { DonutChart } from "@/registry/ui/donut-chart"

export default function DonutChartPreview() {
  return (
    <div className="flex h-full min-w-0 items-center bg-background p-3">
      <DonutChart className="w-full" size={148} thickness={18} label="Planes" totalLabel="Total" data={plans.map((plan) => ({ key: plan.id, label: plan.name, value: plan.price }))} />
    </div>
  )
}
