"use client"

/** Adapted from Arc UI (MIT). */

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent } from "react"
import { AnimatePresence, LayoutGroup, animate, motion, useMotionValue, useReducedMotion, type Transition, type Variants } from "motion/react"
import { Check, KeyRound } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import { OtpField } from "@/registry/retana/ui/otp-field"

type Step = "email" | "code" | "done"
export type SignInProvider = "Google" | "Apple" | "GitHub"
export type SignInMethod = "Email code" | "Passkey" | SignInProvider

export type SignInAccount = { name: string; email: string; photo?: string }

export type SignInClassNames = {
  root?: string
  heading?: string
  form?: string
  footer?: string
}

export type SignInProps = {
  /** The code the simulated email contains. */
  demoCode?: string
  /** Called once the simulated sign in succeeds. */
  onSignIn?: (account: SignInAccount, method: SignInMethod) => void
  accounts?: SignInAccount[]
  defaultEmail?: string
  className?: string
  classNames?: SignInClassNames
}

type StepCustom = { direction: number; reduce: boolean; still?: boolean }

const RESEND_SECONDS = 30
const providers: SignInProvider[] = ["Google", "Apple", "GitHub"]
const marks: Record<SignInProvider, string> = {
  Google:
    "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z",
  Apple:
    "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
  GitHub:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
}

export const exampleAccounts: SignInAccount[] = [
  { name: "Inés Calderón", email: "ines@costa-atelier.example" },
  { name: "Mateo Ruiz", email: "mateo@costa-atelier.example" },
  { name: "Lucía Peña", email: "lucia@costa-atelier.example" },
  { name: "Omar Vidal", email: "omar@costa-atelier.example" },
  { name: "Sara Neri", email: "sara@costa-atelier.example" },
]

const domainFixes: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmail.co": "gmail.com",
  "hotmial.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outlook.co": "outlook.com",
  "iclod.com": "icloud.com",
  "icoud.com": "icloud.com",
  "yaho.com": "yahoo.com",
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())

function suggestionFor(value: string) {
  const [local, domain, extra] = value.trim().toLowerCase().split("@")
  return local && domain && extra === undefined && domainFixes[domain] ? `${local}@${domainFixes[domain]}` : ""
}

function fold(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function accountFor(value: string, people: SignInAccount[]): SignInAccount {
  const email = value.trim().toLowerCase()
  const parts = email.split("@")[0].split(/[._+-]+/).filter(Boolean)
  const known = people.find((person) => fold(person.name.split(" ")[0] ?? "") === fold(parts[0] ?? ""))
  if (known) return { ...known, email }
  return {
    name: parts
      .slice(0, 2)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" ") || "Studio member",
    email,
  }
}

const stepMotion: Variants = {
  enter: ({ direction, reduce, still }: StepCustom) =>
    still ? { opacity: 1, x: 0, filter: "blur(0px)" } : reduce ? { opacity: 0 } : { opacity: 0, x: direction * 28, filter: `blur(${motionPresets.blur.soft}px)` },
  center: ({ reduce }: StepCustom) => ({
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: reduce
      ? { duration: motionPresets.duration.instant }
      : {
          x: motionPresets.spring.smooth,
          opacity: { duration: motionPresets.duration.standard, ease: motionPresets.ease.enter, delay: 0.05 },
          filter: { duration: motionPresets.duration.standard, ease: motionPresets.ease.enter },
        },
  }),
  exit: ({ direction, reduce }: StepCustom) =>
    reduce
      ? { opacity: 0, transition: { duration: 0 } }
      : {
          opacity: 0,
          x: direction * -20,
          filter: `blur(${motionPresets.blur.soft}px)`,
          transition: {
            x: motionPresets.spring.smooth,
            opacity: { duration: motionPresets.duration.exit, ease: motionPresets.ease.standard },
            filter: { duration: motionPresets.duration.exit },
          },
        },
}

const roll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${-0.7 * direction}em`, filter: `blur(${motionPresets.blur.subtle}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: (direction: number) => ({ opacity: 0, y: `${0.7 * direction}em`, filter: `blur(${motionPresets.blur.subtle}px)` }),
}

