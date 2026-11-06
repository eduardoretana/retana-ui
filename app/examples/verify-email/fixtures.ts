import type { VerifyEmailPhase } from "@/registry/blocks/verify-email"

export const address = "hola@costa-atelier.example"

export const filled = { email: address, otp: true }
export const empty = { email: "", otp: false }
export const loading = { email: address, otp: true, phase: "submitting" as VerifyEmailPhase }
export const error = { email: address, otp: true, phase: "error" as VerifyEmailPhase }
export const invalid = { email: address, otp: true, phase: "invalid" as VerifyEmailPhase }
export const cooldown = { email: address, otp: true, phase: "cooldown" as VerifyEmailPhase }
export const success = { email: address, phase: "success" as VerifyEmailPhase }

export const longEmail = `${"N".repeat(60)}@costa-atelier.example`
