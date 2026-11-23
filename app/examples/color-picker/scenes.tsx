"use client"

import { useEffect, useRef, useState } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, sceneText, type Scene, type SceneFrame, type SceneLocale, type SceneLog, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { Button } from "@/components/ui/button"
import {
  ColorPicker,
  ColorPickerPopover,
  colorPickerLabelsEs,
  formatColor,
  type ColorFormat,
  type ColorPickerProps,
  type HsvaColor,
} from "@/registry/ui/color-picker"

import { empty, error, filled, full, invalid, invalidPaste, loading, noEyedropper, popover, type PickerFixture } from "./fixtures"

const frame: SceneFrame = { size: "sm", surface: "canvas", padding: "md" }

function labelsFor(locale: SceneLocale) {
  return locale === "en" ? undefined : colorPickerLabelsEs
}

/** Host state for one picker, with the callbacks a host would wire. */
function usePickerHost(fixture: PickerFixture, locale: SceneLocale, log: SceneLog): ColorPickerProps {
  const [color, setColor] = useState<HsvaColor>(fixture.color)
  const [format, setFormat] = useState<ColorFormat>(fixture.format)
  const [saved, setSaved] = useState<HsvaColor[]>(fixture.saved ?? [])
  return {
    value: color,
    onValueChange: setColor,
    onValueCommit: (next) => log(formatSceneCall("onValueCommit", [formatColor(next, format)])),
    format,
    onFormatChange: (next) => {
      setFormat(next)
      log(formatSceneCall("onFormatChange", [next]))
    },
    swatches: saved,
    onSwatchesChange: (next) => {
      setSaved(next)
      log(formatSceneCall("onSwatchesChange", [next.map((swatch) => formatColor(swatch, "hex"))]))
    },
    maxSwatches: fixture.maxSwatches,
    onCopy: (value) => log(formatSceneCall("onCopy", [value])),
    labels: labelsFor(locale),
    className: "w-full",
  }
}

function Picker({ fixture, locale, log, ...extra }: { fixture: PickerFixture } & SceneRenderProps & Partial<ColorPickerProps>) {
  const host = usePickerHost(fixture, locale, log)
  return <ColorPicker {...host} {...extra} />
}

function FilledScene({ locale, log }: SceneRenderProps) {
  return <Picker fixture={filled} locale={locale} log={log} />
}

function EmptyScene({ locale, log }: SceneRenderProps) {
  return <Picker fixture={empty} locale={locale} log={log} />
}

function LoadingScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim(loading, log)
  const call = sim.call
  useEffect(() => {
    void call("load", (current) => current, () => filled, { silent: true, delay: 900 })
  }, [call])
  const waiting = sim.state.saved == null
  return (
    <div className="flex flex-col gap-3">
      {waiting ? <SceneStatus tone="loading">{sceneText(locale, "Cargando los colores guardados del taller…", "Loading the workshop's saved colors…")}</SceneStatus> : null}
      {/* key: remount with the loaded colors once they arrive */}
      <Picker key={waiting ? "waiting" : "ready"} fixture={waiting ? { ...loading, saved: [] } : filled} locale={locale} log={log} />
    </div>
  )
}

function ErrorScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim({ phase: "error" as "error" | "loading" | "ready" }, log)
  const attempt = useRef(0)
  return (
    <div className="flex flex-col gap-3">
      {sim.state.phase === "ready" ? (
        <Picker fixture={error} locale={locale} log={log} />
      ) : (
        <SceneStatus tone={sim.state.phase === "loading" ? "loading" : "error"}>
          {sim.state.phase === "loading"
            ? sceneText(locale, "Volviendo a leer los colores guardados…", "Reading the saved colors again…")
            : sceneText(locale, "No pudimos leer los colores guardados de Taller Ladrillo.", "We could not read the saved colors for Taller Ladrillo.")}
        </SceneStatus>
      )}
      {sim.state.phase !== "ready" ? (
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
      ) : null}
    </div>
  )
}

/** Puts the pasted text in the field and leaves it, the way a person would, without moving page focus. */
function useSimulatedPaste(ref: React.RefObject<HTMLDivElement | null>, text: string) {
  useEffect(() => {
    const field = ref.current?.querySelector("input:not([type=range])")
    if (!(field instanceof HTMLInputElement)) return
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
    setValue?.call(field, text)
    field.dispatchEvent(new Event("input", { bubbles: true }))
    field.dispatchEvent(new FocusEvent("focusout", { bubbles: true }))
  }, [ref, text])
}

function InvalidScene({ locale, log }: SceneRenderProps) {
  const ref = useRef<HTMLDivElement>(null)
  useSimulatedPaste(ref, invalidPaste)
  return (
    <div ref={ref} className="flex flex-col gap-2">
      <Picker fixture={invalid} locale={locale} log={log} />
    </div>
  )
}

function NoEyedropperScene({ locale, log }: SceneRenderProps) {
  return (
    <div className="flex flex-col gap-2">
      <Picker fixture={noEyedropper} locale={locale} log={log} eyedropper="unsupported" />
      <p className="text-xs text-muted-foreground">
        {sceneText(
          locale,
          "Simula un navegador sin la API EyeDropper: el botón sigue a la vista, deshabilitado, y explica por qué al tocarlo.",
          "Simulates a browser without the EyeDropper API: the button stays in view, disabled, and explains why when pressed.",
        )}
      </p>
    </div>
  )
}

function FullScene({ locale, log }: SceneRenderProps) {
  return <Picker fixture={full} locale={locale} log={log} />
}

function PopoverScene({ locale, log }: SceneRenderProps) {
  const host = usePickerHost(popover, locale, log)
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-sm text-muted-foreground">{sceneText(locale, "Color del esmalte de la pieza 14", "Glaze color for piece 14")}</p>
      <ColorPickerPopover {...host} onOpenChange={(open) => log(formatSceneCall("onOpenChange", [open]))} />
    </div>
  )
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: FilledScene, frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: EmptyScene, frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: LoadingScene, frame },
  { id: "error", label: "Error", labelEn: "Error", render: ErrorScene, frame },
  { id: "invalid", label: "Formato inválido", labelEn: "Invalid format", render: InvalidScene, frame },
  { id: "no-eyedropper", label: "Sin cuentagotas", labelEn: "No eyedropper", render: NoEyedropperScene, frame },
  { id: "full", label: "Guardados llenos", labelEn: "Saved colors full", render: FullScene, frame },
  { id: "popover", label: "En popover", labelEn: "Popover", render: PopoverScene, frame },
]
