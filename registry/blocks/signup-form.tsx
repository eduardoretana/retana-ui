"use client"

/** Adapted from Arc UI (MIT). */

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ComponentProps, type FormEvent } from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type Transition, type Variants } from "motion/react"

import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import { PasswordField } from "@/registry/retana/ui/password-field"

export type SignupProvider = "Google" | "Apple" | "GitHub"

export type SignupDetails = {
  name: string
  email: string
  password: string
  productUpdates: boolean
}

export type SignupFormClassNames = {
  root?: string
  heading?: string
  form?: string
  footer?: string
}

export type SignupFormProps = {
  /** Receives the details once every field is valid. Throw to show a submit error. */
  onSubmit?: (details: SignupDetails) => void | Promise<void>
  /** An error from your API, shown above the submit button. */
  serverError?: string | null
  /** Called when someone picks a single sign-on provider. */
  onProvider?: (provider: SignupProvider) => void
  defaultValues?: Partial<SignupDetails>
  className?: string
  classNames?: SignupFormClassNames
}

type Field = "name" | "email" | "password"
type Step = "form" | "done"
type StepCustom = { direction: number; reduce: boolean }

const providers: SignupProvider[] = ["Google", "Apple", "GitHub"]
const marks: Record<SignupProvider, string> = {
  Google:
    "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z",
  Apple:
    "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
  GitHub:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
}

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"]
const SUBMIT_MS = 700

function ProviderMark({ provider }: { provider: SignupProvider }) {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={marks[provider]} />
    </svg>
  )
}

function getErrors(name: string, email: string, password: string) {
  return {
    name: name.trim().length < 2 ? "Enter your full name." : "",
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) ? "Enter a full address, like name@example.com." : "",
    password: password.length < 8 ? "Use at least 8 characters." : "",
  }
}

function passwordScore(password: string) {
  if (!password) return 0
  return [password.length >= 8, password.length >= 12, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d|[^\w\s]/.test(password)].filter(Boolean).length
}

const stepMotion: Variants = {
  enter: ({ direction, reduce }: StepCustom) =>
    reduce ? { opacity: 0 } : { opacity: 0, x: direction * 24, filter: `blur(${motionPresets.blur.soft}px)` },
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
          x: direction * -16,
          filter: `blur(${motionPresets.blur.soft}px)`,
          transition: {
            x: motionPresets.spring.smooth,
            opacity: { duration: motionPresets.duration.exit, ease: motionPresets.ease.standard },
            filter: { duration: motionPresets.duration.exit },
          },
        },
}

function swap(reduce: boolean) {
  return {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: `blur(${motionPresets.blur.soft}px)` },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: reduce
      ? { opacity: 0, transition: { duration: 0 } }
      : { opacity: 0, y: -4, filter: `blur(${motionPresets.blur.subtle}px)`, transition: { duration: motionPresets.duration.fast } },
    transition: (reduce ? { duration: motionPresets.duration.instant } : { duration: motionPresets.duration.standard, ease: motionPresets.ease.enter }) as Transition,
  }
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

