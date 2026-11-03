"use client"

import { StressCase } from "@/app/examples/stress-case"
import { PrCreateCard, prCreateCardLabelsEs } from "@/registry/ui/pr-create-card"

const long = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tarjeta de pull request</h1>
      <StressCase label="390 px" width={390}>
        <PrCreateCard
          open
          title={long}
          number={42}
          state="open"
          diffStat={{ add: 1280, del: 640 }}
          labels={prCreateCardLabelsEs}
          commits={[{ sha: long, message: long, author: "Noa 😀", timeLabel: "ahora", branches: [long] }]}
        />
      </StressCase>
      <StressCase label="320 px y RTL" width={320}>
        <div dir="rtl">
          <PrCreateCard
            open
            title="حفظ رقم الفرن"
            state="open"
            diffStat={{ add: 1, del: 0 }}
            labels={prCreateCardLabelsEs}
            commits={[{ sha: "aaa", message: "ملاحظة", author: "نوى", timeLabel: "الآن" }]}
          />
        </div>
      </StressCase>
      <StressCase label="Vacío, una palabra y chip cerrado">
        <PrCreateCard title="" state="closed" labels={prCreateCardLabelsEs} />
        <PrCreateCard title="A" state="open" defaultOpen labels={prCreateCardLabelsEs} commits={[]} />
        <PrCreateCard title="Cerrado" state="creating" diffStat={{ add: 86, del: 12 }} labels={prCreateCardLabelsEs} />
      </StressCase>
    </main>
  )
}
