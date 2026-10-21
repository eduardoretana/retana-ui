"use client"

import * as React from "react"
import { CircleAlertIcon, MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { resolveCssColor } from "@/registry/retana/lib/clinical-tone"
import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Scene,
  SphereGeometry,
  Spherical,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Intersection,
  type Object3D,
  SRGBColorSpace,
} from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type MoleculeAtom = {
  serial: number
  /** Atom name, such as CA or O5'. */
  name: string
  /** Element symbol with conventional case, such as C, Fe or Se. */
  element: string
  x: number
  y: number
  z: number
  /** Index into `MolecularStructure.residues`. */
  residue: number
}

export type ResidueKind = "protein" | "nucleic" | "ligand" | "water"
export type SecondaryStructure = "helix" | "sheet" | "coil"

export type MoleculeResidue = {
  /** Chain, author sequence number and insertion code, such as `A:16` or `B:52A`. */
  id: string
  /** Residue or ligand code, such as CYS, DG or HEM. */
  name: string
  chain: string
  seq: number
  insertion: string
  kind: ResidueKind
  secondary: SecondaryStructure
  /** Indices into `MolecularStructure.atoms`. */
  atoms: number[]
}

export type MolecularStructure = {
  /** PDB ID when the file declares one. */
  id?: string
  title?: string
  atoms: MoleculeAtom[]
  residues: MoleculeResidue[]
  chains: string[]
  /** Covalent bonds as pairs of atom indices, inferred from distances. */
  bonds: Uint32Array
}

export type MoleculeRepresentation = "cartoon" | "ball-and-stick" | "spacefill"
export type MoleculeColorScheme =
  "secondary" | "chain" | "element" | "residue" | "rainbow"

export type MoleculeViewerHandle = {
  zoom: (factor: number) => void
  rotate: (azimuth: number, polar?: number) => void
  reset: () => void
}

export type MoleculeViewerProps = {
  /** URL of a PDB or mmCIF file. Ignored when `data` is given. */
  src?: string
  /** PDB or mmCIF text. */
  data?: string
  /** Detected from the text when omitted. */
  format?: "pdb" | "mmcif"
  representation?: MoleculeRepresentation
  defaultRepresentation?: MoleculeRepresentation
  onRepresentationChange?: (representation: MoleculeRepresentation) => void
  colorScheme?: MoleculeColorScheme
  defaultColorScheme?: MoleculeColorScheme
  onColorSchemeChange?: (scheme: MoleculeColorScheme) => void
  /** Residue ID, such as `A:16`. */
  selectedId?: string | null
  onSelectionChange?: (
    id: string | null,
    residue: MoleculeResidue | null
  ) => void
  /** Called once a structure is parsed. */
  onLoad?: (structure: MolecularStructure) => void
  /** Shows water molecules. Defaults to false. */
  water?: boolean
  /** Shows the selectable sequence below the stage. Defaults to true. */
  sequence?: boolean
  /** Shows the style and colour menus, zoom and reset buttons. Defaults to true. */
  controls?: boolean
  /** Links the entry on RCSB PDB when the file names its ID. Defaults to true. */
  attribution?: boolean
  label?: string
  className?: string
  ref?: React.Ref<MoleculeViewerHandle>
}

export const moleculeRepresentations: Record<MoleculeRepresentation, string> = {
  cartoon: "Cartoon",
  "ball-and-stick": "Ball and stick",
  spacefill: "Spacefill",
}

export const moleculeColorSchemes: Record<MoleculeColorScheme, string> = {
  secondary: "Secondary structure",
  chain: "Chain",
  element: "Element",
  residue: "Residue type",
  rainbow: "Rainbow",
}

// ---------------------------------------------------------------------------
// Parsing

type RawAtom = Omit<MoleculeAtom, "residue"> & {
  residueName: string
  chain: string
  seq: number
  insertion: string
  hetero: boolean
  /** Alternate location; conformers after the first are dropped. */
  altLoc: string
}

type Range = {
  kind: "helix" | "sheet"
  chain: string
  start: string
  end: string
}

const WATER = new Set(["HOH", "WAT", "DOD", "H2O", "SOL", "TIP", "TIP3"])
const AMINO_ACIDS: Record<string, string> = {
  ALA: "A",
  ARG: "R",
  ASN: "N",
  ASP: "D",
  CYS: "C",
  GLN: "Q",
  GLU: "E",
  GLY: "G",
  HIS: "H",
  ILE: "I",
  LEU: "L",
  LYS: "K",
  MET: "M",
  PHE: "F",
  PRO: "P",
  SER: "S",
  THR: "T",
  TRP: "W",
  TYR: "Y",
  VAL: "V",
  SEC: "U",
  PYL: "O",
  MSE: "M",
}
const NUCLEOTIDES: Record<string, string> = {
  A: "A",
  C: "C",
  G: "G",
  U: "U",
  T: "T",
  I: "I",
  DA: "A",
  DC: "C",
  DG: "G",
  DT: "T",
  DU: "U",
  DI: "I",
}

function elementCase(symbol: string) {
  const letters = symbol.replace(/[^a-z]/gi, "")
  return letters
    ? letters[0]!.toUpperCase() + letters.slice(1, 2).toLowerCase()
    : ""
}

// Columns 77-78 are often blank in older files; the atom name's leading
// letters then give the element, two letters only for names starting in
// column 13.
function pdbElement(line: string, name: string) {
  const declared = elementCase(line.slice(76, 78).trim())
  if (declared) return declared
  const field = line.slice(12, 16)
  return elementCase(
    field[0] !== " " && /[A-Z]/i.test(field[1] ?? "")
      ? field.slice(0, 2)
      : (name.replace(/^[0-9]+/, "")[0] ?? "C")
  )
}

function parsePdb(text: string) {
  const atoms: RawAtom[] = []
  const ranges: Range[] = []
  let id: string | undefined
  let title = ""
  for (const line of text.split(/\r?\n/)) {
    const record = line.slice(0, 6).trim()
    if (record === "ENDMDL") break
    if (record === "HEADER") id = line.slice(62, 66).trim() || undefined
    else if (record === "TITLE")
      title = `${title} ${line.slice(10).trim()}`.trim()
    else if (record === "HELIX")
      ranges.push({
        kind: "helix",
        chain: line[19]?.trim() ?? "",
        start: line.slice(21, 26).trim(),
        end: line.slice(33, 38).trim(),
      })
    else if (record === "SHEET")
      ranges.push({
        kind: "sheet",
        chain: line[21]?.trim() ?? "",
        start: line.slice(22, 27).trim(),
        end: line.slice(33, 38).trim(),
      })
    else if (record === "ATOM" || record === "HETATM") {
      const name = line.slice(12, 16).trim()
      atoms.push({
        serial: Number(line.slice(6, 11)),
        name,
        element: pdbElement(line, name),
        x: Number(line.slice(30, 38)),
        y: Number(line.slice(38, 46)),
        z: Number(line.slice(46, 54)),
        residueName: line.slice(17, 20).trim(),
        chain: line[21]?.trim() ?? "",
        seq: Number(line.slice(22, 26)),
        insertion: line[26]?.trim() ?? "",
        hetero: record === "HETATM",
        altLoc: line[16]?.trim() ?? "",
      })
    }
  }
  return { id, title: title || undefined, atoms, ranges }
}

