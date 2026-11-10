/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos. Los nombres, montos y documentos son ficticios.
 */
import type { InboxLayout } from "../inbox-crm/InboxCrm.vue"

type Locale = "es" | "en"

function text(locale: Locale, spanish: string, english: string) {
  return locale === "en" ? english : spanish
}

export function bandejaProps(scene: string, locale: Locale = "es") {
  const t = (spanish: string, english: string) => text(locale, spanish, english)
  const cenit = scene === "cenit" || scene === "locked"
  const closed = scene === "locked"
  const conversations = cenit
    ? [
        {
          id: "lerma",
          title: "Casa Lerma",
          preview: t("¿Me compartes la simulación?", "Can you send the simulation?"),
          time: "10:44",
          unread: 2,
          section: "pinned",
          tags: ["leads", "mine", "unread"],
          stage: t("Simulación", "Simulation"),
          windowLabel: t("Quedan 6 h", "6 h left"),
          channel: "WhatsApp",
          presence: "online" as const,
        },
        {
          id: "nube",
          title: "Barrio Nube",
          preview: t("La ventana ya se cerró.", "The window is already closed."),
          time: t("Ayer", "Yesterday"),
          section: "all",
          tags: ["clients"],
          stage: t("Documentos", "Documents"),
          windowLabel: t("Cerrada", "Closed"),
        },
      ]
    : [
        {
          id: "ambar",
          title: "Taller Ámbar",
          preview: t("Tú: Va el corte revisado.", "You: The revised cut is on its way."),
          time: "10:44",
          unread: 2,
          section: "pinned",
          tags: ["clients", "unread"],
          stage: t("Propuesta", "Proposal"),
          windowLabel: t("6 h", "6 h"),
          channel: "WhatsApp",
          presence: "online" as const,
        },
        {
          id: "arcilla",
          title: "Arcilla Viva",
          preview: t("¿Seguimos para el 10 de diciembre?", "Are we still on for December 10?"),
          time: "09:12",
          section: "all",
          tags: ["clients"],
        },
        {
          id: "renata",
          title: "Renata Vidal",
          role: t("Diseñadora", "Designer"),
          time: "",
          section: "people",
          kind: "contact" as const,
          presence: "online" as const,
          tags: ["team"],
        },
      ]

  const studio = [
    {
      id: "hola",
      side: "incoming" as const,
      author: "Marina Soler",
      time: "10:41",
      body: t("Perfecto, gracias.", "Perfect, thank you."),
    },
    {
      id: "pista",
      side: "incoming" as const,
      author: "Marina Soler",
      time: "10:46",
      enter: true,
      body: t("¿Podemos hablar esta semana? El jueves por la tarde nos queda mejor.", "Could we talk this week? Thursday afternoon works best for us."),
    },
    {
      id: "mio",
      side: "outgoing" as const,
      author: t("Tú", "You"),
      time: "10:42",
      body: t("Sí. Solo falta el visto de calidad.", "Yes. Only the quality sign-off is left."),
      delivery: (scene === "failed" ? "failed" : "read") as "failed" | "read",
      deliveryLabel: scene === "failed" ? t("No se envió", "Not sent") : t("Leído", "Read"),
    },
    {
      id: "archivo",
      side: "outgoing" as const,
      author: t("Tú", "You"),
      time: "10:43",
      file: { name: "corte-marca.pdf", detail: t("248 KB · PDF", "248 KB · PDF") },
    },
    {
      id: "cobro",
      side: "outgoing" as const,
      author: t("Tú", "You"),
      time: "10:43",
      invoice: { title: t("Monto a pagar", "Amount due"), amount: "$18,640", due: t("Vence 14 nov", "Due Nov 14") },
    },
    {
      id: "salud",
      side: "incoming" as const,
      author: "Marina Soler",
      time: "10:44",
      metric: {
        title: t("Salud de entrega", "Delivery health"),
        chip: t("Analítica", "Analytics"),
        value: "92 %",
        caption: t("a tiempo", "on time"),
        filled: 11,
        total: 12,
        start: t("11 de 12 hitos", "11 of 12 milestones"),
        end: t("Lanzamiento 10 dic", "Launch Dec 10"),
      },
    },
  ]

  const credito = [
    {
      id: "voz",
      side: "incoming" as const,
      author: "Casa Lerma",
      time: "10:41",
      enter: true,
      note: {
        title: t("Nota de voz · 0:18", "Voice note · 0:18"),
        detail: t("Audio recibido", "Audio received"),
        body: t("Quedamos el jueves por la tarde para revisar el crédito.", "Thursday afternoon works to review the loan."),
      },
    },
    {
      id: "cot",
      side: "incoming" as const,
      author: "Casa Lerma",
      time: "10:42",
      invoice: { title: t("Cotización", "Quote"), amount: "$186,400", due: t("Vence 14 nov", "Due Nov 14") },
    },
    {
      id: "cita",
      side: "outgoing" as const,
      author: t("Tú", "You"),
      time: "10:46",
      delivery: "read" as const,
      deliveryLabel: t("Leído", "Read"),
      note: {
        title: t("Cita agendada", "Appointment booked"),
        detail: t("Jueves 12 nov · 14:30 · 30 min", "Thu Nov 12 · 14:30 · 30 min"),
        body: t("Revisión de expediente.", "File review."),
      },
    },
    {
      id: "ine",
      side: "incoming" as const,
      author: "Casa Lerma",
      time: "10:48",
      file: { name: "ine-demo.pdf", detail: t("1.2 MB · Documento", "1.2 MB · Document"), status: t("En revisión", "In review") },
    },
  ]

  const party = cenit
    ? {
        name: "Casa Lerma",
        meta: t("Prospecto desde 2026 · León", "Prospect since 2026 · León"),
        actions: [
          { id: "expediente", label: t("Expediente", "File") },
          { id: "llamadas", label: t("Llamadas", "Calls") },
          { id: "docs", label: t("Documentos", "Documents") },
        ],
        deal: {
          title: t("Crédito puente", "Bridge loan"),
          status: t("Abierto", "Open"),
          amount: "$186,400 de $240,000",
          value: 40,
          label: "40 %",
        },
        facts: [
          { id: "etapa", label: t("Etapa", "Stage"), value: t("Simulación", "Simulation") },
          { id: "prob", label: t("Probabilidad", "Likelihood"), value: "40 %" },
          { id: "asesor", label: t("Asesor", "Advisor"), value: "Diego Rueda" },
        ],
        members: [{ id: "diego", name: "Diego Rueda", role: t("Asesor · Tú", "Advisor · You") }],
        files: [{ id: "ine", name: "ine-demo.pdf", detail: t("1.2 MB · Hoy", "1.2 MB · Today") }],
        secrets: [
          { id: "curp", label: "CURP", masked: "••••••••••••••••••", revealed: "DEMO000000HDFXXX00" },
          { id: "nss", label: "NSS", masked: "•••••••••••", revealed: "00000000000" },
        ],
      }
    : {
        name: "Taller Ámbar",
        meta: t("Cliente desde 2024 · León", "Client since 2024 · León"),
        actions: [
          { id: "proyecto", label: t("Proyecto", "Project") },
          { id: "facturas", label: t("Facturas", "Invoices") },
          { id: "reunion", label: t("Reunión", "Meeting") },
        ],
        deal: {
          title: t("Marca", "Brand"),
          status: t("Abierto", "Open"),
          amount: "$34,600 de $48,000",
          value: 72,
          label: "72 %",
        },
        facts: [
          { id: "hito", label: t("Próximo hito", "Next milestone"), value: t("10 dic", "Dec 10") },
          { id: "horas", label: t("Horas del sprint", "Sprint hours"), value: "52 h" },
        ],
        members: [
          { id: "marina", name: "Marina Soler", role: t("Cliente · Finanzas", "Client · Finance") },
          { id: "diego", name: "Diego Rueda", role: t("Admin · Tú", "Admin · You") },
        ],
        files: [{ id: "corte", name: "corte-marca.pdf", detail: t("248 KB · Hoy", "248 KB · Today") }],
      }

  const receipts = [
    {
      id: "sent",
      side: "outgoing" as const,
      author: t("Tú", "You"),
      time: "10:40",
      body: t("Te mando el corte.", "Sending the cut."),
      delivery: "sent" as const,
      deliveryLabel: t("Enviado", "Sent"),
    },
    {
      id: "delivered",
      side: "outgoing" as const,
      author: t("Tú", "You"),
      time: "10:41",
      body: t("¿Lo ves?", "Do you see it?"),
      delivery: "delivered" as const,
      deliveryLabel: t("Entregado", "Delivered"),
    },
    {
      id: "read",
      side: "outgoing" as const,
      author: t("Tú", "You"),
      time: "10:42",
      body: t("Quedó leído.", "It was read."),
      delivery: "read" as const,
      deliveryLabel: t("Leído", "Read"),
    },
  ]

  const layout: InboxLayout = scene === "hilo" ? "phone" : "auto"
  const quiet = scene === "empty" || scene === "loading" || scene === "error"

  return {
    layout,
    initialColumn: scene === "hilo" ? ("thread" as const) : ("list" as const),
    status: (scene === "loading" ? "loading" : scene === "empty" ? "empty" : scene === "error" ? "error" : scene === "offline" ? "offline" : "ready") as
      | "ready"
      | "loading"
      | "empty"
      | "error"
      | "offline",
    error: t("No se pudo abrir la bandeja.", "The inbox could not be opened."),
    offlineLabel: t("Sin conexión. El envío espera a que vuelva la red.", "Offline. Sending waits until the network returns."),
    emptyLabel: t("No hay conversaciones.", "No conversations."),
    retryLabel: t("Reintentar", "Try again"),
    railLabel: t("Espacios", "Spaces"),
    railMark: "Á",
    railItems: [
      { id: "inicio", label: t("Inicio", "Home"), icon: "mdi mdi-view-grid-outline" },
      { id: "archivos", label: t("Archivos", "Files"), icon: "mdi mdi-folder-outline" },
      { id: "reportes", label: t("Reportes", "Reports"), icon: "mdi mdi-chart-pie" },
      { id: "chat", label: t("Mensajes", "Messages"), icon: "mdi mdi-message-text-outline", active: true },
      { id: "pagos", label: t("Pagos", "Payments"), icon: "mdi mdi-wallet-outline" },
      { id: "gente", label: t("Contactos", "Contacts"), icon: "mdi mdi-account-group-outline" },
    ],
    crumbs: [
      { label: t("Espacio", "Workspace"), href: "#espacio" },
      { label: t("Mensajes", "Messages") },
    ],
    title: t("Mensajes", "Messages"),
    subtitle: t("Conversaciones con clientes y el equipo · 2 sin leer", "Conversations with clients and the team · 2 unread"),
    actions: [
      { id: "grupo", label: t("Nuevo grupo", "New group") },
      { id: "chat", label: t("Nuevo chat", "New chat") },
    ],
    bellLabel: t("Avisos", "Notices"),
    bellCount: 3,
    listLabel: t("Conversaciones", "Conversations"),
    listTitle: t("Mensajes", "Messages"),
    countLabel: scene === "empty" ? "0" : "12",
    searchLabel: t("Buscar mensajes", "Search messages"),
    filters: cenit
      ? [
          { value: "all", label: t("Todos", "All") },
          { value: "leads", label: t("Prospectos", "Leads") },
          { value: "clients", label: t("Clientes", "Clients") },
          { value: "unread", label: t("Sin leer", "Unread") },
          { value: "mine", label: t("Míos", "Mine") },
        ]
      : [
          { value: "all", label: t("Todos", "All") },
          { value: "clients", label: t("Clientes", "Clients") },
          { value: "unread", label: t("Sin leer", "Unread") },
          { value: "mine", label: t("Míos", "Mine") },
        ],
    filter: scene === "unread" ? "unread" : "all",
    sections: cenit
      ? [
          { id: "pinned", label: t("Fijados", "Pinned") },
          { id: "all", label: t("Todos los mensajes", "All messages") },
        ]
      : [
          { id: "pinned", label: t("Fijados", "Pinned") },
          { id: "all", label: t("Todos los mensajes", "All messages") },
          { id: "people", label: t("Contactos", "Contacts"), hint: t("1 en línea", "1 online") },
        ],
    conversations: quiet ? [] : conversations,
    selectedId: cenit ? "lerma" : "ambar",
    threadLabel: t("Hilo", "Thread"),
    threadTitle: cenit ? "Casa Lerma" : "Taller Ámbar",
    threadStatus: cenit ? t("En línea · Simulación", "Online · Simulation") : t("En línea · Marca", "Online · Brand"),
    threadPresence: "online" as const,
    messages: scene === "empty" ? [] : scene === "receipts" ? receipts : cenit ? credito : studio,
    typing: scene === "typing" || scene === "filled" ? { names: [cenit ? "Casa Lerma" : "Marina Soler"], label: t("Marina escribe…", "Marina is typing…") } : undefined,
    suggestions: scene === "empty"
      ? []
      : cenit
        ? [
            { id: "sim", label: t("Enviar simulación", "Send simulation") },
            { id: "call", label: t("Agendar llamada", "Schedule a call") },
            { id: "docs", label: t("Pedir documentos", "Request documents") },
            { id: "plantilla", label: t("Usar plantilla", "Use a template") },
          ]
        : [
            { id: "crono", label: t("Compartir cronograma", "Share the schedule") },
            { id: "call", label: t("Agendar llamada", "Schedule a call") },
            { id: "reporte", label: t("Enviar reporte", "Send the report") },
          ],
    locked: closed
      ? { title: t("La ventana de 24 h está cerrada.", "The 24-hour window is closed."), action: t("Usar plantilla", "Use a template") }
      : null,
    party,
    placeholder: cenit ? t("Mensaje a Casa Lerma…", "Message Casa Lerma…") : t("Mensaje a Taller Ámbar…", "Message Taller Ámbar…"),
    backLabel: t("Volver", "Back"),
    contextLabel: t("Contexto", "Context"),
    sendLabel: t("Enviar", "Send"),
    askLabel: t("Preguntar a IA", "Ask AI"),
    attachLabel: t("Adjuntar", "Attach"),
    revealLabel: t("Mostrar", "Show"),
  }
}
