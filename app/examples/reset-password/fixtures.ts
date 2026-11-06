import type { ResetPasswordPhase } from "@/registry/blocks/reset-password"

export const strong = "Horno-2026!mx"

export const filled = { password: strong, confirm: strong }
export const empty = { password: "", confirm: "" }
export const loading = { password: strong, confirm: strong, phase: "submitting" as ResetPasswordPhase }
export const error = { password: strong, confirm: strong, phase: "error" as ResetPasswordPhase }
export const invalid = { password: strong, confirm: `${strong}?`, phase: "invalid" as ResetPasswordPhase }
export const success = { phase: "success" as ResetPasswordPhase }

export const longToken = "N".repeat(60)
