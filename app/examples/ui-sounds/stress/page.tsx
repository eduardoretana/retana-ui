"use client"

import { Button } from "@/components/ui/button"
import { StressCase } from "@/app/examples/stress-case"
import { UiSoundsControls, playUiSound } from "@/registry/ui/ui-sounds"

const long = "ConfirmaciónSinEspaciosQueNoDebeRomperElControlDeSonidoDelCatalogo"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Sonidos de interfaz</h1>
      <StressCase label="320px" width={320}>
        <UiSoundsControls />
      </StressCase>
      <StressCase label="Una palabra">
        <Button type="button" onClick={() => playUiSound("tap")}>Ok</Button>
      </StressCase>
      <StressCase label="Cadena larga" width={320}>
        <Button type="button" className="max-w-full" onClick={() => playUiSound("attention")}>{long}</Button>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <UiSoundsControls />
        </div>
      </StressCase>
      <StressCase label="Diez cues">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }, (_, index) => (
            <Button key={index} type="button" variant="outline" size="sm" onClick={() => playUiSound("select")}>
              {index + 1}
            </Button>
          ))}
        </div>
      </StressCase>
    </main>
  )
}
