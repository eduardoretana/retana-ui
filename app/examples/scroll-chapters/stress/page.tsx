"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ScrollChapters, type ScrollChapter } from "@/registry/ui/scroll-chapters"

const token = "W".repeat(60)
const many: ScrollChapter[] = Array.from({ length: 20 }, (_, index) => ({ id: `s-${index}`, title: `Capítulo ${index + 1}`, content: <p>Texto del capítulo {index + 1}.</p> }))

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Capítulos con progreso</h1>
      <StressCase label="Vacío">
        <ScrollChapters />
      </StressCase>
      <StressCase label="Carga y error">
        <ScrollChapters loading />
        <ScrollChapters error="No se cargó la guía." />
      </StressCase>
      <StressCase label="Un capítulo, una palabra">
        <ScrollChapters chapters={[{ id: "uno", title: "Barro", content: "Barro." }]} />
      </StressCase>
      <StressCase label="320px y cadena sin espacios" width={320}>
        <ScrollChapters chapters={[{ id: "largo", title: token, content: token }]} />
      </StressCase>
      <StressCase label="Emoji, RTL y números" width={360}>
        <div dir="rtl">
          <ScrollChapters chapters={[{ id: "rtl", title: "الفرن 🔥", content: "1240 °C · ١٢٤٠" }]} />
        </div>
      </StressCase>
      <StressCase label="Veinte capítulos (índice con desplazamiento horizontal)">
        <ScrollChapters chapters={many} />
      </StressCase>
    </main>
  )
}
