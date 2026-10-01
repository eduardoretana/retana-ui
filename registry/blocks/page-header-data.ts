import type { LucideIcon } from "lucide-react"
import { FileSpreadsheet, FileText, Film, PenTool, Presentation } from "lucide-react"

export type PagePerson = { id: string; name: string; role: string }

export type PageIssue = {
  id: string
  title: string
  owner: string
  label: string
  fresh?: boolean
}

export type PageUpdate = {
  id: string
  author: string
  date: string
  tone: "success" | "warning"
  status: string
  body: string
  fresh?: boolean
}

export type PageFile = {
  name: string
  kind: string
  size: string
  owner: string
  date: string
  icon: LucideIcon
}

export const pagePeople: PagePerson[] = [
  { id: "ines", name: "Inés Calderón", role: "Kiln lead" },
  { id: "mateo", name: "Mateo Ruiz", role: "Glaze" },
  { id: "lucia", name: "Lucía Peña", role: "Packing" },
  { id: "omar", name: "Omar Vidal", role: "Gallery" },
  { id: "sara", name: "Sara Neri", role: "Accounts" },
]

export const startingIssues: PageIssue[] = [
  { id: "CA-138", title: "Saved glaze list clips the batch date on small screens", owner: "lucia", label: "Bug" },
  { id: "CA-136", title: "Add an edit link beside each section of the review step", owner: "ines", label: "Design" },
  { id: "CA-135", title: "Wallet sheet opens twice after a failed card check", owner: "mateo", label: "Bug" },
  { id: "CA-133", title: "Show the firing estimate before payment", owner: "omar", label: "Research" },
  { id: "CA-131", title: "Promo code field loses focus after an invalid code", owner: "lucia", label: "Bug" },
  { id: "CA-129", title: "Track drop-off between review and pay", owner: "sara", label: "Analytics" },
]

export const draftIssues = [
  "Keyboard focus skips the save glaze checkbox",
  "Recalculate shipping when the country changes",
  "Pay button needs a pressed and loading state",
  "Review totals wrap awkwardly at large text sizes",
]

export const startingUpdates: PageUpdate[] = [
  { id: "u4", author: "ines", date: "Sep 19", tone: "success", status: "On track", body: "Saved payment methods reached every returning collector on Thursday. The review step is next." },
  { id: "u3", author: "omar", date: "Sep 12", tone: "success", status: "On track", body: "Five studio visits are done. People trust a single review step as long as the total stays visible while they edit." },
  { id: "u2", author: "mateo", date: "Sep 5", tone: "warning", status: "At risk", body: "Glaze notes are waiting on the kiln log. We moved the review step ahead so the October date can hold." },
  { id: "u1", author: "ines", date: "Aug 29", tone: "success", status: "On track", body: "Kickoff. Scope is saved glazes, one review step, and a staged gallery opening on October 14." },
]

export const draftUpdates = [
  "The review step is in staging behind a flag. If error rates hold through Friday, we open it to a tenth of traffic on Monday.",
  "Declined card copy is final and with the gallery desk. No change to the October 14 opening.",
]

export const pageFiles: PageFile[] = [
  { name: "Kiln flows v3", kind: "Design file", size: "18.4 MB", owner: "ines", date: "Sep 20", icon: PenTool },
  { name: "Review step walkthrough", kind: "Video", size: "46 MB", owner: "ines", date: "Sep 18", icon: Film },
  { name: "Glaze notes", kind: "Document", size: "96 KB", owner: "mateo", date: "Sep 16", icon: FileText },
  { name: "Studio visits, round two", kind: "PDF", size: "2.1 MB", owner: "omar", date: "Sep 13", icon: FileText },
  { name: "Opening plan", kind: "Slides", size: "4.8 MB", owner: "sara", date: "Sep 11", icon: Presentation },
  { name: "Conversion baseline", kind: "Spreadsheet", size: "640 KB", owner: "sara", date: "Sep 9", icon: FileSpreadsheet },
]

export const milestones: { name: string; note: string; state: "done" | "active" | "planned" }[] = [
  { name: "Saved glazes", note: "Shipped Sep 18", state: "done" },
  { name: "Single review step", note: "In progress, due Oct 1", state: "active" },
  { name: "Gallery opening", note: "Planned for Oct 14", state: "planned" },
]

export const activity: { who: string; text: string; time: string }[] = [
  { who: "omar", text: "moved CA-131 to review", time: "1h ago" },
  { who: "mateo", text: "merged the glaze notes endpoint", time: "3h ago" },
  { who: "ines", text: "shared Kiln flows v3", time: "Yesterday" },
  { who: "lucia", text: "closed CA-119, a double charge on retry", time: "Yesterday" },
  { who: "sara", text: "set the opening date to October 14", time: "Sep 17" },
]

export const DONE_AT_START = 31
export const PROJECT_URL = "https://costa-atelier.example/projects/kiln-2"
