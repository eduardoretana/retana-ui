"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type PasswordFieldClassNames = {
  root?: string
  label?: string
  shell?: string
  input?: string
  toggle?: string
  description?: string
}

export type PasswordFieldProps = Omit<React.ComponentProps<"input">, "type"> & {
  label: string
  description?: string
  classNames?: PasswordFieldClassNames
}

function EyeMorph({ slashed }: { slashed: boolean }) {
  const reduced = useReducedMotion()
  const maskId = React.useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const slash = { pathLength: slashed ? 1 : 0, opacity: slashed ? 1 : 0 }
  const transition = reduced
    ? { duration: 0 }
    : {
        pathLength: { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.standard] },
        opacity: { duration: motionPresets.duration.instant },
      }
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="white" stroke="none" />
        <motion.path d="M2 2l20 20" stroke="black" strokeWidth={5} initial={false} animate={slash} transition={transition} />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </g>
      <motion.path d="M2 2l20 20" initial={false} animate={slash} transition={transition} />
    </svg>
  )
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  { label, description, id, className, classNames, ...props },
  ref,
) {
  const generated = React.useId()
  const controlId = id ?? generated
  const [visible, setVisible] = React.useState(false)
  const [toggled, setToggled] = React.useState(false)
  const hintId = description ? `${controlId}-description` : undefined
  const describedBy = [props["aria-describedby"], hintId].filter(Boolean).join(" ") || undefined

  return (
    <div data-slot="password-field" className={cn("grid min-w-0 gap-2", className, classNames?.root)}>
      <label htmlFor={controlId} data-slot="password-field-label" className={cn("text-sm font-medium", classNames?.label)}>
        {label}
      </label>
      <div
        data-slot="password-field-shell"
        className={cn(
          "flex h-9 min-w-0 items-center rounded-lg border border-input bg-transparent pr-1 pl-1 shadow-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-[[aria-invalid=true]]:border-destructive",
          classNames?.shell,
        )}
      >
        <Input
          {...props}
          ref={ref}
          id={controlId}
          type={visible ? "text" : "password"}
          data-reveal={toggled ? (visible ? "shown" : "hidden") : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-8 border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
            classNames?.input,
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          data-slot="password-field-toggle"
          className={classNames?.toggle}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => {
            setVisible((current) => !current)
            setToggled(true)
          }}
        >
          <EyeMorph slashed={visible} />
        </Button>
      </div>
      {description ? (
        <p id={hintId} data-slot="password-field-description" className={cn("text-xs text-muted-foreground", classNames?.description)}>
          {description}
        </p>
      ) : null}
    </div>
  )
})
