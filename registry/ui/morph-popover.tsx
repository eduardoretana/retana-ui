"use client"

/**
 * Clean-room shared-element popover. A surface shared with the trigger
 * grows into the panel via motion `layoutId`. Blendy is the behavior
 * reference only and is not a dependency. Reduced motion fades the panel
 * in place. Escape, outside pointer, and focus return are handled. The
 * popover is non-modal: Tab may leave it.
 */

import * as React from "react"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"

import { cn } from "@/lib/utils"
import { useOverlayFocus } from "@/registry/retana/lib/overlay-focus"
import { motionPresets } from "@/registry/retana/lib/motion"
import { useMotionPreference } from "@/registry/retana/ui/motion-preference"

export type MorphPopoverProps = {
  label: React.ReactNode
  title?: React.ReactNode
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  triggerClassName?: string
  panelClassName?: string
}

export function MorphPopover({
  label,
  title,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  triggerClassName,
  panelClassName,
}: MorphPopoverProps) {
  const reduced = useMotionPreference()
  const uid = React.useId()
  const layoutId = reduced ? undefined : `${uid}-surface`
  const titleId = `${uid}-title`
  const panelId = `${uid}-panel`
  const rootRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const [internal, setInternal] = React.useState(defaultOpen)
  const isOpen = open ?? internal

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (open === undefined) setInternal(next)
      onOpenChange?.(next)
    },
    [onOpenChange, open],
  )

  const close = React.useCallback(() => setOpen(false), [setOpen])
  useOverlayFocus(isOpen, panelRef, close, false)

  React.useEffect(() => {
    if (!isOpen) return
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close()
    }
    document.addEventListener("pointerdown", onPointer)
    return () => document.removeEventListener("pointerdown", onPointer)
  }, [close, isOpen])

  const transition = reduced ? { duration: 0 } : motionPresets.spring.morph

  return (
    <LayoutGroup>
      <div ref={rootRef} className={cn("relative inline-flex", className)}>
        <button
          type="button"
          className={cn(
            "relative inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium",
            triggerClassName,
          )}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setOpen(!isOpen)}
        >
          {!isOpen || reduced ? (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-lg border border-border bg-muted"
              style={{ borderRadius: 8 }}
              transition={transition}
              aria-hidden="true"
            />
          ) : null}
          <span className="relative">{label}</span>
        </button>
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-modal="false"
              aria-labelledby={title ? titleId : undefined}
              tabIndex={-1}
              layoutId={layoutId}
              className={cn(
                "absolute top-[calc(100%+0.5rem)] left-0 z-30 flex w-64 flex-col gap-2 border border-border bg-popover p-3 text-popover-foreground shadow-lg outline-none",
                panelClassName,
              )}
              style={{ borderRadius: 12 }}
              transition={transition}
              initial={reduced ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
            >
              {title ? (
                <p id={titleId} className="text-sm font-medium">
                  {title}
                </p>
              ) : null}
              {children}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  )
}
