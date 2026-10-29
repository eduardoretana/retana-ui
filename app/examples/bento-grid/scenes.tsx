"use client"

import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { BentoCell, BentoGrid } from "@/registry/ui/bento-grid"
import { BentoFeatureCard, type BentoFeatureLayout } from "@/registry/ui/bento-feature-card"

import { empty, error, filled, loading, long, mixed, noCta, noMedia, single, type BentoLocaleCopy } from "./fixtures"
import { bentoIcons, BentoSketch } from "./media"

const frame: SceneFrame = { size: "desk", surface: "canvas", padding: "md" }

function copyOf(pack: { es: BentoLocaleCopy; en: BentoLocaleCopy }, locale: SceneRenderProps["locale"]) {
  return locale === "en" ? pack.en : pack.es
}

function Wall({
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
            href={cell.href}
            icon={bentoIcons[cell.icon]}
            illustration={cell.media ? <BentoSketch id={cell.id} /> : undefined}
          />
        </BentoCell>
      ))}
    </BentoGrid>
  )
}

function FilledScene({ locale }: SceneRenderProps) {
  return <Wall pack={filled} locale={locale} />
}

function EmptyScene({ locale }: SceneRenderProps) {
  return <Wall pack={empty} locale={locale} status="empty" />
}

function LoadingScene({ locale }: SceneRenderProps) {
  return <Wall pack={loading} locale={locale} status="loading" />
}

function ErrorScene({ locale }: SceneRenderProps) {
  return <Wall pack={error} locale={locale} status="error" />
}

function LongScene({ locale }: SceneRenderProps) {
  return <Wall pack={long} locale={locale} />
}

function MixedScene({ locale }: SceneRenderProps) {
  return <Wall pack={mixed} locale={locale} />
}

function SingleScene({ locale }: SceneRenderProps) {
  return <Wall pack={single} locale={locale} />
}

function NoCtaScene({ locale }: SceneRenderProps) {
  return <Wall pack={noCta} locale={locale} />
}

function NoMediaScene({ locale }: SceneRenderProps) {
  return <Wall pack={noMedia} locale={locale} />
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: FilledScene, frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: EmptyScene, frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: LoadingScene, frame },
  { id: "error", label: "Error", labelEn: "Error", render: ErrorScene, frame },
  { id: "long", label: "Texto largo", labelEn: "Long text", render: LongScene, frame },
  { id: "mixed", label: "Celdas mixtas", labelEn: "Mixed cells", render: MixedScene, frame },
  { id: "single", label: "Una celda", labelEn: "Single cell", render: SingleScene, frame },
  { id: "no-cta", label: "Sin CTA", labelEn: "No CTA", render: NoCtaScene, frame },
  { id: "no-media", label: "Sin ilustración", labelEn: "No illustration", render: NoMediaScene, frame },
]
