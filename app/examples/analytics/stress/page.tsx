"use client"

import { StressCase } from "@/app/examples/stress-case"

import { AnalyticsOverview } from "@/registry/blocks/analytics"

const long = "a".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Analítica</h1>
      <StressCase label="320px" width={320}>
        <AnalyticsOverview shell={false} />
      </StressCase>
      <StressCase label="Vacío">
        <AnalyticsOverview shell={false} kpis={[]} channels={[]} breakdown={[]} products={[]} trends={[]} title="" />
      </StressCase>
      <StressCase label="60 caracteres y diez puntos">
        <AnalyticsOverview
          shell={false}
          title={long}
          kpis={[{ id: "k", label: long, value: "1", delta: "😀", direction: "flat" }]}
          channels={Array.from({ length: 10 }, (_, index) => ({ id: `c-${index}`, label: `Canal ${index + 1}`, amount: index }))}
          trends={Array.from({ length: 10 }, (_, index) => ({ id: `t-${index}`, label: `D${index}`, value: index }))}
          products={[{ id: "p", name: "مرحبا", revenue: "0", units: 0 }]}
        />
      </StressCase>
    </main>
  )
}
