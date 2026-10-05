"use client"

import { useState } from "react"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { Button } from "@/components/ui/button"
import { crmDemoCompanies } from "@/registry/lib/crm-demo-data"
import { CrmCommandMenu } from "@/registry/ui/crm-command-menu"
import type { CrmCompany } from "@/registry/lib/crm-companies"

function Menu({ companies, label }: { companies: readonly CrmCompany[]; label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <CrmCommandMenu companies={companies} open={open} onOpenChange={setOpen} hotkey={false} />
    </>
  )
}

const long: CrmCompany = { ...crmDemoCompanies[0], id: "long", name: unbreakable, owner: unbreakable }
const many = Array.from({ length: 30 }, (_, index) => ({
  ...crmDemoCompanies[index % crmDemoCompanies.length],
  id: `c${index}`,
  name: `Empresa ${index + 1}`,
}))

export default function CrmCommandMenuStressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · menú de comandos</h1>
          <p className="mt-2 text-sm text-muted-foreground">Vacío, uno, treinta, nombre sin espacios y RTL.</p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="320px" width={320}>
        <Menu companies={crmDemoCompanies} label="Abrir en 320" />
      </StressCase>
      <StressCase label="Vacío">
        <Menu companies={[]} label="Abrir vacío" />
      </StressCase>
      <StressCase label="Treinta">
        <Menu companies={many} label="Abrir treinta" />
      </StressCase>
      <StressCase label="Nombre largo" width={320}>
        <Menu companies={[long]} label="Abrir nombre largo" />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Menu companies={[{ ...crmDemoCompanies[3], name: "عيادة" }]} label="فتح" />
        </div>
      </StressCase>
    </main>
  )
}
