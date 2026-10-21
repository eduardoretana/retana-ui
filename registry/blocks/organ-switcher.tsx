"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrganViewer, type OrganModel } from "@/registry/retana/ui/organ-viewer"

// One viewer for several organs. Switching remounts the viewer, so each organ
// opens in its own default view with nothing selected.
export function OrganSwitcher({
  models,
  defaultOrgan = models[0]?.name,
  className,
}: {
  models: readonly OrganModel[]
  /** Name of the organ shown first. Defaults to the first model. */
  defaultOrgan?: string
  className?: string
}) {
  const [organ, setOrgan] = React.useState(defaultOrgan)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const model = models.find(({ name }) => name === organ) ?? models[0]
  if (!model) return null
  const selected = model.structures.find(({ id }) => id === selectedId)
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-semibold">{model.name}</h2>
          <p className="text-sm text-muted-foreground">
            {model.structures.length} structures, {model.views.length} views
          </p>
        </div>
        <Select
          value={model.name}
          onValueChange={(next) => {
            if (!next) return
            setOrgan(next)
            setSelectedId(null)
          }}
        >
          <SelectTrigger aria-label="Organ" className="min-w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {models.map(({ name }) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <OrganViewer
        key={model.name}
        model={model}
        selectedId={selectedId}
        onSelectionChange={setSelectedId}
        className="h-[28rem]"
      />
      <p className="text-sm text-muted-foreground" role="status">
        {selected
          ? `${selected.label}: ${selected.description ?? selected.group}`
          : `Select a structure of the ${model.name.toLowerCase()} to learn about it.`}
      </p>
    </div>
  )
}
