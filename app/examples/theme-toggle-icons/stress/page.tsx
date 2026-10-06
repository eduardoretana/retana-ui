"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ThemeToggleIcon, themeToggleIconNames } from "@/registry/ui/theme-toggle-icons"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Iconos de tema</h1>
      <StressCase label="320px" width={320}>
        <div className="flex flex-wrap gap-2">
          {themeToggleIconNames.map((name) => (
            <ThemeToggleIcon key={name} name={name} toggled aria-label={name} className="inline-flex size-9 items-center justify-center rounded-md border border-border" />
          ))}
        </div>
      </StressCase>
      <StressCase label="Etiqueta larga" width={320}>
        <ThemeToggleIcon name="classic" toggled={false} aria-label="classic" className="inline-flex max-w-full items-center gap-2 rounded-md border border-border px-2 py-1 text-sm">
          <span className="truncate">ConfirmaciónSinEspaciosDelInterruptorAnimado</span>
        </ThemeToggleIcon>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <ThemeToggleIcon name="expand" toggled aria-label="توسيع" className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1">
            توسيع
          </ThemeToggleIcon>
        </div>
      </StressCase>
    </main>
  )
}
