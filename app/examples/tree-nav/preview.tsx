"use client"

import { LayoutGrid } from "lucide-react"

import { TreeNav, TreeNavHeader } from "@/registry/ui/tree-nav"

import { projectTree } from "./data"

export default function TreeNavPreview() {
  return (
    <div className="flex h-full items-start justify-center overflow-hidden bg-muted/30 p-3">
      <div className="w-full max-w-xs origin-top scale-[0.86]">
        <TreeNav
          label="Projects"
          items={projectTree}
          defaultExpanded={["updates", "sales", "untitled"]}
          defaultSelected="docs"
          header={<TreeNavHeader name="Morgan Lee" role="Product Designer" />}
          footer={
            <span className="flex min-h-[38px] items-center gap-2 px-2 text-sm font-medium text-primary">
              <LayoutGrid className="size-4" aria-hidden="true" />
              Browse all
            </span>
          }
        />
      </div>
    </div>
  )
}
