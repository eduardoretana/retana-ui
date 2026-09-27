"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export type QuestionOption = {
  id: string
  label: string
  description?: string
}

export type QuestionAnswer = {
  optionIds: string[]
  text: string
}

export type QuestionCardProps = {
  prompt: string
  options?: readonly QuestionOption[]
  mode?: "single" | "multiple"
  allowFreeText?: boolean
  onSubmit?: (answer: QuestionAnswer) => void
  placeholder?: string
  submitLabel?: string
  submittedLabel?: string
  freeTextLabel?: string
  className?: string
}

export function QuestionCard({
  prompt,
  options = [],
  mode = "single",
  allowFreeText = true,
  onSubmit,
  placeholder = "Add your own answer",
  submitLabel = "Send answer",
  submittedLabel = "Answer sent",
  freeTextLabel = "Your answer",
  className,
}: QuestionCardProps) {
  const [selected, setSelected] = React.useState<string[]>([])
  const [text, setText] = React.useState("")
  const [sent, setSent] = React.useState(false)
  const groupId = React.useId()

  function toggle(id: string) {
    setSelected((current) => {
      if (mode === "single") return current[0] === id ? [] : [id]
      return current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    })
  }

  const canSend = selected.length > 0 || text.trim().length > 0

  return (
    <form
      data-slot="question-card"
      data-mode={mode}
      data-submitted={sent ? "true" : "false"}
      className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}
      onSubmit={(event) => {
        event.preventDefault()
        if (!canSend || sent) return
        onSubmit?.({ optionIds: selected, text: text.trim() })
        setSent(true)
      }}
    >
      <fieldset disabled={sent} className="min-w-0 border-0 p-0">
        <legend className="mb-3 text-sm font-medium">{prompt}</legend>
        <div
          role={mode === "single" ? "radiogroup" : "group"}
          aria-labelledby={groupId}
          className="flex flex-col gap-1.5"
        >
          <span id={groupId} className="sr-only">
            {prompt}
          </span>
          {options.map((option) => {
            const active = selected.includes(option.id)
            return (
              <button
                key={option.id}
                type="button"
                role={mode === "single" ? "radio" : "checkbox"}
                aria-checked={active}
                onClick={() => toggle(option.id)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "border-primary bg-primary/10" : "border-border hover:bg-muted/70",
                )}
              >
                <span className="block text-sm">{option.label}</span>
                {option.description ? (
                  <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span>
                ) : null}
              </button>
            )
          })}
        </div>
        {allowFreeText ? (
          <label className="mt-3 flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            {freeTextLabel}
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={placeholder}
              rows={2}
              className="min-h-16 font-normal text-foreground"
            />
          </label>
        ) : null}
      </fieldset>
      <div className="mt-3 flex justify-end">
        {sent ? (
          <p className="text-sm text-muted-foreground" role="status">
            {submittedLabel}
          </p>
        ) : (
          <Button type="submit" size="sm" disabled={!canSend}>
            {submitLabel}
          </Button>
        )}
      </div>
    </form>
  )
}
