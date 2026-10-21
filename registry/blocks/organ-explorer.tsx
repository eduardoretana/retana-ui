"use client"

import * as React from "react"
import { PanelRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import { AnatomyTree } from "@/registry/retana/ui/anatomy-tree"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Toggle } from "@/components/ui/toggle"
import {
  OrganViewer,
  organAnatomyNodes,
  organDefaultVisibility,
  type OrganModel,
} from "@/registry/retana/ui/organ-viewer"

// Matches the lg breakpoint where the panel fits beside the viewer.
const WIDE = "(min-width: 64rem)"
function subscribeWide(onChange: () => void) {
  const query = matchMedia(WIDE)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

// The anatomy tree drives the viewer, and picks in 3D flow back to the tree.
// Like the explorers, the panel starts closed so the 3D view stands alone.
// Phones open it as a sheet.
export function OrganExplorer({
  model,
  className,
}: {
  model: OrganModel
  className?: string
}) {
  const [data] = React.useState(() => organAnatomyNodes(model))
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [visibility, setVisibility] = React.useState(() =>
    organDefaultVisibility(model)
  )
  const [view, setView] = React.useState<string | null>(model.defaultView)
  const selected = model.structures.find(({ id }) => id === selectedId)
  const [open, setOpen] = React.useState(false)
  const wide = React.useSyncExternalStore(
    subscribeWide,
    () => matchMedia(WIDE).matches,
    () => true
  )
  const panel = React.useId()
  const panelRef = React.useRef<HTMLDivElement>(null)
  const sheetRef = React.useRef<HTMLDivElement>(null)
  const toggle = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (open && wide)
      panelRef.current?.querySelector<HTMLElement>("input")?.focus()
  }, [open, wide])
  const close = () => {
    setOpen(false)
    toggle.current?.focus()
  }
  const tree = (className: string) => (
    <AnatomyTree
      data={data}
      selectedId={selectedId}
      onSelectionChange={setSelectedId}
      visibility={visibility}
      onVisibilityChange={setVisibility}
      label={`${model.name} anatomy`}
      // Small organs open fully; the skeleton and muscles start collapsed.
      defaultExpandedIds={
        model.structures.length <= 40 ? data.map(({ id }) => id) : []
      }
      className={className}
    />
  )
  return (
    <div
      className={cn(
        "grid gap-4",
        open && wide && "grid-cols-[minmax(0,1fr)_18rem]",
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-3">
        <OrganViewer
          model={model}
          selectedId={selectedId}
          onSelectionChange={setSelectedId}
          visibility={visibility}
          onViewChange={setView}
          className="h-[28rem]"
        />
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-muted-foreground" role="status">
            {selected
              ? `${selected.label}: ${selected.description ?? selected.group}`
              : `View: ${view ?? "Custom view"}. Select a structure to learn about it.`}
          </p>
          <Toggle
            ref={toggle}
            variant="outline"
            pressed={open}
            onPressedChange={(pressed) => (pressed ? setOpen(true) : close())}
            aria-controls={open && wide ? panel : undefined}
            className="shrink-0"
          >
            <PanelRightIcon
              aria-hidden="true"
              data-icon="inline-start"
            />
            Anatomy
          </Toggle>
        </div>
      </div>
      {open && wide && (
        <div
          id={panel}
          ref={panelRef}
          onKeyDown={(event) => {
            if (event.key === "Escape") close()
          }}
        >
          {tree("max-h-[28rem] overflow-auto")}
        </div>
      )}
      <Sheet
        open={open && !wide}
        onOpenChange={(next) => {
          if (!next) setOpen(false)
        }}
      >
        <SheetContent
          ref={sheetRef}
          side="bottom"
          onOpenAutoFocus={(event) => {
            const input = sheetRef.current?.querySelector("input")
            if (input) {
              event.preventDefault()
              input.focus()
            }
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            toggle.current?.focus()
          }}
          className="gap-0 data-[side=bottom]:h-[70svh]"
        >
          <SheetHeader className="pr-12">
            <SheetTitle>{model.name} anatomy</SheetTitle>
          </SheetHeader>
          {tree(
            "min-h-0 flex-1 overflow-auto rounded-none border-x-0 border-b-0"
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
