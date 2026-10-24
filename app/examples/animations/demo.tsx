"use client"

import { useRef, useState } from "react"
import Link from "next/link"

import { MotionPreferenceControl } from "@/registry/ui/motion-preference"
import { ParallaxLayers } from "@/registry/ui/parallax-layers"
import { PinnedSteps } from "@/registry/ui/pinned-steps"
import { RevealOnScroll } from "@/registry/ui/reveal-on-scroll"
import { ScrollLinked } from "@/registry/ui/scroll-linked"
import { ScrollProgress } from "@/registry/ui/scroll-progress"
import { ScrollSnapPanel, ScrollSnapRail } from "@/registry/ui/scroll-snap-rail"
import { StaggerItem, StaggerReveal } from "@/registry/ui/stagger-reveal"
import { StickySectionList } from "@/registry/ui/sticky-section-list"
import { HorizontalScrollRail } from "@/registry/ui/horizontal-scroll-rail"
import { TextReveal } from "@/registry/ui/text-reveal"

const pieces = [
  ["use-scroll-progress", "Hook 0–1"],
  ["scroll-progress", "Barra de lectura"],
  ["reveal-on-scroll", "Entrada al viewport"],
  ["stagger-reveal", "Cascada"],
  ["scroll-snap-rail", "Snap"],
  ["sticky-section-list", "Encabezados fijos"],
  ["parallax-layers", "Paralaje"],
  ["horizontal-scroll-rail", "Riel horizontal"],
  ["pinned-steps", "Pasos fijos"],
  ["scroll-linked", "Efecto ligado al scroll"],
  ["text-reveal", "Palabras ligadas al scroll"],
  ["use-min-width", "Corte de ancho"],
] as const

const notes = [
  "El horno 2 sube a cono 6. La curva se anota cada veinte minutos.",
  "La primera meseta seca el cuerpo. La segunda funde el esmalte de ceniza.",
  "Al bajar, la puerta sigue cerrada hasta que el pirómetro marca 200.",
  "Inés firma la bitácora. Mateo anota el lote de feldespato.",
  "El cono empieza a doblar a la hora prevista. Nadie abre la mirilla.",
  "La meseta de esmalte dura doce minutos. Luego la curva baja sola.",
  "El pirómetro y el cono no coinciden. Se anota la diferencia.",
  "El final del texto es el final del rango.",
]

