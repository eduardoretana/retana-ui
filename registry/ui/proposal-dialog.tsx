"use client"

/** Clean-room proposal dialog frame. No theme of its own. */

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { motion, useReducedMotion } from "motion/react"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export type ProposalMotionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  closeLabel?: string
}

export function ProposalMotionDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  closeLabel = "Close",
}: ProposalMotionDialogProps) {
  const reduced = !!useReducedMotion()
  const titleId = React.useId()
  const descriptionId = React.useId()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="duration-200" />
        <DialogPrimitive.Content
          data-slot="proposal-dialog"
          data-motion={reduced ? "reduced" : "full"}
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[min(100%-2rem,36rem)] max-h-[min(100dvh-2rem,40rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-popover p-4 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none",
            className,
          )}
        >
          <motion.div
            className="grid gap-4"
            initial={reduced ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
          >
            <div className="flex items-start justify-between gap-3 pe-8">
              <div className="min-w-0">
                <DialogTitle id={titleId} className="text-base">
                  {title}
                </DialogTitle>
                {description ? (
                  <DialogDescription id={descriptionId} className="mt-1">
                    {description}
                  </DialogDescription>
                ) : null}
              </div>
            </div>
            <DialogPrimitive.Close asChild>
              <Button type="button" variant="ghost" size="icon-sm" className="absolute top-2 right-2" aria-label={closeLabel}>
                <XIcon />
              </Button>
            </DialogPrimitive.Close>
            {children}
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
