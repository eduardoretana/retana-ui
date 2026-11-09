import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AppRail } from "@/registry/ui/app-rail"
import { ChatThread } from "@/registry/ui/chat-thread"
import { ConversationList } from "@/registry/ui/conversation-list"
import { InboxPageHeader } from "@/registry/ui/inbox-page-header"
import { MessageBubble } from "@/registry/ui/message-bubble"
import { MessageCardFile } from "@/registry/ui/message-card-file"
import { MessageCardInvoice } from "@/registry/ui/message-card-invoice"
import { MessageCardMetric } from "@/registry/ui/message-card-metric"
import { PartyPanel } from "@/registry/ui/party-panel"
import { SegmentedFilter } from "@/registry/ui/segmented-filter"
import { SuggestedReplies } from "@/registry/ui/suggested-replies"
import { ThreadComposer } from "@/registry/ui/thread-composer"
import { TypingIndicator } from "@/registry/ui/typing-indicator"
import { InboxCrm } from "@/registry/blocks/inbox-crm"

const conversations = [
  {
    id: "ambar",
    title: "Taller Ámbar",
    preview: "Tú: Va el corte",
    time: "10:44",
    unread: 2,
    section: "pinned",
    tags: ["clients"],
    stage: "Propuesta",
    windowLabel: "6 h",
    channel: <span>WhatsApp</span>,
  },
  {
    id: "lerma",
    title: "Casa Lerma",
    preview: "¿Me compartes la simulación?",
    time: "Ayer",
    section: "all",
    tags: ["leads", "mine"],
    unread: 1,
  },
]

describe("conversation list", () => {
  it("announces unread rows and moves with the arrow keys", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <ConversationList
        label="Conversaciones"
        title="Mensajes"
        countLabel="2"
        searchLabel="Buscar mensajes"
        shortcut="⌘K"
        filters={[
          { value: "all", label: "Todos" },
          { value: "unread", label: "Sin leer" },
        ]}
        filter="all"
        sections={[
          { id: "pinned", label: "Fijados" },
          { id: "all", label: "Todos los mensajes" },
        ]}
        items={conversations}
        selectedId="ambar"
        onSelect={onSelect}
      />,
    )

    expect(screen.getByRole("listbox", { name: "Conversaciones" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: /Taller Ámbar/ })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("WhatsApp")).toBeInTheDocument()
    expect(screen.getByText("Propuesta")).toBeInTheDocument()
    expect(screen.getByText("6 h")).toBeInTheDocument()

    screen.getByRole("listbox").focus()
    await user.keyboard("{ArrowDown}")
    expect(onSelect).toHaveBeenCalledWith("lerma")
  })

  it("shows an empty, loading, and error state", () => {
    const { rerender } = render(<ConversationList label="Conversaciones" items={[]} status="empty" emptyTitle="Sin chats" />)
    expect(screen.getByRole("status")).toHaveTextContent("Sin chats")

    rerender(<ConversationList label="Conversaciones" items={[]} status="loading" loadingLabel="Cargando chats" />)
    expect(screen.getByRole("status", { name: "Cargando chats" })).toBeInTheDocument()

    rerender(
      <ConversationList label="Conversaciones" items={[]} status="error" error="No se pudo leer la lista." onRetry={() => {}} retryLabel="Reintentar" />,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo leer la lista.")
  })
})

