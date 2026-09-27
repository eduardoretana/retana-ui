import type {
  AdminSeed,
  AnalyticsClick,
  AnalyticsView,
  Booking,
} from "@/registry/retana/lib/admin-types"

const DAY = 86_400_000

/**
 * Fictitious Spanish studio. Emails use the reserved example domain.
 * Nothing here is a real client, person, or phone number.
 */
export function buildDemoSeed(now = Date.now()): AdminSeed {
  const categories = [
    { id: "cat-product", title: "Diseño de producto", slug: "diseno-de-producto", position: 0, published: true },
    { id: "cat-web", title: "Sitios web", slug: "sitios-web", position: 1, published: true },
    { id: "cat-mobile", title: "Apps móviles", slug: "apps-moviles", position: 2, published: true },
    { id: "cat-brand", title: "Marca", slug: "marca", position: 3, published: true },
    { id: "cat-motion", title: "Motion", slug: "motion", position: 4, published: true },
  ]

  const projects = [
    project("p1", "App de banca Lumen", "app-de-banca-lumen", "cat-mobile", "Banca móvil con transferencias y metas.", "Lumen", "2025", 0, true),
    project("p2", "Identidad Norte", "identidad-norte", "cat-brand", "Sistema visual para un estudio de arquitectura.", "Norte", "2025", 1, true),
    project("p3", "Planificador Orión", "planificador-orion", "cat-product", "Viajes en grupo, con lista compartida.", "Orión", "2024", 2, true),
    project("p4", "Analítica Norteña", "analitica-nortena", "cat-web", "Panel de métricas para una cooperativa.", "Norteña", "2024", 3, false),
    project("p5", "Tablero Pulso", "tablero-pulso", "cat-product", "Seguimiento de citas para una clínica.", "Pulso", "2026", 4, true),
    project("p6", "Comercio Kite", "comercio-kite", "cat-web", "Catálogo y caja para una tienda pequeña.", "Kite", "2023", 5, false),
    project("p7", "Logística Feria", "logistica-feria", "cat-mobile", "Rutas del día para el equipo de reparto.", "Feria", "2025", 6, true),
    project("p8", "CRM Cobalto", "crm-cobalto", "cat-product", "Fichas de clientes y próximos pasos.", "Cobalto", "2026", 7, false),
  ]

  const bookings: Booking[] = [
    booking("b1", "Lucía Navarro", "lucia.navarro@acme.example", "+34 600 010 101", "Sitio web, Marca", "Estudio", "Quiere rehacer la página de precios.", "Sitio", "google.example", "booked", now + 2 * DAY, now - 3 * DAY),
    booking("b2", "Andrés Molina", "andres.molina@acme.example", "+34 600 010 102", "App móvil", "Retainer", "Equipo de cuatro, arranque en octubre.", "Sitio", "news.example", "booked", now + 5 * DAY, now - DAY),
    booking("b3", "Marta Quintero", "marta.quintero@acme.example", "+34 600 010 103", "Motion", "Llamada", "Solo una pieza de lanzamiento.", "Sitio", "Directo", "booked", now - 4 * DAY, now - 10 * DAY),
    booking("b4", "Hugo Beltrán", "hugo.beltran@acme.example", "+34 600 010 104", "Marca", "Estudio", "Canceló por calendario.", "Cal.com", "social.example", "cancelled", now + DAY, now - 6 * DAY),
    booking("b5", "Elena Ruiz", "elena.ruiz@acme.example", "+34 600 010 105", "Sitio web", "Retainer", "Tienda con dos idiomas.", "Sitio", "google.example", "booked", now + 9 * DAY, now - 2 * DAY),
    booking("b6", "Pablo Serra", "pablo.serra@acme.example", "+34 600 010 106", "Producto", "Llamada", "Aún no eligió hora.", "Sitio", "Directo", "booked", null, now - 12 * 3_600_000),
  ]

  return {
    asOf: now,
    settings: {
      "site.name": "Estudio Acme",
      "site.headline": "Diseño de producto para equipos que ya saben lo que quieren",
      "site.subhead": "Un estudio ficticio. Los proyectos, clientes y reservas de esta demo no existen.",
      "cta.label": "Reservar una llamada",
      "cta.href": "https://meet.example/acme",
      "footer.note": "Datos de demostración. Nada de esto es un cliente real.",
      "seo.title": "Estudio Acme",
      "seo.description": "Portafolio de ejemplo para el admin kit de Retana UI.",
      "about.story": "Acme es un estudio inventado. Esta página existe para enseñar el formulario de acerca de: historia, cifras, experiencia y premios.",
    },
    categories,
    projects,
    clients: [
      { id: "c1", name: "Lumen", logoUrl: null, rowIndex: 0, position: 0, published: true },
      { id: "c2", name: "Norte", logoUrl: null, rowIndex: 0, position: 1, published: true },
      { id: "c3", name: "Pulso", logoUrl: null, rowIndex: 1, position: 2, published: true },
      { id: "c4", name: "Feria", logoUrl: null, rowIndex: 1, position: 3, published: true },
    ],
    photos: [
      { id: "ph1", src: "", alt: "Mesa del estudio, mañana", showOnHomepage: true, position: 0, published: true },
      { id: "ph2", src: "", alt: "Pizarra de un taller", showOnHomepage: true, position: 1, published: true },
      { id: "ph3", src: "", alt: "Detalle de un cuaderno", showOnHomepage: false, position: 2, published: true },
    ],
    testimonials: [
      { id: "t1", quote: "Ordenaron el producto sin perder la voz de la marca.", name: "Lucía Navarro", role: "Directora, Lumen", avatarUrl: null, position: 0, published: true },
      { id: "t2", quote: "La primera versión salió en seis semanas y se podía enseñar.", name: "Andrés Molina", role: "Fundador, Orión", avatarUrl: null, position: 1, published: true },
      { id: "t3", quote: "Por fin el equipo entiende qué va en la página de inicio.", name: "Elena Ruiz", role: "Marketing, Feria", avatarUrl: null, position: 2, published: true },
    ],
    faqs: [
      { id: "f1", question: "¿Cuánto dura un proyecto?", answer: "Un sitio suele llevar de seis a diez semanas. Una app, un trimestre.", position: 0, published: true },
      { id: "f2", question: "¿Trabajáis con equipos internos?", answer: "Sí. Nos sentamos con diseño, producto y la persona que publica.", position: 1, published: true },
      { id: "f3", question: "¿Qué incluye la llamada?", answer: "Treinta minutos para ver si el encargo encaja. Sin presentación.", position: 2, published: true },
      { id: "f4", question: "¿Hay contrato mensual?", answer: "El plan Retainer es un mes a mes, cancelable al cierre del ciclo.", position: 3, published: true },
    ],
    plans: [
      { id: "pl1", name: "Llamada", blurb: "Para ver si tiene sentido seguir.", monthlyPrice: null, badge: "", ctaLabel: "Elegir hora", ctaHref: "", features: ["30 minutos", "Sin compromiso"], position: 0, published: true },
      { id: "pl2", name: "Estudio", blurb: "Un encargo cerrado, con alcance escrito.", monthlyPrice: 4800, badge: "Habitual", ctaLabel: "Pedir propuesta", ctaHref: "", features: ["Investigación corta", "Diseño y prototipo", "Entrega en Figma"], position: 1, published: true },
      { id: "pl3", name: "Retainer", blurb: "Un día a la semana con el equipo.", monthlyPrice: 3200, badge: "", ctaLabel: "Hablar del mes", ctaHref: "", features: ["Un día por semana", "Canal compartido", "Informe al cierre"], position: 2, published: true },
    ],
    experience: [
      { id: "e1", role: "Diseño de producto", company: "Estudio Acme", period: "2022 — ahora", position: 0, published: true },
      { id: "e2", role: "Diseño", company: "Taller Norte", period: "2019 — 2022", position: 1, published: true },
    ],
    awards: [
      { id: "a1", name: "Selección UI", count: "Mención", href: "", position: 0, published: true },
      { id: "a2", name: "Revista de oficio", count: "Artículo", href: "", position: 1, published: true },
    ],
    stats: [
      { id: "s1", value: "12", label: "proyectos publicados", position: 0, published: true },
      { id: "s2", value: "6 sem", label: "entrega habitual", position: 1, published: true },
      { id: "s3", value: "4", label: "personas en el estudio", position: 2, published: true },
    ],
    media: [
      { id: "m1", filename: "portada-lumen.png", mime: "image/png", size: 240_000, url: "", createdAt: new Date(now - 8 * DAY).toISOString() },
      { id: "m2", filename: "reel-norte.mp4", mime: "video/mp4", size: 4_200_000, url: "", createdAt: new Date(now - 3 * DAY).toISOString() },
      { id: "m3", filename: "logo-feria.svg", mime: "image/svg+xml", size: 12_000, url: "", createdAt: new Date(now - DAY).toISOString() },
    ],
    bookings,
    views: buildViews(now),
    clicks: buildClicks(now),
  }
}

