import { verdictOf, type AuditData, type Finding, type Severity } from "./analyze.ts"

const SEV: Record<Severity, number> = { blocker: 0, major: 1, minor: 2 }

const PR_GROUPS: { title: string; rules: string[]; alcance: string }[] = [
  {
    title: "docs(catalog): fijar @retana a un SHA",
    rules: ["A6-SHA", "A1-COUNT", "A1-README-DRIFT"],
    alcance:
      "Documentar en README, /docs y los comandos de instalación la URL raw.githubusercontent.com/eduardoretana/retana-ui/<sha>/public/r/{name}.json, y dejar el placeholder https://<your-deployment> como segunda vía, la que no fija SHA.",
  },
  {
    title: "fix(registry): instalación @retana@sha",
    rules: [
      "A4-BARE",
      "A4-UNKNOWN",
      "A3-MISSING",
      "A3-EXTRA",
      "A3-DRIFT",
      "A3-BUILD",
      "A5-IMPORT",
      "A5-NPM",
      "A2-META",
      "A2-SEARCH",
      "A2-SHORT",
      "B1-HEX",
      "B1-FN",
      "B1-PALETTE",
      "B1-NAMED",
      "B1-INLINE",
      "B1-FONT",
      "B1-CSSVARS",
      "B6-PREVIEW",
    ],
    alcance:
      "Lo que impide que shadcn add de un SHA instale la pieza en el host: namespace @retana/, dependencias npm, imports que el host no resuelve, payloads fuera de sync y colores o fuentes que rompen «heredar del host».",
  },
  {
    title: "feat(views): interruptor readOnly / draggable={false}",
    rules: ["A7-DRAG", "B2-DND-KEYBOARD"],
    alcance:
      "Candidatos extension (C32): la pieza existe y siempre mueve tarjetas, fechas o secciones. Añadir un prop que apague el arrastre sin copiar la pieza en el proyecto, y teclado donde el sensor de puntero está solo.",
  },
  {
    title: "fix(a11y): foco, teclado y nombre de icono",
    rules: ["B2-FOCUS", "B2-KEYBOARD", "B2-ALT", "B2-NAME"],
    alcance:
      "Controles que pierden el anillo de foco, clicks sin teclado, imágenes sin alt y botones de icono sin nombre accesible.",
  },
  {
    title: "fix(motion): reduced-motion, ease-out y press",
    rules: ["B3-REDUCED", "B3-ALL", "B3-EASE-IN", "B3-LAYOUT", "B4-PRESS", "B4-ICON"],
    alcance:
      "Movimiento que no consulta prefers-reduced-motion, curvas ease-in, transition all, y escalas de press o de icono distintas a las de better-ui.",
  },
  {
    title: "test(catalog): pruebas, estrés y piezas solapadas",
    rules: ["B6-TEST", "B6-STRESS", "B6-PAGE", "B6-CATALOG", "B4-STATES", "B7-DUP"],
    alcance:
      "Piezas sin test, sin página de estrés o sin estados empty/loading/error, y pares cuyo fuente principal supera el umbral de similitud.",
  },
]

