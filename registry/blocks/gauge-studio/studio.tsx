"use client"

/** Adapted from Gauge UI (MIT). https://github.com/thordursk/gauge-ui */

import { useEffect, useMemo, useState } from "react"
import { Code, PanelRight, Redo2, RotateCcw, Undo2 } from "lucide-react"

import {
  AnimatedGauge,
  GaugeControl,
  clamp,
  css,
  gaugeToCode,
  stepFor,
  storageKeys,
  useGaugeControllers,
  useStoredValue,
  writeStored,
  type PlayMode,
} from "@/registry/retana/ui/gauge-kit"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { CodeDrawer } from "./code-drawer"
import { ControlBar } from "./control-bar"
import { ControlsRoot } from "./controls-root"
import { CopyValuesButton } from "./copy-values"
import { TemplatePicker } from "./template-picker"

export type GaugeStudioProps = {
  className?: string
  /** Fill the parent instead of the default stage height. Used by the catalog thumbnail. */
  fill?: boolean
}

/**
 * The Gauge UI studio: a template grid, a live canvas, stacked gauges, play
 * modes, and the control accordion. Undo and redo walk the composition.
 */
export const GaugeStudio = ({ className, fill = false }: GaugeStudioProps) => {
  const {
    spec,
    stage,
    hostValue,
    sweepKey,
    layers,
    selected,
    selectLayer,
    addLayer,
    removeLayer,
    value: val,
    domain: { min, max },
    setValue,
    setPeriod,
    setAmplitude,
    setMode,
    activeTemplate,
    selectTemplate,
    reset,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useGaugeControllers()

  const code = useMemo(() => gaugeToCode(spec), [spec])
  const [showCode, setShowCode] = useState(false)
  const showControls = useStoredValue(storageKeys.controls, "shown") !== "hidden"
  const toggleControls = () => writeStored(storageKeys.controls, showControls ? "hidden" : "shown")

  const current = clamp(val.value, min, max)
  const mode = val.mode as PlayMode
  const shown = selected === 0 ? current : hostValue

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return
      const target = event.target
      if (target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [redo, undo])

  const gauge = (
    <AnimatedGauge
      key={sweepKey}
      spec={spec}
      value={shown}
      mode={mode}
      period={val.period}
      amplitude={val.amplitude}
      sweepIn
    />
  )

  return (
    <TooltipProvider>
      <div className={cn("@container w-full min-w-0", fill ? "h-full" : "h-[40rem] max-h-[100dvh] min-h-80", className)}>
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-background @3xl:flex-row">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex flex-wrap items-center gap-1.5 px-2 py-2 sm:px-3">
            <h2 className="mr-auto text-sm font-semibold">Studio</h2>
            <TemplatePicker selected={activeTemplate} onSelect={selectTemplate} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon-sm" variant="secondary" onClick={undo} disabled={!canUndo} aria-label="Undo">
                  <Undo2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon-sm" variant="secondary" onClick={redo} disabled={!canRedo} aria-label="Redo">
                  <Redo2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon-sm" variant="secondary" onClick={reset} aria-label="Reset">
                  <RotateCcw />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{activeTemplate ? `Reset to ${activeTemplate.name}` : "Reset to defaults"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon-sm" variant="secondary" aria-label="Toggle controls" aria-pressed={showControls} onClick={toggleControls} className="hidden @3xl:inline-flex">
                  <PanelRight />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showControls ? "Hide controls" : "Show controls"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon-sm" variant="secondary" aria-label="View code" onClick={() => setShowCode(true)}>
                  <Code />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy code</TooltipContent>
            </Tooltip>
          </header>
          <section
            className="flex min-h-0 flex-1 flex-col items-center gap-3 px-3 pb-3"
            style={{ background: css(stage) }}
          >
            <div className="flex min-h-0 w-full flex-1 items-center justify-center py-2">
              {spec.control ? (
                <div className="flex h-full w-full items-center justify-center [container-type:size]">
                  <GaugeControl
                    value={shown}
                    onChange={setValue}
                    min={spec.domain.min}
                    max={spec.domain.max}
                    step={spec.control.step}
                    startAngle={spec.domain.startAngle}
                    endAngle={spec.domain.endAngle}
                    label={spec.title.show ? spec.title.text : "Value"}
                    knob={spec.control.knob}
                    disabled={selected !== 0}
                    className="size-[min(100cqw,100cqh)]"
                  >
                    {gauge}
                  </GaugeControl>
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center">{gauge}</div>
              )}
            </div>
            <ControlBar
              layers={layers}
              selected={selected}
              onSelect={selectLayer}
              onAdd={addLayer}
              onRemove={removeLayer}
              value={current}
              min={min}
              max={max}
              step={stepFor(max - min)}
              mode={mode}
              period={val.period}
              amplitude={val.amplitude}
              onValueChange={setValue}
              onModeChange={setMode}
              onPeriodChange={setPeriod}
              onAmplitudeChange={setAmplitude}
            />
          </section>
          <CodeDrawer code={code} open={showCode} onOpenChange={setShowCode} />
        </main>
        <aside className={cn("flex max-h-64 w-full shrink-0 flex-col overflow-hidden border-t border-border @3xl:h-auto @3xl:max-h-none @3xl:w-72 @3xl:border-t-0 @3xl:border-l", !showControls && "@3xl:hidden")}>
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-card">
            <div className="flex shrink-0 items-center justify-between border-b border-border py-1.5 pr-1.5 pl-3">
              <span className="text-xs font-medium text-muted-foreground">Controls</span>
              <CopyValuesButton values={layers[selected]?.values ?? layers[0].values} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ControlsRoot />
            </div>
          </div>
        </aside>
      </div>
      </div>
    </TooltipProvider>
  )
}
