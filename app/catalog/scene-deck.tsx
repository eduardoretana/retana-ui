"use client"

import { Suspense, useEffect, useState } from "react"
import { MotionConfig } from "motion/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { captureLocale, captureReduced } from "@/app/catalog/capture-query"
import { SceneFrameView } from "@/app/catalog/scene-frame"
import { SceneModeProvider } from "@/app/catalog/scene-mode"
import { sceneText, type Scene, type SceneLocale } from "@/app/catalog/scene-types"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export const PLP_SCENE_MESSAGE = "retana:plp-scene"

function SceneDeckInner({ scenes }: { scenes: readonly Scene[] }) {
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const requested = params.get("scene")
  const selected = scenes.find((scene) => scene.id === requested) ?? scenes[0]
  const [locale, setLocale] = useState<SceneLocale>(captureLocale(params.get("locale")))
  const [reduced, setReduced] = useState(captureReduced(params.get("motion")))
  const [epoch, setEpoch] = useState(0)

  useEffect(() => {
    if (!selected || window.parent === window) return
    window.parent.postMessage({ type: PLP_SCENE_MESSAGE, scene: selected.id }, window.location.origin)
  }, [selected])

  if (!selected) return null

  function select(id: string) {
    const next = new URLSearchParams(params.toString())
    next.set("scene", id)
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }

  function log(line: string) {
    toast(line, {
      description: sceneText(locale, "Callback de la pieza", "Component callback"),
    })
  }

  const Render = selected.render

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label={sceneText(locale, "Estados", "States")} className="flex flex-wrap gap-1">
          {scenes.map((scene) => {
            const pressed = scene.id === selected.id
            return (
              <button
                key={scene.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => select(scene.id)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs",
                  pressed ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {locale === "en" ? scene.labelEn : scene.label}
              </button>
            )
          })}
        </div>
        <div className="ms-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEpoch((current) => current + 1)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            {sceneText(locale, "Reiniciar", "Reset")}
          </button>
          <div role="group" aria-label={sceneText(locale, "Idioma de las etiquetas", "Label language")} className="flex gap-1">
            {(["es", "en"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={locale === option}
                onClick={() => setLocale(option)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs uppercase",
                  locale === option ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 px-1 text-xs text-muted-foreground">
            <Switch
              size="sm"
              checked={reduced}
              onCheckedChange={setReduced}
              aria-label={sceneText(locale, "Menos movimiento", "Reduced motion")}
            />
            {sceneText(locale, "Menos movimiento", "Reduced motion")}
          </label>
        </div>
      </div>
      <SceneModeProvider interactive>
        <MotionConfig reducedMotion={reduced ? "always" : "user"}>
          <SceneFrameView frame={selected.frame}>
            <div key={`${selected.id}-${epoch}`} className="flex flex-col gap-3">
              <Render locale={locale} log={log} />
            </div>
          </SceneFrameView>
        </MotionConfig>
      </SceneModeProvider>
    </div>
  )
}

export function SceneDeck({ scenes }: { scenes: readonly Scene[] }) {
  return (
    <Suspense fallback={<div className="h-44 rounded-xl border border-dashed border-border bg-muted/30" />}>
      <SceneDeckInner scenes={scenes} />
    </Suspense>
  )
}
