"use client"

import * as React from "react"

import { ExampleFrame } from "@/app/examples/example-frame"
import { opportunities, opportunityFields, opportunityViews } from "@/app/examples/multi-view/data"
import type { SortClause } from "@/registry/lib/multi-view"
import { ViewTable } from "@/registry/ui/view-table"

export function ViewTableDemo() {
  const [sort, setSort] = React.useState<SortClause | null>(null)
  return (
    <ExampleFrame wide title="Table view" description="Tabla generada desde el esquema. Orden y selección viven aquí.">
      <ViewTable
        records={opportunities}
        fields={opportunityFields}
        config={opportunityViews[0]}
        locale="en-US"
        sort={sort}
        onSortChange={setSort}
        onOpen={() => undefined}
      />
    </ExampleFrame>
  )
}
