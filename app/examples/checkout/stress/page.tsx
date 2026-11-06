"use client"

import { StressCase } from "@/app/examples/stress-case"
import { checkoutLabelsEn, type CheckoutLine } from "@/registry/retana/lib/checkout"
import { CheckoutPage } from "@/registry/blocks/checkout-page"

const token = "N".repeat(60)

const shipping = [
  { id: "standard", label: "Envío estándar", description: token, priceCents: 990, icon: "truck" as const },
  { id: "express", label: "Envío exprés", description: "Llega mañana", priceCents: 2490, icon: "fast" as const },
]

const payments = [
  { id: "card", label: "Tarjeta", description: "Débito o crédito", icon: "card" as const },
  { id: "transfer", label: "Transferencia", description: "Banco del comprador", icon: "bank" as const },
]

const line = (id: string, title: string, qty = 1): CheckoutLine => ({
  id,
  title,
  variant: "Único",
  qty,
  unitPrice: 1500,
})

const filled = [line("a", "Producto A", 2), line("b", "Producto B")]

const draft = {
  email: "ana@ejemplo.test",
  phone: "+522221234567",
  name: "Ana Solís",
  line1: "Calle Norte 10",
  city: "Ciudad Demo",
  region: "DEMO",
  postalCode: "00000",
  country: "México",
  shippingMethodId: "standard",
  paymentMethodId: "card",
}

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Caja</h1>
      <StressCase label="Vacío, carga y error">
        <CheckoutPage lines={[]} shippingMethods={shipping} paymentMethods={payments} onBackToStore={() => undefined} />
        <CheckoutPage lines={filled} status="loading" shippingMethods={shipping} paymentMethods={payments} />
        <CheckoutPage lines={filled} status="error" shippingMethods={shipping} paymentMethods={payments} onRetry={() => undefined} />
      </StressCase>
      <StressCase label="320px, una palabra y 60 caracteres" width={320}>
        <CheckoutPage
          lines={[line("a", "A"), line("b", token)]}
          shippingMethods={[{ ...shipping[0]!, label: token }]}
          paymentMethods={payments}
          defaultValues={{ ...draft, name: token, line1: token }}
        />
      </StressCase>
      <StressCase label="RTL, emoji y números" width={360}>
        <div dir="rtl">
          <CheckoutPage
            lines={[line("a", "منتج 😀", 12)]}
            shippingMethods={shipping}
            paymentMethods={payments}
            defaultValues={draft}
            labels={checkoutLabelsEn}
            locale="en"
            currency="USD"
          />
        </div>
      </StressCase>
      <StressCase label="Diez productos">
        <CheckoutPage
          lines={Array.from({ length: 10 }, (_, index) => line(`p${index}`, index === 0 ? "" : `Producto ${index + 1}`, index + 1))}
          shippingMethods={shipping}
          paymentMethods={payments}
          defaultValues={draft}
          layout="accordion"
        />
      </StressCase>
      <StressCase label="Muy ancho">
        <CheckoutPage lines={filled} shippingMethods={shipping} paymentMethods={payments} defaultValues={draft} layout="two-column" />
      </StressCase>
    </main>
  )
}