type CifTable = { names: string[]; values: string[] }

// A reader for the CIF 1.1 syntax PDBx/mmCIF files use: data blocks, loops,
// quoted values and semicolon text fields. Values keep their raw text; `?`
// and `.` mean unknown and not applicable.
function readCif(text: string) {
  const tokens: string[] = []
  const quoted: boolean[] = []
  const lines = text.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.startsWith(";")) {
      const field = [line.slice(1)]
      while (++i < lines.length && !lines[i]!.startsWith(";"))
        field.push(lines[i]!)
      tokens.push(field.join("\n").trim())
      quoted.push(true)
      continue
    }
    let at = 0
    while (at < line.length) {
      const char = line[at]!
      if (char === " " || char === "\t") at++
      else if (char === "#") break
      else if (char === "'" || char === '"') {
        let end = at + 1
        // A quote only closes when whitespace or the line end follows it.
        while (
          end < line.length &&
          !(line[end] === char && /\s|^$/.test(line[end + 1] ?? ""))
        )
          end++
        tokens.push(line.slice(at + 1, end))
        quoted.push(true)
        at = end + 1
      } else {
        let end = at
        while (end < line.length && !/\s/.test(line[end]!)) end++
        tokens.push(line.slice(at, end))
        quoted.push(false)
        at = end
      }
    }
  }
  const tables = new Map<string, CifTable>()
  let id: string | undefined
  const table = (category: string) => {
    let found = tables.get(category)
    if (!found) tables.set(category, (found = { names: [], values: [] }))
    return found
  }
  const reserved = (i: number) =>
    !quoted[i] && /^(_|loop_$|data_|save_|global_$|stop_$)/i.test(tokens[i]!)
  for (let i = 0; i < tokens.length;) {
    const token = tokens[i]!
    if (!quoted[i] && token.toLowerCase().startsWith("data_")) {
      // Only the first data block is read.
      if (id !== undefined || tables.size) break
      id = token.slice(5)
      i++
    } else if (!quoted[i] && token.toLowerCase() === "loop_") {
      i++
      const names: string[] = []
      while (i < tokens.length && !quoted[i] && tokens[i]!.startsWith("_"))
        names.push(tokens[i++]!)
      const category = names[0]?.split(".")[0] ?? ""
      const loop = table(category)
      loop.names = names.map((name) => name.split(".")[1] ?? name)
      while (i < tokens.length && !reserved(i)) loop.values.push(tokens[i++]!)
    } else if (!quoted[i] && token.startsWith("_")) {
      const [category = "", field = ""] = token.split(".")
      const item = table(category)
      item.names.push(field)
      item.values.push(tokens[i + 1] ?? "?")
      i += 2
    } else i++
  }
  return { id, tables }
}

function cifColumns(table: CifTable | undefined) {
  if (!table || !table.names.length) return { rows: 0, get: () => "" }
  const width = table.names.length
  const index = new Map(table.names.map((name, i) => [name, i]))
  return {
    rows: Math.floor(table.values.length / width),
    // The first known name wins, so author fields fall back to label fields.
    get(row: number, ...names: string[]) {
      for (const name of names) {
        const column = index.get(name)
        if (column === undefined) continue
        const value = table.values[row * width + column] ?? ""
        if (value !== "?" && value !== ".") return value
      }
      return ""
    },
  }
}

function parseMmcif(text: string) {
  const { id, tables } = readCif(text)
  const site = cifColumns(tables.get("_atom_site"))
  const atoms: RawAtom[] = []
  let model: string | undefined
  for (let row = 0; row < site.rows; row++) {
    const number = site.get(row, "pdbx_PDB_model_num")
    model ??= number
    if (number !== model) continue
    const name = site.get(row, "auth_atom_id", "label_atom_id")
    atoms.push({
      serial: Number(site.get(row, "id")),
      name,
      element: elementCase(site.get(row, "type_symbol") || name[0] || "C"),
      x: Number(site.get(row, "Cartn_x")),
      y: Number(site.get(row, "Cartn_y")),
      z: Number(site.get(row, "Cartn_z")),
      residueName: site.get(row, "auth_comp_id", "label_comp_id"),
      chain: site.get(row, "auth_asym_id", "label_asym_id"),
      seq: Number(site.get(row, "auth_seq_id", "label_seq_id")),
      insertion: site.get(row, "pdbx_PDB_ins_code"),
      hetero: site.get(row, "group_PDB") === "HETATM",
      altLoc: site.get(row, "label_alt_id"),
    })
  }
  const ranges: Range[] = []
  const conf = cifColumns(tables.get("_struct_conf"))
  for (let row = 0; row < conf.rows; row++)
    if (conf.get(row, "conf_type_id").toUpperCase().startsWith("HELX"))
      ranges.push({
        kind: "helix",
        chain: conf.get(row, "beg_auth_asym_id", "beg_label_asym_id"),
        start:
          conf.get(row, "beg_auth_seq_id", "beg_label_seq_id") +
          conf.get(row, "pdbx_beg_PDB_ins_code"),
        end:
          conf.get(row, "end_auth_seq_id", "end_label_seq_id") +
          conf.get(row, "pdbx_end_PDB_ins_code"),
      })
  const sheet = cifColumns(tables.get("_struct_sheet_range"))
  for (let row = 0; row < sheet.rows; row++)
    ranges.push({
      kind: "sheet",
      chain: sheet.get(row, "beg_auth_asym_id", "beg_label_asym_id"),
      start:
        sheet.get(row, "beg_auth_seq_id", "beg_label_seq_id") +
        sheet.get(row, "pdbx_beg_PDB_ins_code"),
      end:
        sheet.get(row, "end_auth_seq_id", "end_label_seq_id") +
        sheet.get(row, "pdbx_end_PDB_ins_code"),
    })
  const title = cifColumns(tables.get("_struct")).get(0, "title") || undefined
  const entry = cifColumns(tables.get("_entry")).get(0, "id") || id
  return { id: entry || undefined, title, atoms, ranges }
}

// Covalent radii in ångströms (Cordero et al. 2008), for bond inference.
const COVALENT: Record<string, number> = {
  H: 0.31,
  C: 0.76,
  N: 0.71,
  O: 0.66,
  F: 0.57,
  P: 1.07,
  S: 1.05,
  Cl: 1.02,
  Se: 1.2,
  Br: 1.2,
  I: 1.39,
  B: 0.84,
  Si: 1.11,
}
// Metal ions coordinate rather than bond, so they are drawn on their own.
const METALS = new Set(
  "Li Na K Rb Cs Be Mg Ca Sr Ba Mn Fe Co Ni Cu Zn Cd Hg Al Ga Pt Au Ag Mo W V Cr Ti Pb".split(
    " "
  )
)

