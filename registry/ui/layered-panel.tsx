"use client"

import * as React from "react"
import { Dialog } from "radix-ui"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

/**
 * Progressive disclosure surface.
 *
 * Opens as a right-hand peek panel and can expand left into a two-column
 * view without changing route. Built on Radix Dialog (focus trap, scroll
 * lock, Esc / click-outside). Does not import Next.js — pair with
 * `useLayeredPanelUrlState` when you want shareable URLs.
 *
 * `Header` and `ExpandToggle` sit at the top of the primary column and move
 * into the left column when the panel expands. Render them from a child
 * component that returns a fragment, or give a wrapping element `className="contents"`.
 */

export type LayeredPanelMode = "peek" | "full"

const CSS_LENGTH = /^(?:\d*\.?\d+)(?:px|rem|em|vw|vh|%)$/

type LayeredPanelContextValue = {
  open: boolean
  mode: LayeredPanelMode
  setOpen: (open: boolean) => void
  setMode: (mode: LayeredPanelMode) => void
  registerFull: (present: boolean) => void
}

const LayeredPanelContext =
  React.createContext<LayeredPanelContextValue | null>(null)

function useLayeredPanel() {
  const context = React.useContext(LayeredPanelContext)
  if (!context) {
    throw new Error("useLayeredPanel must be used within LayeredPanel.")
  }
  return context
}

