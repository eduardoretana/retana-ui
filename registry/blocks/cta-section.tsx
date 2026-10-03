"use client"

/** Adapted from Arc UI (MIT). */

import { forwardRef, useEffect, useId, useRef, useState } from "react"
import type { ReactNode } from "react"
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react"
import { ArrowRight, Check, X } from "lucide-react"

import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

import { ctaCopy, ctaFaces, ctaSetup } from "./cta-section-data"
import type { CtaAction } from "./cta-section-data"

export type { CtaAction } from "./cta-section-data"
export type CtaVariant = "centered" | "split" | "banner"

export interface CtaSectionProps {
  /** `centered` is a closing section, `split` sits beside a product visual, `banner` is one dismissible line. */
  variant?: CtaVariant
  title?: string
  description?: string
  primaryAction?: CtaAction
  /** Not shown in the banner variant. Pass null to hide it. */
  secondaryAction?: CtaAction | null
  /** Small print under the actions in the centered variant. */
  note?: string
  /** Faces beside the note. A name renders as initials; a URL renders as a photo. Pass [] to hide them. */
  faces?: string[]
  /** Short benefit lines in the split variant. */
  points?: string[]
  /** Replaces the split variant's setup card. */
  visual?: ReactNode
  /** Banner only: shows a dismiss button and calls this after the banner closes. */
  onDismiss?: () => void
  className?: string
  classNames?: CtaSectionClassNames
}

export type CtaSectionClassNames = {
  root?: string
  title?: string
  description?: string
  actions?: string
  visual?: string
  banner?: string
}

