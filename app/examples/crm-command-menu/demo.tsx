"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { crmDemoCompanies } from "@/registry/lib/crm-demo-data"
import { CrmCommandMenu } from "@/registry/ui/crm-command-menu"

import { crmMoney } from "../crm-labels"

export function Demo() {
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState("Ninguna")
  return (
    <div className="flex flex-col items-start gap-3">
      <Button type="button" onClick={() => setOpen(true)}>
        Buscar
      </Button>
      <p className="text-sm text-muted-foreground">Elegida: {picked}. También abre con ⌘K o Ctrl+K.</p>
      <CrmCommandMenu
        companies={crmDemoCompanies}
        open={open}
        onOpenChange={setOpen}
        formatValue={(value) => crmMoney.format(value)}
        onSelectCompany={(company) => setPicked(company.name)}
        actions={[{ id: "create", label: "Nueva empresa" }]}
        onSelectAction={() => setPicked("Nueva empresa")}
        labels={{
          label: "Buscar empresas",
          description: "Empresas y acciones",
          placeholder: "Nombre o responsable",
          empty: "Ninguna empresa coincide",
          companies: "Empresas",
          actions: "Acciones",
        }}
      />
    </div>
  )
}
