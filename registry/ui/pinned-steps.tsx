"use client"

/**
 * Scrollytelling steps. The visual column sticks while each step crosses
 * the center of the viewport. Clean-room. Narrow viewports and reduced
 * motion stack the step and its visual in normal flow.
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

import { cn } from "@/lib/utils"
import { useMinWidth } from "@/registry/retana/hooks/use-min-width"
import { motionPresets } from "@/registry/retana/lib/motion"
import { useMotionPreference } from "@/registry/retana/ui/motion-preference"

/** Center band: a step is active while it crosses the middle of the viewport. */
export const PINNED_STEP_MARGIN = "-50% 0px -50% 0px"

const ease = motionPresets.ease.enter.join(", ")
const fade = `${motionPresets.duration.considered}s cubic-bezier(${ease})`

export function pinnedStepsMode(wide: boolean, reduced: boolean) {
  return wide && !reduced ? "pinned" : "stacked"
}

export function pinnedStepMotion(active: boolean, reduced: boolean): CSSProperties {
  return {
    opacity: active ? 1 : 0,
    transform: active ? "translate3d(0, 0, 0)" : "translate3d(0, 0.75rem, 0)",
    transition: reduced ? "none" : `opacity ${fade}, transform ${fade}`,
  }
}

export type PinnedStep = {
  id: string
  title: string
  body: string
  visual: ReactNode
  /** Shapes with no information are hidden from assistive tech. */
  decorative?: boolean
}

export type PinnedStepsProps = {
  steps: PinnedStep[]
  label?: string
  emptyLabel?: string
  className?: string
  visualClassName?: string
  stepClassName?: string
  /** Stack below this viewport width. Default 768. */
  minWidth?: number
}

export function PinnedSteps({
  steps,
  label = "Steps",
  emptyLabel = "No steps",
  className,
  visualClassName,
  stepClassName,
  minWidth = 768,
}: PinnedStepsProps) {
  const reduced = useMotionPreference()
  const wide = useMinWidth(minWidth)
  const mode = pinnedStepsMode(wide, reduced)
  const nodes = useRef(new Map<string, HTMLElement>())
  const stepsRef = useRef(steps)
  const stepKey = steps.map((step) => step.id).join("\0")
  const [active, setActive] = useState(steps[0]?.id ?? "")

  useEffect(() => {
    stepsRef.current = steps
  }, [steps])

  useEffect(() => {
    const list = stepsRef.current
    if (!list.some((step) => step.id === active)) setActive(list[0]?.id ?? "")
  }, [active, stepKey])

  useEffect(() => {
    if (mode !== "pinned") return
    const observers: IntersectionObserver[] = []
    for (const step of stepsRef.current) {
      const node = nodes.current.get(step.id)
      if (!node) continue
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) setActive(step.id)
        },
        { root: null, rootMargin: PINNED_STEP_MARGIN, threshold: 0 },
      )
      observer.observe(node)
      observers.push(observer)
    }
    return () => {
      for (const observer of observers) observer.disconnect()
    }
  }, [mode, stepKey])

  if (steps.length === 0) {
    return (
      <p data-slot="pinned-steps" data-mode="stacked" data-state="empty" className={cn("text-sm text-muted-foreground", className)}>
        {emptyLabel}
      </p>
    )
  }

  return (
    <div
      data-slot="pinned-steps"
      data-mode={mode}
      className={cn(mode === "pinned" ? "grid grid-cols-2 items-start gap-8" : "flex flex-col gap-10", className)}
    >
      {mode === "pinned" ? (
        <div
          data-slot="pinned-steps-visual"
          className={cn("sticky top-0 flex h-[70vh] items-center", visualClassName)}
        >
          <div className="relative h-64 w-full min-w-0">
            {steps.map((step) => (
              <StepVisual
                key={step.id}
                step={step}
                active={step.id === active}
                reduced={reduced}
                className="absolute inset-0"
              />
            ))}
          </div>
        </div>
      ) : null}
      <div data-slot="pinned-steps-track" role="region" aria-label={label} className="min-w-0">
        {steps.map((step) => {
          const current = step.id === active
          return (
            <article
              key={step.id}
              ref={(node) => {
                if (node) nodes.current.set(step.id, node)
                else nodes.current.delete(step.id)
              }}
              data-slot="pinned-step"
              data-step={step.id}
              data-active={current ? "true" : "false"}
              aria-current={mode === "pinned" && current ? "step" : undefined}
              className={cn(
                "flex min-w-0 flex-col justify-center gap-3",
                mode === "pinned" && "min-h-[80vh]",
                stepClassName,
              )}
            >
              <h3 className="text-lg font-semibold tracking-tight [overflow-wrap:anywhere]">{step.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">{step.body}</p>
              {mode === "stacked" ? <StepVisual step={step} active reduced={reduced} className="relative h-48" /> : null}
            </article>
          )
        })}
      </div>
    </div>
  )
}

function StepVisual({
  step,
  active,
  reduced,
  className,
}: {
  step: PinnedStep
  active: boolean
  reduced: boolean
  className?: string
}) {
  const decorative = step.decorative === true
  return (
    <div
      data-slot="pinned-step-visual"
      data-step={step.id}
      data-active={active ? "true" : "false"}
      data-decorative={decorative ? "true" : "false"}
      aria-hidden={decorative ? true : active ? undefined : true}
      aria-live={!decorative && active ? "polite" : undefined}
      className={cn("min-w-0", !active && "pointer-events-none", className)}
      style={pinnedStepMotion(active, reduced)}
    >
      {step.visual}
    </div>
  )
}
