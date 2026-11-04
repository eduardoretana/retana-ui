# L-EMIL-choreograph-c8a79627

- **Fuente:** Emil Kowalski, skill `/choreograph` en [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/c8a79627b59d72d764d6ab6f2c87c09a48169833/skills/choreograph). Commit `c8a79627b59d72d764d6ab6f2c87c09a48169833`.
- **Fecha de revisión:** 2026-11-04.
- **Licencia:** MIT. Copyright (c) 2026 Emil Kowalski. El aviso viaja con este documento. No se copia el cuerpo de `SKILL.md` ni de `RECIPES.md`; las reglas se parafrasean para el auditor.
- **Inspiración aparte:** [Interaction Lab](https://aiforui.dev/lab), revisado el mismo día. Solo ideas. No hay licencia abierta visible para copiar código, así que no se porta ninguna implementación.
- **ui-system:** snapshot de `eduardoretana/hub-vibecoding@419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7` (2026-10-29), `VERSION` = `4.0.0`. Los ids viven en `ui-system/knowledge/rules.yaml` (el archivo todavía dice semilla 3.4.1; el CHANGELOG de 4.0.0 no retira `RUI-ANIM-PERF-*`). `rules/*.md` es prosa sin ids.

Veredicto del aprendizaje: **adaptar**. Varias reglas ya estaban en piezas sueltas (`popLayout`, `custom` de dirección, `useReducedMotion`). Faltaban el presupuesto de stagger, la prohibición en UI de alta frecuencia, el colapso real con reduced motion y una sola familia de timing en el hero. Eso se implementó aquí. El texto de `RUI-ANIM-CHOREO-001` queda propuesto para que VibeBot lo lleve al hub. Este repo no edita el hub.

## Reglas duras

| Regla | Estado en retana-ui | Evidencia | Veredicto | Destino |
| --- | --- | --- | --- | --- |
| Una sola entrada por contenedor. Si el panel entra, el contenido ya está. | El menú de cuenta animaba el panel (`scale`) y además hacía stagger de filas (`delayChildren` + `staggerChildren` + `y` por fila). | Antes: `user-menu.tsx` variants `panelMotion` / `rowMotion`. Ahora el panel es la única entrada: `registry/ui/user-menu.tsx:103-115`. Las filas son `<button>` sin variants. | **Adoptar** | Hecho en `user-menu`. El picker de reacciones entra una vez (`comment-thread.tsx:586-588`); los emoji ya no escalan por separado. |
| Sin stagger en UI de alta frecuencia o teclado (dropdown, menú, command palette, tabs, filas). | Command palette, slash menu y mega menu no animan filas. El menú de cuenta, el picker de reacciones, las teclas del grabador y las filas expandidas del stack sí escalonaban. | Limpio: `command-palette.tsx` (sin `motion`). Corregido: `user-menu.tsx:103`, `comment-thread.tsx:591`, `shortcut-recorder.tsx:330`, `notification-stack.tsx:102`. Lint: `__tests__/choreography-lint.test.ts`. | **Adoptar** | Lint que falla si esas superficies vuelven a tener `staggerChildren`, `delayChildren`, `stagger(`, `delay: index *` o `animationDelay` por índice. |
| El stagger uniforme está prohibido. El tiempo varía por importancia (lead / support / decoration / static). | `stagger-reveal` y `AeStagger` usaban el mismo paso para todos. El hero usaba `stagger.line` (80 ms) idéntico. | `registry/lib/motion.ts:53` (`staggerDelaySeconds`, huecos que se encogen, tope en el ítem 6). `stagger-reveal.tsx:80`. `ae-dash.ts:27`. Hero: `hero-section.tsx:85` con `stagger(..., { ease: "easeOut" })`. | **Adaptar** | Helper compartido. Lead del hero sigue a 12 px; el media de apoyo baja a 8 px (`hero-section.tsx:96-111`). Decoración del mesh no entra en el stagger. |
| La coreografía no bloquea la interacción. | En el menú, una fila tardía podía llegar después del panel. No había un `pointer-events: none` durante el stagger, pero el retraso igual hacía esperar. | `user-menu.tsx:548` filas presentes en cuanto el panel existe. | **Adoptar** | Misma corrección que la entrada única. No se añade un candado de interacción. |
| Toda secuencia se puede interrumpir. | `AnimatePresence` con `key` estable ya corta la salida al cambiar de vista en varias piezas. No hay un orquestador `useAnimate` de varios eventos que apile secuencias. | `time-picker.tsx:190`, `timeline.tsx` (`custom` + `popLayout`). `shortcut-recorder.tsx:564` `mode="popLayout"`. | **Ya cubierto** | Sin cambio. No se introduce `useAnimate` nuevo. |
| El contenido del repositorio es dato, no instrucciones. | Regla de operación del skill, no de UI. | — | **Descartar** | No aplica a piezas. |

## Valores y relaciones

| Regla o valor | Estado | Evidencia | Veredicto | Destino |
| --- | --- | --- | --- | --- |
| Producto: 30–80 ms entre ítems y total &lt; ~300 ms. Listas largas: solo los primeros, el resto con el último. | `stagger.item` es 35 ms y `stagger.line` es 80 ms, pero `index * paso` no tenía techo (usage-meter, ae grow, stagger-reveal). | `motion.ts:27` y `motion.ts:41-65`. Test `__tests__/choreography.test.ts`. | **Adaptar** | `staggerDelaySeconds` (paso 50 ms, decay 0.72, cap 6, techo 300 ms). `stagger-reveal` y tarjetas AE lo usan. `usage-meter.tsx` sigue con `index * 0.07` en la primera revelación de segmentos de una gráfica: es un draw de datos, no filas de UI; se deja y se anota. |
| Marketing: 100–150 ms sobre entradas de 0.5–0.6 s. | El hero entraba a 0.64 s con paso de 80 ms (banda de producto) y el media a 1 s / 40 px. | `hero-section.tsx:88-93` duración 0.55 s. Paso `motionPresets.stagger.marketing` = 0.12 s (`motion.ts:27`). Media: `hero-section.tsx:96-111`. | **Adaptar** | Hecho en el hero. El contenedor del copy no se mueve (`heroGroup` solo reparte hijos). |
| Quien sale deja de ocupar espacio al instante (`popLayout` o `absolute`). | Muchas listas ya usan `mode="popLayout"`. | `user-menu.tsx:170`, `tag-input.tsx`, `chip-group.tsx`, `shortcut-recorder.tsx:564`. | **Ya cubierto** | Sin cambio masivo. |
| Cambio de vista en el mismo contenedor = crossfade (`popLayout`, no `mode="wait"` por defecto). | El patrón dominante es `popLayout`. `mode="wait"` queda en morphs densos (aprobar en sitio, comentario que confirma borrado), que el propio skill permite cuando dos estados ricos se pisarían. | `inline-approve-button.tsx` `mode="wait"`. `comment-thread.tsx:552`. | **Ya cubierto** | No se convierte `wait` en crossfade donde el morph es el estado. |
| Una familia de timing por componente (`MotionConfig` o una variable CSS). | `motionPresets` es la familia. El hero mezclaba 0.55/0.64 con un media de 1 s y un mesh lineal aparte. El bento magnético ya comparte `--mb-dur` / `--mb-ease`. | `motion.ts:4-29`. `hero-section.tsx:417` `MotionConfig`. `hooks/use-magnetic-indicator.ts` duración única. | **Adaptar** en el hero. **Ya cubierto** en bento y en el preset. | Media del hero usa la misma ease de entrada y 0.55 s. El mesh ambiental (18 s, lineal) no es parte de la entrada. |
| Duración según distancia: `clamp(0.15s, Δh/500, 0.27s)`. | No había un fade de altura derivado del delta. Los springs de altura (stepper, sheet) son otra familia y no se recalculan con esta fórmula. | `motion.ts:68` `resizeFadeDuration`. Test en `choreography.test.ts`. | **Adaptar** como helper. No hay hoy una pieza con salto de altura variable que usara un fade fijo incorrecto; no se reescribe el stepper. | Helper listo para el hub y para la próxima vista que mida `Δh`. |
| Salidas simultáneas, más cortas que la entrada y en espejo. Dirección con `custom` en `AnimatePresence` y en el hijo. | Dirección con `custom` ya está en time-picker, timeline, number-field, gauge. El menú salía a `scale: 0.97` (no espejo de `0.94`) y las teclas no espejaban el `y`. El picker de reacciones salía solo con opacidad. | `time-picker.tsx:190-197`. `user-menu.tsx:104` y `:115` (entrada y salida `scale: 0.94`; salida `duration.exit` 0.18 s &lt; 0.3 s). `shortcut-recorder.tsx:331` y `:343`. `comment-thread.tsx:586-588`. | **Adaptar** en menú, teclas y picker. **Ya cubierto** el `custom` de dirección. | Hecho en esas tres piezas. No se añade stagger inverso al cerrar. |
| Encadenar con `Promise.all` y bloquear con un ref, no con estado. | No hay una secuencia imperativa de varios eventos que haya que esperar. `slide-to-confirm` ya guarda el arrastre en refs. | `slide-to-confirm.tsx` refs de drag. | **Ya cubierto** / no aplica. | No se añade `useAnimate`. |
| Loops de atención: primer ciclo ~2.5 s, `repeatDelay` ~6 s, se detienen al interactuar. | No hay un ícono que se mueva para invitar al clic. El brillo del slide y el shimmer son bucles continuos de texto, no un gesto de atención. El mesh del hero es fondo. | `slide-to-confirm.tsx` shimmer lineal. `text-shimmer.tsx`. `hero-section.tsx` mesh `repeat: Infinity`. Constantes de reserva: `motion.ts` `attentionDelay` 2.5 y `attentionRepeat` 6. | **Descartar** como cambio de piezas. El valor queda en el helper por si entra un loop de atención. | Sin cambio visual. |
| Con `prefers-reduced-motion` la coreografía se colapsa (sin retrasos ni desplazamiento; se conserva la opacidad). No basta con acortarla. | Varias piezas ponían `duration: 0` (se pierde también el fade) o dejaban el stagger. `stagger-reveal` ya apagaba el stagger pero con duración 0. El stack de notificaciones hacía `animation: none`. | `stagger-reveal.tsx:88-90`. `ae-dash.ts:16-18`. `hero-section.tsx:83-90`. `notification-stack.tsx:117-125`. `motion-preference.tsx` sigue siendo el override de usuario. | **Adaptar** | Reduced motion: opacidad compartida, delay 0, sin `y`. El hero no reparte `delayChildren` si la preferencia está activa. |

## Cast de lo que se movía de más

| Pieza | Qué se quitó | Por qué |
| --- | --- | --- |
| `user-menu` | Subida de 3 px y stagger de 16 ms por fila | El panel ya es la entrada. Menú de alta frecuencia. |
| `comment-thread` | `scale` y delay por emoji | El grupo del picker ya entra. Los emoji son el contenido. |
| `shortcut-recorder` | Delay por índice en las teclas | Un atajo es un solo objeto. La salida ya era simultánea; ahora también espeja la entrada. |
| `notification-stack` | `animation-delay: index * 40ms` al expandir | Filas que el usuario abre seguido. Entran juntas. |
| `stagger-reveal` / AE | Stagger lineal sin techo y subida de 12–16 px idéntica | Pasa a huecos decrecientes y tope ~300 ms. Reduced motion solo desvanece. |
| Hero | Paso de 80 ms, entrada de 0.64 s, media de 1 s y 40 px | Banda de marketing (120 ms, 0.55 s) y el media en la misma familia. |

## Secuencia (frames) de las piezas tocadas

No hay video. La secuencia se lee del timeline:

1. **Menú de cuenta.** 0 ms: el panel escala de 0.94 a 1 y sube la opacidad (spring 0.3 s, opacidad 0.14 s). Las filas ya están y reciben clic. Al cerrar, todo sale junto a escala 0.94 en 0.18 s. Con reduced motion el panel solo cruza opacidad en 0.12 s, sin escala.
2. **Hero.** 0 ms: título (lead, 12 px, 0.55 s). Los siguientes bloques de copy arrancan con `stagger(0.12, easeOut)`, huecos más cortos hacia el final. El media entra con 8 px y el mismo ease, retrasado como apoyo (`staggerDelaySeconds(3)` con paso de marketing). Con reduced motion, copy y media solo cambian opacidad, juntos, en 0.12 s.
3. **Stagger reveal y tarjetas AE.** Ítem 0 en 0 ms, ítem 1 a 50 ms, y el hueco se encoge. Del sexto en adelante comparten el delay del sexto, siempre bajo 300 ms. Reduced motion: opacidad 0.12 s, `data-delay="0"`.
4. **Notificaciones expandidas.** Todas las filas usan `retana-notice-in` (280 ms) sin delay. Con reduced motion, `retana-notice-fade` (120 ms, solo opacidad).
5. **Reacciones y teclas.** Un solo beat de entrada del grupo. La salida es más corta y vuelve por el mismo eje (`x: -6` o `scale`/`y` de la entrada).

## Interaction Lab

Revisión de https://aiforui.dev/lab el 2026-11-04. Veredicto: **descartar como código**.

- La hoja de ejemplo (`transform` 400 ms, `cubic-bezier(0.32, 0.72, 0, 1)`) no se copia. `bottom-sheet` ya tiene su spring y separa scroll y gesto.
- EASE, KEYFRAMES y SPRING son bancos para una curva o un resorte. No enseñan orden entre varios elementos. Los resortes siguen en `motionPresets`.
- PALIMPSEST (borrador que cede al texto final) coincide con la idea de crossfade en un contenedor. Eso ya está en `popLayout`. No se porta el umbral ni el shader.

## ¿`/choreograph` entra como skill oficial?

**Sí, como fase, no como cuarto skill que corre siempre.**

| Skill existente (hub; no está en este repo) | Qué decide | Dónde queda choreograph |
| --- | --- | --- |
| Decidir si algo debe moverse | Antes | No lo reemplaza. |
| `animate` | Curva, duración y origen de **un** elemento | Después, o en paralelo solo para el lead. |
| `review-animations` | Auditoría | Aquí corre el lint de alta frecuencia y revisa padre+hijos, techo de 300 ms y colapso con reduced motion. |
| `improve-animations` | Corrección | Aplica `staggerDelaySeconds` / `resizeFadeDuration` y quita el stagger de menús. |

**Disparador:** el evento mueve dos o más cosas (`stagger`, `staggerChildren`, `delayChildren`, `animation-delay` por índice, cambio de vista en el mismo contenedor, salida que debe soltar el layout, “se siente lento al abrir”).

**No** dispararlo para un hover de un solo botón, un spinner o un shimmer.

**No** vender el `SKILL.md` completo dentro del hub. La licencia MIT obliga a conservar el copyright si se copia el texto. Basta la regla de abajo, el pin `c8a79627` y los números de `motion.ts`.

## Comparación con ui-system 4.0.0 (`419ad648`)

Los ids están en `knowledge/rules.yaml`. No hay una regla de coreografía, stagger, `popLayout` ni familia de timing. `RUI-ANIM-PERF-001…007` dicen **qué propiedad** se puede animar. `/choreograph` dice **en qué orden** se mueven varias. No se duplican. La frase “solo transform y opacity” de la propuesta de coreografía se apoya en PERF-002; no la repite como regla nueva.

| Regla del hub | Dónde | Qué exige | Relación con `/choreograph` |
| --- | --- | --- | --- |
| RUI-ANIM-PERF-001 | `knowledge/rules.yaml:117`. Lint `anim_perf_lint.mjs:5` y `:49`. SKILL.md `:209` | Nada de `transition: all`, `transition-all` ni `transition` sin propiedad | **Ya cubierto, otro eje.** El diff no introduce `transition-all`. El lint no marcó 001 en los 14 archivos tocados. |
| RUI-ANIM-PERF-002 | `rules.yaml:118`. Lint `:6`, `:144`. SKILL.md `:210`. Nota: excepción citada para `height: auto` | No animar layout; usar `scale()` / `translate()` | **Ya cubierto como prohibición de propiedades.** La coreografía no la sustituye. El lint sí marca `height` previo en `comment-thread.tsx:368-370` y `shortcut-recorder.tsx:641`, `:642`, `:839`, `:858` (listas que abren en altura). Es el caso de la nota de excepción; no viene de este aprendizaje y no se reescribe aquí. |
| RUI-ANIM-PERF-003 | `rules.yaml:119`. Lint `:7` | No animar `box-shadow` | **Ya cubierto.** Se quitó `transition-shadow` de `card-shell.tsx` (el hover de sombra queda sin transición). El lint no marcó 003 en el diff. |
| RUI-ANIM-PERF-004 | `rules.yaml:120`. Lint `:8`, `:146`. SKILL.md `:212` | `blur()` animado &lt; 20 px | **Ya cubierto.** Los blurs de este diff usan `motionPresets.blur.subtle` (2 px). El lint no marcó 004. |
| RUI-ANIM-PERF-005 | `rules.yaml:121`. Lint `:9`, `:153` | En un handler por frame no escribir variables CSS heredadas | **Ya cubierto como regla de rendimiento, no de coreografía.** El lint marca `user-menu.tsx:232` (`--index` del control segmentado, no es un frame) y `:380-381` (`--origin-x/y` al colocar el panel, con listener de `scroll`). Son señales previas del archivo; el origen se escribe en el propio panel, no en un árbol grande por frame. No se cambia en esta ronda. |
| RUI-ANIM-PERF-006 | `rules.yaml:122`. Lint `:10` | `will-change` solo en el elemento que anima, solo `transform`/`opacity` | **Ya cubierto.** El lint no marcó 006. |
| RUI-ANIM-PERF-007 | `rules.yaml:123`. AUDITOR.md `:197` y `:206`. SKILL.md `:216` | Sin `setState` por frame; el movimiento de carga/navegación va en CSS o WAAPI | **Ya cubierto como juicio.** Las entradas de esta ronda usan Motion/`AnimatePresence`, no `setState` por frame. El hold táctil hace un solo `setState` al cumplir los 360 ms, no por frame. |
| UIS-LAYOUT-002 | `rules.yaml:91` | La página carga con `scrollY === 0` | **Sin relación.** No habla de stagger ni de gesto. Las páginas de ejemplo no hacen scroll al montar por este diff. |
| a11y, reduced motion | `rules/a11y.md:10` | Respetar `prefers-reduced-motion`; nada de parpadeos &gt; 3/s | **La prosa existe; no dice cómo colapsar una coreografía.** `RUI-ANIM-CHOREO-001` precisa ese cómo (sin delays ni desplazamiento, opacidad compartida). No copia la línea 10. |
| a11y, objetivo | `rules/a11y.md:9` | Hit area ≥ 24 px (AA) y ≥ 44 px recomendado en táctil | **No es coreografía.** El chip de calendario que tocamos queda en `min-h-6` (24 px). 44 px sigue siendo recomendación de layout, no de este aprendizaje. |
| layout, táctil | `rules/layout.md:12` | Responsive desde móvil; áreas táctiles ≥ 44 px (ver `a11y.md`) | **No se duplica.** 44 px es objetivo de layout. Esta ronda no agranda la rejilla del calendario a 44 px. |

### `anim_perf_lint.mjs`

No se commitea: es herramienta del hub (cabecera MIT de `emilkowalski/skills@2d22863`, empaquetada en el snapshot privado). Se ejecutó desde la copia en `/tmp`.

```
node /tmp/lint-run/tools/anim_perf_lint.mjs /agent/repos/retana-ui \
  --files registry/blocks/ae/card-shell.tsx,registry/blocks/hero-section.tsx,registry/lib/ae-dash.ts,registry/lib/motion.ts,registry/ui/comment-thread.tsx,registry/ui/multi-view-fields.tsx,registry/ui/notification-stack.tsx,registry/ui/shortcut-recorder.tsx,registry/ui/slide-to-confirm.tsx,registry/ui/stagger-reveal.tsx,registry/ui/user-menu.tsx,registry/ui/view-calendar.tsx,registry/ui/view-kanban.tsx,registry/ui/view-timeline.tsx \
  --json
```

Exit code: **1**. `status: fail`, 14 archivos, 10 flags. Ninguno es de las reglas nuevas de coreografía (el lint no las conoce). Los 10 son PERF-002 (7, `height` previo) y PERF-005 (3, variables de posición del menú). 001, 003, 004 y 006: cero flags.

## Propuesta para VibeBot — `RUI-ANIM-CHOREO-001`

No duplica `RUI-ANIM-PERF-001…007` ni `UIS-LAYOUT-002`. Esas reglas no nombran stagger, orden, crossfade ni el colapso de una secuencia. La propuesta no repite “prohibido `transition: all`” ni “no animar width/height”: eso ya es PERF-001 y PERF-002. Formato de `knowledge/rules.yaml`. No se escribió en el hub.

```yaml
- id: RUI-ANIM-CHOREO-001
  title: "Una coreografía por evento: sin doble entrada, sin stagger en UI frecuente, delays con tope"
  description: >-
    Si un contenedor ya entra, sus hijos aparecen con él. Prohibido el stagger en menús,
    dropdowns, command palette, tabs y filas que se abren seguido o con teclado. El stagger
    uniforme está prohibido: el lead viaja más, el apoyo menos, la decoración solo desvanece.
    En producto, 30–80 ms entre ítems, tope del grupo ~300 ms, y desde el sexto ítem el mismo
    delay que el sexto. En marketing o primera visita, 100–150 ms sobre entradas de 0.5–0.6 s.
    Quien sale deja el flujo al instante (popLayout o absolute). Un cambio de vista en el mismo
    contenedor es crossfade, salvo dos estados densos que se pisarían. Una sola familia de
    timing por componente. Si la altura del contenedor cambia, el fade dura
    clamp(0.15s, Δpx/500, 0.27s). Las salidas son simultáneas, más cortas que la entrada y en
    espejo; la dirección viaja en custom. La secuencia se puede cortar. Un loop que invita al
    clic espera ~2.5 s y repite cada ~6 s. Con prefers-reduced-motion se quitan delays y
    desplazamiento y queda un fade de opacidad compartido (precisión de rules/a11y.md L10, no
    un sustituto). Las propiedades animables siguen en RUI-ANIM-PERF-001…007.
  severity: major
  category: rendimiento
  check: lint
  check_tool: "retana-ui __tests__/choreography-lint.test.ts (alta frecuencia); el resto es juicio con cita"
  origin:
    source: "emilkowalski/skills@c8a79627b59d72d764d6ab6f2c87c09a48169833 skills/choreograph (MIT, Copyright (c) 2026 Emil Kowalski)"
    date: 2026-11-04
  status: proposed
```

El lint de alta frecuencia de `__tests__/choreography-lint.test.ts` cubre la prohibición de stagger en menús y filas. El resto de la regla es juicio hasta que el hub tenga un check.
