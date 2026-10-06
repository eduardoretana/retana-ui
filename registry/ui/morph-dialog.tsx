"use client"

/**
 * Clean-room shared-element dialog. The trigger grows into the panel with
 * motion `layoutId`. Blendy (MIT, Taha Shashtari) is the behavior reference
 * only: none of its source is included, and it is not a dependency.
 * Reduced motion skips the morph. Focus moves in, Tab is trapped, Escape
 * and the backdrop close, and focus returns to the trigger.
 */

import * as React from "react"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"

import { cn } from "@/lib/utils"
import { useOverlayFocus } from "@/registry/retana/lib/overlay-focus"
import { motionPresets } from "@/registry/retana/lib/motion"
import { useMotionPreference } from "@/registry/retana/ui/motion-preference"

export type MorphDialogProps = {
  label: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  closeLabel?: string
  className?: string
  triggerClassName?: string
  panelClassName?: string
}

export function MorphDialog({
  label,
  title,
  description,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  closeLabel = "Close",
  className,
  triggerClassName,
  panelClassName,
}: MorphDialogProps) {
  const reduced = useMotionPreference()
  const uid = React.useId()
  const layoutId = reduced ? undefined : `${uid}-surface`
  const titleId = `${uid}-title`
  const descriptionId = `${uid}-description`
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
  useOverlayFocus(isOpen, panelRef, close, true)

  React.useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  const transition = reduced ? { duration: 0 } : motionPresets.spring.morph

  return (
    <LayoutGroup>
      <div className={className}>
        {!isOpen ? (
          <motion.button
            type="button"
            layoutId={layoutId}
            className={cn(
              "inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground",
              triggerClassName,
            )}
            style={{ borderRadius: 8 }}
            onClick={() => setOpen(true)}
            transition={transition}
          >
            {label}
          </motion.button>
        ) : (
          <span className="inline-flex h-8 items-center px-2.5 text-sm text-transparent" aria-hidden="true">
            {label}
          </span>
        )}
      </div>
      <AnimatePresence>
        {isOpen ? (
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <motion.button
              type="button"
              aria-label={closeLabel}
              className="absolute inset-0 bg-foreground/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0 } : { duration: motionPresets.duration.fast }}
              onClick={close}
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={description ? descriptionId : undefined}
              tabIndex={-1}
              layoutId={layoutId}
              className={cn(
                "relative z-10 flex w-full max-w-md flex-col gap-3 border border-border bg-popover p-4 text-popover-foreground shadow-lg outline-none",
                panelClassName,
              )}
              style={{ borderRadius: 16 }}
              transition={transition}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 id={titleId} className="text-base font-semibold">
                  {title}
                </h2>
                <button
                  type="button"
                  data-overlay-close=""
                  className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={close}
                >
                  {closeLabel}
                </button>
              </div>
              {description ? (
                <p id={descriptionId} className="text-sm text-muted-foreground">
                  {description}
                </p>
              ) : null}
              {children}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </LayoutGroup>
  )
}
