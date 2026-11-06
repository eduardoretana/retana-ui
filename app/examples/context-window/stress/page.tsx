"use client"

import { useState } from "react"

import { StressCase } from "@/app/examples/stress-case"
import {
  applyContextEvent,
  applyContextEvents,
  contextTokenTotal,
  emptyContextModel,
  explainContextEvent,
  type ContextEvent,
  type ContextSource,
  type ContextWindowModel,
} from "@/registry/lib/context-window"
import { ContextWindow, contextWindowLabelsEs } from "@/registry/ui/context-window"

const token = "N".repeat(60)

function source(partial: Partial<ContextSource> & Pick<ContextSource, "id" | "label">): ContextSource {
  return {
    kind: "file",
    tokens: 100,
    status: "loaded",
    cached: false,
    cacheTokens: 0,
    pinned: false,
    ...partial,
  }
}

function many(): ContextSource[] {
  return Array.from({ length: 40 }, (_, index) =>
    source({
      id: `p${index}`,
      kind: index % 7 === 0 ? "rag" : "file",
      label: index === 3 ? token : index === 4 ? "📸 horno" : `Parte ${index + 1} del pedido de esmalte en el taller de Celaya`,
      tokens: index === 0 ? 0 : index === 1 ? 2_000_000 : 100 + index,
      pinned: index < 3,
    }),
  )
}

function PinnedCompact() {
  const [model, setModel] = useState<ContextWindowModel>(() => ({
    sources: [
      source({ id: "a", label: "Instrucciones", kind: "system", tokens: 1000, pinned: true }),
      source({ id: "b", label: "Charla", kind: "chat", tokens: 4000, pinned: true }),
    ],
    lastCompact: null,
  }))
  const [reason, setReason] = useState("aún no")
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="min-h-11 self-start rounded-md border border-border px-3"
        onClick={() => {
          const event: ContextEvent = {
            type: "compact",
            from: "b",
            to: source({ id: "resumen", label: "Resumen", kind: "chat" }),
            tokensBefore: 4000,
            tokensAfter: 400,
            note: "no",
          }
          setReason(explainContextEvent(model, event))
          setModel((current) => applyContextEvent(current, event))
        }}
      >
        Intentar compactar
      </button>
      <p>
        Resultado: {reason}. Total {contextTokenTotal(model.sources)}.
      </p>
      <ContextWindow model={model} modelLimit={8000} locale="es-MX" labels={contextWindowLabelsEs} caption="Todo está fijado." />
    </div>
  )
}

function Unordered() {
  const events: ContextEvent[] = [
    { type: "compact", from: "charla", to: source({ id: "resumen", label: "Resumen", kind: "chat" }), tokensBefore: 100, tokensAfter: 10, note: "tarde" },
    { type: "update", id: "charla", tokens: 50 },
    { type: "load", source: source({ id: "charla", label: "Charla", kind: "chat", tokens: 20 }) },
    { type: "load", source: source({ id: "charla", label: "Charla", kind: "chat", tokens: 20 }) },
    { type: "pin", id: "nadie" },
  ]
  const model = applyContextEvents(emptyContextModel(), events)
  return (
    <div className="flex flex-col gap-2">
      <p>Total {contextTokenTotal(model.sources)} después de eventos fuera de orden. No se duplica la charla.</p>
      <ContextWindow model={model} modelLimit={100} locale="es-MX" labels={contextWindowLabelsEs} />
    </div>
  )
}