describe("message bubble", () => {
  it("marks an outgoing read message and hides the author inside a group", () => {
    render(
      <div>
        <MessageBubble side="outgoing" author="Tú" time="10:42" delivery="read" deliveryLabel="Leído">
          Solo falta el visto.
        </MessageBubble>
        <MessageBubble side="incoming" author="Marina Soler" time="10:46" grouped="middle">
          Sigo aquí.
        </MessageBubble>
      </div>,
    )

    const outgoing = screen.getByText("Solo falta el visto.").closest("[data-slot=message-bubble]")
    expect(outgoing).toHaveAttribute("data-side", "outgoing")
    expect(outgoing).toHaveAttribute("data-delivery", "read")
    expect(screen.getByText("Leído")).toBeInTheDocument()
    expect(screen.queryByText("Marina Soler")).not.toBeInTheDocument()
  })

  it("offers retry when sending fails", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(
      <MessageBubble side="outgoing" author="Tú" delivery="failed" onRetry={onRetry} retryLabel="Reintentar">
        Va el corte.
      </MessageBubble>,
    )
    await user.click(screen.getByRole("button", { name: "Reintentar" }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("rises on enter and stays still when motion is reduced", () => {
    const { rerender } = render(
      <MessageBubble side="incoming" author="Marina" enter>
        Llegué.
      </MessageBubble>,
    )
    expect(screen.getByText("Llegué").closest("[data-motion]")).toHaveAttribute("data-motion", "rise")

    const original = window.matchMedia
    window.matchMedia = (query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList
    rerender(
      <MessageBubble side="incoming" author="Marina" enter>
        Llegué.
      </MessageBubble>,
    )
    expect(screen.getByText("Llegué").closest("[data-motion]")).toHaveAttribute("data-motion", "off")
    window.matchMedia = original
  })
})

describe("rich cards", () => {
  it("renders a file, an amount due, and a segmented bar", () => {
    render(
      <div>
        <MessageCardFile name="corte-marca.pdf" detail="248 KB · PDF" status="En revisión" downloadLabel="Descargar" onDownload={() => {}} />
        <MessageCardInvoice title="Monto a pagar" amount="$18,640" due="Vence 14 nov" />
        <MessageCardMetric
          title="Salud de entrega"
          chip="Analítica"
          value="92 %"
          caption="a tiempo"
          filled={11}
          total={12}
          start="11 de 12 hitos"
          end="Lanzamiento 10 dic"
        />
      </div>,
    )
    expect(screen.getByText("corte-marca.pdf")).toBeInTheDocument()
    expect(screen.getByText("En revisión")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Descargar" })).toBeInTheDocument()
    expect(screen.getByText("$18,640")).toBeInTheDocument()
    expect(screen.getByText("Vence 14 nov")).toBeInTheDocument()
    const segments = document.querySelectorAll("[data-slot=metric-segment]")
    expect(segments).toHaveLength(12)
    expect(Array.from(segments).filter((node) => node.getAttribute("data-filled") === "true")).toHaveLength(11)
  })
})

describe("typing indicator", () => {
  it("names who is typing without a presence provider", () => {
    render(<TypingIndicator names={["Marina Soler"]} label={() => "Marina escribe…"} dots />)
    expect(screen.getByText("Marina escribe…")).toBeInTheDocument()
    expect(document.querySelector("[data-dots=true]")).toBeTruthy()
  })
})

describe("suggested replies", () => {
  it("asks for approval and never sends", async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    render(
      <SuggestedReplies
        label="Sugerencias"
        items={[
          { id: "timeline", label: "Compartir timeline" },
          { id: "call", label: "Agendar llamada" },
        ]}
        onApprove={onApprove}
      />,
    )
    const chips = screen.getAllByRole("button")
    expect(chips[1]).toHaveAttribute("data-stagger", "50")
    await user.click(screen.getByRole("button", { name: "Agendar llamada" }))
    expect(onApprove).toHaveBeenCalledWith("call")
    expect(screen.queryByRole("button", { name: "Enviar" })).not.toBeInTheDocument()
  })
})

describe("thread composer", () => {
  it("sends the draft and keeps ask-ai from sending", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    const onAsk = vi.fn()
    render(
      <ThreadComposer
        placeholder="Mensaje a Taller Ámbar…"
        sendLabel="Enviar"
        askLabel="Preguntar a IA"
        attachLabel="Adjuntar"
        onSend={onSend}
        onAsk={onAsk}
      />,
    )
    await user.type(screen.getByRole("textbox"), "Va el jueves")
    await user.click(screen.getByRole("button", { name: "Preguntar a IA" }))
    expect(onAsk).toHaveBeenCalledOnce()
    expect(onSend).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "Enviar" }))
    expect(onSend).toHaveBeenCalledWith("Va el jueves")
  })

  it("locks the field when the window is closed and only offers a template", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    const onUseTemplate = vi.fn()
    render(
      <ThreadComposer
        sendLabel="Enviar"
        locked={{ title: "La ventana de 24 h está cerrada.", action: "Usar plantilla" }}
        onSend={onSend}
        onUseTemplate={onUseTemplate}
      />,
    )
    expect(screen.getByRole("status")).toHaveTextContent("La ventana de 24 h está cerrada.")
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Usar plantilla" }))
    expect(onUseTemplate).toHaveBeenCalledOnce()
    expect(onSend).not.toHaveBeenCalled()
  })
})