export function renderReport(data: AuditData) {
  const verdict = verdictOf(data)
  const top = topFindings(data)
  const prs = propose(data)
  const lines: string[] = []
  lines.push("# Auditoría retana-ui contra ui-system v3.2.2")
  lines.push("")
  lines.push(`Fecha del informe: 2026-10-06. Árbol auditado: \`registry.json\` en \`origin/CPL\` \`${data.cplSha}\` (blob git \`${data.registryBlob}\`). ui-system ${data.uiSystem}. better-ui pin \`267330e1adfc66a718fb65fa6918c1f06d0a689e\`.`)
  lines.push("")
  lines.push("Los números salen de `node --experimental-strip-types docs/audit/scripts/run.ts`. El JSON crudo está en `docs/audit/output/audit.json`. El script no modifica piezas: si regenera el registry para medir el diff, restaura `public/r`, `lib/generated/preview-map.tsx` y `README.md` antes de salir.")
  lines.push("")
  lines.push("## Resumen ejecutivo")
  lines.push("")
  lines.push(`**Veredicto: ${verdict}** como catálogo \`@retana@sha\` del ui-system.`)
  lines.push("")
  lines.push(verdictReason(verdict, data))
  lines.push("")
  lines.push(`Hallazgos (una fila por causa, no por pieza afectada): **${data.counts.blocker}** blocker, **${data.counts.major}** major, **${data.counts.minor}** minor. Total **${data.counts.findings}**.`)
  lines.push("")
  lines.push("### Los cinco hallazgos más importantes")
  lines.push("")
  for (const finding of top) {
    lines.push(`- **${finding.id}** (${finding.severity}, ${finding.ruleId}) ${finding.summary} Evidencia: ${formatEvidence(finding)}.`)
  }
  lines.push("")
  lines.push("## Conteos del catálogo")
  lines.push("")
  lines.push(`Según \`registry.json@${data.cplSha}\`: **${data.counts.items}** items, **${data.counts.components}** components (\`registry:ui\`), **${data.counts.blocks}** blocks, **${data.counts.hooks}** hooks, **${data.counts.libraries}** libraries.`)
  lines.push("")
  lines.push("| Fuente | Items | Components | Blocks | Hooks | Libraries | Viñetas |")
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |")
  lines.push(`| registry.json@${data.cplSha.slice(0, 12)} | ${data.counts.items} | ${data.counts.components} | ${data.counts.blocks} | ${data.counts.hooks} | ${data.counts.libraries} | — |`)
  lines.push(`| README bloque CATALOG | ${data.readme.items ?? "—"} | ${data.readme.components ?? "—"} | ${data.readme.blocks ?? "—"} | ${data.readme.hooks ?? "—"} | ${data.readme.libraries ?? "—"} | ${data.readme.bullets} |`)
  lines.push(`| Coincide | ${data.readme.matchesRegistry ? "sí" : "no"} | | | | | |`)
  lines.push("")
  lines.push(`\`/docs\` toma el total de \`getCatalog().length\` (${data.docs.dynamicCatalogCount ? "sí, es dinámico y sigue a registry.json" : "no se encontró getCatalog().length"}). La página de ítem \`/items/[name]\` existe como ruta dinámica: ${data.findings.some((finding) => finding.ruleId === "B6-CATALOG") ? "no" : "sí"}.`)
  lines.push("")
  lines.push(`Previews presentes: ${data.coverage.withPreview}/${data.coverage.items}. Páginas de ejemplo: ${data.coverage.withExamplePage}/${data.coverage.items}. Tests que importan la pieza: ${data.coverage.withTest}/${data.coverage.items}. Páginas de estrés: ${data.coverage.withStress}/${data.coverage.items}.`)
  lines.push("")
  lines.push("### Contrato A, resultado")
  lines.push("")
  lines.push(`- Meta \`titleEs\` / \`descriptionEs\` / \`preview\`: ${countRule(data, "A2-META") === 0 ? "las tres están en los " + data.counts.items + " items" : countRule(data, "A2-META") + " items incompletos"}.`)
  lines.push(`- Descripción ES útil para \`uis catalog search\`: ${countRule(data, "A2-SEARCH")} idénticas a la descripción en inglés; ${countRule(data, "A2-SHORT")} con menos de 24 caracteres. El resto tiene texto propio en español.`)
  lines.push(`- \`public/r/<name>.json\`: faltan ${data.payload.missing.length}, sobran ${data.payload.extra.length}, con \`cssVars\` ${data.payload.cssVars.length}.`)
  lines.push(`- Regenerar (\`pnpm registry:build\` y \`pnpm readme:catalog\`): ${rebuildSentence(data)}`)
  lines.push(`- \`validateRegistryTree\`: ${data.validatorErrors.length} error(es).`)
  lines.push(`- \`registryDependencies\` de retana sin \`@retana/\`: ${countRule(data, "A4-BARE")}. Desconocidas con namespace: ${countRule(data, "A4-UNKNOWN")}.`)
  lines.push(`- Imports que el host no resuelve en el payload: ${countRule(data, "A5-IMPORT")}. Paquetes npm importados y ausentes en \`dependencies\`: ${countRule(data, "A5-NPM")}.`)
  lines.push(`- URL con SHA en README y docs: ${data.docs.shaPinMentions.length} menciones. Placeholder \`https://<your-deployment>\`: ${data.docs.placeholderMentions.length} menciones.`)
  lines.push(`- Candidatos extension de arrastre siempre activo: ${countRule(data, "A7-DRAG")}.`)
  lines.push("")
  lines.push("### Reglas B que el script no da por cumplidas")
  lines.push("")
  lines.push("Radios concéntricos y «sombra para elevación, borde para estructura» (better-ui/surfaces.md) no tienen un detector fiable sobre className anidadas. Quedan **sin verificar**. El modo oscuro se juzga por la misma evidencia que el color: si no hay hex, función de color, paleta ni inline literal, \`.dark\` hereda el token del host. Eso es B5, y solo falla donde falla B1.")
  lines.push("")
  lines.push("## Tabla por pieza")
  lines.push("")
  lines.push("A reúne A2, A3, A4, A5 y A7. B reúne color, a11y, motion, craft, tests y duplicados. `cumple` significa que ninguna de esas reglas produjo hallazgo para la pieza, ni heredado de un archivo compartido que el payload incluye.")
  lines.push("")
  lines.push("| Pieza | Tipo | A | B | Severidad máxima |")
  lines.push("| --- | --- | --- | --- | --- |")
  for (const piece of data.pieces) {
    lines.push(`| \`${piece.name}\` | ${piece.kind} | ${cell(piece.failedA)} | ${cell(piece.failedB)} | ${piece.maxSeverity} |`)
  }
  lines.push("")
  const failing = data.pieces.filter((piece) => piece.maxSeverity !== "ok").length
  const inheritedOnly = data.pieces.filter((piece) => piece.maxSeverity !== "ok" && piece.directFindings === 0).length
  lines.push(`${data.pieces.length - failing} piezas sin hallazgo. ${failing} con al menos uno. ${inheritedOnly} de esas no tienen hallazgo en su propio archivo: fallan porque el payload incluye un archivo compartido (el caso grande es \`registry/lib/motion.ts\`, la curva de salida).`)
  lines.push("")
  lines.push("## Hallazgos")
  lines.push("")
  lines.push("Destino: fix en pieza, extension, consolidar, regla nueva en CONTRIBUTING, test o docs. La cita es la regla del ui-system o de better-ui / emil-design-eng que el detector usó.")
  lines.push("")
  for (const severity of ["blocker", "major", "minor"] as const) {
    const group = data.findings.filter((finding) => finding.severity === severity)
    lines.push(`### ${severity} (${group.length})`)
    lines.push("")
    if (!group.length) {
      lines.push("Ninguno.")
      lines.push("")
      continue
    }
    lines.push("| Id | Pieza | Regla | Evidencia | Destino |")
    lines.push("| --- | --- | --- | --- | --- |")
    for (const finding of group) {
      const pieces = finding.affectedPieces.length > 4
        ? `${finding.affectedPieces.slice(0, 4).join(", ")} +${finding.affectedPieces.length - 4}`
        : finding.affectedPieces.join(", ") || finding.piece
      lines.push(`| ${finding.id} | ${escapeCell(pieces || finding.piece)} | ${finding.ruleId} | ${escapeCell(formatEvidence(finding))} | ${finding.destination} |`)
    }
    lines.push("")
    const notable = group.filter((finding) => finding.severity !== "minor" || ["A7-DRAG", "B3-EASE-IN", "B7-DUP"].includes(finding.ruleId))
    for (const finding of (severity === "minor" ? notable.slice(0, 12) : group.slice(0, 25))) {
      lines.push(`**${finding.id} ${finding.piece}.** ${finding.summary} Regla: ${finding.rule} Destino propuesto: ${finding.destination}.`)
      lines.push("")
    }
    if (severity !== "minor" && group.length > 25) {
      lines.push(`Las otras ${group.length - 25} filas ${severity} están en la tabla y en \`audit.json\`.`)
      lines.push("")
    }
  }
  lines.push("## Backlog en PRs")
  lines.push("")
  lines.push("Como máximo seis. El orden empieza por lo que bloquea componer desde `@retana@sha`. El esfuerzo es el tamaño del diff según archivos distintos en la evidencia: S hasta 5, M de 6 a 20, L más de 20. No es un plazo.")
  lines.push("")
  prs.forEach((pr, index) => {
    lines.push(`### ${index + 1}. ${pr.title}`)
    lines.push("")
    lines.push(pr.alcance)
    lines.push("")
    lines.push(`- Hallazgos: ${pr.ids.join(", ") || "—"}.`)
    lines.push(`- Piezas (${pr.pieces.length}): ${pr.pieces.slice(0, 40).map((name) => `\`${name}\``).join(", ")}${pr.pieces.length > 40 ? ` y ${pr.pieces.length - 40} más` : ""}.`)
    lines.push(`- Esfuerzo: **${pr.effort}** (${pr.files} archivos en la evidencia).`)
    lines.push("")
  })
  lines.push("## Qué renovar")
  lines.push("")
  lines.push("Una pieza entra aquí si el script le encuentra al menos dos hallazgos directos major o blocker (no cuenta un archivo compartido atribuido a otra pieza) y tiene fecha de alta en `registry/`. Van primero las más antiguas. Rehacerlas es acercarlas al nivel de las familias recientes que salen en `cumple` en la tabla.")
  lines.push("")
  if (!data.renew.length) {
    lines.push("Ninguna pieza acumula dos hallazgos directos major o blocker.")
    lines.push("")
  } else {
    lines.push("| Pieza | Alta | Majors/blockers directos | Minors directos |")
    lines.push("| --- | --- | ---: | ---: |")
    for (const row of data.renew) {
      lines.push(`| \`${row.name}\` | ${row.born} | ${row.directMajors} | ${row.directMinors} |`)
    }
    lines.push("")
  }
  lines.push("Pares con nombre emparentado y Jaccard del fuente principal por debajo de 0.72 (no se proponen para consolidar; el catálogo ya los separa en el README):")
  lines.push("")
  if (!data.nearNames.length) {
    lines.push("Ningún par en ese rango.")
  } else {
    for (const pair of data.nearNames.slice(0, 15)) {
      lines.push(`- \`${pair.a}\` / \`${pair.b}\`: ${pair.jaccard}`)
    }
  }
  lines.push("")
  if (data.similarity.length) {
    lines.push("Pares con Jaccard ≥ 0.55 (el hallazgo B7-DUP empieza en 0.72):")
    lines.push("")
    for (const pair of data.similarity.slice(0, 15)) {
      lines.push(`- \`${pair.a}\` / \`${pair.b}\`: ${pair.jaccard}`)
    }
    lines.push("")
  }
  lines.push("## PR de animaciones de scroll")
  lines.push("")
  if (data.openPrs.length === 0) {
    lines.push("Al correr el script, `gh pr list --repo eduardoretana/retana-ui --state open` devolvió 0 pull requests.")
  } else {
    lines.push("PRs abiertos en el momento de la corrida:")
    lines.push("")
    for (const pr of data.openPrs) {
      lines.push(`- #${pr.number} ${pr.title} (\`${pr.head}\`) ${pr.url}`)
    }
    lines.push("")
    const scroll = data.openPrs.filter((pr) => /scroll|animacion/i.test(`${pr.title} ${pr.head}`))
    if (scroll.length) {
      lines.push("Ese PR de animaciones de scroll no está mergeado en `origin/CPL`. Las piezas nuevas no entran en el conteo ni en la tabla de esta corrida. No se modificó el PR. El diff toca README, `/docs` y `registry.json` del otro branch; el hallazgo de la URL sin SHA (A6) hay que volver a medirlo cuando ese PR entre, porque este informe no dice que lo corrija.")
    }
    lines.push("No se modificó ningún PR abierto.")
  }
  lines.push("")
  lines.push("## Cómo repetir la medición")
  lines.push("")
  lines.push("```bash")
  lines.push("node --experimental-strip-types docs/audit/scripts/run.ts")
  lines.push("```")
  lines.push("")
  lines.push("Hace falta `pnpm install` porque el script ejecuta `pnpm registry:build` para ver si el JSON versionado diverge. `--no-rebuild` omite ese paso y no puede afirmar el sync.")
  lines.push("")
  return lines.join("\n")
}

