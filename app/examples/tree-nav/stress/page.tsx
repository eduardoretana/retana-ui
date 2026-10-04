"use client"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { TreeNav, TreeNavHeader, type TreeNavNode } from "@/registry/ui/tree-nav"

import { projectTree } from "../data"

const deep: TreeNavNode[] = [
  {
    id: "root",
    label: "Root",
    children: [
      {
        id: "level-2",
        label: "Level 2",
        children: [
          {
            id: "level-3",
            label: "Level 3",
            children: [{ id: "level-4", label: "Level 4" }],
          },
        ],
      },
    ],
  },
]

const many: TreeNavNode[] = Array.from({ length: 10 }, (_, index) => ({
  id: `folder-${index + 1}`,
  label: `Folder ${index + 1}`,
  count: index + 1,
  children: [{ id: `file-${index + 1}`, label: `Note ${index + 1}` }],
}))

export default function TreeNavStressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · árbol de navegación</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            320px, vacío, un nodo, diez carpetas, un nombre sin espacios, RTL, emoji y un nodo deshabilitado.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="320px" width={320}>
        <TreeNav
          label="Projects"
          items={projectTree}
          defaultExpanded={["updates", "sales", "untitled", "support"]}
          header={<TreeNavHeader name="Morgan Lee" role="Product Designer" />}
        />
      </StressCase>
      <StressCase label="Vacío" width={320}>
        <TreeNav label="Empty" items={[]} header={<TreeNavHeader name="—" role="No rows" />} />
      </StressCase>
      <StressCase label="Un nodo" width={320}>
        <TreeNav label="One" items={[{ id: "only", label: "Only note" }]} />
      </StressCase>
      <StressCase label="Diez carpetas" width={320}>
        <TreeNav label="Many" items={many} defaultExpanded={many.map((item) => item.id)} />
      </StressCase>
      <StressCase label="Nombre largo" width={320}>
        <TreeNav label="Long" items={[{ id: "long", label: unbreakable, count: 3, children: [{ id: "child", label: unbreakable }] }]} defaultExpanded={["long"]} />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <TreeNav
            label="شجرة"
            items={deep}
            defaultExpanded={["root", "level-2", "level-3"]}
            header={<TreeNavHeader name="ليلى حسن" role="تصميم" />}
          />
        </div>
      </StressCase>
      <StressCase label="Emoji" width={320}>
        <TreeNav label="Emoji" items={[{ id: "emoji", label: "Notas 📁✨", count: 2, children: [{ id: "spark", label: "Idea 🔥" }] }]} defaultExpanded={["emoji"]} />
      </StressCase>
      <StressCase label="Deshabilitado" width={320}>
        <TreeNav label="Disabled" items={[{ id: "off", label: "Archived", disabled: true }, { id: "on", label: "Active" }]} />
      </StressCase>
    </main>
  )
}