describe("party panel", () => {
  it("masks a sensitive field until someone asks to show it", async () => {
    const user = userEvent.setup()
    const onReveal = vi.fn()
    render(
      <PartyPanel
        name="Casa Lerma"
        meta="Prospecto desde 2026 · León"
        deal={{ title: "Crédito puente", status: "Abierto", amount: "$186,400 de $240,000", value: 40, label: "40 %" }}
        facts={[{ id: "hito", label: "Próximo hito", value: "12 nov" }]}
        members={[{ id: "m", name: "Marina Soler", role: "Cliente · Finanzas" }]}
        files={[{ id: "f", name: "ine-demo.pdf", detail: "1.2 MB · Hoy" }]}
        secrets={[{ id: "curp", label: "CURP", masked: "••••••••••••••••••", revealed: "DEMO000000HDFXXX00" }]}
        revealLabel="Mostrar"
        onReveal={onReveal}
      />,
    )
    expect(screen.getByText("••••••••••••••••••")).toBeInTheDocument()
    expect(screen.queryByText("DEMO000000HDFXXX00")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Mostrar" }))
    expect(screen.getByText("DEMO000000HDFXXX00")).toBeInTheDocument()
    expect(onReveal).toHaveBeenCalledWith("curp")
  })
})

describe("inbox shell", () => {
  const party = {
    name: "Taller Ámbar",
    meta: "Cliente desde 2024 · León",
    facts: [] as { id: string; label: string; value: string }[],
    members: [] as { id: string; name: string; role: string }[],
    files: [] as { id: string; name: string; detail: string }[],
  }

  function shell(extra: Record<string, unknown> = {}) {
    return (
      <InboxCrm
        layout="wide"
        railLabel="Espacios"
        railItems={[{ id: "chat", label: "Mensajes", active: true }]}
        crumbs={[
          { label: "Espacio", href: "#espacio" },
          { label: "Mensajes" },
        ]}
        title="Mensajes"
        subtitle="Conversaciones con clientes y el equipo · 2 sin leer"
        actions={[{ id: "chat", label: "Nuevo chat" }]}
        listLabel="Conversaciones"
        searchLabel="Buscar mensajes"
        filters={[
          { value: "all", label: "Todos" },
          { value: "unread", label: "Sin leer" },
        ]}
        filter="all"
        sections={[{ id: "pinned", label: "Fijados" }]}
        conversations={conversations}
        selectedId="ambar"
        threadLabel="Hilo con Taller Ámbar"
        threadTitle="Taller Ámbar"
        threadStatus="En línea · Marca"
        messages={[
          { id: "m1", side: "incoming", author: "Marina Soler", time: "10:46", body: "¿Podemos hablar el jueves?" },
        ]}
        suggestions={[{ id: "call", label: "Agendar llamada" }]}
        party={party}
        {...extra}
      />
    )
  }

  it("keeps one column on a phone and goes back to the list", async () => {
    const user = userEvent.setup()
    render(shell({ layout: "phone" }))
    expect(screen.queryByText("¿Podemos hablar el jueves?")).not.toBeInTheDocument()
    await user.click(screen.getByRole("option", { name: /Taller Ámbar/ }))
    expect(screen.getByText("¿Podemos hablar el jueves?")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Volver" }))
    expect(screen.queryByText("¿Podemos hablar el jueves?")).not.toBeInTheDocument()
  })

  it("hides the rail below the desk and closes the context drawer with escape", async () => {
    const user = userEvent.setup()
    const { rerender } = render(shell({ layout: "tablet" }))
    expect(screen.queryByRole("navigation", { name: "Espacios" })).not.toBeInTheDocument()

    rerender(shell({ layout: "desk" }))
    expect(screen.getByRole("navigation", { name: "Espacios" })).toBeInTheDocument()
    expect(screen.queryByText("Cliente desde 2024 · León")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Contexto" }))
    expect(screen.getByText("Cliente desde 2024 · León")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(screen.queryByText("Cliente desde 2024 · León")).not.toBeInTheDocument()
  })

  it("focuses search with the command shortcut", async () => {
    const user = userEvent.setup()
    render(shell())
    await user.keyboard("{Meta>}k{/Meta}")
    expect(screen.getByRole("searchbox", { name: "Buscar mensajes" })).toHaveFocus()
  })

  it("covers loading, empty, error, and offline", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(shell({ status: "loading" }))
    expect(document.querySelector("[data-slot=inbox-crm]")).toHaveAttribute("aria-busy", "true")

    rerender(shell({ status: "empty", conversations: [], emptyLabel: "No hay conversaciones" }))
    expect(screen.getByText("No hay conversaciones")).toBeInTheDocument()

    rerender(shell({ status: "error", error: "No se pudo abrir la bandeja.", onRetry, retryLabel: "Reintentar" }))
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo abrir la bandeja.")
    await user.click(screen.getByRole("button", { name: "Reintentar" }))
    expect(onRetry).toHaveBeenCalledOnce()

    rerender(shell({ status: "offline", offlineLabel: "Sin conexión" }))
    expect(screen.getByRole("status")).toHaveTextContent("Sin conexión")
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled()
  })

  it("puts a suggestion into the draft and does not send it", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(shell({ onSend }))
    await user.click(screen.getByRole("button", { name: "Agendar llamada" }))
    expect(screen.getByRole("textbox")).toHaveValue("Agendar llamada")
    expect(onSend).not.toHaveBeenCalled()
  })

  it("threads a log with typing, a failed send, and a closed window", () => {
    render(
      <ChatThread
        label="Hilo"
        title="Casa Lerma"
        status="Ventana cerrada"
        messages={[
          {
            id: "v",
            side: "incoming",
            author: "Casa Lerma",
            time: "09:12",
            note: { title: "Nota de voz · 0:18", detail: "Audio", body: "Quedamos el jueves por la tarde." },
          },
          { id: "bad", side: "outgoing", author: "Tú", time: "09:14", body: "Te la mando.", delivery: "failed" },
        ]}
        typing={{ names: ["Casa Lerma"], label: "Casa Lerma escribe…" }}
        onRetryMessage={() => {}}
        retryLabel="Reintentar"
      />,
    )
    const log = screen.getByRole("log")
    expect(log).toHaveAttribute("aria-live", "polite")
    expect(screen.getByText("Quedamos el jueves por la tarde.")).toBeInTheDocument()
    expect(screen.getByText("Casa Lerma escribe…")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument()
  })
})

describe("page chrome", () => {
  it("renders the rail, the header, and a touch-sized filter", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <div>
        <AppRail label="Espacios" mark="Á" items={[{ id: "chat", label: "Mensajes", active: true }]} />
        <InboxPageHeader
          crumbs={[
            { label: "Espacio", href: "#espacio" },
            { label: "Mensajes" },
          ]}
          title="Mensajes"
          subtitle="2 sin leer"
          actions={[{ id: "new", label: "Nuevo chat", onSelect: () => {} }]}
          bellLabel="Avisos"
          bellCount={3}
        />
        <SegmentedFilter
          label="Filtro"
          options={[
            { value: "all", label: "Todos" },
            { value: "unread", label: "Sin leer" },
          ]}
          value="all"
          onValueChange={onValueChange}
        />
      </div>,
    )
    expect(screen.getByRole("navigation", { name: "Espacios" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Mensajes" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Avisos/ })).toBeInTheDocument()
    const option = screen.getByRole("button", { name: "Todos" })
    expect(option.className).toContain("min-h-11")
    await user.click(screen.getByRole("button", { name: "Sin leer" }))
    expect(onValueChange).toHaveBeenCalledWith("unread")
  })
})