function verdictReason(verdict: string, data: AuditData) {
  const rule =
    "El script marca NO APTO si el JSON versionado no coincide con una regeneración, si falta un payload, si hay cssVars, o si los colores literales tocan más del 5 % de las piezas. Con blockers o majors que no rompen esa integridad, el veredicto es APTO CON CAMBIOS. APTO solo con cero blockers y cero majors."
  const sync = syncPhrase(data)
  const colorFindings = data.findings.filter((finding) => finding.ruleId.startsWith("B1-") || finding.ruleId === "A3-CSSVARS").length + data.payload.cssVars.length
  if (verdict === "NO APTO") {
    return `${rule} Esta corrida cae en NO APTO: regenerar dejó diff en ${data.payload.rebuild.diffAfterBuild.length} archivo(s), faltan ${data.payload.missing.length} payloads, hay ${data.payload.cssVars.length} con cssVars y ${colorFindings} hallazgo(s) de color.`
  }
  if (verdict === "APTO CON CAMBIOS") {
    const bare = countRule(data, "A4-BARE")
    const npm = countRule(data, "A5-NPM")
    return `${rule} La regeneración ${sync}. Hallazgos de color o cssVars: ${colorFindings}. El catálogo se puede citar por SHA. No todas las piezas instalan bien: ${bare} registryDependencies de retana van sin \`@retana/\` y ${npm} imports npm no están en \`dependencies\`. Esos blockers, más los majors de extensión, accesibilidad, motion y tests, dejan el catálogo en APTO CON CAMBIOS.`
  }
  return `${rule} Esta corrida no tiene blockers ni majors. La regeneración ${sync}.`
}

