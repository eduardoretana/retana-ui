"use client"

import { useState } from "react"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { StressCase } from "@/app/examples/stress-case"
import { Button } from "@/components/ui/button"
import { CrmNewCompanyDialog } from "@/registry/ui/crm-new-company-dialog"

const statuses = [{ value: "lead", label: "Prospecto" }]
const owners = [{ value: "elena", label: "Elena Voss" }]

function Open({ label }: { label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <CrmNewCompanyDialog open={open} onOpenChange={setOpen} statuses={statuses} owners={owners} onSubmit={() => setOpen(false)} />
    </>
  )
}

export default function CrmNewCompanyDialogStressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · empresa nueva</h1>
          <p className="mt-2 text-sm text-muted-foreground">El diálogo cabe en 320px y se puede recorrer. Sin dueños extra sigue validando.</p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="320px" width={320}>
        <Open label="Abrir formulario" />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Open label="فتح النموذج" />
        </div>
      </StressCase>
    </main>
  )
}
