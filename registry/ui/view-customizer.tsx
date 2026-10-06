"use client"

import * as React from "react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"
import { Check, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { motionPresets } from "@/registry/retana/lib/motion"
import { SegmentedControl } from "@/registry/retana/ui/segmented-control"

export type ViewOption = {
  id: string
  label: string
  icon?: React.ReactNode
}

export type ViewCustomizerClassNames = {
  content?: string
  tile?: string
  footer?: string
}

export type ViewCustomizerProps = {
  title?: string
  subtitle?: string
  views: readonly ViewOption[]
  enabled: readonly string[]
  onEnabledChange: (ids: string[]) => void
  showAllLabel?: string
  /** At least one view stays enabled. */
  minimumLabel?: string
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
  classNames?: ViewCustomizerClassNames
}

export function ViewCustomizer({
  title = "Views",
  subtitle,
  views,
  enabled,
  onEnabledChange,
  showAllLabel = "Show all",
  minimumLabel = "At least one view stays on.",
  footer,
  children,
  className,
  classNames,
}: ViewCustomizerProps) {
  const enabledSet = new Set(enabled)
  const allOn = views.length > 0 && views.every((view) => enabledSet.has(view.id))
  const [notice, setNotice] = React.useState("")

  function toggle(id: string) {
    const on = enabledSet.has(id)
    if (on && enabled.length <= 1) {
      setNotice(minimumLabel)
      return
    }
    setNotice("")
    const next = on ? enabled.filter((item) => item !== id) : [...enabled, id]
    onEnabledChange(views.map((view) => view.id).filter((item) => next.includes(item)))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={12}
        className={cn("relative w-80 gap-3 p-3", className, classNames?.content)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground wrap-anywhere">{subtitle}</p> : null}
          </div>
          {allOn ? null : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={() => {
                setNotice("")
                onEnabledChange(views.map((view) => view.id))
              }}
            >
              {showAllLabel}
            </Button>
          )}
        </div>
        <div role="group" aria-label={title} className="grid grid-cols-4 gap-2">
          {views.map((view) => {
            const on = enabledSet.has(view.id)
            return (
              <button
                key={view.id}
                type="button"
                aria-pressed={on}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  on
                    ? "border border-border bg-muted font-semibold text-foreground"
                    : "border border-dashed border-border bg-transparent text-muted-foreground",
                  "hover:bg-accent hover:text-accent-foreground",
                  classNames?.tile,
                )}
                onClick={() => toggle(view.id)}
              >
                {on ? (
                  <span className="absolute -top-1 -end-1 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-2.5" aria-hidden />
                  </span>
                ) : null}
                {view.icon ? <span aria-hidden>{view.icon}</span> : null}
                <span className="max-w-full truncate">{view.label}</span>
              </button>
            )
          })}
        </div>
        <p className="sr-only" role="status">
          {notice}
        </p>
        {footer ? <div className={cn("border-t border-border pt-2 text-xs text-muted-foreground", classNames?.footer)}>{footer}</div> : null}
        <span
          aria-hidden
          className="absolute top-full left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-r border-b border-border bg-popover"
        />
      </PopoverContent>
    </Popover>
  )
}

export type ViewSwitcherItem = {
  id: string
  label: string
  icon?: React.ReactNode
}

export type ViewSwitcherProps = {
  views: readonly ViewSwitcherItem[]
  value?: string
  onValueChange?: (id: string) => void
  onAdd?: () => void
  addLabel?: string
  label?: string
  /** The views menu, usually the "…" trigger for `ViewCustomizer`. */
  menu?: React.ReactNode
  className?: string
}

export function ViewSwitcher({
  views,
  value,
  onValueChange,
  onAdd,
  addLabel = "Add",
  label = "Views",
  menu,
  className,
}: ViewSwitcherProps) {
  const reduced = useReducedMotion()
  const showPill = views.length >= 2
  const spring = reduced ? { duration: 0 } : motionPresets.spring.snappy
  const selected = value && views.some((view) => view.id === value) ? value : views[0]?.id

  return (
    <LayoutGroup>
      <div data-slot="view-switcher" className={cn("inline-flex items-center gap-1.5", className)}>
        {onAdd ? (
          <motion.div layout="position" transition={spring}>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label={addLabel}
              onClick={onAdd}
            >
              <Plus />
            </Button>
          </motion.div>
        ) : null}
        <AnimatePresence initial={false}>
          {showPill && selected ? (
            <motion.div
              key="view-switcher-pill"
              data-slot="view-switcher-pill"
              layout
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              transition={spring}
            >
              <SegmentedControl
                label={label}
                iconsOnly
                value={selected}
                onValueChange={onValueChange}
                options={views.map((view) => ({
                  value: view.id,
                  label: view.label,
                  icon: view.icon,
                }))}
                classNames={{
                  track: "rounded-full",
                  option: "rounded-full px-2.5",
                  selection: "rounded-full",
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
        {menu ? (
          <motion.div layout="position" transition={spring}>
            {menu}
          </motion.div>
        ) : null}
      </div>
    </LayoutGroup>
  )
}
