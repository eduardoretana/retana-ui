"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ForgotPassword } from "@/registry/blocks/forgot-password"

import { longEmail } from "../fixtures"

const quiet = async () => {}

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Olvidé mi contraseña</h1>
      <StressCase label="Vacío">
        <ForgotPassword locale="es-MX" onSubmit={quiet} />
      </StressCase>
      <StressCase label="Inválido, enviando y error">
        <ForgotPassword locale="es-MX" phase="invalid" defaultEmail="hola@" onSubmit={quiet} />
        <ForgotPassword locale="en" phase="submitting" defaultEmail="hola@costa-atelier.example" onSubmit={quiet} />
        <ForgotPassword locale="en" phase="error" defaultEmail="hola@costa-atelier.example" onSubmit={quiet} />
      </StressCase>
      <StressCase label="390 px" width={390}>
        <ForgotPassword locale="es-MX" phase="sent" defaultEmail={longEmail} onSubmit={quiet} brand={{ name: "N".repeat(60) }} />
      </StressCase>
      <StressCase label="RTL" width={390}>
        <div dir="rtl">
          <ForgotPassword
            locale="en"
            defaultEmail={longEmail}
            onSubmit={quiet}
            labels={{ title: "نسيت كلمة المرور؟", description: "اكتب البريد. الرسالة لا تقول إن كان الحساب موجوداً.", email: "البريد", submit: "إرسال الرابط" }}
          />
        </div>
      </StressCase>
    </main>
  )
}
