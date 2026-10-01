"use client"

/** Adapted from Arc UI (MIT). */

import { useEffect, useId, useRef, useState } from "react"
import type { FormEvent, PointerEvent, ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"
import { Check, FingerprintPattern, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import { OtpField } from "@/registry/retana/ui/otp-field"

export type LoginStep = "passkey" | "email" | "code" | "done"
export type LoginMode = "sign-in" | "sign-up"
export type LoginProvider = "Google" | "Apple" | "GitHub"
export type LoginMethod = "Passkey" | "Email code" | LoginProvider

export type LoginDelays = {
  passkey?: number
  verified?: number
  email?: number
  code?: number
  provider?: number
}

export type LoginCenteredClassNames = {
  root?: string
  card?: string
  heading?: string
  form?: string
  footer?: string
}

export type LoginCenteredProps = {
  /** The code the simulated email contains. */
  demoCode?: string
  /** Fill the viewport when the block is the whole page. */
  fullScreen?: boolean
  /** The account a simulated passkey or single sign-on resolves to. */
  demoEmail?: string
  brand?: { name: string; mark?: ReactNode }
  termsHref?: string
  privacyHref?: string
  /** Simulated waits, in milliseconds. */
  delays?: LoginDelays
  /** Seconds before another code can be sent. */
  resendSeconds?: number
  onSignIn?: (email: string, method: LoginMethod, mode: LoginMode) => void
  className?: string
  classNames?: LoginCenteredClassNames
}

const DEFAULT_DELAYS: Required<LoginDelays> = { passkey: 1700, verified: 640, email: 800, code: 700, provider: 900 }
const providers: LoginProvider[] = ["Google", "Apple", "GitHub"]
const providerMarks: Record<LoginProvider, string> = {
  Google: "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z",
  Apple: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
  GitHub: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
}
const rings = Array.from({ length: 10 }, (_, index) => 180 + index * 56)
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())

function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 14.5c1.2-4 3.4-6 6-6s4.8 2 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="14.5" r="1.4" fill="currentColor" />
    </svg>
  )
}

function ProviderIcon({ provider }: { provider: LoginProvider }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={providerMarks[provider]} />
    </svg>
  )
}

/**
 * A centered sign-in. A passkey is the first step, then email and a one-time code,
 * with single sign-on beside them. Every step is simulated on this page.
 */
