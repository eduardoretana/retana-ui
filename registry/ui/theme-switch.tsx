"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type ThemeSwitchVariant = "fade" | "eclipse" | "split" | "rise"
export type ThemeName = "light" | "dark"

export type ThemeSwitchClassNames = {
  root?: string
  icon?: string
  label?: string
}

export type ThemeSwitchProps = {
  theme: ThemeName
  /** Page transition. `fade` crossfades; `eclipse` opens from the control; `split` from a center seam; `rise` from the bottom. */
  variant?: ThemeSwitchVariant
  /** Next-themes compatible. Called with the next theme inside the view transition when the browser supports it. */
  onThemeChange: (next: ThemeName) => void
  label?: string
  iconOnly?: boolean
  className?: string
  classNames?: ThemeSwitchClassNames
}

const TRANSITION_CSS = `
@media (prefers-reduced-motion: no-preference) {
  html[data-theme-switch="fade"]::view-transition-old(root),
  html[data-theme-switch="fade"]::view-transition-new(root) {
    animation-duration: 280ms;
    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }
  html[data-theme-switch="eclipse"]::view-transition-old(root) { animation: none; }
  html[data-theme-switch="eclipse"]::view-transition-new(root) {
    animation: retana-theme-eclipse 520ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  html[data-theme-switch="split"]::view-transition-old(root) { animation: none; }
  html[data-theme-switch="split"]::view-transition-new(root) {
    animation: retana-theme-split 480ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  html[data-theme-switch="rise"]::view-transition-old(root) { animation: none; }
  html[data-theme-switch="rise"]::view-transition-new(root) {
    animation: retana-theme-rise 480ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  @keyframes retana-theme-eclipse {
    from { clip-path: circle(0px at var(--theme-switch-x, 50%) var(--theme-switch-y, 50%)); }
    to { clip-path: circle(150vmax at var(--theme-switch-x, 50%) var(--theme-switch-y, 50%)); }
  }
  @keyframes retana-theme-split {
    from { clip-path: inset(0 50% 0 50%); }
    to { clip-path: inset(0 0 0 0); }
  }
  @keyframes retana-theme-rise {
    from { clip-path: inset(100% 0 0 0); }
    to { clip-path: inset(0 0 0 0); }
  }
}
`

const iconSpring = {
  ...motionPresets.spring.snappy,
  opacity: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.enter] },
  filter: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.enter] },
} as const

function useSettled() {
  const [settled, setSettled] = React.useState(false)
  React.useEffect(() => {
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setSettled(true))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [])
  return settled
}

function ThemeIcon({
  theme,
  reduced,
  settled,
  className,
}: {
  theme: ThemeName
  reduced: boolean
  settled: boolean
  className?: string
}) {
  const Icon = theme === "light" ? Sun : Moon
  const angle = theme === "light" ? 30 : -30
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={theme}
        data-slot="theme-switch-glyph"
        className={cn("absolute grid size-[18px] place-items-center", className)}
        initial={
          !settled
            ? false
            : reduced
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.7, rotate: angle, filter: `blur(${motionPresets.blur.subtle}px)` }
        }
        animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
        exit={
          !settled
            ? { opacity: 0, transition: { duration: 0 } }
            : reduced
              ? { opacity: 0, transition: { duration: motionPresets.duration.instant } }
              : {
                  opacity: 0,
                  scale: 0.7,
                  rotate: angle,
                  filter: `blur(${motionPresets.blur.subtle}px)`,
                  transition: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] },
                }
        }
        transition={reduced ? { duration: motionPresets.duration.instant } : iconSpring}
        aria-hidden="true"
      >
        <Icon />
      </motion.span>
    </AnimatePresence>
  )
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** Runs `onThemeChange` inside `document.startViewTransition` when the browser can, otherwise immediately. */
export function runThemeSwitch(
  next: ThemeName,
  variant: ThemeSwitchVariant,
  origin: HTMLElement | null,
  onThemeChange: (next: ThemeName) => void,
) {
  const apply = () => onThemeChange(next)
  const viewTransition = document.startViewTransition?.bind(document)
  if (!viewTransition || reducedMotion()) {
    apply()
    return
  }
  const root = document.documentElement
  if (origin) {
    const box = origin.getBoundingClientRect()
    root.style.setProperty("--theme-switch-x", `${box.left + box.width / 2}px`)
    root.style.setProperty("--theme-switch-y", `${box.top + box.height / 2}px`)
  }
  root.dataset.themeSwitch = variant
  const transition = viewTransition(() => {
    apply()
  })
  void transition.finished.finally(() => {
    delete root.dataset.themeSwitch
    root.style.removeProperty("--theme-switch-x")
    root.style.removeProperty("--theme-switch-y")
  })
}

const nudge: Record<ThemeSwitchVariant, string> = {
  fade: "data-[theme=dark]:scale-105",
  eclipse: "data-[theme=dark]:-translate-x-0.5",
  split: "data-[theme=dark]:translate-x-px",
  rise: "data-[theme=dark]:-translate-y-0.5",
}

export function ThemeSwitch({
  theme,
  variant = "fade",
  onThemeChange,
  label,
  iconOnly = false,
  className,
  classNames,
}: ThemeSwitchProps) {
  const reduced = useReducedMotion() ?? false
  const settled = useSettled()
  const next = theme === "light" ? "dark" : "light"

  return (
    <>
      <style>{TRANSITION_CSS}</style>
      <Button
        type="button"
        size={iconOnly ? "icon" : "sm"}
        variant="outline"
        data-slot="theme-switch"
        data-variant={variant}
        data-theme={theme}
        className={cn(
          "relative",
          iconOnly && "size-9",
          className,
          classNames?.root,
        )}
        aria-label={label ?? `Switch to ${next} mode`}
        aria-pressed={theme === "dark"}
        onClick={(event) => runThemeSwitch(next, variant, event.currentTarget, onThemeChange)}
      >
        <span
          data-slot="theme-switch-icon"
          className={cn(
            "relative grid size-5 place-items-center motion-reduce:transition-none",
            settled && "transition-transform duration-300",
            nudge[variant],
            classNames?.icon,
          )}
        >
          <ThemeIcon theme={theme} reduced={reduced} settled={settled} />
        </span>
        {iconOnly ? null : (
          <span data-slot="theme-switch-label" className={cn("truncate", classNames?.label)}>
            {label ?? "Switch theme"}
          </span>
        )}
      </Button>
    </>
  )
}
