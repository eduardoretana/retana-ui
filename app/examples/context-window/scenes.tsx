"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneMode } from "@/app/catalog/scene-mode"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { Button } from "@/components/ui/button"
import { applyContextEvent, applyContextEvents, emptyContextModel, type ContextWindowModel } from "@/registry/lib/context-window"
import { ContextWindow, contextWindowLabels, contextWindowLabelsEs } from "@/registry/ui/context-window"

import {
  cacheHeavy,
  compactAt,
  compacted,
  compactedModel,
  compacting,
  empty,
  error as broken,
  filled,
  MODEL_LIMIT,
  nearLimit,
  overLimit,
  pinned,
  playbackPlan,
  sourcesFrom,
  viewport390,
  warnAt,
  workshopPricing,
  loading,
  type PlaybackFrame,
  type WindowFixture,
} from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function WindowScene({
  locale,
  log,
  fixture,
  failEvict = false,
  model,
  width,
}: SceneRenderProps & { fixture: WindowFixture; failEvict?: boolean; model?: ContextWindowModel; width?: number }) {
  const sim = useSceneSim({ pinned: {} as Record<string, boolean>, evicted: {} as Record<string, true> }, log)
  const attempt = useRef(0)
  const seeds = sourcesFrom(fixture.seeds, locale).map((source) => {
    const pinnedOverride = sim.state.pinned[source.id]
    const next = pinnedOverride === undefined ? source : { ...source, pinned: pinnedOverride }
    return sim.state.evicted[source.id] ? { ...next, status: "evicted" as const } : next
  })
  const labels = locale === "en" ? contextWindowLabels : contextWindowLabelsEs
  const view = (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.error ? <SceneStatus tone="error">{fixture.error[locale]}</SceneStatus> : null}
      <ContextWindow
        {...(model ? { model } : { sources: seeds })}
        modelLimit={MODEL_LIMIT}
        warnAt={warnAt}
        compactAt={compactAt}
        pricing={workshopPricing}
        currency={locale === "en" ? "USD" : "MXN"}
        locale={locale === "en" ? "en-US" : "es-MX"}
        activity={fixture.activity ?? "reading"}
        caption={fixture.caption?.[locale] ?? ""}
        tooltip={fixture.tooltip?.[locale] ?? ""}
        labels={labels}
        loading={fixture.loading}
        error={sim.failed ? fixture.error?.[locale] : undefined}
        size={width ? "sm" : "default"}
        onThreshold={(hit) => log(formatSceneCall("onThreshold", [hit.kind, hit.used, hit.limit]))}
        onPinChange={async (id, next) => {
          const ok = await sim.call(formatSceneCall("onPinChange", [id, next]), (current) => ({
            ...current,
            pinned: { ...current.pinned, [id]: next },
          }))
          if (!ok) throw new Error("pin failed")
        }}
        onEvictRequest={async (id) => {
          attempt.current += 1
          const fail = failEvict && attempt.current === 1
          const ok = await sim.call(
            formatSceneCall("onEvictRequest", [id]),
            (current) => ({ ...current, evicted: { ...current.evicted, [id]: true } }),
            undefined,
            { fail },
          )
          if (!ok) throw new Error("evict failed")
        }}
      />
    </div>
  )
  if (!width) return view
  return (
    <div className="w-full max-w-full" style={{ maxWidth: width }}>
      {view}
    </div>
  )
}

function scene(fixture: WindowFixture, options: { failEvict?: boolean; model?: (locale: SceneRenderProps["locale"]) => ContextWindowModel; width?: number } = {}) {
  return function Render(props: SceneRenderProps) {
    return <WindowScene {...props} fixture={fixture} failEvict={options.failEvict} model={options.model?.(props.locale)} width={options.width} />
  }
}

export function PlaybackPanel({ locale, log }: SceneRenderProps) {
  const mode = useSceneMode()
  const plan = useMemo(() => playbackPlan(locale), [locale])
  const [epoch, setEpoch] = useState(0)
  return (
    <div className="flex flex-col gap-3">
      <Button type="button" variant="outline" className="min-h-11 self-start" onClick={() => setEpoch((current) => current + 1)}>
        {sceneText(locale, "Reiniciar recorrido", "Replay the pass")}
      </Button>
      <Player key={epoch} locale={locale} log={log} plan={plan} interactive={mode.interactive} />
    </div>
  )
}

function Player({
  locale,
  log,
  plan,
  interactive,
}: SceneRenderProps & { plan: readonly PlaybackFrame[]; interactive: boolean }) {
  const logRef = useRef(log)
  useEffect(() => {
    logRef.current = log
  }, [log])
  const labels = locale === "en" ? contextWindowLabels : contextWindowLabelsEs
  const folded = useMemo(
    () => applyContextEvents(emptyContextModel(), plan.flatMap((frame) => (frame.event ? [frame.event] : []))),
    [plan],
  )
  const [index, setIndex] = useState(0)
  const [model, setModel] = useState<ContextWindowModel>(() => emptyContextModel())

  useEffect(() => {
    if (!interactive) return undefined
    const timers = plan.map((frame, frameIndex) =>
      window.setTimeout(() => {
        setIndex(frameIndex)
        if (!frame.event) return
        const event = frame.event
        setModel((current) => applyContextEvent(current, event))
        if (event.type === "compact") logRef.current(formatSceneCall("compact", [event.from, event.tokensAfter]))
      }, frame.at),
    )
    return () => {
      for (const timer of timers) window.clearTimeout(timer)
    }
  }, [interactive, plan])

  const shownIndex = interactive ? index : Math.max(0, plan.length - 1)
  const current = plan[shownIndex] ?? plan[0]
  return (
    <ContextWindow
      model={interactive ? model : folded}
      modelLimit={MODEL_LIMIT}
      warnAt={warnAt}
      compactAt={compactAt}
      pricing={workshopPricing}
      currency={locale === "en" ? "USD" : "MXN"}
      locale={locale === "en" ? "en-US" : "es-MX"}
      activity={current?.activity ?? "reading"}
      caption={current?.caption ?? ""}
      tooltip={current?.tooltip ?? ""}
      labels={labels}
      onThreshold={(hit) => log(formatSceneCall("onThreshold", [hit.kind, hit.used, hit.limit]))}
    />
  )
}

export const scenes: Scene[] = [
  { id: "playback", label: "Recorrido", labelEn: "Playback", render: PlaybackPanel, frame },
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, { failEvict: true }), frame },
  { id: "near-limit", label: "Casi llena", labelEn: "Near limit", render: scene(nearLimit), frame },
  { id: "compacting", label: "Compactando", labelEn: "Compacting", render: scene(compacting), frame },
  { id: "compacted", label: "Compacta", labelEn: "Compacted", render: scene(compacted, { model: compactedModel }), frame },
  { id: "over-limit", label: "Sobre el límite", labelEn: "Over limit", render: scene(overLimit), frame },
  { id: "pinned", label: "Fijadas", labelEn: "Pinned", render: scene(pinned), frame },
  { id: "cache-heavy", label: "Mucha caché", labelEn: "Cache heavy", render: scene(cacheHeavy), frame },
  { id: "390", label: "390", labelEn: "390", render: scene(viewport390, { width: 390 }), frame: { size: "md", surface: "card", padding: "sm" } },
]
