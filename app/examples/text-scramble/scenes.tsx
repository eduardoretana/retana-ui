"use client"

import { useEffect, useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, sceneText, type Scene, type SceneFrame, type SceneLocale, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { Button } from "@/components/ui/button"
import { TextScramble } from "@/registry/ui/text-scramble"

import { empty, error, filled, loading, long, terminal, type ScrambleCopy, type ScrambleFixture } from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "lg" }

const pick = (copy: ScrambleCopy, locale: SceneLocale) => (locale === "en" ? copy.en : copy.es)

/** A hero block: the title decodes once; the support line is static so it never waits on the effect. */
function Hero({ fixture, locale, log }: { fixture: ScrambleFixture } & SceneRenderProps) {
  return (
    <div className="flex flex-col gap-2">
      <TextScramble
        as="h1"
        trigger="mount"
        text={pick(fixture.title, locale)}
        className="text-2xl font-semibold tracking-tight text-balance"
        onDecoded={() => log(formatSceneCall("onDecoded"))}
      />
      {fixture.support ? <p className="text-sm text-muted-foreground">{pick(fixture.support, locale)}</p> : null}
    </div>
  )
}

function FilledScene({ locale, log }: SceneRenderProps) {
  return <Hero fixture={filled} locale={locale} log={log} />
}

function EmptyScene({ locale, log }: SceneRenderProps) {
  return (
    <div className="flex flex-col gap-2">
      <Hero fixture={empty} locale={locale} log={log} />
      <p className="text-sm text-muted-foreground">
        {sceneText(locale, "Todavía no hay texto de lanzamiento. Sin texto no hay efecto: no se muestra ruido.", "No launch copy yet. With no copy there is no effect and no noise.")}
      </p>
    </div>
  )
}

function LoadingScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim({ ready: false }, log)
  const call = sim.call
  useEffect(() => {
    void call("load", (current) => current, () => ({ ready: true }), { silent: true, delay: 900 })
  }, [call])
  if (!sim.state.ready) {
    return <SceneStatus tone="loading">{sceneText(locale, "Cargando el texto de lanzamiento…", "Loading the launch copy…")}</SceneStatus>
  }
  return <Hero fixture={loading} locale={locale} log={log} />
}

function ErrorScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim({ phase: "error" as "error" | "loading" | "ready" }, log)
  const attempt = useRef(0)
  if (sim.state.phase === "ready") return <Hero fixture={error} locale={locale} log={log} />
  return (
    <div className="flex flex-col gap-3">
      <SceneStatus tone={sim.state.phase === "loading" ? "loading" : "error"}>
        {sim.state.phase === "loading"
          ? sceneText(locale, "Volviendo a pedir el texto…", "Asking for the copy again…")
          : sceneText(locale, "No pudimos traer el texto de lanzamiento de Electrónica Cobre.", "We could not fetch the launch copy for Electrónica Cobre.")}
      </SceneStatus>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="self-start"
        disabled={sim.pending != null}
        onClick={() => {
          attempt.current += 1
          const fail = attempt.current === 1
          void sim.call(formatSceneCall("onRetry"), (current) => ({ ...current, phase: "loading" }), () => ({ phase: "ready" }), { fail })
        }}
      >
        {sceneText(locale, "Reintentar", "Retry")}
      </Button>
    </div>
  )
}

/**
 * Thematic case: a terminal product card. Two moving parts at most: the name leads at 0 ms and
 * the price follows at 90 ms. Specs, labels and buttons are static and usable from the first frame.
 */
function TerminalScene({ locale, log }: SceneRenderProps) {
  return (
    <div className="flex flex-col gap-4 font-mono">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{sceneText(locale, "Terminales", "Terminals")}</p>
        <TextScramble as="h2" trigger="mount" text={pick(terminal.name, locale)} className="text-xl font-semibold" onDecoded={() => log(formatSceneCall("onDecoded", ["name"]))} />
        <TextScramble as="p" trigger="mount" delay={90} duration={480} text={pick(terminal.price, locale)} className="text-sm tabular-nums" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => log(formatSceneCall("onAddToCart", ["cobre-84"]))}>
          {sceneText(locale, "Agregar al carrito", "Add to cart")}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => log(formatSceneCall("onSave", ["cobre-84"]))}>
          {sceneText(locale, "Guardar para después", "Save for later")}
        </Button>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {terminal.specs.map((spec) => (
          <div key={spec.label.en} className="contents">
            <dt className="text-muted-foreground">{pick(spec.label, locale)}</dt>
            <dd>{pick(spec.value, locale)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function LongScene({ locale, log }: SceneRenderProps) {
  return (
    <div className="flex flex-col gap-2">
      <TextScramble as="p" trigger="mount" text={pick(long.title, locale)} className="text-sm" onDecoded={() => log(formatSceneCall("onDecoded", ["skipped"]))} />
      <p className="text-xs text-muted-foreground">
        {sceneText(locale, "Más de 120 caracteres es texto de lectura: aparece completo, sin efecto.", "Over 120 characters is body copy: it shows in full, with no effect.")}
      </p>
    </div>
  )
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: FilledScene, frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: EmptyScene, frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: LoadingScene, frame },
  { id: "error", label: "Error", labelEn: "Error", render: ErrorScene, frame },
  { id: "terminal", label: "Ficha de terminal", labelEn: "Terminal card", render: TerminalScene, frame },
  { id: "long", label: "Texto largo", labelEn: "Long copy", render: LongScene, frame },
]
