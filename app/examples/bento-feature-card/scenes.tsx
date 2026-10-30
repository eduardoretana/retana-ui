"use client"

import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { BentoCell, BentoGrid } from "@/registry/ui/bento-grid"
import { BentoFeatureCard, type BentoFeatureLayout } from "@/registry/ui/bento-feature-card"

import { filled, long, mixed, noCta, noMedia, single, type BentoLocaleCopy } from "./fixtures"
import { bentoIcons, BentoSketch } from "../bento-grid/media"

const frame: SceneFrame = { size: "lg", surface: "canvas", padding: "md" }
const wide: SceneFrame = { size: "desk", surface: "canvas", padding: "md" }

function copyOf(pack: { es: BentoLocaleCopy; en: BentoLocaleCopy }, locale: SceneRenderProps["locale"]) {
  return locale === "en" ? pack.en : pack.es
}

function CardWall({
  pack,
  locale,
  layout = "media-first",
  status = "ready",
}: {
  pack: { es: BentoLocaleCopy; en: BentoLocaleCopy }
  locale: SceneRenderProps["locale"]
  layout?: BentoFeatureLayout
  status?: "ready" | "loading" | "empty" | "error"
}) {
  const copy = copyOf(pack, locale)
  return (
    <BentoGrid
      label={sceneText(locale, "Muro del taller", "Studio wall")}
      columns={4}
      status={status === "ready" ? undefined : status}
      emptyLabel={copy.emptyLabel}
      loadingLabel={copy.loadingLabel}
      errorLabel={copy.errorLabel}
    >
      {copy.cells.map((cell) => (
        <BentoCell key={cell.id} span={cell.span}>
          <BentoFeatureCard
            layout={layout}
            title={cell.title}
            description={cell.description}
            cta={cell.cta}
            href={status === "ready" ? cell.href : undefined}
            icon={bentoIcons[cell.icon]}
            illustration={cell.media ? <BentoSketch id={cell.id} /> : undefined}
            status={copy.cells.length === 1 ? status : "ready"}
            emptyLabel={copy.emptyLabel}
            loadingLabel={copy.loadingLabel}
            errorLabel={copy.errorLabel}
          />
        </BentoCell>
      ))}
    </BentoGrid>
  )
}

function OneCard({
  locale,
  status,
}: {
  locale: SceneRenderProps["locale"]
  status: "empty" | "loading" | "error"
}) {
  const copy = copyOf(filled, locale)
  return (
    <BentoFeatureCard
      status={status}
      title={copy.cells[0]?.title}
      description={copy.cells[0]?.description}
      emptyLabel={copy.emptyLabel}
      loadingLabel={copy.loadingLabel}
      errorLabel={copy.errorLabel}
      href="#horno"
    />
  )
}

function FilledScene({ locale }: SceneRenderProps) {
  return <CardWall pack={single} locale={locale} />
}

function EmptyScene({ locale }: SceneRenderProps) {
  return <OneCard locale={locale} status="empty" />
}

function LoadingScene({ locale }: SceneRenderProps) {
  return <OneCard locale={locale} status="loading" />
}

function ErrorScene({ locale }: SceneRenderProps) {
  return <OneCard locale={locale} status="error" />
}

function LongScene({ locale }: SceneRenderProps) {
  return <CardWall pack={long} locale={locale} />
}

function NoCtaScene({ locale }: SceneRenderProps) {
  return <CardWall pack={noCta} locale={locale} />
}

function NoMediaScene({ locale }: SceneRenderProps) {
  return <CardWall pack={noMedia} locale={locale} />
}

function MixedScene({ locale }: SceneRenderProps) {
  return <CardWall pack={mixed} locale={locale} />
}

function SingleScene({ locale }: SceneRenderProps) {
  return <CardWall pack={single} locale={locale} />
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: FilledScene, frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: EmptyScene, frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: LoadingScene, frame },
  { id: "error", label: "Error", labelEn: "Error", render: ErrorScene, frame },
  { id: "long", label: "Texto largo", labelEn: "Long text", render: LongScene, frame },
  { id: "no-cta", label: "Sin CTA", labelEn: "No CTA", render: NoCtaScene, frame },
  { id: "no-media", label: "Sin ilustración", labelEn: "No illustration", render: NoMediaScene, frame },
  { id: "mixed", label: "Celdas mixtas", labelEn: "Mixed cells", render: MixedScene, frame: wide },
  { id: "single", label: "Una celda", labelEn: "Single cell", render: SingleScene, frame },
]
