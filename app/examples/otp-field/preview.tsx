"use client"

import { OtpField } from "@/registry/ui/otp-field"

export default function OtpFieldPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <OtpField defaultValue="123" label="Código" hint="Te lo enviamos por correo" resendLabel="Reenviar" onResend={() => {}} />
    </div>
  )
}
