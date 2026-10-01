"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
import { ChevronDown, Clock3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type TimePickerClassNames = {
  root?: string
  label?: string
  trigger?: string
  menu?: string
  option?: string
  description?: string
}

export type TimePickerProps = {
  label: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  description?: string
  placeholder?: string
  minuteStep?: 1 | 5 | 10 | 15 | 30
  format?: "12h" | "24h"
  disabled?: boolean
  className?: string
  classNames?: TimePickerClassNames
}

const pad = (value: number) => String(value).padStart(2, "0")

const toMinutes = (value: string) => {
  const [h, m] = value.split(":").map(Number)
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : 0
}

const valueRoll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * 0.35}em`, filter: `blur(${motionPresets.blur.soft}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] } },
  exit: (direction: number) => ({
    opacity: 0,
    y: `${direction * -0.3}em`,
    filter: `blur(${motionPresets.blur.subtle}px)`,
    transition: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] },
  }),
}

const valueFade: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionPresets.duration.instant } },
  exit: { opacity: 0, transition: { duration: motionPresets.duration.instant } },
}

export function TimePicker({
  label,
  value,
  defaultValue = "09:00",
  onChange,
  description,
  placeholder = "Select a time",
  minuteStep = 15,
  format = "12h",
  disabled = false,
  className,
  classNames,
}: TimePickerProps) {
  const id = React.useId()
  const labelId = `${id}-label`
  const valueId = `${id}-value`
  const rootRef = React.useRef<HTMLDivElement>(null)
  const optionRefs = React.useRef<Array<HTMLButtonElement | null>>([])
  const centerOnOpen = React.useRef(false)
  const [internal, setInternal] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const selected = value ?? internal
  const reduce = useReducedMotion()
  const [previous, setPrevious] = React.useState(selected)
  const [direction, setDirection] = React.useState(1)
  if (previous !== selected) {
    setPrevious(selected)
    setDirection(toMinutes(selected) >= toMinutes(previous) ? 1 : -1)
  }

  const options = Array.from({ length: Math.ceil(1440 / minuteStep) }, (_, index) => {
    const minutes = index * minuteStep
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    return `${pad(hour)}:${pad(minute)}`
  })

  const display = (raw: string) => {
    const minutes = toMinutes(raw)
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    return format === "24h" ? `${pad(hour)}:${pad(minute)}` : `${hour % 12 || 12}:${pad(minute)} ${hour < 12 ? "AM" : "PM"}`
  }

  React.useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [])

  React.useLayoutEffect(() => {
    if (!open || activeIndex < 0) return
    const option = optionRefs.current[activeIndex]
    const menu = option?.parentElement
    if (!option || !menu) return
    const top = option.offsetTop
    const bottom = top + option.offsetHeight
    if (centerOnOpen.current) {
      centerOnOpen.current = false
      menu.scrollTop = top - (menu.clientHeight - option.offsetHeight) / 2
    } else if (top < menu.scrollTop) menu.scrollTop = top
    else if (bottom > menu.scrollTop + menu.clientHeight) menu.scrollTop = bottom - menu.clientHeight
  }, [activeIndex, open])

  const choose = (next: string) => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
    setOpen(false)
  }

  const openMenu = () => {
    const selectedIndex = options.indexOf(selected)
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    centerOnOpen.current = true
    setOpen(true)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") {
      event.preventDefault()
      setOpen(false)
      return
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      if (open && activeIndex >= 0) choose(options[activeIndex])
      else openMenu()
      return
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      if (!open) {
        openMenu()
        return
      }
      setActiveIndex((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length)
    }
  }

  return (
    <div
      ref={rootRef}
      data-slot="time-picker"
      className={cn("grid min-w-0 max-w-full gap-2", className, classNames?.root)}
    >
      <span id={labelId} data-slot="time-picker-label" className={cn("text-sm font-medium", classNames?.label)}>
        {label}
      </span>
      <div className="relative min-w-0">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          data-slot="time-picker-trigger"
          className={cn("h-9 w-full justify-start gap-2 px-3 font-normal", classNames?.trigger)}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={onKeyDown}
        >
          <Clock3 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span id={valueId} className="sr-only">
            {selected ? display(selected) : placeholder}
          </span>
          <span className="grid min-w-0 flex-1 grid-cols-1" aria-hidden="true">
            <AnimatePresence initial={false} custom={direction}>
              <motion.span
                key={selected || "placeholder"}
                className={cn(
                  "col-start-1 row-start-1 min-w-0 truncate",
                  selected ? "tabular-nums text-foreground" : "text-muted-foreground",
                )}
                custom={direction}
                variants={reduce ? valueFade : valueRoll}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {selected ? display(selected) : placeholder}
              </motion.span>
            </AnimatePresence>
          </span>
          <ChevronDown
            className={cn("size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none", open && "rotate-180")}
            aria-hidden="true"
          />
        </Button>
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id={`${id}-listbox`}
              role="listbox"
              aria-label={`${label} options`}
              data-slot="time-picker-menu"
              className={cn(
                "absolute top-[calc(100%+6px)] right-0 left-0 z-50 max-h-[250px] overflow-y-auto overscroll-contain rounded-lg border border-border bg-popover p-1 shadow-sm",
                classNames?.menu,
              )}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: reduce
                  ? { duration: motionPresets.duration.instant }
                  : { ...motionPresets.spring.snappy, opacity: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.enter] } },
              }}
              exit={{
                opacity: 0,
                ...(reduce ? {} : { y: -4, scale: 0.98 }),
                transition: { duration: 0.13, ease: [...motionPresets.ease.standard] },
              }}
            >
              {options.map((option, index) => (
                <button
                  ref={(node) => {
                    optionRefs.current[index] = node
                  }}
                  id={`${id}-option-${index}`}
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={option === selected}
                  data-active={activeIndex === index || undefined}
                  data-slot="time-picker-option"
                  className={cn(
                    "flex min-h-9 w-full cursor-pointer items-center justify-between rounded-md border-0 bg-transparent px-2.5 text-left text-sm text-foreground tabular-nums transition-colors data-[active]:bg-muted motion-reduce:transition-none",
                    classNames?.option,
                  )}
                  onPointerMove={() => {
                    if (activeIndex !== index) setActiveIndex(index)
                  }}
                  onClick={() => choose(option)}
                >
                  {display(option)}
                  {option === selected ? <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" /> : null}
                </button>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      {description ? (
        <span data-slot="time-picker-description" className={cn("text-xs text-muted-foreground break-all", classNames?.description)}>
          {description}
        </span>
      ) : null}
    </div>
  )
}
