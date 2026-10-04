"use client"

import { useState } from "react"
import { LayoutGrid, ListFilter } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TreeNav, TreeNavHeader, type TreeNavNode } from "@/registry/ui/tree-nav"

import { projectTree } from "./data"

export function Demo() {
  const [selected, setSelected] = useState<TreeNavNode | null>(null)
  const [added, setAdded] = useState(0)

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
      <TreeNav
        label="Projects"
        items={projectTree}
        defaultExpanded={["updates", "sales", "untitled"]}
        onSelect={setSelected}
        onAddNew={() => setAdded((count) => count + 1)}
        header={
          <TreeNavHeader
            name="Morgan Lee"
            role="Product Designer"
            action={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" aria-label="Sort and filter">
                    <ListFilter />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Name</DropdownMenuItem>
                  <DropdownMenuItem>Recent</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />
        }
        footer={
          <a
            href="#all"
            className="flex min-h-[38px] items-center gap-2 rounded-md px-2 text-sm font-medium text-primary hover:bg-accent"
          >
            <LayoutGrid className="size-4" aria-hidden="true" />
            Browse all
          </a>
        }
      />
      <p className="text-sm text-muted-foreground">
        {selected ? (
          <>
            Selected <span className="text-foreground">{selected.label}</span>
          </>
        ) : (
          "Select a row."
        )}
        {added ? ` Added ${added}.` : ""}
      </p>
    </div>
  )
}
