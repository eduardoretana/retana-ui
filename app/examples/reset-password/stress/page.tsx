"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ResetPassword } from "@/registry/blocks/reset-password"

import { longToken, strong } from "../fixtures"

const quiet = async () => {}

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Restablecer contraseña</h1>
      <StressCase label="Vacío">
        <ResetPassword locale="es-MX" onSubmit={quiet} />
      </StressCase>
      <StressCase label="No coinciden, carga y error">
        <ResetPassword locale="es-MX" phase="invalid" defaultPassword={strong} defaultConfirm={`${strong}?`} onSubmit={quiet} />
        <ResetPassword locale="en" phase="submitting" defaultPassword={strong} defaultConfirm={strong} onSubmit={quiet} />
        <ResetPassword locale="en" phase="error" defaultPassword={strong} defaultConfirm={strong} onSubmit={quiet} />
      </StressCase>
      <StressCase label="Enlace inválido y vencido">
        <ResetPassword tokenState="invalid" onSubmit={quiet} requestHref="/examples/forgot-password" />
        <ResetPassword tokenState="expired" onSubmit={quiet} requestHref="/examples/forgot-password" />
      </StressCase>
      <StressCase label="390 px" width={390}>
        <ResetPassword locale="es-MX" defaultPassword={longToken} defaultConfirm={longToken} onSubmit={quiet} brand={{ name: longToken }} />
      </StressCase>
      <StressCase label="RTL" width={390}>
        <div dir="rtl">
          <ResetPassword locale="en" onSubmit={quiet} labels={{ title: "كلمة مرور جديدة", password: "الجديدة", confirm: "التأكيد", submit: "تحديث" }} />
        </div>
      </StressCase>
    </main>
  )
}