export default function StressPage() {
  const crowd = many()
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Ventana de contexto</h1>
      <StressCase label="Vacío">
        <div data-preview="empty">
          <ContextWindow locale="es-MX" labels={contextWindowLabelsEs} />
        </div>
      </StressCase>
      <StressCase label="Carga y error">
        <div data-preview="loading">
          <ContextWindow loading locale="es-MX" labels={contextWindowLabelsEs} />
        </div>
        <div data-preview="error">
          <ContextWindow error="No pudimos leer la ventana. Intenta otra vez." locale="es-MX" labels={contextWindowLabelsEs} />
        </div>
      </StressCase>
      <StressCase label="Una palabra" width={320}>
        <ContextWindow modelLimit={10} locale="es-MX" labels={contextWindowLabelsEs} sources={[source({ id: "a", label: "Horno", tokens: 4 })]} />
      </StressCase>
      <StressCase label="60 caracteres sin espacios" width={320}>
        <ContextWindow modelLimit={20} locale="es-MX" labels={contextWindowLabelsEs} sources={[source({ id: "a", label: token, tokens: 9 })]} />
      </StressCase>
      <StressCase label="Varias frases">
        <ContextWindow
          modelLimit={40}
          locale="es-MX"
          labels={contextWindowLabelsEs}
          sources={[source({ id: "a", label: "El horno 2 no enciende. La ficha dice que el gas llegó tarde. Celaya espera el esmalte.", tokens: 12 })]}
        />
      </StressCase>
      <StressCase label="Emoji y RTL" width={360}>
        <ContextWindow modelLimit={20} locale="es-MX" labels={contextWindowLabelsEs} sources={[source({ id: "a", label: "📸 horno", tokens: 4 })]} />
        <div dir="rtl">
          <ContextWindow modelLimit={20} locale="es-MX" labels={contextWindowLabelsEs} sources={[source({ id: "b", label: "ملفات الفرن", tokens: 4 })]} />
        </div>
      </StressCase>
      <StressCase label="0 tokens y 2 millones">
        <ContextWindow
          modelLimit={2_000_000}
          locale="es-MX"
          labels={contextWindowLabelsEs}
          sources={[source({ id: "zero", label: "Vacío", tokens: 0 }), source({ id: "huge", label: "Archivo enorme", tokens: 2_000_000, kind: "file" })]}
        />
      </StressCase>
      <StressCase label="320px" width={320}>
        <ContextWindow modelLimit={20} locale="es-MX" labels={contextWindowLabelsEs} sources={[source({ id: "a", label: token, tokens: 9 })]} />
      </StressCase>
      <StressCase label="Apretado por un hermano">
        <div className="flex max-w-xl gap-4">
          <div className="min-w-0 flex-1">
            <ContextWindow modelLimit={20} locale="es-MX" labels={contextWindowLabelsEs} sources={[source({ id: "a", label: "Ficha del horno 2", tokens: 8 })]} />
          </div>
          <div className="w-24 shrink-0 rounded-md bg-muted" />
        </div>
      </StressCase>
      <StressCase label="Muy ancho">
        <div className="w-[1200px] max-w-full">
          <ContextWindow modelLimit={20} locale="es-MX" labels={contextWindowLabelsEs} sources={[source({ id: "a", label: "Ficha", tokens: 8 })]} />
        </div>
      </StressCase>
      <StressCase label="40 fuentes">
        <div data-preview="crowd">
          <ContextWindow sources={crowd} modelLimit={2_000_000} locale="es-MX" labels={contextWindowLabelsEs} caption="Cuarenta fuentes sintéticas." />
        </div>
      </StressCase>
      <StressCase label="Compactar con todas fijadas">
        <div data-preview="pinned">
          <PinnedCompact />
        </div>
      </StressCase>
      <StressCase label="Eventos desordenados">
        <Unordered />
      </StressCase>
      <StressCase label="390px" width={390}>
        <div data-preview="390">
          <ContextWindow
            size="sm"
            modelLimit={80_000}
            locale="es-MX"
            labels={contextWindowLabelsEs}
            caption="Tarea: ver el horno."
            sources={[
              source({ id: "s", label: "Instrucciones del taller", kind: "system", tokens: 2400, pinned: true }),
              source({ id: "c", label: "Charla del pedido", kind: "chat", tokens: 12800 }),
              source({ id: "f", label: "Ficha del horno 2", kind: "rag", tokens: 8600 }),
            ]}
          />
        </div>
      </StressCase>
      <StressCase label="Solo teclado">
        <p className="text-sm text-muted-foreground">Tab entra a la barra y a la grilla. Las flechas mueven. Enter abre el detalle. Escape lo cierra.</p>
        <ContextWindow
          modelLimit={100}
          locale="es-MX"
          labels={contextWindowLabelsEs}
          sources={[source({ id: "a", label: "Ficha", kind: "rag", tokens: 30 }), source({ id: "b", label: "Charla", kind: "chat", tokens: 40 })]}
        />
      </StressCase>
    </main>
  )
}
