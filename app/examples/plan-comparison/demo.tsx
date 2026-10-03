"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { plans, unbreakable } from "@/app/examples/arc/demo-data"
import { PlanComparison, type PlanFeature } from "@/registry/blocks/plan-comparison"

const crowded: PlanFeature[] = plans.flatMap((plan, index) =>
  Array.from({ length: 4 }, (_, row) => ({
    label: `${plan.name} ${row + 1}`,
    studio: index === 0 ? "Included" : "Not included",
    workshop: "Included",
    shared: index === 2 && row === 0,
  })),
)

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <PlanComparison />
      <StressCases
        empty={<PlanComparison features={[]} title="Sin rasgos" description={plans[0].detail} />}
        long={<PlanComparison title={unbreakable} description={unbreakable} />}
        crowded={<PlanComparison features={crowded} />}
      />
    </div>
  )
}
