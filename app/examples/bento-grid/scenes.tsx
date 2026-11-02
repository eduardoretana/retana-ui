"use client"

import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { BentoCell, BentoGrid } from "@/registry/ui/bento-grid"
import { BentoFeatureCard, type BentoFeatureLayout } from "@/registry/ui/bento-feature-card"

import {
  empty,
  error,
  filled,
  loading,
  long,
  mixed,
  noCta,
  noMedia,
  presets,
  single,
  sizeLg,
  sizeSm,
  sizeTall,
  sizeWide,
  type BentoLocaleCopy,
} from "./fixtures"
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
        <BentoCell key={cell.id} span={cell.span} size={cell.size}>
          <BentoFeatureCard
            layout={layout}
            size={cell.size}
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

function SizeSmScene({ locale }: SceneRenderProps) {
  return <Wall pack={sizeSm} locale={locale} />
}

function SizeWideScene({ locale }: SceneRenderProps) {
  return <Wall pack={sizeWide} locale={locale} />
}

function SizeTallScene({ locale }: SceneRenderProps) {
  return <Wall pack={sizeTall} locale={locale} />
}

function SizeLgScene({ locale }: SceneRenderProps) {
  return <Wall pack={sizeLg} locale={locale} />
}

function PresetsScene({ locale }: SceneRenderProps) {
  return <Wall pack={presets} locale={locale} />
}

function MediaFirstScene({ locale }: SceneRenderProps) {
  return <Wall pack={presets} locale={locale} layout="media-first" />
}

function CopyFirstScene({ locale }: SceneRenderProps) {
  return <Wall pack={presets} locale={locale} layout="copy-first" />
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
  { id: "size-sm", label: "Compacta", labelEn: "Compact", render: SizeSmScene, frame },
  { id: "size-wide", label: "Ancha", labelEn: "Wide", render: SizeWideScene, frame },
  { id: "size-tall", label: "Alta", labelEn: "Tall", render: SizeTallScene, frame },
  { id: "size-lg", label: "Grande", labelEn: "Large", render: SizeLgScene, frame },
  { id: "presets", label: "Presets", labelEn: "Presets", render: PresetsScene, frame },
  { id: "media-first", label: "Dibujo primero", labelEn: "Media first", render: MediaFirstScene, frame },
  { id: "copy-first", label: "Texto primero", labelEn: "Copy first", render: CopyFirstScene, frame },
]