export function LoginCentered({
  demoCode = "482913",
  fullScreen = false,
  demoEmail = "maya@studio.example",
  brand = { name: "Studio" },
  termsHref = "#terms",
  privacyHref = "#privacy",
  delays,
  resendSeconds = 30,
  onSignIn,
  className,
  classNames,
}: LoginCenteredProps) {
  const reduce = useReducedMotion() ?? false
  const timing = { ...DEFAULT_DELAYS, ...delays }
  const labelId = useId()
  const [step, setStep] = useState<LoginStep>("passkey")
  const [mode, setMode] = useState<LoginMode>("sign-in")
  const [direction, setDirection] = useState(1)
  const [passkey, setPasskey] = useState<"idle" | "waiting" | "verified">("idle")
  const [busy, setBusy] = useState<null | "email" | "code" | LoginProvider>(null)
  const [verified, setVerified] = useState(false)
  const [email, setEmail] = useState("")
  const [touched, setTouched] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [code, setCode] = useState("")
  const [codeError, setCodeError] = useState("")
  const [resendIn, setResendIn] = useState(resendSeconds)
  const [account, setAccount] = useState(demoEmail)
  const [method, setMethod] = useState<LoginMethod>("Passkey")
  const [status, setStatus] = useState("")
  const passkeyRef = useRef<HTMLButtonElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const codeRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)
  const focusNext = useRef<LoginStep | null>(null)
  const timers = useRef<number[]>([])
  const verifying = useRef(false)
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const springX = useSpring(pointerX, { visualDuration: 0.9, bounce: 0 })
  const springY = useSpring(pointerY, { visualDuration: 0.9, bounce: 0 })
  const driftX = useTransform(springX, (value) => value * 10)
  const driftY = useTransform(springY, (value) => value * 10)
  const signingUp = mode === "sign-up"
  const emailError = (touched || attempted) && !isEmail(email) ? (email.trim() ? "Enter a full address, like name@example.com." : "Enter your email address.") : ""

  useEffect(() => {
    const pending = timers
    return () => pending.current.forEach((id) => window.clearTimeout(id))
  }, [])

  useEffect(() => {
    if (step !== "code" || resendIn <= 0) return
    const timer = window.setTimeout(() => setResendIn((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [step, resendIn])

  useEffect(() => {
    const target = focusNext.current
    focusNext.current = null
    if (target === "passkey") passkeyRef.current?.focus()
    if (target === "email") emailRef.current?.focus()
    if (target === "code") codeRef.current?.querySelector("input")?.focus()
    if (target === "done") doneRef.current?.focus()
  }, [step, mode])

  function later(run: () => void, ms: number) {
    timers.current.push(window.setTimeout(run, ms))
  }

  function settle() {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
    verifying.current = false
    setBusy(null)
    setVerified(false)
  }

  function go(next: LoginStep, towards: number) {
    focusNext.current = next
    setDirection(towards)
    if (next === "passkey") setPasskey("idle")
    setStep(next)
  }

  function complete(address: string, how: LoginMethod) {
    settle()
    setAccount(address)
    setMethod(how)
    go("done", 1)
    setStatus(`${signingUp ? "Account created" : "Signed in"} with ${how === "Email code" ? "an email code" : how === "Passkey" ? "a passkey" : how}`)
    onSignIn?.(address, how, mode)
  }

  function startPasskey() {
    if (passkey !== "idle" || busy) return
    setPasskey("waiting")
    setStatus("Waiting for your passkey")
    later(() => {
      setPasskey("verified")
      setStatus("Passkey verified")
      later(() => complete(demoEmail, "Passkey"), timing.verified)
    }, timing.passkey)
  }

  function cancelPasskey() {
    settle()
    setPasskey("idle")
    setStatus("Passkey request canceled")
    passkeyRef.current?.focus()
  }

  function switchToEmail() {
    if (passkey === "verified" || busy) return
    settle()
    setPasskey("idle")
    setAttempted(false)
    go("email", 1)
    setStatus("We will email you a sign in code")
  }

  function signInWith(provider: LoginProvider) {
    if (busy || passkey !== "idle") return
    setBusy(provider)
    setStatus(`Opening ${provider}`)
    later(() => complete(demoEmail, provider), timing.provider)
  }

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setAttempted(true)
    if (!isEmail(email)) {
      emailRef.current?.focus()
      return
    }
    setBusy("email")
    setStatus("Sending a code")
    later(() => {
      const address = email.trim().toLowerCase()
      setBusy(null)
      setAccount(address)
      setCode("")
      setCodeError("")
      setResendIn(resendSeconds)
      go("code", 1)
      setStatus(`Code sent to ${address}`)
    }, timing.email)
  }

  function verify(value: string) {
    if (busy || verified || verifying.current) return
    if (value.length < 6) {
      setCodeError("Enter all 6 digits.")
      codeRef.current?.querySelector("input")?.focus()
      return
    }
    verifying.current = true
    setBusy("code")
    setStatus("Checking code")
    later(() => {
      verifying.current = false
      setBusy(null)
      if (value !== demoCode) {
        setCode("")
        setCodeError("That code didn't match. Check the latest email and try again.")
        setStatus("Code didn't match")
        codeRef.current?.querySelector("input")?.focus()
        return
      }
      setVerified(true)
      setStatus("Code verified")
      later(() => complete(account, "Email code"), timing.verified)
    }, timing.code)
  }

  function changeCode(value: string) {
    if (busy || verified) return
    setCode(value)
    if (codeError && value) setCodeError("")
    if (value.length === 6) verify(value)
  }

  function resend() {
    if (busy || verified || resendIn > 0) return
    setResendIn(resendSeconds)
    setCode("")
    setCodeError("")
    setStatus("New code sent")
    codeRef.current?.querySelector("input")?.focus()
  }

  function changeEmail() {
    settle()
    setAttempted(false)
    go("email", -1)
    setStatus("Edit your email")
  }

  function switchToPasskey() {
    settle()
    setMode("sign-in")
    go("passkey", -1)
    setStatus("Sign in with your passkey")
  }

  function switchMode() {
    settle()
    setAttempted(false)
    setCode("")
    if (signingUp) {
      setMode("sign-in")
      go("passkey", -1)
      setStatus("Sign in to your account")
      return
    }
    setMode("sign-up")
    go("email", 1)
    setStatus("Create an account with your email")
  }

  function signOut() {
    settle()
    setEmail("")
    setTouched(false)
    setAttempted(false)
    setCode("")
    setMode("sign-in")
    go("passkey", -1)
    setStatus("Signed out")
  }

  function openLegal(href: string, label: string) {
    return (event: { preventDefault: () => void }) => {
      if (!href.startsWith("#")) return
      event.preventDefault()
      setStatus(`${label} opens here in your app (demo)`)
    }
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (reduce || event.pointerType !== "mouse") return
    const box = event.currentTarget.getBoundingClientRect()
    if (!box.width || !box.height) return
    pointerX.set((event.clientX - box.left) / box.width - 0.5)
    pointerY.set((event.clientY - box.top) / box.height - 0.5)
  }

  const stepMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: direction * 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: direction * -8 },
      }

  const clock = `${Math.floor(resendIn / 60)}:${String(resendIn % 60).padStart(2, "0")}`

  return (
    <section
      data-slot="login-centered"
      data-step={step}
      aria-labelledby={labelId}
      className={cn("relative flex w-full min-w-0 flex-col overflow-hidden bg-background text-foreground", fullScreen ? "min-h-dvh" : "min-h-[36rem]", className, classNames?.root)}
      onPointerMove={onPointerMove}
      onPointerLeave={() => { pointerX.set(0); pointerY.set(0) }}
    >
      <h2 id={labelId} className="sr-only">{signingUp ? "Create an account" : "Sign in"}</h2>
      <motion.div className="pointer-events-none absolute inset-0 text-border" aria-hidden="true" style={{ x: driftX, y: driftY }}>
        <svg className="size-full">
          <g transform="translate(50%, 50%)">
            {rings.map((radius) => <circle key={radius} r={radius} cx="0" cy="0" fill="none" stroke="currentColor" strokeWidth="1" />)}
          </g>
        </svg>
      </motion.div>

      <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <span className="inline-flex min-w-0 items-center gap-2 text-sm font-medium">
          {brand.mark ?? <Mark className="shrink-0" />}
          <span className="truncate">{brand.name}</span>
        </span>
        <p className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={mode}
              initial={{ opacity: 0, y: reduce ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -4 }}
              transition={{ duration: reduce ? 0 : motionPresets.duration.standard, ease: [...motionPresets.ease.enter] }}
            >
              {signingUp ? "Have an account?" : "No account?"}
            </motion.span>
          </AnimatePresence>
          <button type="button" className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" onClick={switchMode}>
            {signingUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-6">
        <div className={cn("w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-sm", classNames?.card)}>
          <AnimatePresence mode="popLayout" initial={false}>
            {step === "passkey" ? (
              <motion.div key="passkey" className="grid gap-5" {...stepMotion} transition={{ duration: reduce ? 0 : motionPresets.duration.standard }}>
                <div className={cn("grid gap-1", classNames?.heading)}>
                  <h3 className="text-xl font-medium text-balance">Sign in to {brand.name}</h3>
                  <p className="text-sm text-muted-foreground">Use the passkey saved on this device. No password needed.</p>
                </div>
                <div className="grid gap-2">
                  <Button ref={passkeyRef} type="button" className="w-full" aria-busy={passkey === "waiting" || undefined} onClick={startPasskey}>
                    {passkey === "verified" ? <Check aria-hidden /> : <FingerprintPattern aria-hidden />}
                    {passkey === "waiting" ? "Waiting for your device" : passkey === "verified" ? "Passkey verified" : "Sign in with passkey"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={passkey === "waiting" ? cancelPasskey : switchToEmail}>
                    {passkey === "waiting" ? "Cancel" : <><Mail aria-hidden />Use email instead</>}
                  </Button>
                </div>
                <div className="text-center text-xs text-muted-foreground">or</div>
                <div className="grid gap-2" role="group" aria-label="Single sign-on">
                  {providers.map((provider) => (
                    <Button key={provider} type="button" variant="outline" className="w-full" aria-label={`Continue with ${provider}`} disabled={passkey !== "idle" || (!!busy && busy !== provider)} aria-busy={busy === provider || undefined} onClick={() => signInWith(provider)}>
                      <ProviderIcon provider={provider} />
                      {provider}
                    </Button>
                  ))}
                </div>
              </motion.div>
            ) : null}

            {step === "email" ? (
              <motion.div key={`email-${mode}`} className="grid gap-5" {...stepMotion} transition={{ duration: reduce ? 0 : motionPresets.duration.standard }}>
                <div className={cn("grid gap-1", classNames?.heading)}>
                  <h3 className="text-xl font-medium text-balance">{signingUp ? "Create your account" : "Sign in with email"}</h3>
                  <p className="text-sm text-muted-foreground">{signingUp ? "Enter your work email. We will send a code to confirm it." : "We will send a 6 digit code to your inbox."}</p>
                </div>
                <form className={cn("grid gap-3", classNames?.form)} onSubmit={submitEmail} noValidate>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`${labelId}-email`}>{signingUp ? "Work email" : "Email"}</Label>
                    <Input
                      ref={emailRef}
                      id={`${labelId}-email`}
                      type="email"
                      name="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="name@example.com"
                      value={email}
                      readOnly={busy === "email"}
                      aria-invalid={emailError ? true : undefined}
                      aria-describedby={emailError ? `${labelId}-email-error` : undefined}
                      onChange={(event) => setEmail(event.target.value)}
                      onBlur={() => { if (email.trim()) setTouched(true) }}
                    />
                    {emailError ? <p id={`${labelId}-email-error`} role="alert" className="text-xs text-destructive">{emailError}</p> : null}
                  </div>
                  <Button type="submit" className="w-full" aria-busy={busy === "email" || undefined} disabled={busy === "email"}>
                    {signingUp ? "Create account" : "Send code"}
                  </Button>
                </form>
                {signingUp ? null : (
                  <button type="button" className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" onClick={switchToPasskey}>
                    <FingerprintPattern className="size-3.5" aria-hidden />
                    Use a passkey instead
                  </button>
                )}
              </motion.div>
            ) : null}

            {step === "code" ? (
              <motion.div key="code" className="grid gap-5" {...stepMotion} transition={{ duration: reduce ? 0 : motionPresets.duration.standard }}>
                <div className={cn("grid gap-1", classNames?.heading)}>
                  <h3 className="text-xl font-medium">Check your email</h3>
                  <p className="text-sm text-pretty text-muted-foreground">
                    Enter the code sent to <span className="font-medium break-all text-foreground">{account}</span>.{" "}
                    <button type="button" className="font-medium text-foreground underline-offset-4 hover:underline" onClick={changeEmail}>Change</button>
                  </p>
                </div>
                <form className={cn("grid gap-3", classNames?.form)} onSubmit={(event) => { event.preventDefault(); verify(code) }} noValidate>
                  <div ref={codeRef}>
                    <OtpField
                      label="Verification code"
                      hint={`Demo code: ${demoCode}`}
                      value={code}
                      onValueChange={changeCode}
                      state={codeError ? "error" : verified ? "success" : "idle"}
                      errorLabel={codeError || "That code is not valid"}
                      disabled={busy === "code" || verified}
                    />
                  </div>
                  <Button type="submit" className="w-full" aria-busy={busy === "code" || undefined} disabled={busy === "code" || verified}>
                    {verified ? <><Check aria-hidden />Verified</> : signingUp ? "Verify and create account" : "Verify"}
                  </Button>
                </form>
                <button
                  type="button"
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
                  disabled={resendIn > 0 || verified}
                  aria-label={resendIn > 0 ? `Resend code, available in ${resendIn} seconds` : "Resend code"}
                  onClick={resend}
                >
                  {resendIn > 0 ? <>Resend code in {clock}</> : "Resend code"}
                </button>
              </motion.div>
            ) : null}

            {step === "done" ? (
              <motion.div key="done" className="grid gap-5" {...stepMotion} transition={{ duration: reduce ? 0 : motionPresets.duration.standard }}>
                <svg className="mx-auto size-12 text-primary" viewBox="0 0 48 48" aria-hidden="true">
                  <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <motion.path d="M15.5 24.5l5.5 5.5 11.5-12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduce ? 0 : motionPresets.duration.considered, ease: [...motionPresets.ease.enter] }} />
                </svg>
                <div className={cn("grid gap-1 text-center", classNames?.heading)}>
                  <h3 ref={doneRef} tabIndex={-1} className="text-xl font-medium outline-none">{signingUp ? `Welcome to ${brand.name}` : "Welcome back"}</h3>
                  <p className="text-sm text-pretty text-muted-foreground">
                    {signingUp ? "Your account is ready. " : "You are signed in as "}
                    <span className="font-medium break-all text-foreground">{account}</span>
                    {signingUp ? "" : "."}
                  </p>
                </div>
                <dl className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Method</dt>
                    <dd>{method}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">This device</dt>
                    <dd>Remembered for 30 days</dd>
                  </div>
                </dl>
                <Button type="button" variant="outline" className="w-full" onClick={signOut}>Sign out</Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <footer className={cn("relative z-10 flex items-center justify-between gap-3 px-4 py-4 text-xs text-muted-foreground sm:px-6", classNames?.footer)}>
        <p className="sr-only" role="status">{status}</p>
        <span aria-hidden="true" className="min-w-0 truncate">{status}</span>
        <nav className="flex shrink-0 gap-3" aria-label="Legal">
          <a href={termsHref} className="underline-offset-4 hover:underline" onClick={openLegal(termsHref, "Terms")}>Terms</a>
          <a href={privacyHref} className="underline-offset-4 hover:underline" onClick={openLegal(privacyHref, "Privacy policy")}>Privacy</a>
        </nav>
      </footer>
    </section>
  )
}
