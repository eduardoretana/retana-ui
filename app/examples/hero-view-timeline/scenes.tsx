"use client"

import type { Scene, SceneFrame, SceneRenderProps } from "@/app/catalog/scene-types"
import { useWebSceneMotion, WebScrollStage } from "@/app/examples/web-scroll-stage"
import { Button } from "@/components/ui/button"
import { HeroViewTimeline } from "@/registry/ui/hero-view-timeline"

import { empty, error as broken, filled, heroLabels, loading, long, type HeroFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function HeroScene({ locale, log, fixture, still = false }: SceneRenderProps & { fixture: HeroFixture; still?: boolean }) {
  const motion = useWebSceneMotion()
  const copy = fixture.copy[locale]
  return (
    <WebScrollStage locale={locale} lead={false}>
      <HeroViewTimeline
        headingAs="h2"
        eyebrow={copy.eyebrow}
        title={copy.title}
        lead={copy.lead}
        actions={
          <>
            <Button onClick={() => log("onPrimary()")}>{copy.primary}</Button>
            <Button variant="outline" onClick={() => log("onSecondary()")}>
              {copy.secondary}
            </Button>
          </>
        }
        loading={fixture.loading}
        error={fixture.error?.[locale]}
        labels={heroLabels(locale)}
        motion={still ? "off" : motion}
        className="min-h-[24rem]"
      />
      <div aria-hidden="true" className="h-96" />
    </WebScrollStage>
  )
}

function scene(fixture: HeroFixture, still = false) {
  return function Render(props: SceneRenderProps) {
    return <HeroScene {...props} fixture={fixture} still={still} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "long", label: "Titular largo", labelEn: "Long headline", render: scene(long), frame },
  { id: "static", label: "Sin soporte", labelEn: "No support", render: scene(filled, true), frame },
]