function initials(name: string) {
  const clean = name.split("/").pop() ?? name
  return clean
    .replace(/\.[a-z]+$/i, "")
    .split(/[\s-_]+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
}

function isImage(face: string) {
  return face.startsWith("/") || face.startsWith("http") || face.startsWith("data:")
}

function Faces({ faces }: { faces: string[] }) {
  if (!faces.length) return null
  return (
    <AvatarGroup aria-hidden="true">
      {faces.slice(0, 4).map((face) => (
        <Avatar key={face} size="sm">
          {isImage(face) ? <AvatarImage src={face} alt="" /> : null}
          <AvatarFallback>{initials(face)}</AvatarFallback>
        </Avatar>
      ))}
    </AvatarGroup>
  )
}

function Action({ action, variant, size = "lg", arrow }: { action: CtaAction; variant: "primary" | "secondary"; size?: "sm" | "lg"; arrow?: boolean }) {
  const [confirmed, setConfirmed] = useState(false)
  const buttonVariant = variant === "primary" ? "default" : "outline"
  const buttonSize = size === "sm" ? "sm" : "lg"
  const icon = arrow ? <ArrowRight data-icon="inline-end" className="transition-transform group-hover/button:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" /> : null
  if (action.href) {
    return (
      <Button asChild variant={buttonVariant} size={buttonSize}>
        <a href={action.href}>
          {action.label}
          {icon}
        </a>
      </Button>
    )
  }
  const simulated = !action.onClick
  return (
    <Button
      variant={buttonVariant}
      size={buttonSize}
      aria-live={simulated ? "polite" : undefined}
      onClick={() => {
        if (action.onClick) action.onClick()
        else setConfirmed((value) => !value)
      }}
    >
      {confirmed ? (
        <>
          <Check data-icon="inline-start" aria-hidden="true" />
          {action.confirmedLabel ?? action.label}
        </>
      ) : (
        <>
          {action.label}
          {icon}
        </>
      )}
    </Button>
  )
}

function SetupVisual({ reduced, faces, workspace, steps }: { reduced: boolean; faces: string[]; workspace: string; steps: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const total = steps.length
  const [step, setStep] = useState(0)
  const shown = reduced ? total : step

  useEffect(() => {
    if (!inView || reduced) return
    const timers = steps.map((_, index) => window.setTimeout(() => setStep(index + 1), 520 + index * 620))
    return () => timers.forEach(window.clearTimeout)
  }, [inView, reduced, steps])

  return (
    <div ref={ref} data-slot="cta-section-setup" className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-sm" aria-hidden="true" data-done={shown === total ? "" : undefined}>
      <div className="flex items-center gap-2.5 px-4 py-3.5">
        <span className="grid size-7 place-items-center rounded-md bg-foreground text-sm text-background">{workspace.charAt(0)}</span>
        <span className="text-sm font-medium">{workspace}</span>
        <span className="ml-auto text-xs text-muted-foreground">{shown === total ? "Ready" : "Setting up"}</span>
      </div>
      <div className="mx-4 h-0.5 overflow-hidden rounded-full bg-border">
        <span className="block h-full origin-left bg-primary motion-reduce:transition-none" style={{ transform: `scaleX(${total ? shown / total : 0})` }} />
      </div>
      <ol className="grid gap-0.5 p-2">
        {steps.map((label, index) => {
          const done = index < shown
          const active = index === shown
          return (
            <li key={label} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-2.5 text-sm text-muted-foreground", active && "bg-muted text-foreground", done && "text-foreground")} data-done={done ? "" : undefined}>
              <span className={cn("grid size-5 place-items-center rounded-full border border-dashed border-border text-transparent", active && "border-solid border-muted-foreground", done && "border-solid border-primary bg-primary text-primary-foreground")}>
                <Check className="size-3" aria-hidden="true" />
              </span>
              <span className="min-w-0 truncate">{label}</span>
              {index === total - 1 ? (
                <span className="ml-auto">
                  <Faces faces={faces} />
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/**
 * A call to action in three shapes: a centered closing section, a split layout beside a setup card, and a compact banner that closes when dismissed.
 */
export const CtaSection = forwardRef<HTMLElement, CtaSectionProps>(function CtaSection({
  variant = "centered",
  title,
  description,
  primaryAction,
  secondaryAction,
  note,
  faces = ctaFaces,
  points,
  visual,
  onDismiss,
  className,
  classNames,
}, ref) {
  const id = useId()
  const reduced = !!useReducedMotion()
  const [open, setOpen] = useState(true)
  const copy = ctaCopy[variant]
  const heading = title ?? copy.title
  const text = description ?? copy.description
  const primary = primaryAction ?? copy.primary
  const secondary = secondaryAction === null ? null : secondaryAction ?? ("secondary" in copy ? copy.secondary : undefined)
  const root = cn("@container/cta w-full min-w-0 bg-background text-foreground", className, classNames?.root)

  if (variant === "banner") {
    return (
      <section ref={ref} data-slot="cta-section" data-variant="banner" data-open={open ? "true" : "false"} className={root} aria-label={heading} aria-labelledby={open ? `${id}-title` : undefined}>
        <AnimatePresence initial={false} onExitComplete={onDismiss}>
          {open ? (
            <motion.div
              key="banner"
              className="overflow-hidden"
              exit={reduced ? { opacity: 0, transition: { duration: 0.12 } } : { opacity: 0, height: 0, scale: 0.98, transition: { height: motionPresets.spring.smooth, scale: { duration: 0.2 }, opacity: { duration: motionPresets.duration.fast } } }}
            >
              <div className="mx-auto max-w-6xl px-4 py-4 @min-[560px]/cta:px-8 @min-[560px]/cta:py-6">
                <div data-slot="cta-section-banner" className={cn("flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-card p-4 @min-[560px]/cta:flex-row @min-[560px]/cta:items-center @min-[560px]/cta:py-2.5 @min-[560px]/cta:pr-2.5 @min-[560px]/cta:pl-5", classNames?.banner)}>
                  <p className="m-0 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                    <strong id={`${id}-title`} className={cn("font-medium wrap-anywhere", classNames?.title)}>{heading}</strong>
                    <span className={cn("text-muted-foreground", classNames?.description)}>{text}</span>
                  </p>
                  <div className={cn("flex w-full items-center justify-between gap-1 @min-[560px]/cta:w-auto", classNames?.actions)}>
                    <Action action={primary} variant="primary" size="sm" arrow />
                    {onDismiss !== undefined ? (
                      <Button type="button" variant="ghost" size="icon" aria-label="Dismiss" onClick={() => setOpen(false)}>
                        <X aria-hidden="true" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    )
  }

  if (variant === "split") {
    const list = points ?? ctaCopy.split.points
    return (
      <section ref={ref} data-slot="cta-section" data-variant="split" className={root} aria-labelledby={`${id}-title`}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 @min-[860px]/cta:grid-cols-2 @min-[860px]/cta:gap-16 @min-[860px]/cta:px-8 @min-[860px]/cta:py-24">
          <div className="grid justify-items-start gap-4">
            <h2 id={`${id}-title`} className={cn("m-0 font-heading text-3xl font-medium tracking-tight text-balance @min-[560px]/cta:text-4xl", classNames?.title)}>{heading}</h2>
            <p className={cn("m-0 text-pretty text-muted-foreground @min-[560px]/cta:text-lg", classNames?.description)}>{text}</p>
            {list.length > 0 ? (
              <ul className="m-0 grid list-none gap-2 p-0">
                {list.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="text-primary" aria-hidden="true" />
                    <span className="wrap-anywhere">{point}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className={cn("mt-2 flex w-full flex-col flex-wrap gap-3 @min-[560px]/cta:w-auto @min-[560px]/cta:flex-row", classNames?.actions)}>
              <Action action={primary} variant="primary" arrow />
              {secondary ? <Action action={secondary} variant="secondary" /> : null}
            </div>
          </div>
          <motion.div
            data-slot="cta-section-visual"
            className={cn("grid min-h-72 place-items-center rounded-xl border border-border bg-muted/40 p-5 @min-[560px]/cta:min-h-80 @min-[560px]/cta:p-8", classNames?.visual)}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: reduced ? 0 : 0.7, ease: [...motionPresets.ease.enter] }}
          >
            {visual ?? <SetupVisual reduced={reduced} faces={ctaSetup.faces} workspace={ctaSetup.workspace} steps={ctaSetup.steps} />}
          </motion.div>
        </div>
      </section>
    )
  }

  const small = note ?? ctaCopy.centered.note
  return (
    <section ref={ref} data-slot="cta-section" data-variant="centered" className={root} aria-labelledby={`${id}-title`}>
      <div className="mx-auto max-w-6xl px-4 py-10 @min-[560px]/cta:px-8 @min-[560px]/cta:py-16">
        <div className="grid justify-items-center gap-4 rounded-xl border border-border bg-muted/40 px-5 py-12 text-center @min-[560px]/cta:px-8 @min-[560px]/cta:py-24">
          <h2 id={`${id}-title`} className={cn("m-0 max-w-[18ch] font-heading text-3xl font-medium tracking-tight text-balance @min-[560px]/cta:text-4xl", classNames?.title)}>{heading}</h2>
          <p className={cn("m-0 max-w-xl text-pretty text-muted-foreground @min-[560px]/cta:text-lg", classNames?.description)}>{text}</p>
          <div className={cn("mt-2 flex w-full flex-col flex-wrap justify-center gap-3 @min-[560px]/cta:w-auto @min-[560px]/cta:flex-row", classNames?.actions)}>
            <Action action={primary} variant="primary" arrow />
            {secondary ? <Action action={secondary} variant="secondary" /> : null}
          </div>
          {small || faces.length > 0 ? (
            <p className="mt-3 mb-0 inline-flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
              <Faces faces={faces} />
              {small}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
})

CtaSection.displayName = "CtaSection"