function syncPhrase(data: AuditData) {
  if (!data.payload.rebuild.ran) return "no se ejecutó en esta corrida"
  if (data.payload.rebuild.diffAfterBuild.length === 0) return "no produjo diff"
  return `produjo diff en ${data.payload.rebuild.diffAfterBuild.length} archivo(s)`
}

function topFindings(data: AuditData) {
  const preferredPiece: Record<string, string> = {
    "A7-DRAG": "view-kanban",
  }
  const ranked = [...data.findings].sort((a, b) => {
    const reachA = Math.max(a.affectedPieces.length, a.ruleId.startsWith("A") ? 2 : 0)
    const reachB = Math.max(b.affectedPieces.length, b.ruleId.startsWith("A") ? 2 : 0)
    return SEV[a.severity] - SEV[b.severity] || reachB - reachA || b.count - a.count
  })
  const picked: Finding[] = []
  const seen = new Set<string>()
  for (const finding of ranked) {
    if (seen.has(finding.ruleId)) continue
    const preferred = preferredPiece[finding.ruleId]
    const chosen = preferred
      ? ranked.find((item) => item.ruleId === finding.ruleId && item.piece === preferred) ?? finding
      : finding
    seen.add(finding.ruleId)
    picked.push(chosen)
    if (picked.length === 5) break
  }
  return picked
}