function project(
  id: string,
  title: string,
  slug: string,
  categoryId: string,
  summary: string,
  client: string,
  year: string,
  position: number,
  showOnHomepage: boolean,
) {
  return {
    id,
    title,
    slug,
    categoryId,
    summary,
    client,
    year,
    liveUrl: "",
    coverUrl: null,
    showOnHomepage,
    published: true,
    position,
  }
}

function booking(
  id: string,
  name: string,
  email: string,
  phone: string,
  needs: string,
  plan: string,
  note: string,
  source: string,
  cameFrom: string,
  status: Booking["status"],
  startTime: number | null,
  createdAt: number,
): Booking {
  return {
    id,
    name,
    email,
    phone,
    needs,
    plan,
    note,
    source,
    cameFrom,
    status,
    startTime,
    endTime: startTime == null ? null : startTime + 30 * 60_000,
    timezone: "Europe/Madrid",
    meetUrl: startTime ? "https://meet.example/acme" : "",
    createdAt,
  }
}

function buildViews(now: number): AnalyticsView[] {
  const paths = ["/", "/trabajo", "/planes", "/acerca"]
  const refs = [null, "https://google.example", "https://news.example", "https://social.example"]
  const views: AnalyticsView[] = []
  for (let day = 0; day < 30; day += 1) {
    const count = 6 + (day % 5)
    for (let i = 0; i < count; i += 1) {
      const path = paths[(day + i) % paths.length] ?? "/"
      views.push({
        ts: now - day * DAY - i * 3_600_000,
        visitor: `v-${(day + i) % 14}`,
        session: `s-${day}-${i % 3}`,
        path,
        referrer: refs[(day + i) % refs.length] ?? null,
        device: i % 3 === 0 ? "mobile" : "desktop",
        durationMs: 12_000 + ((day * 17 + i * 13) % 90_000),
        scrollPct: [15, 30, 55, 80, 100][(day + i) % 5] ?? 0,
      })
    }
  }
  return views
}

function buildClicks(now: number): AnalyticsClick[] {
  const clicks: AnalyticsClick[] = []
  for (let day = 0; day < 30; day += 2) {
    clicks.push({
      ts: now - day * DAY - 5_000_000,
      session: `s-${day}-0`,
      path: "/planes",
      label: "Reservar una llamada",
      target: "meeting",
    })
  }
  return clicks
}