function inferBonds(atoms: MoleculeAtom[], residues: MoleculeResidue[]) {
  const cell = 2.6
  const grid = new Map<string, number[]>()
  const key = (x: number, y: number, z: number) =>
    `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`
  atoms.forEach((atom, index) => {
    if (METALS.has(atom.element)) return
    const k = key(atom.x, atom.y, atom.z)
    const bucket = grid.get(k)
    if (bucket) bucket.push(index)
    else grid.set(k, [index])
  })
  const bonds: number[] = []
  atoms.forEach((a, i) => {
    if (METALS.has(a.element)) return
    const ra = COVALENT[a.element] ?? 0.8
    const water = residues[a.residue]!.kind === "water"
    const cx = Math.floor(a.x / cell)
    const cy = Math.floor(a.y / cell)
    const cz = Math.floor(a.z / cell)
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++) {
          const bucket = grid.get(`${cx + dx},${cy + dy},${cz + dz}`)
          if (!bucket) continue
          for (const j of bucket) {
            if (j <= i) continue
            const b = atoms[j]!
            if (a.element === "H" && b.element === "H") continue
            if (
              (water || residues[b.residue]!.kind === "water") &&
              a.residue !== b.residue
            )
              continue
            const limit = ra + (COVALENT[b.element] ?? 0.8) + 0.4
            const d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2
            if (d2 > 0.16 && d2 < limit * limit) bonds.push(i, j)
          }
        }
  })
  return Uint32Array.from(bonds)
}

function residueKind(name: string, atoms: RawAtom[]): ResidueKind {
  if (WATER.has(name)) return "water"
  const names = new Set(atoms.map((atom) => atom.name))
  if (
    names.has("CA") &&
    (name in AMINO_ACIDS || (names.has("N") && names.has("C")))
  )
    return "protein"
  if (name in NUCLEOTIDES && (names.has("P") || names.has("C4'")))
    return "nucleic"
  return "ligand"
}

