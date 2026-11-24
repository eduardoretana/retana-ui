"use client"

import { StressCase } from "@/app/examples/stress-case"
import { SCRAMBLE_MAX_CHARS, TextScramble } from "@/registry/ui/text-scramble"

const atCap = "b".repeat(SCRAMBLE_MAX_CHARS)
const overCap = "c".repeat(SCRAMBLE_MAX_CHARS + 1)
const headings = Array.from({ length: 20 }, (_, i) => `Consola Cobre ${String(i + 1).padStart(2, "0")}`)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Texto que se descifra</h1>
      <StressCase label="320px, título que se parte en tres líneas" width={320}>
        <TextScramble as="h2" trigger="mount" text="Consola Cobre 84, ensamblada a mano y lista para enviar" className="text-2xl font-semibold" />
      </StressCase>
      <StressCase label="Monoespaciada y cifras tabulares">
        <TextScramble as="p" trigger="mount" text="$18,400 MXN · 84 teclas · 6.2 kg" className="font-mono text-lg tabular-nums" />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <TextScramble as="h2" trigger="mount" text="مرحبا بالعالم الجديد" className="text-xl font-semibold" />
        </div>
      </StressCase>
      <StressCase label="Acentos, ñ y emoji">
        <TextScramble as="p" trigger="mount" text="Año nuevo, señal más clara 🚀" className="text-lg" />
      </StressCase>
      <StressCase label="Una letra, vacío y solo espacios">
        <div className="flex flex-col gap-1 text-sm">
          <TextScramble trigger="mount" text="x" />
          <TextScramble trigger="mount" text="" />
          <TextScramble trigger="mount" text="   " />
        </div>
      </StressCase>
      <StressCase label={`Tope: ${SCRAMBLE_MAX_CHARS} caracteres anima, ${SCRAMBLE_MAX_CHARS + 1} no`}>
        <div className="flex flex-col gap-2 text-sm">
          <TextScramble as="p" trigger="mount" text={atCap} className="break-all" />
          <TextScramble as="p" trigger="mount" text={overCap} className="break-all" />
        </div>
      </StressCase>
      <StressCase label="Veinte títulos a la vez (al entrar en pantalla)">
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {headings.map((text) => (
            <TextScramble key={text} as="p" text={text} />
          ))}
        </div>
      </StressCase>
    </main>
  )
}
