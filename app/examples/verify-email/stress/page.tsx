"use client"

import { StressCase } from "@/app/examples/stress-case"
import { VerifyEmail } from "@/registry/blocks/verify-email"

import { longEmail } from "../fixtures"

const quiet = async () => {}

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Verificar correo</h1>
      <StressCase label="Vacío">
        <VerifyEmail locale="es-MX" onResend={quiet} />
      </StressCase>
      <StressCase label="Código, espera, carga y error">
        <VerifyEmail locale="es-MX" email={longEmail} otp phase="invalid" onResend={quiet} onVerifyCode={async () => false} />
        <VerifyEmail locale="en" email="hola@costa-atelier.example" phase="cooldown" onResend={quiet} />
        <VerifyEmail locale="en" email="hola@costa-atelier.example" phase="submitting" otp onResend={quiet} />
        <VerifyEmail locale="en" email="hola@costa-atelier.example" phase="error" onResend={quiet} />
      </StressCase>
      <StressCase label="390 px" width={390}>
        <VerifyEmail locale="es-MX" email={longEmail} otp skipHref="/examples/sign-in" onResend={quiet} onVerifyCode={async () => false} />
      </StressCase>
      <StressCase label="RTL" width={390}>
        <div dir="rtl">
          <VerifyEmail locale="en" email={longEmail} onResend={quiet} labels={{ title: "راجع بريدك", description: "أرسلنا رسالة. لا نقول إن كان الحساب موجوداً.", resend: "إعادة الإرسال" }} />
        </div>
      </StressCase>
    </main>
  )
}