/** Parses PDB or PDBx/mmCIF text; only the first model and alternate location are kept. */
export function parseStructure(
  text: string,
  format?: "pdb" | "mmcif"
): MolecularStructure {
  const cif =
    format === "mmcif" ||
    (!format && /^\s*(#.*\n\s*)*data_/i.test(text.slice(0, 2048)))
  const parsed = cif ? parseMmcif(text) : parsePdb(text)
  const raw = parsed.atoms.filter((atom) =>
    Number.isFinite(atom.x + atom.y + atom.z)
  )
  // Keep one conformer per atom: the first alternate location in the file.
  const seen = new Map<string, string>()
  const kept = raw.filter((atom) => {
    if (!atom.altLoc) return true
    const key = `${atom.chain}|${atom.seq}|${atom.insertion}|${atom.residueName}|${atom.name}`
    const first = seen.get(key)
    if (first === undefined) seen.set(key, atom.altLoc)
    return (first ?? atom.altLoc) === atom.altLoc
  })
  if (!kept.length) throw new Error("The file contains no atom coordinates.")

  const residues: MoleculeResidue[] = []
  const groups: RawAtom[][] = []
  const byId = new Map<string, number>()
  const atoms: MoleculeAtom[] = []
  for (const atom of kept) {
    const id = `${atom.chain}:${atom.seq}${atom.insertion}`
    let index = byId.get(id)
    if (index === undefined || residues[index]!.name !== atom.residueName) {
      index = residues.length
      byId.set(id, index)
      residues.push({
        id: residues.some((residue) => residue.id === id)
          ? `${id}:${atom.residueName}`
          : id,
        name: atom.residueName,
        chain: atom.chain,
        seq: atom.seq,
        insertion: atom.insertion,
        kind: "ligand",
        secondary: "coil",
        atoms: [],
      })
      groups.push([])
    }
    residues[index]!.atoms.push(atoms.length)
    groups[index]!.push(atom)
    atoms.push({
      serial: atom.serial,
      name: atom.name,
      element: atom.element || "C",
      x: atom.x,
      y: atom.y,
      z: atom.z,
      residue: index,
    })
  }
  residues.forEach((residue, index) => {
    residue.kind = residueKind(residue.name, groups[index]!)
  })
  for (const range of parsed.ranges) {
    const chain = residues.filter(
      ({ chain, kind }) => chain === range.chain && kind === "protein"
    )
    const label = ({ seq, insertion }: MoleculeResidue) => `${seq}${insertion}`
    const start = chain.findIndex((residue) => label(residue) === range.start)
    const end = chain.findIndex((residue) => label(residue) === range.end)
    if (start < 0 || end < start) continue
    for (const residue of chain.slice(start, end + 1))
      residue.secondary = range.kind
  }
  return {
    id: parsed.id,
    title: parsed.title,
    atoms,
    residues,
    chains: [...new Set(residues.map(({ chain }) => chain))],
    bonds: inferBonds(atoms, residues),
  }
}

// ---------------------------------------------------------------------------
// Appearance

const STAGE_TONE = "var(--muted)"
/** Resolve a theme token expression to a three.js colour. */
function cssColor(value: string) {
  const rgb = resolveCssColor(value)
  const color = new Color()
  if (rgb) color.setRGB(rgb[0], rgb[1], rgb[2], SRGBColorSpace)
  else color.setScalar(0.6)
  return color
}

const CHAIN_COLORS = [
  "var(--chart-4)",
  "color-mix(in oklch, var(--chart-1), var(--background) 11%)",
  "var(--chart-3)",
  "color-mix(in oklch, var(--chart-2), var(--background) 6%)",
  "color-mix(in oklch, var(--chart-5), var(--background) 8%)",
  "color-mix(in oklch, var(--chart-4), var(--background) 9%)",
  "color-mix(in oklch, var(--chart-2), var(--background) 11%)",
  "color-mix(in oklch, var(--chart-1), var(--background) 31%)",
  "var(--chart-1)",
  "color-mix(in oklch, var(--muted-foreground), var(--background) 20%)",
]
const SECONDARY_COLORS: Record<SecondaryStructure, string> = {
  helix: "var(--chart-1)",
  sheet: "color-mix(in oklch, var(--chart-2), var(--background) 5%)",
  coil: "color-mix(in oklch, var(--muted-foreground), var(--background) 16%)",
}
// Jmol's CPK palette, with carbon darkened to stand out on a light stage.
const ELEMENT_COLORS: Record<string, string> = {
  H: "color-mix(in oklch, var(--muted-foreground), var(--background) 40%)",
  C: "color-mix(in oklch, var(--muted-foreground), var(--background) 5%)",
  N: "color-mix(in oklch, var(--chart-4), var(--background) 8%)",
  O: "var(--chart-1)",
  S: "var(--chart-2)",
  P: "var(--chart-2)",
  Se: "var(--chart-2)",
  Fe: "var(--chart-1)",
  Zn: "color-mix(in oklch, var(--chart-4), var(--background) 9%)",
  Mg: "var(--chart-3)",
  Ca: "var(--chart-3)",
  Na: "color-mix(in oklch, var(--chart-5), var(--background) 15%)",
  K: "var(--chart-5)",
  Cl: "var(--chart-3)",
  Cu: "var(--chart-2)",
  Mn: "color-mix(in oklch, var(--chart-5), var(--background) 13%)",
  F: "color-mix(in oklch, var(--chart-3), var(--background) 10%)",
  Br: "color-mix(in oklch, var(--chart-1), var(--foreground) 9%)",
  I: "color-mix(in oklch, var(--chart-5), var(--foreground) 21%)",
}
const RESIDUE_GROUPS: [string, string, string[]][] = [
  [
    "Hydrophobic",
    "color-mix(in oklch, var(--chart-2), var(--background) 5%)",
    ["ALA", "VAL", "LEU", "ILE", "MET", "MSE", "PHE", "TRP"],
  ],
  ["Polar", "var(--chart-3)", ["SER", "THR", "ASN", "GLN", "TYR", "CYS", "SEC"]],
  ["Acidic", "color-mix(in oklch, var(--chart-1), var(--background) 5%)", ["ASP", "GLU"]],
  ["Basic", "var(--chart-4)", ["LYS", "ARG", "HIS", "PYL"]],
  ["Glycine and proline", "color-mix(in oklch, var(--chart-4), var(--background) 16%)", ["GLY", "PRO"]],
]
const BASE_COLORS: Record<string, string> = {
  A: "color-mix(in oklch, var(--chart-1), var(--background) 11%)",
  T: "var(--chart-4)",
  U: "var(--chart-4)",
  G: "var(--chart-3)",
  C: "color-mix(in oklch, var(--chart-2), var(--background) 11%)",
  I: "color-mix(in oklch, var(--muted-foreground), var(--background) 16%)",
}
const OTHER = "color-mix(in oklch, var(--muted-foreground), var(--background) 16%)"

// Van der Waals radii in ångströms (Bondi), for spacefill.
const VDW: Record<string, number> = {
  H: 1.1,
  C: 1.7,
  N: 1.55,
  O: 1.52,
  S: 1.8,
  P: 1.8,
  Se: 1.9,
  F: 1.47,
  Cl: 1.75,
  Br: 1.85,
  I: 1.98,
}

function residueColor(
  structure: MolecularStructure,
  index: number,
  scheme: MoleculeColorScheme,
  rainbow: Map<number, number>
) {
  const residue = structure.residues[index]!
  switch (scheme) {
    case "secondary":
      return residue.kind === "nucleic"
        ? (BASE_COLORS[NUCLEOTIDES[residue.name] ?? ""] ?? OTHER)
        : SECONDARY_COLORS[residue.secondary]
    case "residue":
      if (residue.kind === "nucleic")
        return BASE_COLORS[NUCLEOTIDES[residue.name] ?? ""] ?? OTHER
      return (
        RESIDUE_GROUPS.find(([, , names]) =>
          names.includes(residue.name)
        )?.[1] ?? OTHER
      )
    case "rainbow": {
      const position = rainbow.get(index)
      return position === undefined
        ? OTHER
        : `color-mix(in oklch, var(--chart-1), var(--chart-4) ${Math.round(position * 100)}%)`
    }
    default:
      return CHAIN_COLORS[
        structure.chains.indexOf(residue.chain) % CHAIN_COLORS.length
      ]!
  }
}

function atomColor(
  structure: MolecularStructure,
  index: number,
  scheme: MoleculeColorScheme,
  rainbow: Map<number, number>
) {
  const atom = structure.atoms[index]!
  const residue = structure.residues[atom.residue]!
  // Ligands and heteroatoms read best in element colours whatever the scheme.
  if (
    scheme === "element" ||
    residue.kind === "ligand" ||
    residue.kind === "water" ||
    (atom.element !== "C" && scheme !== "chain" && scheme !== "rainbow")
  )
    return ELEMENT_COLORS[atom.element] ?? "var(--chart-5)"
  return residueColor(structure, atom.residue, scheme, rainbow)
}

/** Display name for a residue, such as `Cys 16 · chain A`. */
export function residueLabel(residue: MoleculeResidue) {
  const name =
    residue.name.length === 3
      ? residue.name[0] + residue.name.slice(1).toLowerCase()
      : residue.name
  const chain = residue.chain ? ` · chain ${residue.chain}` : ""
  return `${name} ${residue.seq}${residue.insertion}${chain}`
}

/** One-letter code for a polymer residue, or the ligand code. */
export function residueCode(residue: MoleculeResidue) {
  if (residue.kind === "protein") return AMINO_ACIDS[residue.name] ?? "X"
  if (residue.kind === "nucleic") return NUCLEOTIDES[residue.name] ?? "N"
  return residue.name
}

// ---------------------------------------------------------------------------
// Geometry

type Built = {
  group: Group
  /** Residue index for a raycast hit on one of `pickable`. */
  pick: (hit: Intersection<Object3D>) => number | undefined
  pickable: Object3D[]
  paint: (atomColors: Color[], residueColors: Color[], selected: number) => void
  dispose: () => void
}

const UP = new Vector3(0, 1, 0)

function material() {
  return new MeshStandardMaterial({ roughness: 0.55, metalness: 0 })
}

// Instanced spheres and half-bond cylinders for a set of atoms.
function atomMeshes(
  structure: MolecularStructure,
  atomIndices: number[],
  style: "ball-and-stick" | "spacefill"
) {
  const { atoms, bonds } = structure
  const detail = atomIndices.length > 20_000 ? [8, 6] : [16, 12]
  const sphereGeometry = new SphereGeometry(1, detail[0], detail[1])
  const spheres = new InstancedMesh(
    sphereGeometry,
    material(),
    Math.max(1, atomIndices.length)
  )
  spheres.count = atomIndices.length
  const matrix = new Matrix4()
  const position = new Vector3()
  const quaternion = new Quaternion()
  const scale = new Vector3()
  atomIndices.forEach((index, instance) => {
    const atom = atoms[index]!
    const radius =
      style === "spacefill"
        ? (VDW[atom.element] ?? 1.7)
        : atom.element === "H"
          ? 0.16
          : 0.28
    matrix.compose(
      position.set(atom.x, atom.y, atom.z),
      quaternion.identity(),
      scale.setScalar(radius)
    )
    spheres.setMatrixAt(instance, matrix)
  })
  const halves: number[] = []
  if (style === "ball-and-stick") {
    const shown = new Set(atomIndices)
    for (let i = 0; i < bonds.length; i += 2)
      if (shown.has(bonds[i]!) && shown.has(bonds[i + 1]!))
        halves.push(bonds[i]!, bonds[i + 1]!, bonds[i + 1]!, bonds[i]!)
  }
  const sticks = new InstancedMesh(
    new CylinderGeometry(1, 1, 1, 8, 1, true),
    material(),
    Math.max(1, halves.length / 2)
  )
  sticks.count = halves.length / 2
  const a = new Vector3()
  const b = new Vector3()
  const direction = new Vector3()
  for (let i = 0; i < halves.length; i += 2) {
    const from = atoms[halves[i]!]!
    const to = atoms[halves[i + 1]!]!
    a.set(from.x, from.y, from.z)
    b.set(to.x, to.y, to.z).add(a).multiplyScalar(0.5)
    direction.subVectors(b, a)
    const length = direction.length()
    matrix.compose(
      position.addVectors(a, b).multiplyScalar(0.5),
      quaternion.setFromUnitVectors(UP, direction.normalize()),
      scale.set(0.12, length, 0.12)
    )
    sticks.setMatrixAt(i / 2, matrix)
  }
  const color = new Color()
  // Instance colours must exist before the first render compiles the shader.
  for (let i = 0; i < spheres.count; i++) spheres.setColorAt(i, color)
  for (let i = 0; i < sticks.count; i++) sticks.setColorAt(i, color)
  spheres.computeBoundingSphere()
  sticks.computeBoundingSphere()
  return {
    spheres,
    sticks,
    atomOf(object: Object3D, instance: number) {
      if (object === spheres) return atomIndices[instance]
      if (object === sticks) return halves[instance * 2]
    },
    paint(colors: Color[]) {
      atomIndices.forEach((index, instance) =>
        spheres.setColorAt(instance, colors[index]!)
      )
      for (let i = 0; i < halves.length; i += 2)
        sticks.setColorAt(i / 2, colors[halves[i]!]!)
      if (spheres.instanceColor) spheres.instanceColor.needsUpdate = true
      if (sticks.instanceColor) sticks.instanceColor.needsUpdate = true
    },
    dispose() {
      for (const mesh of [spheres, sticks]) {
        mesh.geometry.dispose()
        ;(mesh.material as MeshStandardMaterial).dispose()
        mesh.dispose()
      }
    },
  }
}

type Segment = { residues: number[]; points: Vector3[]; guides: Vector3[] }

// Polymer runs whose trace atoms (CA, or P for nucleic acids) are bonded.
function backboneSegments(structure: MolecularStructure) {
  const segments: Segment[] = []
  let current: Segment | null = null
  let previous: MoleculeResidue | null = null
  structure.residues.forEach((residue, index) => {
    const find = (...names: string[]) => {
      for (const name of names) {
        const atom = residue.atoms
          .map((i) => structure.atoms[i]!)
          .find((atom) => atom.name === name)
        if (atom) return new Vector3(atom.x, atom.y, atom.z)
      }
    }
    const protein = residue.kind === "protein"
    const trace = protein
      ? find("CA")
      : residue.kind === "nucleic"
        ? find("P", "C4'")
        : undefined
    if (!trace) {
      current = null
      previous = null
      return
    }
    const last: Vector3 | undefined = current?.points.at(-1)
    const gap = protein ? 4.3 : 8.5
    if (
      !current ||
      !previous ||
      previous.chain !== residue.chain ||
      previous.kind !== residue.kind ||
      !last ||
      last.distanceTo(trace) > gap
    ) {
      current = { residues: [], points: [], guides: [] }
      segments.push(current)
    }
    // The ribbon's wide side follows the peptide's C=O, or the base's
    // direction from the backbone.
    const from = protein ? find("C") : trace
    const to = protein ? find("O") : find("C1'", "N1", "N9")
    const guide =
      from && to ? to.clone().sub(from).normalize() : new Vector3(0, 0, 1)
    const before = current.guides.at(-1)
    if (before && guide.dot(before) < 0) guide.negate()
    current.residues.push(index)
    current.points.push(trace)
    current.guides.push(guide)
    previous = residue
  })
  return segments.filter((segment) => segment.points.length > 1)
}

function cartoonGeometry(structure: MolecularStructure) {
  const segments = backboneSegments(structure)
  const total = segments.reduce((sum, { points }) => sum + points.length, 0)
  const steps = total > 3000 ? 3 : 6
  const sides = 10
  const positions: number[] = []
  const normals: number[] = []
  const owners: number[] = []
  const indices: number[] = []
  const shape = (residue: MoleculeResidue) =>
    residue.kind === "nucleic"
      ? [0.6, 0.6]
      : residue.secondary === "helix"
        ? [1.3, 0.25]
        : residue.secondary === "sheet"
          ? [1.1, 0.25]
          : [0.3, 0.3]
  const tangent = new Vector3()
  const normal = new Vector3()
  const binormal = new Vector3()
  const offset = new Vector3()
  const surface = new Vector3()
  for (const segment of segments) {
    const curve = new CatmullRomCurve3(segment.points, false, "centripetal")
    const count = segment.points.length
    const samples = (count - 1) * steps
    const shapes = segment.residues.map((i) => shape(structure.residues[i]!))
    const base = positions.length / 3
    for (let s = 0; s <= samples; s++) {
      const t = s / samples
      const along = s / steps
      const low = Math.min(count - 1, Math.floor(along))
      const high = Math.min(count - 1, low + 1)
      const mix = along - low
      const point = curve.getPoint(t)
      curve.getTangent(t, tangent)
      normal.copy(segment.guides[low]!).lerp(segment.guides[high]!, mix)
      normal.sub(offset.copy(tangent).multiplyScalar(normal.dot(tangent)))
      if (normal.lengthSq() < 1e-6) normal.set(0, 0, 1).cross(tangent)
      normal.normalize()
      binormal.crossVectors(tangent, normal).normalize()
      // Shapes ease between residues so helices and strands taper.
      const ease = mix * mix * (3 - 2 * mix)
      const width =
        shapes[low]![0]! + (shapes[high]![0]! - shapes[low]![0]!) * ease
      const thickness =
        shapes[low]![1]! + (shapes[high]![1]! - shapes[low]![1]!) * ease
      const owner = segment.residues[Math.round(along)]!
      for (let k = 0; k < sides; k++) {
        const angle = (k / sides) * Math.PI * 2
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        surface
          .copy(normal)
          .multiplyScalar(cos * width)
          .addScaledVector(binormal, sin * thickness)
          .add(point)
        positions.push(surface.x, surface.y, surface.z)
        offset
          .copy(normal)
          .multiplyScalar(cos / width)
          .addScaledVector(binormal, sin / thickness)
          .normalize()
        normals.push(offset.x, offset.y, offset.z)
        owners.push(owner)
      }
    }
    for (let s = 0; s < samples; s++)
      for (let k = 0; k < sides; k++) {
        const a = base + s * sides + k
        const b = base + s * sides + ((k + 1) % sides)
        const c = a + sides
        const d = b + sides
        indices.push(a, c, b, b, c, d)
      }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3)
  )
  geometry.setAttribute(
    "normal",
    new BufferAttribute(new Float32Array(normals), 3)
  )
  geometry.setAttribute(
    "color",
    new BufferAttribute(new Float32Array(positions.length), 3)
  )
  geometry.setIndex(indices)
  geometry.computeBoundingSphere()
  return { geometry, owners }
}

function build(
  structure: MolecularStructure,
  representation: MoleculeRepresentation,
  water: boolean
): Built {
  const group = new Group()
  const visible = (index: number) =>
    water ||
    structure.residues[structure.atoms[index]!.residue]!.kind !== "water"
  const all = structure.atoms.map((_, i) => i).filter(visible)

  if (representation !== "cartoon") {
    const meshes = atomMeshes(structure, all, representation)
    group.add(meshes.spheres, meshes.sticks)
    return {
      group,
      pickable: [meshes.spheres, meshes.sticks],
      pick(hit) {
        const atom =
          hit.instanceId === undefined
            ? undefined
            : meshes.atomOf(hit.object, hit.instanceId)
        return atom === undefined ? undefined : structure.atoms[atom]!.residue
      },
      paint: (colors) => meshes.paint(colors),
      dispose: () => meshes.dispose(),
    }
  }

  const { geometry, owners } = cartoonGeometry(structure)
  const ribbon = new Mesh(
    geometry,
    new MeshStandardMaterial({
      roughness: 0.5,
      metalness: 0,
      vertexColors: true,
    })
  )
  group.add(ribbon)
  // Ligands, and residues no ribbon can show, keep their atoms.
  const traced = new Set(owners)
  const extra = all.filter((index) => {
    const residue = structure.atoms[index]!.residue
    return !traced.has(residue)
  })
  const others = atomMeshes(structure, extra, "ball-and-stick")
  group.add(others.spheres, others.sticks)
  let detail: ReturnType<typeof atomMeshes> | null = null
  let detailFor = -1
  const colorAttribute = geometry.getAttribute("color") as BufferAttribute
  return {
    group,
    get pickable() {
      return [
        ribbon,
        others.spheres,
        others.sticks,
        ...(detail ? [detail.spheres, detail.sticks] : []),
      ]
    },
    pick(hit) {
      if (hit.object === ribbon)
        return hit.face ? owners[hit.face.a] : undefined
      if (hit.instanceId === undefined) return
      const atom =
        others.atomOf(hit.object, hit.instanceId) ??
        detail?.atomOf(hit.object, hit.instanceId)
      return atom === undefined ? undefined : structure.atoms[atom]!.residue
    },
    paint(atomColors, residueColors, selected) {
      owners.forEach((owner, vertex) => {
        const color = residueColors[owner]!
        colorAttribute.setXYZ(vertex, color.r, color.g, color.b)
      })
      colorAttribute.needsUpdate = true
      others.paint(atomColors)
      // A selected polymer residue also shows its atoms on the ribbon.
      if (selected !== detailFor) {
        if (detail) {
          group.remove(detail.spheres, detail.sticks)
          detail.dispose()
          detail = null
        }
        detailFor = selected
        if (selected >= 0 && traced.has(selected)) {
          detail = atomMeshes(
            structure,
            structure.residues[selected]!.atoms.filter(visible),
            "ball-and-stick"
          )
          group.add(detail.spheres, detail.sticks)
        }
      }
      detail?.paint(atomColors)
    },
    dispose() {
      geometry.dispose()
      ;(ribbon.material as MeshStandardMaterial).dispose()
      others.dispose()
      detail?.dispose()
    },
  }
}

// ---------------------------------------------------------------------------
// Component

type Engine = MoleculeViewerHandle & {
  show: (representation: MoleculeRepresentation, water: boolean) => void
  paint: (scheme: MoleculeColorScheme, selected: number) => void
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

function SequenceStrip({
  structure,
  water,
  selected,
  onSelect,
}: {
  structure: MolecularStructure
  water: boolean
  selected: number
  onSelect: (index: number) => void
}) {
  const strip = React.useRef<HTMLDivElement>(null)
  const chains = React.useMemo(
    () =>
      structure.chains
        .map((chain) => ({
          chain,
          residues: structure.residues
            .map((residue, index) => ({ residue, index }))
            .filter(
              ({ residue }) =>
                residue.chain === chain && (water || residue.kind !== "water")
            ),
        }))
        .filter(({ residues }) => residues.length),
    [structure, water]
  )
  const order = React.useMemo(
    () => chains.flatMap(({ residues }) => residues.map(({ index }) => index)),
    [chains]
  )
  const [focus, setFocus] = React.useState<number | null>(null)
  const stop =
    focus !== null && order.includes(focus)
      ? focus
      : order.includes(selected)
        ? selected
        : order[0]

  // Scroll a selection made on the stage into view inside the strip only, so
  // the page never jumps.
  React.useEffect(() => {
    const container = strip.current
    const button = container?.querySelector<HTMLElement>(
      `[data-residue="${selected}"]`
    )
    if (!container || !button) return
    const left = button.offsetLeft - container.offsetLeft
    if (
      left < container.scrollLeft ||
      left + button.offsetWidth > container.scrollLeft + container.clientWidth
    )
      container.scrollLeft = left - container.clientWidth / 2
  }, [selected])

  const move = (index: number) => {
    setFocus(index)
    strip.current
      ?.querySelector<HTMLElement>(`[data-residue="${index}"]`)
      ?.focus()
  }

  return (
    <div
      ref={strip}
      role="toolbar"
      aria-label="Sequence"
      className="flex shrink-0 gap-3 overflow-x-auto border-t bg-background/60 px-2 py-1.5 font-mono text-xs"
      onKeyDown={(event) => {
        const at = order.indexOf(stop ?? -1)
        const next: Record<string, number> = {
          ArrowRight: Math.min(order.length - 1, at + 1),
          ArrowLeft: Math.max(0, at - 1),
          Home: 0,
          End: order.length - 1,
        }
        const target = next[event.key]
        if (target === undefined) return
        event.preventDefault()
        move(order[target]!)
      }}
    >
      {chains.map(({ chain, residues }) => (
        <div key={chain} className="flex items-center gap-px">
          {structure.chains.length > 1 && (
            <span className="pr-1 text-muted-foreground">{chain}</span>
          )}
          {residues.map(({ residue, index }) => {
            const code = residueCode(residue)
            return (
              <button
                key={index}
                type="button"
                data-residue={index}
                tabIndex={index === stop ? 0 : -1}
                aria-pressed={index === selected}
                aria-label={residueLabel(residue)}
                title={residueLabel(residue)}
                onFocus={() => setFocus(index)}
                onClick={() => onSelect(index)}
                className={cn(
                  "min-w-5 rounded px-0.5 py-0.5 text-center hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring",
                  code.length > 1 && "px-1 text-muted-foreground",
                  index === selected &&
                    "bg-primary text-primary-foreground hover:bg-primary"
                )}
              >
                {code}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function useStructure(
  src: string | undefined,
  data: string | undefined,
  format: "pdb" | "mmcif" | undefined,
  attempt: number
): { structure?: MolecularStructure; error?: string } {
  const fromData = React.useMemo(() => {
    if (data === undefined) return null
    try {
      return { structure: parseStructure(data, format) }
    } catch (reason) {
      return {
        error:
          reason instanceof Error
            ? reason.message
            : "The file could not be read.",
      }
    }
  }, [data, format])
  const request = `${attempt}:${src}:${format}`
  const [fetched, setFetched] = React.useState<{
    request: string
    structure?: MolecularStructure
    error?: string
  } | null>(null)
  React.useEffect(() => {
    if (data !== undefined || !src) return
    const abort = new AbortController()
    const timeout = setTimeout(() => abort.abort("timeout"), 60_000)
    fetch(src, { signal: abort.signal })
      .then((response) => {
        if (!response.ok)
          throw new Error(
            `The structure request returned HTTP ${response.status}.`
          )
        return response.text()
      })
      .then((text) =>
        setFetched({ request, structure: parseStructure(text, format) })
      )
      .catch((reason: unknown) => {
        if (abort.signal.aborted && abort.signal.reason !== "timeout") return
        setFetched({
          request,
          error:
            abort.signal.reason === "timeout"
              ? "The download timed out."
              : reason instanceof Error
                ? reason.message
                : "The file could not be read.",
        })
      })
      .finally(() => clearTimeout(timeout))
    return () => {
      abort.abort("unmount")
      clearTimeout(timeout)
    }
  }, [src, data, format, request])
  if (fromData) return fromData
  if (!src) return { error: "No structure was given." }
  return fetched?.request === request ? fetched : {}
}

export function MoleculeViewer({
  src,
  data,
  format,
  representation: controlledRepresentation,
  defaultRepresentation = "cartoon",
  onRepresentationChange,
  colorScheme: controlledScheme,
  defaultColorScheme = "secondary",
  onColorSchemeChange,
  selectedId = null,
  onSelectionChange,
  onLoad,
  water = false,
  sequence = true,
  controls = true,
  attribution = true,
  label = "Interactive molecular structure",
  className,
  ref,
}: MoleculeViewerProps) {
  const host = React.useRef<HTMLDivElement>(null)
  const [attempt, setAttempt] = React.useState(0)
  const { structure = null, error = null } = useStructure(
    src,
    data,
    format,
    attempt
  )
  const [graphicsFailed, setGraphicsFailed] = React.useState(false)
  const [engine, setEngine] = React.useState<Engine | null>(null)
  const [interacted, setInteracted] = React.useState(false)
  const [ownRepresentation, setOwnRepresentation] = React.useState(
    defaultRepresentation
  )
  const [ownScheme, setOwnScheme] = React.useState(defaultColorScheme)
  const representation = controlledRepresentation ?? ownRepresentation
  const scheme = controlledScheme ?? ownScheme
  const instructions = React.useId()
  const latest = React.useRef({ onSelectionChange, onLoad, structure })
  React.useLayoutEffect(() => {
    latest.current = { onSelectionChange, onLoad, structure }
  })

  const selected = React.useMemo(
    () =>
      structure && selectedId
        ? structure.residues.findIndex(({ id }) => id === selectedId)
        : -1,
    [structure, selectedId]
  )
  const select = React.useCallback((index: number) => {
    const residue = latest.current.structure?.residues[index] ?? null
    latest.current.onSelectionChange?.(residue?.id ?? null, residue)
  }, [])

  React.useEffect(() => {
    if (structure) latest.current.onLoad?.(structure)
  }, [structure])

  React.useEffect(() => {
    const container = host.current
    if (!structure || !container || graphicsFailed) return
    const canvas = document.createElement("canvas")
    canvas.className = "block size-full touch-none outline-none"
    canvas.setAttribute("aria-hidden", "true")
    container.prepend(canvas)
    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      })
    } catch {
      canvas.remove()
      // WebGL is an external system; its failure is reported once per attempt.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGraphicsFailed(true)
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const stage = new Scene()
    stage.add(new AmbientLight(new Color(1, 1, 1), 0.8))
    stage.add(new HemisphereLight(new Color(1, 1, 1), new Color(0.6, 0.6, 0.6), 1.4))
    const lights: [number[], number, Color][] = [
      [[-4, 6, 6], 2.4, new Color(1, 1, 1)],
      [[5, 1, -4], 1.6, new Color(1, 1, 1)],
    ]
    const camera = new PerspectiveCamera(34, 1, 0.1, 1000)
    for (const [position, intensity, color] of lights) {
      const light = new DirectionalLight(color, intensity)
      light.position.set(position[0]!, position[1]!, position[2]!)
      // Lights follow the camera so every side of the molecule is lit.
      camera.add(light)
    }
    stage.add(camera)
    const orbit = new OrbitControls(camera, canvas)
    orbit.enablePan = false
    orbit.rotateSpeed = 0.65
    orbit.zoomSpeed = 0.8
    const motion = matchMedia("(prefers-reduced-motion: reduce)")
    const applyMotion = () => (orbit.enableDamping = !motion.matches)
    applyMotion()
    motion.addEventListener("change", applyMotion)

    // Frame the polymer and ligands; water can spread far around them.
    const framed = structure.atoms.filter(
      (atom) => structure.residues[atom.residue]!.kind !== "water"
    )
    const points = (framed.length ? framed : structure.atoms).map(
      ({ x, y, z }) => new Vector3(x, y, z)
    )
    const center = points
      .reduce((sum, point) => sum.add(point), new Vector3())
      .divideScalar(points.length)
    const radius =
      Math.max(...points.map((point) => point.distanceTo(center))) + 2
    camera.near = radius / 100
    camera.far = radius * 20
    orbit.minDistance = 4
    orbit.maxDistance = radius * 8
    orbit.target.copy(center)

    let dirty = true
    const render = () => (dirty = true)
    let frame = 0
    const tick = () => {
      if (orbit.update() || dirty) {
        renderer.render(stage, camera)
        dirty = false
      }
      frame = requestAnimationFrame(tick)
    }

    const reset = () => {
      orbit.reset()
      const halfV = (camera.fov * Math.PI) / 360
      const halfH = Math.atan(Math.tan(halfV) * camera.aspect)
      const distance = (radius / Math.sin(Math.min(halfV, halfH))) * 0.9
      orbit.target.copy(center)
      camera.position.set(center.x, center.y, center.z + distance)
      camera.lookAt(center)
      orbit.update()
      render()
    }
    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      render()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()
    camera.aspect = container.clientWidth / Math.max(1, container.clientHeight)
    reset()

    let interacting = false
    const onStart = () => (interacting = true)
    const onEnd = () => (interacting = false)
    const onChange = () => {
      if (interacting) setInteracted(true)
      render()
    }
    orbit.addEventListener("start", onStart)
    orbit.addEventListener("end", onEnd)
    orbit.addEventListener("change", onChange)

    let built: Built | null = null
    const rainbow = new Map<number, number>()
    for (const chain of structure.chains) {
      const polymer = structure.residues
        .map((residue, index) => ({ residue, index }))
        .filter(
          ({ residue }) =>
            residue.chain === chain &&
            (residue.kind === "protein" || residue.kind === "nucleic")
        )
      polymer.forEach(({ index }, position) =>
        rainbow.set(index, position / Math.max(1, polymer.length - 1))
      )
    }

    const raycaster = new Raycaster()
    const down = new Vector2()
    const onPointerDown = (event: PointerEvent) =>
      down.set(event.clientX, event.clientY)
    const onPointerUp = (event: PointerEvent) => {
      if (!built) return
      if (down.distanceTo(new Vector2(event.clientX, event.clientY)) > 4) return
      const bounds = canvas.getBoundingClientRect()
      raycaster.setFromCamera(
        new Vector2(
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          -((event.clientY - bounds.top) / bounds.height) * 2 + 1
        ),
        camera
      )
      const hit = raycaster.intersectObjects(built.pickable, false)[0]
      const residue = hit && built.pick(hit)
      if (residue !== undefined) select(residue)
    }
    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointerup", onPointerUp)
    const onContextLost = (event: Event) => {
      event.preventDefault()
      setGraphicsFailed(true)
    }
    canvas.addEventListener("webglcontextlost", onContextLost)

    setEngine({
      show(representation, water) {
        if (built) {
          stage.remove(built.group)
          built.dispose()
        }
        built = build(structure, representation, water)
        stage.add(built.group)
        render()
      },
      paint(scheme, selected) {
        if (!built) return
        // Everything but the selected residue fades towards the stage.
        const dim = (hex: string, residue: number) => {
          const color = cssColor(hex)
          return selected >= 0 && residue !== selected
            ? color.lerp(cssColor(STAGE_TONE), 0.65)
            : color
        }
        const residueColors = structure.residues.map((_, index) =>
          dim(residueColor(structure, index, scheme, rainbow), index)
        )
        const atomColors = structure.atoms.map((atom, index) =>
          dim(atomColor(structure, index, scheme, rainbow), atom.residue)
        )
        built.paint(atomColors, residueColors, selected)
        render()
      },
      reset,
      zoom(factor) {
        const offset = camera.position.clone().sub(orbit.target)
        offset.setLength(
          Math.min(
            orbit.maxDistance,
            Math.max(orbit.minDistance, offset.length() * factor)
          )
        )
        camera.position.copy(orbit.target).add(offset)
        orbit.update()
        setInteracted(true)
        render()
      },
      rotate(azimuth, polar = 0) {
        const spherical = new Spherical().setFromVector3(
          camera.position.clone().sub(orbit.target)
        )
        spherical.theta += azimuth
        spherical.phi += polar
        spherical.makeSafe()
        camera.position
          .copy(orbit.target)
          .add(new Vector3().setFromSpherical(spherical))
        orbit.update()
        setInteracted(true)
        render()
      },
    })
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      setEngine(null)
      observer.disconnect()
      motion.removeEventListener("change", applyMotion)
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointerup", onPointerUp)
      canvas.removeEventListener("webglcontextlost", onContextLost)
      orbit.dispose()
      if (built) built.dispose()
      renderer.dispose()
      canvas.remove()
    }
  }, [structure, graphicsFailed, select])

  React.useEffect(() => {
    engine?.show(representation, water)
  }, [engine, representation, water])

  React.useEffect(() => {
    engine?.paint(scheme, selected)
  }, [engine, representation, water, scheme, selected])

  React.useImperativeHandle(
    ref,
    () => ({
      zoom: (factor) => engine?.zoom(factor),
      rotate: (azimuth, polar) => engine?.rotate(azimuth, polar),
      reset: () => engine?.reset(),
    }),
    [engine]
  )

  const retry = () => {
    setGraphicsFailed(false)
    setAttempt((n) => n + 1)
  }
  const message = error
    ? {
        title: "The structure couldn’t load",
        text: `${error} Check the file and your connection, then try again.`,
      }
    : graphicsFailed
      ? {
          title: "3D view unavailable",
          text: "WebGL could not start or its connection was interrupted. Try again, or use a browser with hardware acceleration enabled.",
        }
      : null
  const residue =
    structure && selected >= 0 ? structure.residues[selected]! : null
  const status = residue
    ? `${residueLabel(residue)}${
        residue.kind === "protein" && residue.secondary !== "coil"
          ? ` · ${residue.secondary}`
          : ""
      }`
    : structure
      ? // Titles in PDB files are upper case, so the summary leaves them out.
        [
          structure.id,
          `${structure.residues.filter(({ kind }) => kind === "protein" || kind === "nucleic").length} residues`,
          structure.chains.length > 1 && `${structure.chains.length} chains`,
        ]
          .filter(Boolean)
          .join(" · ")
      : ""

  return (
    <div
      className={cn(
        "flex h-[28rem] w-full flex-col overflow-hidden rounded-xl border bg-muted/30 text-sm text-foreground",
        className
      )}
    >
      <div
        ref={host}
        role="region"
        aria-label={label}
        aria-describedby={instructions}
        tabIndex={0}
        className="relative min-h-0 flex-1 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget || !engine) return
          const actions: Record<string, () => void> = {
            ArrowLeft: () => engine.rotate(-0.2),
            ArrowRight: () => engine.rotate(0.2),
            ArrowUp: () => engine.rotate(0, -0.2),
            ArrowDown: () => engine.rotate(0, 0.2),
            "+": () => engine.zoom(0.85),
            "=": () => engine.zoom(0.85),
            "-": () => engine.zoom(1.18),
          }
          const action = actions[event.key]
          if (!action) return
          event.preventDefault()
          action()
        }}
      >
        <p id={instructions} className="sr-only">
          Drag or use the arrow keys to rotate, and scroll, pinch or press plus
          and minus to zoom. Click a residue to select it, or choose one from
          the sequence.
        </p>
        {message ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <Alert className="max-w-sm">
              <CircleAlertIcon
                aria-hidden="true"
              />
              <AlertTitle>{message.title}</AlertTitle>
              <AlertDescription>
                <p>{message.text}</p>
                {src && data === undefined && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retry}
                    className="mt-3 text-foreground"
                  >
                    Try again
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </div>
        ) : !structure ? (
          <div
            role="status"
            className="absolute inset-0 flex items-center justify-center p-6 text-muted-foreground"
          >
            Loading structure
          </div>
        ) : null}
        {engine && controls && (
          <TooltipProvider>
            <div
              role="toolbar"
              aria-label="View controls"
              className="absolute top-2 right-2 left-2 flex flex-wrap items-center justify-end gap-0.5"
            >
              <div className="flex flex-wrap items-center justify-end gap-0.5 rounded-lg border bg-background/90 p-1 shadow-sm backdrop-blur">
                <Select
                  value={representation}
                  onValueChange={(next) => {
                    if (!next) return
                    setOwnRepresentation(next as MoleculeRepresentation)
                    onRepresentationChange?.(next as MoleculeRepresentation)
                  }}
                >
                  <SelectTrigger
                    aria-label="Style"
                    className="border-transparent"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Object.entries(moleculeRepresentations).map(
                        ([value, name]) => (
                          <SelectItem key={value} value={value}>
                            {name}
                          </SelectItem>
                        )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select
                  value={scheme}
                  onValueChange={(next) => {
                    if (!next) return
                    setOwnScheme(next as MoleculeColorScheme)
                    onColorSchemeChange?.(next as MoleculeColorScheme)
                  }}
                >
                  <SelectTrigger
                    aria-label="Colour"
                    className="border-transparent"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Object.entries(moleculeColorSchemes).map(
                        ([value, name]) => (
                          <SelectItem key={value} value={value}>
                            {name}
                          </SelectItem>
                        )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {/* Narrow stages pinch to zoom; the menus need the room. */}
                <span className="hidden sm:contents">
                  <ToolbarButton
                    label="Zoom in"
                    onClick={() => engine.zoom(0.85)}
                  >
                    <PlusIcon
                      aria-hidden="true"
                    />
                  </ToolbarButton>
                  <ToolbarButton
                    label="Zoom out"
                    onClick={() => engine.zoom(1.18)}
                  >
                    <MinusIcon
                      aria-hidden="true"
                    />
                  </ToolbarButton>
                </span>
                <ToolbarButton
                  label="Reset view"
                  onClick={() => engine.reset()}
                >
                  <RotateCcwIcon
                    aria-hidden="true"
                  />
                </ToolbarButton>
              </div>
            </div>
          </TooltipProvider>
        )}
        {engine && !interacted && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-xs text-muted-foreground"
          >
            Drag to rotate · Scroll or pinch to zoom
          </p>
        )}
        <div className="pointer-events-none absolute right-2 bottom-1.5 left-2 flex items-end justify-between gap-2 text-[11px] text-muted-foreground">
          <p aria-live="polite" className="min-w-0 truncate">
            {status}
          </p>
          {attribution && structure?.id && (
            <a
              href={`https://www.rcsb.org/structure/${encodeURIComponent(structure.id)}`}
              className="pointer-events-auto shrink-0 underline-offset-2 hover:underline"
            >
              PDB {structure.id}
            </a>
          )}
        </div>
      </div>
      {sequence && structure && (
        <SequenceStrip
          structure={structure}
          water={water}
          selected={selected}
          onSelect={select}
        />
      )}
    </div>
  )
}
