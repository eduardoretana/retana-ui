"use client"

import { StressCase } from "@/app/examples/stress-case"
import { MessageCardMetric } from "@/registry/ui/message-card-metric"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tarjeta de métrica</h1>
      <StressCase label="Vacío"><MessageCardMetric state="empty" emptyLabel="Sin métrica" /></StressCase>
      <StressCase label="320px" width={320}><MessageCardMetric title={token} value="1 %" filled={1} total={10} start={token} end={token} /></StressCase>
      <StressCase label="RTL" width={320}><div dir="rtl"><MessageCardMetric title={token} value="1 %" filled={1} total={10} start={token} end={token} /></div></StressCase>
    </main>
  )
}
