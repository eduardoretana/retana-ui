"use client"

import { Button } from "@/components/ui/button"
import { StressCase } from "@/app/examples/stress-case"
import { HapticsToggle, useHaptics } from "@/registry/ui/haptics"

function Row() {
  const haptics = useHaptics()
  return (
    <Button type="button" variant="outline" onClick={() => haptics.trigger("tap")}>
      Tap
    </Button>
  )
}

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Háptica</h1>
      <StressCase label="320px" width={320}>
        <HapticsToggle mutedLabel="Activar vibración con una etiqueta larga" unmutedLabel="Quitar vibración con una etiqueta larga" />
      </StressCase>
      <StressCase label="Diez">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }, (_, index) => <Row key={index} />)}
        </div>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <HapticsToggle mutedLabel="تفعيل" unmutedLabel="إيقاف" />
        </div>
      </StressCase>
    </main>
  )
}
