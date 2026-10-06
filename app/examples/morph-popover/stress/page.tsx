"use client"

import { StressCase } from "@/app/examples/stress-case"
import { MorphPopover } from "@/registry/ui/morph-popover"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Popover que crece</h1>
      <StressCase label="320px" width={320}>
        <MorphPopover label="Acciones" title="ConfirmaciónSinEspaciosDentroDelPopover">
          <p className="text-sm">Una palabra</p>
        </MorphPopover>
      </StressCase>
      <StressCase label="Vacío">
        <MorphPopover label="Vacío" />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <MorphPopover label="قائمة" title="خيارات">
            <p className="text-sm">عنصر</p>
          </MorphPopover>
        </div>
      </StressCase>
      <StressCase label="Diez">
        <div className="flex max-w-full flex-wrap gap-2">
          {Array.from({ length: 10 }, (_, index) => (
            <MorphPopover key={index} label={String(index + 1)} title="Item" />
          ))}
        </div>
      </StressCase>
    </main>
  )
}
