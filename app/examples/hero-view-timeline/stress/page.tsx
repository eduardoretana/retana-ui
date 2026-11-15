"use client"

import { StressCase } from "@/app/examples/stress-case"
import { Button } from "@/components/ui/button"
import { HeroViewTimeline } from "@/registry/ui/hero-view-timeline"

const token = "W".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Hero con view-timeline</h1>
      <StressCase label="Vacío">
        <HeroViewTimeline headingAs="h2" />
      </StressCase>
      <StressCase label="Carga y error">
        <HeroViewTimeline headingAs="h2" loading />
        <HeroViewTimeline headingAs="h2" title="Vajillas por encargo" error="No se cargó la agenda." />
      </StressCase>
      <StressCase label="Una palabra">
        <HeroViewTimeline headingAs="h2" title="Barro" />
      </StressCase>
      <StressCase label="320px y cadena sin espacios" width={320}>
        <HeroViewTimeline headingAs="h2" title={token} lead={token} actions={<Button>{token}</Button>} />
      </StressCase>
      <StressCase label="Emoji, RTL y números" width={360}>
        <div dir="rtl">
          <HeroViewTimeline headingAs="h2" title="ورشة الخزف 🏺 منذ ١٩٩٨" lead="1240 °C" />
        </div>
      </StressCase>
    </main>
  )
}
