"use client"

import type { Scene, SceneFrame, SceneRenderProps } from "@/app/catalog/scene-types"
import { useWebSceneMotion, WebScrollStage } from "@/app/examples/web-scroll-stage"
import { ScrollChapters } from "@/registry/ui/scroll-chapters"

import { chaptersLabels, empty, error as broken, filled, loading, long, type ChaptersFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function ChaptersScene({ locale, fixture, still = false }: SceneRenderProps & { fixture: ChaptersFixture; still?: boolean }) {
  const motion = useWebSceneMotion()
  return (
    <WebScrollStage locale={locale} lead={false}>
      <ScrollChapters
        chapters={fixture.chapters[locale].map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          content: chapter.paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-3">
              {paragraph}
            </p>
          )),
        }))}
        loading={fixture.loading}
        error={fixture.error?.[locale]}
        labels={chaptersLabels(locale)}
        motion={still ? "off" : motion}
      />
    </WebScrollStage>
  )
}

function scene(fixture: ChaptersFixture, still = false) {
  return function Render(props: SceneRenderProps) {
    return <ChaptersScene {...props} fixture={fixture} still={still} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "long", label: "Títulos largos", labelEn: "Long titles", render: scene(long), frame },
  { id: "static", label: "Sin soporte", labelEn: "No support", render: scene(filled, true), frame },
]
