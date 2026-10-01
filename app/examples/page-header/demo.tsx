"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { people, unbreakable } from "@/app/examples/arc/demo-data"
import { PageHeader, type PageIssue } from "@/registry/blocks/page-header"

const members = people.map((person) => ({ name: person.name }))
const crowd: PageIssue[] = people.map((person, index) => ({
  id: `CA-${200 + index}`,
  title: `${person.role} · ${person.name}`,
  owner: "ines",
  label: person.role,
}))

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader members={members} lead={people[0].name} />
      <StressCases
        empty={<PageHeader title="Vacío" description="" issues={[]} updates={[]} files={[]} members={[]} className="h-80" />}
        long={<PageHeader title={unbreakable} description={unbreakable} className="h-96" />}
        crowded={<PageHeader issues={crowd} members={members} className="h-96" />}
      />
    </div>
  )
}
