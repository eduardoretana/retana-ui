"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type SearchFieldClassNames = {
  root?: string
  label?: string
  shell?: string
  input?: string
  clear?: string
}

export type SearchFieldProps = Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> & {
  label: string
  value: string
  onValueChange: (value: string) => void
  classNames?: SearchFieldClassNames
}

export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { label, value, onValueChange, id, className, classNames, ...props },
  ref,
) {
  const generated = React.useId()
  const controlId = id ?? generated
  const reduced = useReducedMotion()
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (typeof ref === "function") ref(node)
    else if (ref) ref.current = node
  }

  function clear() {
    onValueChange("")
    inputRef.current?.focus()
  }

  return (
    <div data-slot="search-field" className={cn("grid min-w-0 gap-2", className, classNames?.root)}>
      <label htmlFor={controlId} data-slot="search-field-label" className={cn("text-sm font-medium", classNames?.label)}>
        {label}
      </label>
      <div
        data-slot="search-field-shell"
        data-filled={value ? "true" : undefined}
        className={cn(
          "flex h-9 min-w-0 items-center gap-1 rounded-lg border border-input bg-transparent pr-1 pl-2.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          classNames?.shell,
        )}
      >
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <Input
          {...props}
          ref={setRefs}
          id={controlId}
          type="search"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          className={cn(
            "h-8 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 dark:bg-transparent [&::-webkit-search-cancel-button]:appearance-none",
            classNames?.input,
          )}
        />
        <span className="grid size-6 shrink-0 place-items-center">
          <AnimatePresence initial={false}>
            {value ? (
              <motion.span
                key="clear"
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.8 }}
                transition={reduced ? { duration: motionPresets.duration.instant } : motionPresets.spring.snappy}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  data-slot="search-field-clear"
                  className={classNames?.clear}
                  aria-label="Clear search"
                  onClick={clear}
                >
                  <X aria-hidden="true" />
                </Button>
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      </div>
    </div>
  )
})
