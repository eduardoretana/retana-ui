export type ChangelogKind = "new" | "improved" | "fixed"

export type ChangelogMedia =
  | { type: "photo"; alt: string; caption: string }
  | { type: "code"; file: string; code: string }

export type ChangelogEntry = {
  id: string
  month: string
  date: string
  iso: string
  version: string
  kind: ChangelogKind
  title: string
  summary: string
  details: string[]
  media?: ChangelogMedia
}

export type ChangelogMonth = { key: string; label: string; short: string }

export const exampleMonths: ChangelogMonth[] = [
  { key: "2026-09", label: "September 2026", short: "Sep" },
  { key: "2026-08", label: "August 2026", short: "Aug" },
  { key: "2026-07", label: "July 2026", short: "Jul" },
  { key: "2026-06", label: "June 2026", short: "Jun" },
]

const webhookSnippet = `import { verifyWebhook } from "@costa/node"

const event = verifyWebhook(body, headers, secret)

if (event.type === "order.paid") {
  await fulfil(event.data.order)
}`

const dnsSnippet = `Type    Name       Value
CNAME   shop       edge.costa-atelier.example
TXT     _costa     verify=ca_4f81c2`

export const exampleEntries: ChangelogEntry[] = [
  {
    id: "shelves",
    month: "2026-09",
    date: "Sep 18",
    iso: "2026-09-18",
    version: "4.12.0",
    kind: "new",
    title: "Shelf gallery for the shop",
    summary: "Mix portrait bowls and wide platters without cropping a single frame.",
    details: ["Choose two to five columns for each breakpoint.", "Drag a piece and the columns rebalance while you move it.", "Captions fall back to the image alt text."],
    media: { type: "photo", alt: "Terracotta bowls on a timber shelf in Oaxaca light", caption: "Gallery wall at Costa Atelier, Oaxaca" },
  },
  {
    id: "resumable",
    month: "2026-09",
    date: "Sep 18",
    iso: "2026-09-18",
    version: "4.12.0",
    kind: "improved",
    title: "Uploads resume after a dropped connection",
    summary: "Large glaze photos continue from the last finished chunk instead of starting over.",
    details: ["Files upload in 8 MB chunks, each retried up to five times.", "The upload queue survives a page reload."],
  },
  {
    id: "currency",
    month: "2026-09",
    date: "Sep 9",
    iso: "2026-09-09",
    version: "4.11.2",
    kind: "fixed",
    title: "Discount codes stay applied after a currency switch",
    summary: "Switching from MXN to USD at checkout no longer clears an applied code.",
    details: ["Affected a handful of wholesale checkouts since 4.11.0.", "Totals are recalculated on the server after every switch."],
  },
  {
    id: "webhooks",
    month: "2026-09",
    date: "Sep 2",
    iso: "2026-09-02",
    version: "4.11.0",
    kind: "new",
    title: "Order webhooks",
    summary: "Receive a signed request when an order is paid, refunded, or shipped.",
    details: ["Every request carries a timestamped signature.", "Failed deliveries retry with backoff for 72 hours."],
    media: { type: "code", file: "webhooks.ts", code: webhookSnippet },
  },
  {
    id: "covers",
    month: "2026-08",
    date: "Aug 26",
    iso: "2026-08-26",
    version: "4.10.0",
    kind: "new",
    title: "Journal posts with full-bleed covers",
    summary: "Open a firing story with one photograph that runs edge to edge.",
    details: ["Set a focal point so the crop holds on narrow phones.", "Covers load a muted preview first, then the full image."],
    media: { type: "photo", alt: "A stoneware vase on a workbench at dusk", caption: "Journal cover from Kiln 2, Costa Atelier" },
  },
  {
    id: "inventory",
    month: "2026-08",
    date: "Aug 14",
    iso: "2026-08-14",
    version: "4.9.3",
    kind: "fixed",
    title: "Stock no longer goes negative during a sale",
    summary: "Concurrent checkouts now reserve a piece in a single step.",
    details: ["Two buyers can no longer purchase the last bowl at the same moment.", "Oversold orders from August 9 to 13 were refunded."],
  },
  {
    id: "variants",
    month: "2026-07",
    date: "Jul 22",
    iso: "2026-07-22",
    version: "4.8.0",
    kind: "new",
    title: "Variants with their own photos",
    summary: "Each glaze can show its own gallery on the product page.",
    details: ["The page switches photos when a buyer picks a glaze.", "Variants without photos fall back to the piece gallery."],
  },
  {
    id: "domains",
    month: "2026-07",
    date: "Jul 3",
    iso: "2026-07-03",
    version: "4.7.0",
    kind: "improved",
    title: "Custom domains verify in under a minute",
    summary: "Add two DNS records and the studio checks them every few seconds.",
    details: ["Certificates are issued as soon as the records resolve.", "Verification used to take up to an hour."],
    media: { type: "code", file: "DNS records", code: dnsSnippet },
  },
  {
    id: "search",
    month: "2026-06",
    date: "Jun 3",
    iso: "2026-06-03",
    version: "4.5.0",
    kind: "improved",
    title: "Media search understands glaze and colour",
    summary: "Type what is in the picture and the library finds it.",
    details: ["Search works across the archive in under 200 ms.", "Results group near-duplicates so each shot appears once."],
    media: { type: "photo", alt: "A celadon bowl on a linen cloth", caption: "Result for “celadon bowl” in the media library" },
  },
]