function TextButton({ children, className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-current focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function SignupForm({ onSubmit, serverError, onProvider, defaultValues, className, classNames }: SignupFormProps) {
  const reduce = !!useReducedMotion()
  const feedbackId = useId()
  const nameId = useId()
  const emailId = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)
  const timers = useRef<number[]>([])
  const [step, setStep] = useState<Step>("form")
  const [direction, setDirection] = useState(1)
  const [name, setName] = useState(defaultValues?.name ?? "")
  const [email, setEmail] = useState(defaultValues?.email ?? "")
  const [password, setPassword] = useState(defaultValues?.password ?? "")
  const [productUpdates, setProductUpdates] = useState(defaultValues?.productUpdates ?? false)
  const [touched, setTouched] = useState<Record<Field, boolean>>({ name: false, email: false, password: false })
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState<null | "form" | SignupProvider>(null)
  const [method, setMethod] = useState<"Email" | SignupProvider>("Email")
  const [submitError, setSubmitError] = useState("")
  const [status, setStatus] = useState("")
  const { track, height } = useStepHeight(step, reduce)
  const errors = getErrors(name, email, password)
  const score = passwordScore(password)
  const visibleError = (field: Field) => (touched[field] || submitted ? errors[field] : "")
  const passwordError = visibleError("password")
  const custom: StepCustom = { direction, reduce }
  const shownError = submitError || serverError || ""
  const feedback = passwordError
    ? { key: "error", text: passwordError }
    : password
      ? { key: `s${score}`, text: `${strengthLabel[Math.max(score, 1)]} password` }
      : { key: "hint", text: "Use 8 or more characters." }

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])
  useEffect(() => {
    if (step === "done") doneRef.current?.focus()
  }, [step])

  function markTouched(field: Field) {
    setTouched((current) => ({ ...current, [field]: true }))
  }

  function finish(how: "Email" | SignupProvider) {
    setBusy(null)
    setMethod(how)
    setDirection(1)
    setStep("done")
    setStatus(`Account created with ${how === "Email" ? "your email" : how}`)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setSubmitted(true)
    setSubmitError("")
    const nextErrors = getErrors(name, email, password)
    const firstInvalid = (Object.keys(nextErrors) as Field[]).find((field) => nextErrors[field])
    if (firstInvalid) {
      const fieldRefs = { name: nameRef, email: emailRef, password: passwordRef }
      fieldRefs[firstInvalid].current?.focus()
      return
    }
    setBusy("form")
    setStatus("Creating your account")
    try {
      await Promise.all([
        onSubmit?.({ name: name.trim(), email: email.trim(), password, productUpdates }),
        new Promise((resolve) => window.setTimeout(resolve, SUBMIT_MS)),
      ])
      finish("Email")
    } catch (error) {
      setBusy(null)
      setSubmitError(error instanceof Error && error.message ? error.message : "We couldn't create your account. Try again.")
      setStatus("Account not created")
    }
  }

  function continueWith(provider: SignupProvider) {
    if (busy) return
    setBusy(provider)
    setStatus(`Opening ${provider}`)
    onProvider?.(provider)
    timers.current.push(
      window.setTimeout(() => {
        if (!name.trim()) setName("Inés Calderón")
        if (!email.trim()) setEmail("hola@costa-atelier.example")
        finish(provider)
      }, 900),
    )
  }

  function reset() {
    setName("")
    setEmail("")
    setPassword("")
    setProductUpdates(false)
    setTouched({ name: false, email: false, password: false })
    setSubmitted(false)
    setSubmitError("")
    setDirection(-1)
    setStep("form")
    setStatus("Start again with new details")
    timers.current.push(window.setTimeout(() => nameRef.current?.focus(), 60))
  }

  const firstName = name.trim().split(/\s+/)[0] || "there"

  return (
    <Card
      data-slot="signup-form"
      role="region"
      aria-label="Create an account"
      className={cn("@container w-full min-w-0 max-w-md gap-0 overflow-hidden py-0", className, classNames?.root)}
    >
      <motion.div className="overflow-hidden" style={{ height }}>
        <div ref={track}>
          <AnimatePresence mode="popLayout" initial={false} custom={custom}>
            {step === "form" ? (
              <motion.div
                key="form"
                data-slot="signup-form-step"
                className="grid min-w-0 gap-0 p-6 @max-[380px]:p-5"
                custom={custom}
                variants={stepMotion}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div className={cn("mb-6 grid gap-2", classNames?.heading)}>
                  <h2 className="text-2xl font-medium text-balance @min-[380px]:text-3xl">Create your account</h2>
                  <p className="text-sm text-pretty text-muted-foreground">Start with your work email. You can invite the studio after.</p>
                </div>
                <div className="grid grid-cols-3 gap-2" role="group" aria-label="Sign up with">
                  {providers.map((provider) => (
                    <Button
                      key={provider}
                      type="button"
                      variant="outline"
                      className="min-w-0 px-1.5"
                      aria-label={`Sign up with ${provider}`}
                      aria-busy={busy === provider || undefined}
                      disabled={!!busy && busy !== provider}
                      onClick={() => continueWith(provider)}
                    >
                      <ProviderMark provider={provider} />
                      <span className="truncate">{busy === provider ? "Opening" : provider}</span>
                    </Button>
                  ))}
                </div>
                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <Separator className="flex-1" />
                  or
                  <Separator className="flex-1" />
                </div>
                <form onSubmit={(event) => void submit(event)} noValidate className={cn("grid gap-4", classNames?.form)}>
                  <div className="grid gap-2">
                    <Label htmlFor={nameId}>Full name</Label>
                    <Input
                      ref={nameRef}
                      id={nameId}
                      name="name"
                      autoComplete="name"
                      placeholder="Inés Calderón"
                      value={name}
                      readOnly={!!busy}
                      aria-invalid={visibleError("name") ? true : undefined}
                      onChange={(event) => setName(event.target.value)}
                      onBlur={() => {
                        if (name) markTouched("name")
                      }}
                    />
                    {visibleError("name") ? (
                      <p className="text-xs text-destructive" role="alert">
                        {visibleError("name")}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={emailId}>Work email</Label>
                    <Input
                      ref={emailRef}
                      id={emailId}
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="hola@costa-atelier.example"
                      value={email}
                      readOnly={!!busy}
                      aria-invalid={visibleError("email") ? true : undefined}
                      onChange={(event) => setEmail(event.target.value)}
                      onBlur={() => {
                        if (email) markTouched("email")
                      }}
                    />
                    {visibleError("email") ? (
                      <p className="text-xs break-all text-destructive" role="alert">
                        {visibleError("email")}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid min-w-0">
                    <PasswordField
                      ref={passwordRef}
                      label="Password"
                      name="password"
                      autoComplete="new-password"
                      value={password}
                      readOnly={!!busy}
                      aria-invalid={passwordError ? true : undefined}
                      aria-describedby={feedbackId}
                      onChange={(event) => setPassword(event.target.value)}
                      onBlur={() => {
                        if (password) markTouched("password")
                      }}
                    />
                    <div className="mt-2 flex min-h-5 items-center justify-between gap-3 text-xs">
                      <span id={feedbackId} className={cn("relative min-w-0 flex-1 text-muted-foreground", passwordError && "text-destructive")} role={passwordError ? "alert" : undefined}>
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span key={feedback.key} className="block" {...swap(reduce)}>
                            {feedback.text}
                          </motion.span>
                        </AnimatePresence>
                      </span>
                      <span className="flex shrink-0 gap-0.5" data-level={score} aria-hidden="true">
                        {[1, 2, 3, 4].map((bar) => (
                          <span
                            key={bar}
                            className={cn(
                              "h-0.5 w-5 rounded-full bg-border @max-[380px]:w-3.5",
                              bar <= score && score <= 1 && "bg-destructive",
                              bar <= score && score === 2 && "bg-muted-foreground",
                              bar <= score && score === 3 && "bg-foreground",
                              bar <= score && score >= 4 && "bg-primary",
                            )}
                          />
                        ))}
                      </span>
                    </div>
                  </div>
                  <Label className="items-start gap-2 font-normal">
                    <Checkbox
                      checked={productUpdates}
                      disabled={!!busy}
                      onCheckedChange={(checked) => setProductUpdates(checked === true)}
                    />
                    Email me product updates
                  </Label>
                  <AnimatePresence initial={false}>
                    {shownError ? (
                      <motion.div
                        key="error"
                        className="overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={reduce ? { duration: 0 } : { height: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.fast } }}
                      >
                        <p className="text-xs text-destructive" role="alert">
                          {shownError}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                  <Button className="w-full" type="submit" disabled={busy === "form"} aria-busy={busy === "form" || undefined}>
                    {busy === "form" ? "Creating account" : "Create account"}
                  </Button>
                </form>
                <p className="mt-4 text-xs text-pretty text-muted-foreground">
                  By creating an account you agree to the{" "}
                  <TextButton onClick={() => setStatus("Terms open in your app")}>Terms</TextButton> and{" "}
                  <TextButton onClick={() => setStatus("Privacy policy opens in your app")}>Privacy policy</TextButton>.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                data-slot="signup-form-step"
                className="grid min-w-0 p-6 @max-[380px]:p-5"
                custom={custom}
                variants={stepMotion}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <svg className="mb-6 size-12 text-primary" viewBox="0 0 48 48" aria-hidden="true">
                  <g transform="rotate(-90 24 24)">
                    <motion.circle
                      cx="24"
                      cy="24"
                      r="22.25"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        pathLength: { duration: motionPresets.duration.considered, ease: motionPresets.ease.inOut, delay: 0.16 },
                        opacity: { duration: motionPresets.duration.instant, delay: 0.16 },
                      }}
                    />
                  </g>
                  <motion.path
                    d="M15.5 24.5l5.5 5.5 11.5-12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      pathLength: { duration: motionPresets.duration.standard + 0.08, ease: motionPresets.ease.enter, delay: 0.5 },
                      opacity: { duration: motionPresets.duration.instant, delay: 0.5 },
                    }}
                  />
                </svg>
                <div className="mb-6 grid gap-2">
                  <h2 ref={doneRef} tabIndex={-1} className="text-2xl font-medium text-balance outline-none @min-[380px]:text-3xl">
                    Welcome, {firstName}
                  </h2>
                  <p className="text-sm text-pretty text-muted-foreground">
                    Your account is ready. We sent a confirmation to <span className="break-all text-foreground">{email.trim()}</span>.
                  </p>
                </div>
                <dl className="mb-6 border-t border-border">
                  <div className="flex justify-between gap-4 border-b border-border py-3 text-sm">
                    <dt className="text-muted-foreground">Signed up with</dt>
                    <dd className="text-right">{method}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-border py-3 text-sm">
                    <dt className="text-muted-foreground">Product updates</dt>
                    <dd className="text-right">{productUpdates ? "On" : "Off"}</dd>
                  </div>
                </dl>
                <Button type="button" variant="outline" className="w-full" onClick={reset}>
                  Start over
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <CardFooter className={cn("min-h-12 flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground", classNames?.footer)}>
        <p className="sr-only" role="status" aria-live="polite">
          {status}
        </p>
        <span className="relative block min-w-0 flex-1 basis-48" aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={status} className="block truncate" {...swap(reduce)}>
              {status}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="text-muted-foreground">
          Have an account? <TextButton onClick={() => setStatus("Sign in opens in your app")}>Sign in</TextButton>
        </span>
      </CardFooter>
    </Card>
  )
}
