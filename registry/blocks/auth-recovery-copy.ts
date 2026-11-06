/**
 * Clean-room copy for password recovery and email verification.
 * One sentence per outcome. Nothing here takes an "account exists" flag.
 */

export type AuthLocale = "es-MX" | "en"

const LEAK =
  /no account|not found|does not exist|doesn't exist|no existe|sin cuenta|no encontramos|unknown user|user not found|correo no registrado|email not registered/i

export function recoveryCopyLeaksAccount(text: string) {
  return LEAK.test(text)
}

const forgot = {
  en: {
    title: "Forgot your password?",
    description: "Enter your email and we will send reset instructions.",
    email: "Email",
    emailPlaceholder: "name@example.com",
    emailRequired: "Enter your email address.",
    emailInvalid: "Enter a full address, like name@example.com.",
    submit: "Send link",
    sending: "Sending",
    sentTitle: "Check your inbox",
    sentBody: "If an account uses that address, a reset link is on its way. Check the inbox and the spam folder.",
    back: "Back to sign in",
    serverError: "We could not send the link. Try again in a moment.",
  },
  "es-MX": {
    title: "¿Olvidaste tu contraseña?",
    description: "Escribe tu correo y enviaremos instrucciones para restablecerla.",
    email: "Correo",
    emailPlaceholder: "nombre@ejemplo.com",
    emailRequired: "Escribe tu correo.",
    emailInvalid: "Escribe un correo completo, como nombre@ejemplo.com.",
    submit: "Enviar enlace",
    sending: "Enviando",
    sentTitle: "Revisa tu bandeja",
    sentBody: "Si hay una cuenta con esa dirección, el enlace para restablecer va en camino. Revisa la bandeja y el correo no deseado.",
    back: "Volver a entrar",
    serverError: "No pudimos enviar el enlace. Inténtalo de nuevo en un momento.",
  },
}

const reset = {
  en: {
    title: "Choose a new password",
    description: "Use a long password that you do not use anywhere else.",
    password: "New password",
    confirm: "Confirm password",
    submit: "Update password",
    sending: "Updating",
    rules: "The password does not meet the rules yet.",
    mismatch: "Those passwords do not match.",
    successTitle: "Password updated",
    successBody: "You can sign in with the new password.",
    back: "Back to sign in",
    invalidTitle: "This link is not valid",
    invalidBody: "Request a new reset link and open the latest email.",
    expiredTitle: "This link has expired",
    expiredBody: "Reset links last for a short time. Request a new one.",
    request: "Request a new link",
    serverError: "We could not update the password. Try again in a moment.",
    ruleLength: "At least 12 characters",
    ruleCase: "Upper and lowercase letters",
    ruleNumber: "At least one number",
    ruleSymbol: "At least one symbol",
    show: "Show password",
    hide: "Hide password",
    tooShort: "Too short",
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong",
    empty: "No password yet",
    more: "more",
    meter: "Password strength",
    requirements: "Password requirements",
    met: ", met",
    unmet: ", not met",
  },
  "es-MX": {
    title: "Elige una contraseña nueva",
    description: "Usa una contraseña larga que no repitas en otro sitio.",
    password: "Contraseña nueva",
    confirm: "Confirmar contraseña",
    submit: "Actualizar contraseña",
    sending: "Actualizando",
    rules: "La contraseña todavía no cumple las reglas.",
    mismatch: "Las contraseñas no coinciden.",
    successTitle: "Contraseña actualizada",
    successBody: "Ya puedes entrar con la contraseña nueva.",
    back: "Volver a entrar",
    invalidTitle: "Este enlace no es válido",
    invalidBody: "Pide otro enlace y abre el correo más reciente.",
    expiredTitle: "Este enlace caducó",
    expiredBody: "Los enlaces duran poco. Pide uno nuevo.",
    request: "Pedir un enlace nuevo",
    serverError: "No pudimos actualizar la contraseña. Inténtalo de nuevo en un momento.",
    ruleLength: "Al menos 12 caracteres",
    ruleCase: "Mayúsculas y minúsculas",
    ruleNumber: "Al menos un número",
    ruleSymbol: "Al menos un símbolo",
    show: "Mostrar contraseña",
    hide: "Ocultar contraseña",
    tooShort: "Corta",
    weak: "Débil",
    fair: "Regular",
    good: "Buena",
    strong: "Fuerte",
    empty: "Aún no hay contraseña",
    more: "más",
    meter: "Fortaleza de la contraseña",
    requirements: "Reglas de la contraseña",
    met: ", cumplida",
    unmet: ", pendiente",
  },
}

const verify = {
  en: {
    title: "Check your email",
    description: "We sent a message so you can confirm the address. It expires in 10 minutes.",
    address: "Address",
    resend: "Resend email",
    resendWait: "Resend email in",
    sending: "Sending",
    resent: "Check your email again.",
    code: "Verification code",
    codeHint: "Enter the code from the latest message.",
    codeInvalid: "That code does not match. Check the latest message.",
    codeValid: "Code confirmed",
    verify: "Verify",
    checking: "Checking",
    successTitle: "Email verified",
    successBody: "The address is confirmed. You can continue.",
    skip: "Verify later",
    serverError: "We could not send the email. Try again in a moment.",
  },
  "es-MX": {
    title: "Revisa tu correo",
    description: "Enviamos un mensaje para confirmar la dirección. Caduca en 10 minutos.",
    address: "Dirección",
    resend: "Reenviar correo",
    resendWait: "Reenviar correo en",
    sending: "Enviando",
    resent: "Revisa tu correo otra vez.",
    code: "Código de verificación",
    codeHint: "Escribe el código del mensaje más reciente.",
    codeInvalid: "Ese código no coincide. Revisa el mensaje más reciente.",
    codeValid: "Código confirmado",
    verify: "Verificar",
    checking: "Revisando",
    successTitle: "Correo verificado",
    successBody: "La dirección quedó confirmada. Puedes continuar.",
    skip: "Verificar más tarde",
    serverError: "No pudimos enviar el correo. Inténtalo de nuevo en un momento.",
  },
}

export const authRecoveryCopy = { forgot, reset, verify }

export function recoverySentBody(locale: AuthLocale) {
  return forgot[locale].sentBody
}

export function forgotCopy(locale: AuthLocale) {
  return forgot[locale]
}

export function resetCopy(locale: AuthLocale) {
  return reset[locale]
}

export function verifyCopy(locale: AuthLocale) {
  return verify[locale]
}