export function Demo() {
  const reader = useRef<HTMLDivElement>(null)
  const linked = useRef<HTMLDivElement>(null)
  const reveals = useRef<HTMLDivElement>(null)
  const stagger = useRef<HTMLDivElement>(null)
  const [replay, setReplay] = useState(0)

  return (
    <div className="flex flex-col gap-14">
      <MotionPreferenceControl label="Movimiento" />

      <section className="flex flex-col gap-3">
        <Term kicker="Scroll-triggered" title="Entra al llegar" body="Fade, slide o scale, una sola vez, cuando el bloque cruza el recuadro." />
        <button type="button" className="self-start rounded-md border border-border px-3 py-1 text-sm" onClick={() => setReplay((value) => value + 1)}>
          Repetir
        </button>
        <div key={replay} ref={reveals} className="flex h-80 flex-col gap-4 overflow-y-auto rounded-xl border border-border p-4">
          <RevealOnScroll root={reveals} variant="fade" className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium">Fade</p>
            <p className="text-sm text-muted-foreground">La nota aparece sin desplazarse.</p>
          </RevealOnScroll>
          <RevealOnScroll root={reveals} variant="slide" className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium">Slide</p>
            <p className="text-sm text-muted-foreground">Sube unos píxeles y se queda.</p>
          </RevealOnScroll>
          <RevealOnScroll root={reveals} variant="scale" className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium">Scale</p>
            <p className="text-sm text-muted-foreground">Crece apenas al entrar.</p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Term kicker="Scroll-linked" title="Ligado al scroll" body="Fade, subida, escala o giro. El avance es la posición, no una reproducción." />
        <div ref={linked} className="h-72 overflow-y-auto rounded-xl border border-border">
          <div className="h-36" />
          <div className="flex flex-col gap-4 px-4">
            {(
              [
                ["fade", "Fade", "Aparece con el avance del recuadro."],
                ["rise", "Subida", "Termina antes, en un rango más corto."],
                ["scale", "Escala", "Crece mientras cruza."],
                ["rotate", "Giro", "Se endereza con el scroll."],
              ] as const
            ).map(([preset, title, body]) => (
              <ScrollLinked
                key={preset}
                preset={preset}
                container={linked}
                range={preset === "rise" ? [0, 0.45] : [0, 1]}
                className="rounded-xl border border-border bg-card p-4"
              >
                <p className="text-sm font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{body}</p>
              </ScrollLinked>
            ))}
          </div>
          <div className="h-36" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Term kicker="Parallax" title="Capas a distinta velocidad" body="El disco, la loma y la ficha no comparten el mismo paso. Con movimiento reducido no se desplazan." />
        <ParallaxLayers
          label="Costa al atardecer"
          className="h-72 rounded-xl border border-border"
          layers={[
            {
              id: "sky",
              speed: 0.15,
              decorative: true,
              className: "bg-muted",
              children: <span className="absolute top-8 right-10 size-14 rounded-full bg-accent" />,
            },
            {
              id: "ridge",
              speed: 0.45,
              decorative: true,
              children: <span className="absolute inset-x-0 bottom-16 h-24 rounded-t-[2rem] bg-secondary" />,
            },
            {
              id: "note",
              speed: 0.9,
              children: (
                <span className="absolute inset-x-5 bottom-5 rounded-xl border border-border bg-card px-4 py-3 text-sm">
                  El disco baja más lento que la loma.
                </span>
              ),
            },
          ]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <Term kicker="Sticky" title="El encabezado se queda" body="A, B y C se pegan al borde hasta que el siguiente grupo los empuja." />
        <div className="h-80 overflow-y-auto rounded-xl border border-border">
          <StickySectionList
            label="Directorio del taller"
            sections={[
              {
                id: "a",
                label: "A",
                items: [
                  { id: "ana", title: "Ana Solís", detail: "Horno" },
                  { id: "aura", title: "Aura Vidal", detail: "Galería" },
                ],
              },
              {
                id: "b",
                label: "B",
                items: [
                  { id: "bruno", title: "Bruno Peña", detail: "Esmalte" },
                  { id: "belen", title: "Belén Marín", detail: "Empaque" },
                ],
              },
              {
                id: "c",
                label: "C",
                items: [
                  { id: "cira", title: "Cira Neri", detail: "Cuentas" },
                  { id: "cleo", title: "Cleo Arce", detail: "Horno" },
                  { id: "cruz", title: "Cruz Beltrán", detail: "Galería" },
                ],
              },
            ]}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Term
          kicker="Pin"
          title="La visual se queda"
          body="Los pasos siguen en el flujo. La columna de la izquierda se pega y cambia al paso que cruza el centro. En estrecho, o con movimiento reducido, cada paso lleva su visual."
        />
        <PinnedSteps
          label="Quema del sábado"
          steps={[
            {
              id: "dry",
              title: "Secado",
              body: "La puerta queda entreabierta hasta que el pie suena seco.",
              decorative: true,
              visual: <span className="absolute inset-0 rounded-xl bg-muted" />,
            },
            {
              id: "glaze",
              title: "Esmalte",
              body: "La meseta de ceniza dura doce minutos. El cono empieza a doblar.",
              visual: (
                <span className="absolute inset-0 flex flex-col justify-end rounded-xl border border-border bg-card p-4">
                  <span className="text-xs text-muted-foreground">Pirómetro</span>
                  <span className="text-2xl font-semibold tabular-nums">1.220 °C</span>
                </span>
              ),
            },
            {
              id: "cool",
              title: "Bajada",
              body: "La puerta sigue cerrada hasta los 200. El choque térmico parte los bordes.",
              visual: (
                <span className="absolute inset-0 flex items-end rounded-xl border border-border bg-secondary p-4 text-sm">
                  Inés firma la bitácora.
                </span>
              ),
            },
          ]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <Term kicker="Scroll snap" title="Se alinea al soltar" body="Tres etapas a pantalla del recuadro. El snap es del navegador." />
        <ScrollSnapRail label="Etapas del horno" className="h-64 rounded-xl border border-border">
          {[
            ["01", "Secado", "La puerta entreabierta hasta que el pie suena seco."],
            ["02", "Esmalte", "Meseta corta. El cono empieza a doblar."],
            ["03", "Bajada", "Sin abrir. El choque térmico parte los bordes."],
          ].map(([id, title, body]) => (
            <ScrollSnapPanel key={id} className="flex h-full flex-col justify-end gap-1 p-6">
              <p className="text-5xl font-semibold tabular-nums text-muted-foreground">{id}</p>
              <h3 className="text-lg font-medium">{title}</h3>
              <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
            </ScrollSnapPanel>
          ))}
        </ScrollSnapRail>
      </section>

      <section className="flex flex-col gap-3">
        <Term
          kicker="Horizontal scroll"
          title="La fila avanza con la página"
          body="En ancho, esta sección se estira y el scroll vertical mueve las tarjetas. En estrecho, o con movimiento reducido, la fila se desplaza en horizontal."
        />
        <HorizontalScrollRail label="Piezas en el horno" paneClassName="h-48">
          {[
            ["Cuenco de ceniza", "Cono 6"],
            ["Jarra de sal", "Cono 10"],
            ["Taza de taller", "Cono 6"],
            ["Plato ovalado", "Cono 7"],
            ["Florero corto", "Cono 6"],
          ].map(([title, meta]) => (
            <article key={title} tabIndex={0} className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-medium">{title}</h3>
              <p className="text-xs text-muted-foreground">{meta}</p>
            </article>
          ))}
        </HorizontalScrollRail>
      </section>

      <section className="flex flex-col gap-3">
        <Term kicker="Stagger" title="Uno después de otro" body="La cascada reparte la entrada entre las tarjetas. No es el mismo gesto que un solo fade." />
        <div key={`stagger-${replay}`} ref={stagger} className="h-56 overflow-y-auto rounded-xl border border-border p-4">
          <div className="h-40" />
          <StaggerReveal root={stagger} className="grid grid-cols-2 gap-3">
            {["Ceniza", "Feldespato", "Sílice", "Ball clay"].map((name) => (
              <StaggerItem key={name} className="rounded-xl border border-border bg-muted px-3 py-4 text-sm">
                {name}
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Term
          kicker="Text reveal"
          title="La frase sigue el scroll"
          body="Cada palabra pasa de casi invisible a opaca al entrar. Al montarse, el mismo componente sube una vez. Con movimiento reducido el texto está completo."
        />
        <TextReveal as="h2" trigger="scroll" text={"El horno de Oaxaca\nabre el sábado"} className="text-3xl font-semibold tracking-tight" />
      </section>

      <section className="flex flex-col gap-3">
        <Term kicker="Progress bar" title="La barra es la posición" body="De 0 a 1, ligada al texto. No se reproduce: se arrastra. El valor accesible sale del hook." />
        <div ref={reader} className="h-64 overflow-y-auto rounded-xl border border-border">
          <ScrollProgress container={reader} label="Lectura del horno" showValue />
          <article className="flex flex-col gap-4 p-4 text-sm leading-6">
            {notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </article>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Piezas</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {pieces.map(([name, use]) => (
            <li key={name}>
              <Link href={`/items/${name}`} className="font-medium underline-offset-2 hover:underline">
                {name}
              </Link>
              <span className="text-muted-foreground"> — {use}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Term({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{kicker}</p>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="max-w-xl text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
