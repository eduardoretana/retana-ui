# bounded-text-scramble · evidencia de Experience Quality (retana-ui, rama feat/text-scramble)

Artefacto del carril `docs/sprints/bounded-text-scramble.md`. Registra solo evidencia que ya existe. Lo que no se ha medido queda pendiente con dueño; no se declara cerrado.

- **Experience Quality Gate**: APPLIES
- **Experience surface**: pieza del registry retana-ui `text-scramble`; rutas `/examples/text-scramble`, `/examples/text-scramble/stress` y escenas `?scene=` (filled, empty, loading, error, terminal, long).

## Evidencia existente

Carpeta (fuera del repo): `/workspace/emil-decode-2026-11-24/`. La evidencia se generó en el tip de código `a8ff697636537bef7e24c846821bb66f483b21c2` (árbol `57be3cb7d1646d344a6a15b751c528b7c2166e7f`); los commits posteriores solo tocan `ui/**` y `docs/sprints/**`.

- Estados declarados en la Spec: idle, running, done, reduced, empty, long, loading, error, swap, unmount, visible, 390.
- Rojo primero: `328cd4d3` con `ui-tests/expected-red.yaml` (spec_id `text-scramble`): 12 fallan y 0 pasan sobre CPL `bf1682d4` más un stub.
- Suite (`suite/`, run_id `text-scramble-suite-a8ff6976-20261124T094802`): `pnpm test` 723 pruebas en 240 archivos, 0 fallidas; `pnpm lint` exit 0 (7 avisos previos, ninguno en archivos del carril); `pnpm typecheck:strict-host` exit 0; `pnpm registry:build` exit 0 sin diff; `pnpm build` exit 0; `anim_perf_lint` pass (7 archivos, 0 hallazgos).
- Renders (arnés 21db9481b331, `next start`): `capturas/antes` 24 (CPL: text-reveal, slot-text y text-scramble con 404), `capturas/despues` 64 (8 rutas × 390/escritorio × claro/oscuro × reduced sí/no), `capturas/despues-decode` 40 (filled y terminal × 390/escritorio × claro/oscuro × t=0/120/260/400/700 ms, reloj falso).
- Accesibilidad: axe-core 4.13 en 24 cargas sin reduced. Las únicas violaciones son 3 de `color-contrast` en `div[data-description]`, el toast de sonner de la escena `loading` mientras aparece (opacidad < 1). En reposo (3.2 s), 0 violaciones (`logs/axe-recheck-loading-a8ff.json`). La pieza no aporta violaciones. `ariaSnapshot` en los 8 recorridos de cuadros: el ruido no entra al árbol y el nombre final está presente.
- 390px: 0 cargas con overflow horizontal; estrés a 320 px con mono, RTL, acentos y emoji, 120 vs 121 caracteres y 20 títulos con `visible`.
- Layout: CLS máximo 0.0003, solo en la escena `error` por el cambio de estado del host; 0 en las escenas con decode. Rects estables en todos los cuadros.
- Reduced-motion: 32 capturas con `prefers-reduced-motion: reduce`; texto final de inmediato, sin rAF (TS-REDUCED).
- es-MX / EN: fixtures con ambos idiomas; el SceneDeck cambia de idioma.

## Campos de cierre

- **Accessibility target**: WCAG 2.2 AA
- **Accessibility coverage**: escenas filled, terminal, empty, loading, error, long y estrés; revisión manual con lector de pantalla pendiente de cierre, dueño Retana UI.
- **Accessibility automated evidence**: `capturas/despues-decode-records.json` (axe, CLS, overflow, ariaSnapshot) y `logs/axe-recheck-loading-a8ff.json`.
- **Accessibility manual evidence**: pendiente de cierre; la revisión visual la hace el UI Auditor despachado por el UI Lead. Medición de destello con PEAT pendiente, dueño Retana UI.
- **Interaction state matrix**: los 12 estados de la Spec con su prueba o captura (Spec AC-1…AC-11; matriz en `design-pass/README.md` §2).
- **Response budget**: no aplica; la pieza no responde a entradas del usuario.
- **Performance budgets**: una escritura de `textContent` por tick de 50 ms; 0 `setState` por frame; 0 lecturas de layout durante el decode (AC-6, `RUI-ANIM-PERF-007`). Grabación en dispositivo de gama media pendiente de cierre, dueño Retana UI.
- **Performance evidence**: `anim_perf_lint` pass (7 archivos, 0 hallazgos); 0 long tasks en las cargas de la sonda (`logs/decode-probe-a8ff.log`).
- **Optimistic UI exclusions**: no aplica; la pieza no hace red.
- **Loading state evidence**: escena `loading` (el host muestra su carga; el decode corre una vez cuando llega el texto).
- **Cache/prefetch evidence**: no aplica.
- **Experience proof surfaces**: code/tests = suite de arriba; served frontend = renders de `next start`; automated audit = axe y sonda de cuadros; manual browser, dispositivo y production field data pendientes de cierre.
