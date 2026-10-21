"use client"

import * as React from "react"
import { PanelLeftIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import { AnatomyTree } from "@/registry/retana/ui/anatomy-tree"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  OrganViewer,
  organAnatomyNodes,
  organDefaultVisibility,
  type OrganModel,
} from "@/registry/retana/ui/organ-viewer"

// Matches the lg breakpoint where the sidebar is shown.
const WIDE = "(min-width: 64rem)"
function subscribeWide(onChange: () => void) {
  const query = matchMedia(WIDE)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

// A full-height workspace: the anatomy tree stays in a sidebar on wide
// screens and opens as a sheet on phones, and a details card acts on the
// selected structure.
export function AnatomyWorkspace({
  model,
  className,
}: {
  model: OrganModel
  className?: string
}) {
  const [data] = React.useState(() => organAnatomyNodes(model))
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [visibility, setVisibility] = React.useState<Record<string, boolean>>(
    () => organDefaultVisibility(model)
  )
  const [open, setOpen] = React.useState(false)
  const wide = React.useSyncExternalStore(
    subscribeWide,
    () => matchMedia(WIDE).matches,
    () => true
  )
  const sheetRef = React.useRef<HTMLDivElement>(null)
  const selected = model.structures.find(({ id }) => id === selectedId)
  const hidden = model.structures.filter(
    ({ id }) => visibility[id] === false
  ).length
  const tree = (className: string) => (
    <AnatomyTree
      data={data}
      selectedId={selectedId}
      onSelectionChange={setSelectedId}
      visibility={visibility}
      onVisibilityChange={setVisibility}
      label={`${model.name} anatomy`}
      defaultExpandedIds={
        model.structures.length <= 40 ? data.map(({ id }) => id) : []
      }
      className={className}
    />
  )
  return (
    <div className={cn("flex h-svh flex-col", className)}>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        {!wide && (
          <Button
            variant="outline"
            size="icon"
            aria-label="Open anatomy"
            onClick={() => setOpen(true)}
          >
            <PanelLeftIcon
              aria-hidden="true"
            />
          </Button>
        )}
        <h1 className="font-medium">{model.name}</h1>
        <p className="truncate text-sm text-muted-foreground">
          {model.structures.length} structures
          {hidden > 0 && `, ${hidden} hidden`}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          disabled={hidden === 0}
          onClick={() => setVisibility({})}
        >
          Show all
        </Button>
      </header>
      <div className="flex min-h-0 flex-1">
        {wide && (
          <aside
            aria-label="Anatomy"
            className="flex w-72 shrink-0 flex-col border-r"
          >
            {tree("min-h-0 flex-1 overflow-auto rounded-none border-0")}
          </aside>
        )}
        <main className="flex min-w-0 flex-1 flex-col gap-4 p-4">
          <OrganViewer
            model={model}
            selectedId={selectedId}
            onSelectionChange={setSelectedId}
            visibility={visibility}
            className="h-auto min-h-72 flex-1"
          />
          <Card size="sm" className="shrink-0">
            <CardHeader>
              <CardTitle>
                {selected?.label ?? "No structure selected"}
              </CardTitle>
              <CardDescription>
                {selected?.group ??
                  "Select a structure in the model or the anatomy list."}
              </CardDescription>
            </CardHeader>
            {selected && (
              <>
                {selected.description && (
                  <CardContent>
                    <p>{selected.description}</p>
                  </CardContent>
                )}
                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setVisibility((current) => ({
                        ...current,
                        [selected.id]: current[selected.id] === false,
                      }))
                    }
                  >
                    {visibility[selected.id] === false ? "Show" : "Hide"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setVisibility(
                        Object.fromEntries(
                          model.structures
                            .filter(({ id }) => id !== selected.id)
                            .map(({ id }) => [id, false])
                        )
                      )
                    }
                  >
                    Isolate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => setSelectedId(null)}
                  >
                    Clear
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        </main>
      </div>
      <Sheet open={open && !wide} onOpenChange={setOpen}>
        <SheetContent
          ref={sheetRef}
          side="left"
          onOpenAutoFocus={(event) => {
            const input = sheetRef.current?.querySelector("input")
            if (input) {
              event.preventDefault()
              input.focus()
            }
          }}
          className="gap-0"
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
