"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { EmailDraft, type DraftStatus } from "@/registry/ui/email-draft"

import { bodyFor, contactsFrom, discarded, draftLabels, empty, error as broken, filled, loading, sent, short, type EmailFixture } from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }

function DraftScene({ locale, log, fixture, failSend = false }: SceneRenderProps & { fixture: EmailFixture; failSend?: boolean }) {
  const sim = useSceneSim(
    {
      contactId: fixture.contactId ?? null,
      toneId: fixture.toneId ?? null,
      body: null as string | null,
      attachmentRemoved: false,
      status: null as DraftStatus | null,
      touched: false,
    },
    log,
  )
  const attempt = useRef(0)
  const contactId = sim.state.contactId ?? fixture.contacts[0]?.id ?? ""
  const toneId = sim.state.toneId ?? fixture.tones[locale][0]?.id ?? ""
  const body = sim.state.body ?? bodyFor(fixture, locale, toneId, contactId)
  const status = sim.state.touched ? sim.state.status : (fixture.status ?? null)
  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.sendError ? <SceneStatus tone="error">{fixture.sendError[locale]}</SceneStatus> : null}
      <EmailDraft
        reference={fixture.reference}
        account={fixture.account}
        amount={fixture.amount}
        statusLabel={fixture.statusLabel?.[locale]}
        agent={fixture.agent}
        contacts={contactsFrom(fixture, locale)}
        contactId={contactId}
        tones={fixture.tones[locale]}
        toneId={toneId}
        body={body}
        attachment={sim.state.attachmentRemoved ? null : fixture.attachment}
        removedAttachment={sim.state.attachmentRemoved ? fixture.attachment : null}
        linkLabel={fixture.link?.[locale]}
        status={status}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={draftLabels(locale)}
        onContact={(id) => sim.patch(formatSceneCall("onContact", [id]), (current) => ({ ...current, contactId: id, body: null }))}
        onTone={(id) => sim.patch(formatSceneCall("onTone", [id]), (current) => ({ ...current, toneId: id, body: null }))}
        onBody={(next) => sim.patch(formatSceneCall("onBody", [next]), (current) => ({ ...current, body: next }))}
        onAttachment={(name) => sim.patch(formatSceneCall("onAttachment", [name]), (current) => ({ ...current, attachmentRemoved: name == null }))}
        onOpen={() => log(formatSceneCall("onOpen", []))}
        onSend={(email) => {
          attempt.current += 1
          const fail = failSend && attempt.current === 1
          void sim.call(formatSceneCall("onSend", [email.to]), (current) => ({ ...current, status: "sent", touched: true }), undefined, { fail })
        }}
        onDiscard={() => sim.patch(formatSceneCall("onDiscard", []), (current) => ({ ...current, status: "discarded", touched: true }))}
        onUndo={() => sim.patch(formatSceneCall("onUndo", []), (current) => ({ ...current, status: null, touched: true }))}
      />
    </div>
  )
}

function scene(fixture: EmailFixture, failSend = false) {
  return function Render(props: SceneRenderProps) {
    return <DraftScene {...props} fixture={fixture} failSend={failSend} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "sent", label: "Enviado", labelEn: "Sent", render: scene(sent), frame },
  { id: "discarded", label: "Descartado", labelEn: "Discarded", render: scene(discarded), frame },
  { id: "short", label: "Breve", labelEn: "Short", render: scene(short), frame },
]