function RollingTime({ seconds, reduce }: { seconds: number; reduce: boolean }) {
  const [shown, setShown] = useState({ seconds, direction: 1 })
  if (shown.seconds !== seconds) setShown({ seconds, direction: seconds < shown.seconds ? 1 : -1 })
  const text = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
  const transition: Transition = reduce
    ? { duration: 0 }
    : { y: motionPresets.spring.snappy, opacity: { duration: motionPresets.duration.fast }, filter: { duration: motionPresets.duration.fast } }
  return (
    <span className="inline-flex tabular-nums">
      {text.split("").map((character, index) => (
        <span key={index} className="relative inline-flex justify-center">
          <AnimatePresence initial={false} mode="popLayout" custom={shown.direction}>
            <motion.span key={character} custom={shown.direction} variants={roll} initial="enter" animate="center" exit="exit" transition={transition}>
              {character}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}

function useStepHeight(step: Step, reduce: boolean) {
  const track = useRef<HTMLDivElement>(null)
  const height = useMotionValue<number | "auto">("auto")
  const measured = useRef(0)
  const gliding = useRef(false)
  const lastStep = useRef(step)
  const glide = useCallback(
    (to: number) => {
      gliding.current = true
      animate(height, to, {
        ...motionPresets.spring.smooth,
        onComplete: () => {
          gliding.current = false
          height.jump("auto")
        },
      })
    },
    [height],
  )
  useEffect(() => {
    const node = track.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) => {
      measured.current = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight
      if (gliding.current) glide(measured.current)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [glide])
  useLayoutEffect(() => {
    if (lastStep.current === step) return
    lastStep.current = step
    const current = height.get()
    const from = typeof current === "number" ? current : measured.current
    const to = track.current?.offsetHeight ?? 0
    if (reduce || !from || !to) {
      gliding.current = false
      height.jump("auto")
      return
    }
    if (current === "auto") height.jump(from)
    glide(to)
  }, [step, reduce, height, glide])
  return { track, height }
}

function ProviderMark({ provider }: { provider: SignInProvider }) {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={marks[provider]} />
    </svg>
  )
}

function AccountAvatar({ account, className }: { account: SignInAccount; className?: string }) {
  return (
    <Avatar className={cn("size-full", className)}>
      {account.photo ? <AvatarImage src={account.photo} alt="" /> : null}
      <AvatarFallback>{initials(account.name)}</AvatarFallback>
    </Avatar>
  )
}

function swapMotion(reduce: boolean): Transition {
  return reduce ? { duration: motionPresets.duration.instant } : { duration: motionPresets.duration.standard, ease: motionPresets.ease.enter }
}

export function SignIn({ demoCode = "123456", onSignIn, accounts = exampleAccounts, defaultEmail = "", className, classNames }: SignInProps) {
  const id = useId()
  const emailId = useId()
  const reduce = !!useReducedMotion()
  const [step, setStep] = useState<Step>("email")
  const [direction, setDirection] = useState(1)
  const [email, setEmail] = useState(defaultEmail)
  const [touched, setTouched] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [code, setCode] = useState("")
  const [codeError, setCodeError] = useState("")
  const [resendIn, setResendIn] = useState(RESEND_SECONDS)
  const [busy, setBusy] = useState<null | "email" | "code" | "passkey" | SignInProvider>(null)
  const [account, setAccount] = useState<SignInAccount>(accounts[0] ?? exampleAccounts[0])
  const [method, setMethod] = useState<SignInMethod>("Email code")
  const [status, setStatus] = useState("")
  const emailRef = useRef<HTMLInputElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)
  const focusNext = useRef<"email" | "done" | null>(null)
  const verifying = useRef(false)
  const timers = useRef<number[]>([])
  const { track, height } = useStepHeight(step, reduce)

  const emailError = (touched || attempted) && !isEmail(email) ? (email.trim() ? "Enter a full address, like name@example.com." : "Enter your email address.") : ""
  const suggestion = touched || attempted ? suggestionFor(email) : ""
  const custom: StepCustom = { direction, reduce }
  const avatarTransition: Transition = reduce ? { duration: 0 } : motionPresets.spring.morph

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => window.clearTimeout(timer))
  }, [])
  useEffect(() => {
    if (step !== "code" || resendIn <= 0) return
    const timer = window.setTimeout(() => setResendIn((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [step, resendIn])
  useEffect(() => {
    const target = focusNext.current
    focusNext.current = null
    if (target === "email") {
      emailRef.current?.focus()
      emailRef.current?.select()
    }
    if (target === "done") doneRef.current?.focus()
  }, [step])

  function later(run: () => void, ms: number) {
    timers.current.push(window.setTimeout(run, ms))
  }
  function go(next: Step, towards: number, focus: "email" | "done" | null = null) {
    focusNext.current = focus
    setDirection(towards)
    setStep(next)
  }

  function complete(next: SignInAccount, how: SignInMethod) {
    verifying.current = false
    setBusy(null)
    setAccount(next)
    setMethod(how)
    go("done", 1, "done")
    setStatus(`Signed in with ${how === "Email code" ? "an email code" : how}`)
    onSignIn?.(next, how)
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
      setBusy(null)
      setAccount(accountFor(email, accounts))
      setCode("")
      setCodeError("")
      setResendIn(RESEND_SECONDS)
      go("code", 1)
      setStatus("Code sent")
    }, 800)
  }

  function applySuggestion() {
    setEmail(suggestion)
    setStatus(`Email changed to ${suggestion}`)
    emailRef.current?.focus()
  }

  function verify(value: string) {
    if (verifying.current || busy) return
    if (value.length < 6) {
      setCodeError("Enter all 6 digits.")
      return
    }
    verifying.current = true
    setBusy("code")
    setStatus("Checking code")
    later(() => {
      verifying.current = false
      if (value === demoCode) {
        complete(account, "Email code")
        return
      }
      setBusy(null)
      setCode("")
      setCodeError("That code didn't match. Check the latest email and try again.")
      setStatus("Code didn't match")
    }, 700)
  }

  function changeCode(value: string) {
    if (busy) return
    setCode(value)
    if (codeError && value) setCodeError("")
    if (value.length === 6) verify(value)
  }

  function resend() {
    if (busy || resendIn > 0) return
    setResendIn(RESEND_SECONDS)
    setCode("")
    setCodeError("")
    setStatus("New code sent")
  }

  function changeEmail() {
    if (busy) return
    setAttempted(false)
    go("email", -1, "email")
    setStatus("Edit your email")
  }

  function signInWith(how: "passkey" | SignInProvider) {
    if (busy) return
    setBusy(how)
    setStatus(how === "passkey" ? "Waiting for your passkey" : `Opening ${how}`)
    later(() => complete(accounts[0] ?? exampleAccounts[0], how === "passkey" ? "Passkey" : how), how === "passkey" ? 1100 : 900)
  }

  function signOut() {
    setEmail(account.email)
    setTouched(false)
    setAttempted(false)
    setCode("")
    go("email", -1, "email")
    setStatus("Signed out")
  }

  const rise = (index: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: `blur(${motionPresets.blur.soft}px)` },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: (reduce
      ? { duration: motionPresets.duration.instant }
      : {
          y: { ...motionPresets.spring.smooth, delay: 0.14 + index * motionPresets.stagger.line },
          opacity: { duration: motionPresets.duration.standard, ease: motionPresets.ease.enter, delay: 0.14 + index * motionPresets.stagger.line },
          filter: { duration: motionPresets.duration.standard, delay: 0.14 + index * motionPresets.stagger.line },
        }) as Transition,
  })

  return (
    <Card
      data-slot="sign-in"
      role="region"
      aria-label="Sign in"
      className={cn("@container w-full min-w-0 max-w-md gap-0 overflow-hidden py-0", className, classNames?.root)}
    >
      <LayoutGroup id={id}>
        <motion.div className="overflow-hidden" style={{ height }}>
          <div ref={track}>
            <AnimatePresence mode="popLayout" initial={false} custom={custom}>
              {step === "email" ? (
                <motion.div key="email" className="grid min-w-0 p-6 @max-[380px]:p-5" custom={custom} variants={stepMotion} initial="enter" animate="center" exit="exit">
                  <div className={cn("mb-6 grid gap-2", classNames?.heading)}>
                    <h2 className="text-2xl font-medium text-balance @min-[380px]:text-3xl">Sign in</h2>
                    <p className="text-sm text-pretty text-muted-foreground">Enter your email and we will send you a 6 digit code.</p>
                  </div>
                  <form className={cn("grid gap-4", classNames?.form)} onSubmit={submitEmail} noValidate>
                    <div className="grid min-w-0">
                      <Label htmlFor={emailId}>Email</Label>
                      <Input
                        ref={emailRef}
                        id={emailId}
                        className="mt-2"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        placeholder="hola@costa-atelier.example"
                        value={email}
                        readOnly={busy === "email"}
                        aria-invalid={emailError ? true : undefined}
                        onChange={(event) => setEmail(event.target.value)}
                        onBlur={() => {
                          if (email.trim()) setTouched(true)
                        }}
                      />
                      {emailError ? (
                        <p className="mt-2 text-xs text-destructive" role="alert">
                          {emailError}
                        </p>
                      ) : null}
                      <AnimatePresence initial={false}>
                        {suggestion ? (
                          <motion.div
                            key="suggestion"
                            className="overflow-hidden"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={reduce ? { duration: 0 } : { height: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.fast } }}
                          >
                            <p className="pt-2 text-xs break-all text-muted-foreground">
                              Did you mean{" "}
                              <button type="button" className="font-medium text-foreground underline underline-offset-4 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none" aria-label={`Use ${suggestion}`} onClick={applySuggestion}>
                                {suggestion}
                              </button>
                              ?
                            </p>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                    <Button type="submit" className="w-full" disabled={busy === "email"} aria-busy={busy === "email" || undefined}>
                      {busy === "email" ? "Sending" : "Continue"}
                    </Button>
                  </form>
                  <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                    <Separator className="flex-1" />
                    or
                    <Separator className="flex-1" />
                  </div>
                  <div className="grid gap-2">
                    <Button type="button" variant="outline" className="w-full" disabled={busy === "passkey"} aria-busy={busy === "passkey" || undefined} onClick={() => signInWith("passkey")}>
                      <KeyRound data-icon="inline-start" aria-hidden="true" />
                      Sign in with a passkey
                    </Button>
                    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Single sign-on">
                      {providers.map((provider) => (
                        <Button
                          key={provider}
                          type="button"
                          variant="outline"
                          className="min-w-0 px-1.5"
                          aria-label={`Continue with ${provider}`}
                          disabled={!!busy && busy !== provider}
                          aria-busy={busy === provider || undefined}
                          onClick={() => signInWith(provider)}
                        >
                          <ProviderMark provider={provider} />
                          <span className="truncate">{provider}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {step === "code" ? (
                <motion.div key="code" className="grid min-w-0 p-6 @max-[380px]:p-5" custom={custom} variants={stepMotion} initial="enter" animate="center" exit="exit">
                  <div className="mb-6 grid gap-2">
                    <h2 className="text-2xl font-medium text-balance @min-[380px]:text-3xl">Check your email</h2>
                    <p className="text-sm text-pretty text-muted-foreground">Enter the 6 digit code we sent. It expires in 10 minutes.</p>
                  </div>
                  <div className="mb-6 flex min-w-0 items-center gap-3 rounded-lg border border-border p-2">
                    <motion.span layoutId="account-avatar" className="relative inline-flex size-8 shrink-0" transition={avatarTransition}>
                      <AccountAvatar account={account} />
                    </motion.span>
                    <span className="min-w-0 flex-1 text-sm break-all">{account.email}</span>
                    <Button type="button" variant="ghost" size="sm" aria-label="Change email" onClick={changeEmail}>
                      Change
                    </Button>
                  </div>
                  <form
                    className="grid gap-4"
                    onSubmit={(event) => {
                      event.preventDefault()
                      verify(code)
                    }}
                    noValidate
                  >
                    <OtpField
                      label="Verification code"
                      hint={`For this demo, the code is ${demoCode}.`}
                      value={code}
                      onValueChange={changeCode}
                      onComplete={verify}
                      state={codeError ? "error" : busy === "code" ? "idle" : "idle"}
                      errorLabel={codeError || "That code is not valid"}
                      disabled={busy === "code"}
                    />
                    <Button type="submit" className="w-full" disabled={busy === "code"} aria-busy={busy === "code" || undefined}>
                      {busy === "code" ? "Checking" : "Verify"}
                    </Button>
                  </form>
                  <button
                    type="button"
                    className={cn(
                      "mt-3 -ml-2 inline-flex min-h-8 items-center self-start rounded-full px-2 text-sm font-medium focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                      resendIn > 0 ? "cursor-default font-normal text-muted-foreground" : "text-foreground hover:bg-muted",
                    )}
                    aria-disabled={resendIn > 0 || undefined}
                    aria-label={resendIn > 0 ? `Resend code, available in ${resendIn} seconds` : "Resend code"}
                    onClick={resend}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={resendIn > 0 ? "wait" : "ready"}
                        className="inline-flex items-baseline gap-1 whitespace-nowrap"
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: `blur(${motionPresets.blur.soft}px)` }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4, filter: `blur(${motionPresets.blur.subtle}px)`, transition: { duration: motionPresets.duration.fast } }}
                        transition={swapMotion(reduce)}
                      >
                        {resendIn > 0 ? (
                          <>
                            Resend code in <RollingTime seconds={resendIn} reduce={reduce} />
                          </>
                        ) : (
                          "Resend code"
                        )}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                </motion.div>
              ) : null}

              {step === "done" ? (
                <motion.div key="done" className="grid min-w-0 p-6 @max-[380px]:p-5" custom={{ ...custom, still: true }} variants={stepMotion} initial="enter" animate="center" exit="exit">
                  <div className="relative mb-6 size-24">
                    <svg className="absolute inset-0 size-full -rotate-90 text-primary" viewBox="0 0 96 96" aria-hidden="true">
                      <motion.circle
                        cx="48"
                        cy="48"
                        r="47"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{
                          pathLength: { duration: motionPresets.duration.considered * 1.25, ease: motionPresets.ease.inOut, delay: 0.22 },
                          opacity: { duration: motionPresets.duration.instant, delay: 0.22 },
                        }}
                      />
                    </svg>
                    <motion.span layoutId="account-avatar" className="absolute inset-1 inline-flex" initial={method === "Email code" || reduce ? false : { opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={avatarTransition}>
                      <AccountAvatar account={account} />
                    </motion.span>
                    <motion.span className="absolute right-0.5 bottom-1 grid size-6 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground" aria-hidden="true" initial={reduce ? false : { opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...motionPresets.spring.snappy, delay: 0.78 }}>
                      <Check className="size-3.5" />
                    </motion.span>
                  </div>
                  <motion.div className="mb-6 grid gap-2" {...rise(0)}>
                    <h2 ref={doneRef} tabIndex={-1} className="text-2xl font-medium text-balance outline-none @min-[380px]:text-3xl">
                      Welcome back, {account.name.split(" ")[0]}
                    </h2>
                    <p className="text-sm break-all text-muted-foreground">{account.email}</p>
                  </motion.div>
                  <motion.dl className="mb-6 border-t border-border" {...rise(1)}>
                    <div className="flex justify-between gap-4 border-b border-border py-3 text-sm">
                      <dt className="text-muted-foreground">Signed in with</dt>
                      <dd className="text-right">{method}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-border py-3 text-sm">
                      <dt className="text-muted-foreground">This browser</dt>
                      <dd className="text-right">Remembered for 30 days</dd>
                    </div>
                  </motion.dl>
                  <motion.div {...rise(2)}>
                    <Button type="button" variant="outline" className="w-full" onClick={signOut}>
                      Sign out
                    </Button>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </LayoutGroup>
      <CardFooter className={cn("min-h-12 flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground", classNames?.footer)}>
        <p className="sr-only" role="status" aria-live="polite">
          {status}
        </p>
        <span className="relative block min-w-0 flex-1 basis-48" aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={status}
              className="block truncate"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: `blur(${motionPresets.blur.soft}px)` }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4, filter: `blur(${motionPresets.blur.subtle}px)`, transition: { duration: motionPresets.duration.fast } }}
              transition={swapMotion(reduce)}
            >
              {status}
            </motion.span>
          </AnimatePresence>
        </span>
        <span>
          No account?{" "}
          <button type="button" className="font-medium text-foreground underline decoration-transparent underline-offset-4 hover:decoration-current focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none" onClick={() => setStatus("Sign up opens in your app")}>
            Sign up
          </button>
        </span>
      </CardFooter>
    </Card>
  )
}
