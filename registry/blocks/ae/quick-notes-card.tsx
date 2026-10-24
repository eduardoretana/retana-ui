"use client"

/** Clean-room AE dashboard piece. Theme tokens only. */

import { useId, useState, type FormEvent } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Plus, X } from "lucide-react"

import { AeCard, AeEmpty } from "@/registry/retana/blocks/ae/card-shell"

export type QuickNote = { id: string; text: string }

export type QuickNotesCardProps = {
  title?: string
  notes?: QuickNote[]
  onChange?: (notes: QuickNote[]) => void
  placeholder?: string
  className?: string
}

export function QuickNotesCard({ title = "Notas rápidas", notes: initial = [], onChange, placeholder = "Escribe una nota…", className }: QuickNotesCardProps) {
  const reduce = !!useReducedMotion()
  const inputId = useId()
  const [notes, setNotes] = useState(initial)
  const [draft, setDraft] = useState("")
  const commit = (next: QuickNote[]) => {
    setNotes(next)
    onChange?.(next)
  }
  const add = (event: FormEvent) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    commit([...notes, { id: `${Date.now()}`, text }])
    setDraft("")
  }
  return (
    <AeCard title={title} className={className}>
      {notes.length === 0 ? <AeEmpty>Sin notas por ahora.</AeEmpty> : null}
      <ul className="grid gap-2">
        <AnimatePresence initial={false}>
          {notes.map((note) => (
            <motion.li
              key={note.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: 12 }}
              className="group flex min-w-0 items-start gap-2 rounded-2xl bg-muted/60 px-3 py-2 text-sm"
            >
              <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="min-w-0 flex-1 break-words">{note.text}</span>
              <button
                type="button"
                aria-label={`Borrar nota: ${note.text}`}
                onClick={() => commit(notes.filter((item) => item.id !== note.id))}
                className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X aria-hidden className="size-3.5" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <form onSubmit={add} className="flex items-center gap-2">
        <label htmlFor={inputId} className="sr-only">
          Nueva nota
        </label>
        <input
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          className="h-10 min-w-0 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button type="submit" aria-label="Agregar nota" disabled={!draft.trim()} className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground text-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-40">
          <Plus aria-hidden className="size-4" />
        </button>
      </form>
    </AeCard>
  )
}
