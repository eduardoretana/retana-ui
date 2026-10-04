"use client"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { TwoFactorCard } from "@/registry/ui/two-factor-card"

export default function TwoFactorCardStressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · tarjeta de verificación</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            320px, título sin espacios, RTL, separador, carga, error, éxito, sin métodos y un hermano en el mismo flex.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="320px" width={320}>
        <TwoFactorCard expiresIn={90} onBack={() => {}} onMenu={() => {}} />
      </StressCase>
      <StressCase label="Título largo" width={320}>
        <TwoFactorCard title={unbreakable} description={unbreakable} expiresIn={45} methods={[]} />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <TwoFactorCard
            title="التحقق بخطوتين"
            description="أدخل الرمز المكوّن من ستة أرقام"
            verifyLabel="تحقق"
            expiresLabel="ينتهي خلال"
            resendLabel="إعادة الإرسال"
            expiresIn={75}
          />
        </div>
      </StressCase>
      <StressCase label="Separador y ocho dígitos" width={360}>
        <TwoFactorCard length={8} separator defaultValue="1234" className="max-w-none" />
      </StressCase>
      <StressCase label="Carga">
        <TwoFactorCard defaultValue="123456" autoSubmit onVerify={() => new Promise(() => {})} gradient />
      </StressCase>
      <StressCase label="Error">
        <TwoFactorCard defaultValue="000000" autoSubmit onVerify={() => false} />
      </StressCase>
      <StressCase label="Éxito">
        <TwoFactorCard
          defaultValue="246810"
          autoSubmit
          gradient
          onVerify={() => true}
          successDescription="Listo para entrar."
        />
      </StressCase>
      <StressCase label="Vacío y deshabilitado">
        <TwoFactorCard disabled methods={[]} description="" title=" " verifyLabel="Verificar" />
      </StressCase>
      <StressCase label="Emoji">
        <TwoFactorCard title="🔐 Código" description="El horno 🔥 espera el código." expiresIn={30} />
      </StressCase>
      <StressCase label="Apretado por un hermano">
        <div className="flex max-w-md items-start gap-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-muted text-xs text-muted-foreground">
            16
          </div>
          <TwoFactorCard className="max-w-none" expiresIn={20} methods={[{ id: "qr", label: "QR" }]} />
        </div>
      </StressCase>
      <StressCase label="Muy ancho">
        <div className="w-full max-w-4xl">
          <TwoFactorCard expiresIn={12} />
        </div>
      </StressCase>
    </main>
  )
}