function useControllable<T>({
  value,
  defaultValue,
  onChange,
}: {
  value: T | undefined
  defaultValue: T
  onChange?: (value: T) => void
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : uncontrolled

  const setValue = React.useCallback(
    (next: T) => {
      if (!controlled) setUncontrolled(next)
      onChange?.(next)
    },
    [controlled, onChange],
  )

  return [current, setValue] as const
}

function cssLength(value: string | undefined, fallback: string) {
  if (!value) return fallback
  const trimmed = value.trim()
  return CSS_LENGTH.test(trimmed) ? trimmed : fallback
}

type LayeredPanelProps = {
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  mode?: LayeredPanelMode
  defaultMode?: LayeredPanelMode
  onModeChange?: (mode: LayeredPanelMode) => void
  /** Accessible name announced for the dialog. */
  title?: string
  /** Accessible description. Kept visually hidden. */
  description?: string
  /** Close button label. Default: "Close". */
  closeLabel?: string
  /** Mobile tab for the peek column. Default: "Overview". */
  mobilePeekLabel?: string
  /** Mobile tab for the full column. Default: "Profile". */
  mobileFullLabel?: string
  /** Peek width on desktop. Any single CSS length. Default: 26.25rem (420px). */
  peekWidth?: string
  /** Expanded width on desktop. Any single CSS length. Default: 70vw. */
  fullWidth?: string
  /** Hide the built-in close button when you render your own. */
  showClose?: boolean
  /** Panel surface. Merged onto the dialog content. */
  className?: string
  /** Backdrop. Default uses `bg-foreground` / `bg-background`, not a custom color. */
  overlayClassName?: string
  /** Built-in close button. */
  closeClassName?: string
  /** Mobile tab track, below 1024px. */
  tabsClassName?: string
  /** Each mobile tab button. */
  tabClassName?: string
  /** Grid that holds Header, ExpandToggle, Peek, and Full. */
  gridClassName?: string
}

function LayeredPanelRoot({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  mode: modeProp,
  defaultMode = "peek",
  onModeChange,
  title = "Details",
  description = "Detail panel",
  closeLabel = "Close",
  mobilePeekLabel = "Overview",
  mobileFullLabel = "Profile",
  peekWidth,
  fullWidth,
  showClose = true,
  className,
  overlayClassName,
  closeClassName,
  tabsClassName,
  tabClassName,
  gridClassName,
}: LayeredPanelProps) {
  const [open, setOpenState] = useControllable({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const [mode, setModeState] = useControllable({
    value: modeProp,
    defaultValue: defaultMode,
    onChange: onModeChange,
  })

  const setOpen = React.useCallback(
    (next: boolean) => {
      setOpenState(next)
      if (!next && modeProp === undefined) setModeState(defaultMode)
    },
    [defaultMode, modeProp, setModeState, setOpenState],
  )

  const setMode = React.useCallback(
    (next: LayeredPanelMode) => {
      setModeState(next)
    },
    [setModeState],
  )
  const [hasFull, setHasFull] = React.useState(false)
  const registerFull = React.useCallback((present: boolean) => {
    setHasFull(present)
  }, [])

  const panelId = React.useId().replace(/:/g, "")
  const peek = cssLength(peekWidth, "26.25rem")
  const full = cssLength(fullWidth, "70vw")
  const contentRef = React.useRef<HTMLDivElement>(null)
  const previousMode = React.useRef(mode)

  React.useEffect(() => {
    if (
      previousMode.current === "full" &&
      mode === "peek" &&
      contentRef.current
    ) {
      const active = document.activeElement
      if (!active || !contentRef.current.contains(active)) {
        contentRef.current.focus()
      }
    }
    previousMode.current = mode
  }, [mode])

  const context = React.useMemo<LayeredPanelContextValue>(
    () => ({ open, mode, setOpen, setMode, registerFull }),
    [mode, open, registerFull, setMode, setOpen],
  )

  return (
    <LayeredPanelContext.Provider value={context}>
      <Dialog.Root open={open} onOpenChange={setOpen} modal>
        <Dialog.Portal>
          <Dialog.Overlay
            data-slot="layered-panel-overlay"
            className={cn(
              "fixed inset-0 z-50 bg-foreground/40 dark:bg-background/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none",
              overlayClassName,
            )}
          />
          <Dialog.Content
            ref={contentRef}
            data-slot="layered-panel"
            data-panel-id={panelId}
            data-mode={mode}
            tabIndex={-1}
            onEscapeKeyDown={(event) => {
              if (mode === "full") {
                event.preventDefault()
                setMode("peek")
              }
            }}
            className={cn(
              "fixed inset-y-0 right-0 z-50 flex h-dvh max-h-dvh max-w-full flex-col overflow-hidden border-l border-border bg-background text-foreground shadow-lg outline-none lg:rounded-l-xl",
              "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-right data-[state=open]:duration-300 data-[state=closed]:duration-300 motion-reduce:animate-none",
              className,
            )}
          >
            <style>{`
              [data-panel-id="${panelId}"] { width: min(100%, ${peek}); transition: width 280ms cubic-bezier(0.32, 0.72, 0, 1); }
              [data-panel-id="${panelId}"][data-mode="full"] { width: min(100%, ${full}); }
              [data-panel-id="${panelId}"] .lp-grid { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto minmax(0, 1fr); }
              @media (min-width: 1024px) {
                [data-panel-id="${panelId}"][data-mode="full"] .lp-grid { grid-template-columns: minmax(0, 1fr) min(100%, ${peek}); }
              }
              @media (max-width: 1023px) {
                [data-panel-id="${panelId}"],
                [data-panel-id="${panelId}"][data-mode="full"] { width: 100%; transition: none; }
              }
              @media (prefers-reduced-motion: reduce) {
                [data-panel-id="${panelId}"] { transition: none; }
              }
            `}</style>
            <Dialog.Title className="sr-only">{title}</Dialog.Title>
            <Dialog.Description className="sr-only">
              {description}
            </Dialog.Description>
            {showClose ? (
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={closeLabel}
                  className={cn(
                    "absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-10 active:scale-[0.96] motion-reduce:active:scale-100",
                    closeClassName,
                  )}
                >
                  <X />
                </Button>
              </Dialog.Close>
            ) : null}
            {hasFull ? (
              <div className={cn("shrink-0 px-3 pt-3 pr-14 lg:hidden", tabsClassName)}>
                <div
                  className="flex rounded-lg bg-muted p-0.5"
                  role="group"
                  aria-label="Panel sections"
                >
                  <ModeButton
                    pressed={mode === "peek"}
                    onClick={() => setMode("peek")}
                    className={tabClassName}
                  >
                    {mobilePeekLabel}
                  </ModeButton>
                  <ModeButton
                    pressed={mode === "full"}
                    onClick={() => setMode("full")}
                    className={tabClassName}
                  >
                    {mobileFullLabel}
                  </ModeButton>
                </div>
              </div>
            ) : null}
            <div className={cn("lp-grid grid min-h-0 flex-1", gridClassName)}>
              {children}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </LayeredPanelContext.Provider>
  )
}

function ModeButton({
  pressed,
  onClick,
  className,
  children,
}: {
  pressed: boolean
  onClick: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "h-8 flex-1 rounded-lg text-sm font-medium transition-transform active:scale-[0.96] motion-reduce:active:scale-100",
        pressed
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground",
        className,
      )}
    >
      {children}
    </button>
  )
}

type ColumnProps = {
  children?: React.ReactNode
  className?: string
  contentClassName?: string
}

function Peek({ children, className, contentClassName }: ColumnProps) {
  const { mode } = useLayeredPanel()
  return (
    <div
      data-slot="layered-panel-peek"
      className={cn(
        "col-start-1 row-start-3 min-h-0",
        mode === "full" &&
          "max-lg:hidden lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:border-l lg:border-border",
        className,
      )}
    >
      <ScrollArea className="h-full">
        <div
          className={cn(
            "flex min-h-full flex-col",
            mode === "full" && "lg:pt-12",
            contentClassName,
          )}
        >
          {children}
        </div>
      </ScrollArea>
    </div>
  )
}
Peek.displayName = "LayeredPanel.Peek"
;(Peek as typeof Peek & { slot: string }).slot = "peek"

function Full({ children, className, contentClassName }: ColumnProps) {
  const { mode, registerFull } = useLayeredPanel()
  React.useLayoutEffect(() => {
    registerFull(true)
    return () => registerFull(false)
  }, [registerFull])

  return (
    <div
      data-slot="layered-panel-full"
      inert={mode === "full" ? undefined : true}
      className={cn(
        "col-start-1 row-start-3 min-h-0",
        mode === "full" ? "block" : "hidden",
        className,
      )}
    >
      <ScrollArea className="h-full">
        <div className={cn("flex min-h-full flex-col", contentClassName)}>
          {children}
        </div>
      </ScrollArea>
    </div>
  )
}
Full.displayName = "LayeredPanel.Full"
;(Full as typeof Full & { slot: string }).slot = "full"

function Header({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="layered-panel-header"
      className={cn(
        "col-start-1 row-start-1 flex flex-col gap-3 px-5 pt-5 pr-14 pb-1",
        className,
      )}
    >
      {children}
    </div>
  )
}
Header.displayName = "LayeredPanel.Header"
;(Header as typeof Header & { slot: string }).slot = "header"

type ExpandToggleProps = {
  /** Label while the panel is peeked. Default: "View full profile". */
  expandLabel?: string
  /** Label while the panel is expanded. Default: "Close profile". */
  collapseLabel?: string
  /** Wrapper that places the control on the grid. */
  className?: string
  /** Passed to the host `Button`. Does not replace its variant. */
  buttonClassName?: string
}

function ExpandToggle({
  expandLabel = "View full profile",
  collapseLabel = "Close profile",
  className,
  buttonClassName,
}: ExpandToggleProps) {
  const { mode, setMode } = useLayeredPanel()
  const expanded = mode === "full"

  return (
    <div className={cn("col-start-1 row-start-2 px-5 py-3", className)}>
      <Button
        type="button"
        variant="secondary"
        aria-expanded={expanded}
        onClick={() => setMode(expanded ? "peek" : "full")}
        className={cn(
          "w-full active:scale-[0.96] motion-reduce:active:scale-100",
          buttonClassName,
        )}
      >
        {expanded ? collapseLabel : expandLabel}
      </Button>
    </div>
  )
}
ExpandToggle.displayName = "LayeredPanel.ExpandToggle"
;(ExpandToggle as typeof ExpandToggle & { slot: string }).slot = "toggle"

type DetailSectionProps = {
  title: string
  icon?: React.ReactNode
  children?: React.ReactNode
  className?: string
  contentClassName?: string
  titleClassName?: string
}

function DetailSection({
  title,
  icon,
  children,
  className,
  contentClassName,
  titleClassName,
}: DetailSectionProps) {
  return (
    <section className={cn("flex flex-col", className)}>
      <Separator />
      <div className={cn("flex flex-col gap-3.5 px-5 py-4", contentClassName)}>
        <h3
          className={cn(
            "flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase",
            titleClassName,
          )}
        >
          {icon ? (
            <span className="text-muted-foreground [&_svg]:size-3.5">{icon}</span>
          ) : null}
          {title}
        </h3>
        <div className="flex flex-col gap-3.5">{children}</div>
      </div>
    </section>
  )
}
DetailSection.displayName = "LayeredPanel.Section"

type DetailFieldProps = {
  label: string
  icon?: React.ReactNode
  value?: React.ReactNode
  children?: React.ReactNode
  href?: string
  className?: string
  labelClassName?: string
  valueClassName?: string
}

function DetailField({
  label,
  icon,
  value,
  children,
  href,
  className,
  labelClassName,
  valueClassName,
}: DetailFieldProps) {
  const content = children ?? value
  return (
    <div className={cn("grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3", className)}>
      <span className="mt-0.5 text-muted-foreground [&_svg]:size-3.5">
        {icon}
      </span>
      <div className="min-w-0">
        <div
          className={cn(
            "text-xs font-medium tracking-wide text-muted-foreground uppercase",
            labelClassName,
          )}
        >
          {label}
        </div>
        <div className={cn("text-sm wrap-break-word text-foreground", valueClassName)}>
          {href ? (
            <a
              href={href}
              className="underline-offset-2 hover:underline focus-visible:underline"
            >
              {content}
            </a>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  )
}
DetailField.displayName = "LayeredPanel.Field"

type LayeredPanelComponent = typeof LayeredPanelRoot & {
  Peek: typeof Peek
  Full: typeof Full
  Header: typeof Header
  ExpandToggle: typeof ExpandToggle
  Section: typeof DetailSection
  Field: typeof DetailField
}

const LayeredPanel = LayeredPanelRoot as LayeredPanelComponent
LayeredPanel.Peek = Peek
LayeredPanel.Full = Full
LayeredPanel.Header = Header
LayeredPanel.ExpandToggle = ExpandToggle
LayeredPanel.Section = DetailSection
LayeredPanel.Field = DetailField

export {
  LayeredPanel,
  useLayeredPanel,
  DetailSection,
  DetailField,
  Peek as LayeredPanelPeek,
  Full as LayeredPanelFull,
  Header as LayeredPanelHeader,
  ExpandToggle as LayeredPanelExpandToggle,
}
