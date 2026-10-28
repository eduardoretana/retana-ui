"use client"

import { StressCase } from "@/app/examples/stress-case"
import { PermissionRequest } from "@/registry/ui/permission-request"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Petición de permiso</h1>
      <StressCase label="Vacío">
        <PermissionRequest />
      </StressCase>
      <StressCase label="Carga y error">
        <PermissionRequest loading />
        <PermissionRequest error="No se leyó la petición." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <PermissionRequest agent={{ name: token }} action={token} reason={token} risk="destructive" preview={[{ id: "a", label: token, meta: token }]} />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <PermissionRequest agent={{ name: "بريما" }} action="إرسال البريد" reason="السبب" target="ورشة" />
        </div>
      </StressCase>
      <StressCase label="Diez filas">
        <PermissionRequest
          agent={{ name: "Bruma" }}
          action="mandar el correo"
          preview={Array.from({ length: 10 }, (_, index) => ({ id: String(index), label: index === 0 ? "" : `Fila ${index}` }))}
        />
      </StressCase>
    </main>
  )
}
