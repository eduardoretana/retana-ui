"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { crmDemoCompanies } from "@/registry/lib/crm-demo-data"
import { CrmCompanyDetail } from "@/registry/ui/crm-company-detail"

import { crmMoney } from "../crm-labels"

export function Demo() {
  const [open, setOpen] = useState(false)
  const company = crmDemoCompanies[0]
  return (
    <div className="flex flex-col items-start gap-3">
      <Button type="button" onClick={() => setOpen(true)}>
        Abrir {company.name}
      </Button>
      <CrmCompanyDetail
        company={company}
        open={open}
        onOpenChange={setOpen}
        formatValue={(value) => crmMoney.format(value)}
        labels={{
          close: "Cerrar",
          score: "Puntuación",
          scoreContext: "De 100",
          health: "Salud del pipeline",
          healthDetail: "Cómo está esta cuenta",
          healthLow: "Baja",
          healthWatch: "Atención",
          healthHigh: "Sana",
          trend: "Actividad",
          trendEmpty: "Sin actividad",
          about: "Detalle",
          owner: "Responsable",
          industry: "Giro",
          region: "Región",
          email: "Correo",
          website: "Sitio",
          notes: "Notas",
        }}
      />
    </div>
  )
}
