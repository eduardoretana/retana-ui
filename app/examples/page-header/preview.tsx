"use client"

import { people } from "@/app/examples/arc/demo-data"
import { PageHeader } from "@/registry/blocks/page-header"

export default function PageHeaderPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <PageHeader members={people.map((person) => ({ name: person.name }))} lead={people[0].name} className="h-full max-h-full" />
    </div>
  )
}
