import type { ForgotPasswordPhase } from "@/registry/blocks/forgot-password"

export const filled = { email: "hola@costa-atelier.example" }
export const empty = { email: "" }
export const loading = { email: "hola@costa-atelier.example", phase: "submitting" as ForgotPasswordPhase }
export const error = { email: "hola@costa-atelier.example", phase: "error" as ForgotPasswordPhase }
export const invalid = { email: "hola@", phase: "invalid" as ForgotPasswordPhase }
export const sent = { email: "hola@costa-atelier.example", phase: "sent" as ForgotPasswordPhase }

export const longEmail = `${"N".repeat(60)}@costa-atelier.example`
