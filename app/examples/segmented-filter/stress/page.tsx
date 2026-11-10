"use client"

import { StressCase } from "@/app/examples/stress-case"
import { SegmentedFilter } from "@/registry/ui/segmented-filter"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Filtro</h1>
      <StressCase label="Vacío"><SegmentedFilter label="Filtro" options={[]} status="empty" /></StressCase>
      <StressCase label="Carga y error"><SegmentedFilter label="Filtro" options={[]} status="loading" /><SegmentedFilter label="Filtro" options={[]} status="error" error="Fallo" /></StressCase>
      <StressCase label="320px" width={320}>
        <SegmentedFilter label="Filtro" value="all" options={Array.from({ length: 8 }, (_, index) => ({ value: `v${index}`, label: index === 0 ? token : `Filtro ${index}` }))} />
      </StressCase>
      <StressCase label="Cinco filtros largos en inglés" width={220}>
        <SegmentedFilter
          label="Filter"
          value="mine"
          options={[
            { value: "all", label: "All conversations" },
            { value: "leads", label: "Open leads this quarter" },
            { value: "clients", label: "Active clients" },
            { value: "unread", label: "Unread messages" },
            { value: "mine", label: "Assigned to me this week" },
          ]}
        />
      </StressCase>
      <StressCase label="RTL" width={320}><div dir="rtl"><SegmentedFilter label="تصفية" value="a" options={[{ value: "a", label: "الكل" }, { value: "b", label: "غير مقروء" }]} /></div></StressCase>
    </main>
  )
}
