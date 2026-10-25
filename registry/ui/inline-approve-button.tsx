"use client"

/**
 * Clean-room confirm that turns into a success check in place.
 * The host saves. This button only reports the outcome.
 * Icon motion follows the 0.25 scale recipe and stops when motion is reduced.
 */

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Check, LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export const INLINE_APPROVE_STATES = ["idle", "pending", "success", "error"] as const

export type InlineApproveState = (typeof INLINE_APPROVE_STATES)[number]

export type InlineApproveLabels = {
  idle: string
  pending: string
  success: string
  error: string
}

export const inlineApproveLabels: InlineApproveLabels = {
  idle: "Aprobar",
  pending: "Aprobando",
  success: "Aprobado",
  error: "Reintentar",
}

export const inlineApproveLabelsEn: InlineApproveLabels = {
  idle: "Approve",
  pending: "Approving",
  success: "Approved",
  error: "Try again",
}

export type InlineApproveButtonProps = {
  onConfirm?: () => void | Promise<unknown>
  state?: InlineApproveState
  defaultState?: InlineApproveState
  onStateChange?: (state: InlineApproveState) => void
  disabled?: boolean
  labels?: Partial<InlineApproveLabels>
  className?: string
}

const subscribe = () => () => {}

function useReducedFlag() {
  const hydrated = React.useSyncExternalStore(subscribe, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

export function InlineApproveButton({
  onConfirm,
  state: stateProp,
  defaultState = "idle",
  onStateChange,
  disabled = false,
  labels,
  className,
}: InlineApproveButtonProps) {
  const copy = { ...inlineApproveLabels, ...labels }
  const reduced = useReducedFlag()
  const [uncontrolled, setUncontrolled] = React.useState<InlineApproveState>(defaultState)
  const state = stateProp ?? uncontrolled
  const lock = React.useRef(false)

  function commit(next: InlineApproveState) {
    if (stateProp === undefined) setUncontrolled(next)
    onStateChange?.(next)
  }

  async function confirm() {
    if (disabled || state === "pending" || state === "success" || lock.current) return
    lock.current = true
    commit("pending")
    try {
      await onConfirm?.()
      commit("success")
    } catch {
      commit("error")
    } finally {
      lock.current = false
    }
  }

  const text = copy[state]
  const icon =
    state === "pending" ? (
      <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" data-icon="inline-start" />
    ) : state === "success" ? (
      <Check aria-hidden="true" data-icon="inline-start" />
    ) : null

  return (
    <Button
      type="button"
      variant={state === "error" ? "destructive" : state === "success" ? "outline" : "default"}
      className={cn(className)}
      data-slot="inline-approve-button"
      data-state={state}
      data-reduced-motion={reduced ? "true" : "false"}
      aria-live="polite"
      aria-busy={state === "pending" || undefined}
      aria-disabled={disabled || state === "success" || undefined}
      disabled={disabled || state === "pending"}
      onClick={() => {
        void confirm()
      }}
    >
      <span className="inline-flex items-center gap-1.5">
        <AnimatePresence mode="wait" initial={false}>
          {icon ? (
            <motion.span
              key={state}
              className="inline-flex"
              initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              transition={{ duration: reduced ? 0 : motionPresets.duration.fast, ease: motionPresets.ease.enter }}
            >
              {icon}
            </motion.span>
          ) : null}
        </AnimatePresence>
        {text}
      </span>
    </Button>
  )
}
