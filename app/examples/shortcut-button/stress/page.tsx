"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ShortcutButton } from "@/registry/ui/shortcut-button"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Botón con atajo</h1>
      <StressCase label="320px" width={320}>
        <ShortcutButton shortcut="mod+shift+k" className="max-w-full">Guardar borrador</ShortcutButton>
      </StressCase>
      <StressCase label="Cadena larga" width={320}>
        <ShortcutButton shortcut="b" className="max-w-full">
          <span className="truncate">ConfirmaciónSinEspaciosDelAtajo</span>
        </ShortcutButton>
      </StressCase>
      <StressCase label="Deshabilitado">
        <ShortcutButton shortcut="s" disabled>Guardar</ShortcutButton>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <ShortcutButton shortcut="mod+s">حفظ</ShortcutButton>
        </div>
      </StressCase>
      <StressCase label="Diez">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }, (_, index) => (
            <ShortcutButton key={index} shortcut={String.fromCharCode(97 + (index % 26))} showShortcut={index % 2 === 0}>
              {index + 1}
            </ShortcutButton>
          ))}
        </div>
      </StressCase>
    </main>
  )
}