function propose(data: AuditData) {
  return PR_GROUPS.map((group) => {
    const findings = data.findings.filter((finding) => group.rules.includes(finding.ruleId))
    const pieces = [...new Set(findings.flatMap((finding) => (finding.affectedPieces.length ? finding.affectedPieces : [finding.piece])))].filter((name) => !name.startsWith("("))
    const files = new Set(findings.flatMap((finding) => finding.evidence.map((evidence) => evidence.file)))
    const effort = files.size <= 5 ? "S" : files.size <= 20 ? "M" : "L"
    return {
      ...group,
      ids: findings.map((finding) => finding.id),
      pieces,
      files: files.size,
      effort,
    }
  }).filter((group) => group.ids.length > 0)
}

function countRule(data: AuditData, ruleId: string) {
  return data.findings.filter((finding) => finding.ruleId === ruleId).length
}

function cell(rules: string[]) {
  return rules.length ? `falla ${rules.join(", ")}` : "cumple"
}

function formatEvidence(finding: Finding) {
  if (!finding.evidence.length) return "—"
  return finding.evidence
    .slice(0, 3)
    .map((evidence) => `${evidence.file}:${evidence.line}`)
    .join(", ")
}

function escapeCell(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ")
}

function rebuildSentence(data: AuditData) {
  const rebuild = data.payload.rebuild
  if (!rebuild.ran) return "no se ejecutó en esta corrida."
  if (rebuild.exitCode !== 0) return `registry:build salió ${rebuild.exitCode}. Diff de payloads: ${rebuild.diffAfterBuild.length}. README: ${rebuild.diffAfterReadme.length}. Restaurado: ${rebuild.restored ? "sí" : "no"}.`
  return `registry:build salió 0. Archivos distintos en public/r o preview-map: ${rebuild.diffAfterBuild.length}. README tras readme:catalog: ${rebuild.diffAfterReadme.length}. Restaurado: ${rebuild.restored ? "sí" : "no"}.`
}
