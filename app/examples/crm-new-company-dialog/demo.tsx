"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { crmDemoOwners } from "@/registry/lib/crm-demo-data"
import { CrmNewCompanyDialog } from "@/registry/ui/crm-new-company-dialog"

const statuses = [
  { value: "active", label: "Activa" },
  { value: "lead", label: "Prospecto" },
  { value: "churned", label: "Inactiva" },
]

export function Demo() {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState("Todavía no hay un alta")
  return (
    <div className="flex flex-col items-start gap-3">
      <Button type="button" onClick={() => setOpen(true)}>
        Nueva empresa
      </Button>
      <p className="text-sm text-muted-foreground">{saved}</p>
      <CrmNewCompanyDialog
        open={open}
        onOpenChange={setOpen}
        statuses={statuses}
        owners={crmDemoOwners.map((owner) => ({ value: owner.id, label: owner.name }))}
        onSubmit={(draft) => setSaved(`Guardada: ${draft.name.trim()}`)}
        labels={{
          title: "Nueva empresa",
          description: "Los campos con asterisco son obligatorios.",
          identity: "Identidad",
          relationship: "Relación",
          commercial: "Comercial",
          logo: "Logo",
          upload: "Subir logo",
          removeLogo: "Quitar logo",
          name: "Nombre",
          email: "Correo",
          website: "Sitio",
          status: "Estado",
          statusPlaceholder: "Elige un estado",
          owner: "Responsable",
          ownerPlaceholder: "Elige a alguien",
          industry: "Giro",
          region: "Región",
          pipeline: "Valor del pipeline",
          notes: "Notas",
          cancel: "Cancelar",
          save: "Guardar empresa",
          invalid: "Revisa los campos marcados",
          issues: {
            "name-required": "Escribe un nombre",
            "status-required": "Elige un estado",
            "owner-required": "Elige un responsable",
            "email-invalid": "Ese correo no es válido",
            "website-invalid": "El sitio debe empezar por http:// o https://",
            "pipeline-invalid": "El valor tiene que ser cero o más",
            "logo-type": "El logo tiene que ser PNG, JPEG, WebP o GIF",
            "logo-size": "El logo tiene que pesar 2 MB o menos",
          },
        }}
      />
    </div>
  )
}
