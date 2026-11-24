---
spec_id: text-scramble
version: 0.1.0
profile: STANDARD
ui_system: 4.0.0
retana_ui:
  sha: bf1682d4dfb8696ddb01bf84aedda111f47b086c
  registry_source: git-sha
spec_changelog:
  - version: 0.1.0
    origin: builder
    note: "Spec inicial. Encargo de EduardoBot (2026-11-24) relayado por el builder Retana UI: validar el post «Decoding interfaces» de Emil Kowalski y, si procede, adaptarlo."
states: [idle, running, done, reduced, empty, long, loading, error, swap, unmount, visible, "390"]
data_fixture: ui/direction/fixtures/text-scramble.yaml
direction:
  mode: visual
  reference_meta: ui/direction/text-scramble/reference-meta.yaml
  references:
    - reference_id: REF-cpl-text-reveal
      screen_id: text-scramble
      kind: visual
      path: ui/direction/text-scramble/ref-cpl-text-reveal.md
      sha256: c3ef6603199b680665cd62084f87bf54643c03e2a16d6774a3077d15bdf6dfeb
      chosen_at_spec_version: "0.1.0"
      valid_for_spec_version: "0.1.0"
      status: current
    - reference_id: REF-emil-decoding
      screen_id: all
      kind: code
      path: ui/direction/text-scramble/ref-emil-decoding.md
      sha256: 3b7e2722dfdc5077eba9c6f6b2925907d6d6790593dd4d440622b4c9f5ceaa12
      chosen_at_spec_version: "0.1.0"
      valid_for_spec_version: "0.1.0"
      status: current
---

# Texto que se descifra (`text-scramble`)

Perfil STANDARD propuesto por el builder: es una pieza nueva del registry con movimiento propio y un riesgo declarado (`RUI-ANIM-PERF-007`). La confirmación del perfil es del UI Lead.

## Perfil y estados

- **Profile**: STANDARD
- **UI intent**: APPLIES
- **States**: idle, running, done, reduced, empty, long, loading, error, swap, unmount, visible, 390

## Criterios de aceptación

| ID | Criterio | Medida | Prueba |
| --- | --- | --- | --- |
| AC-1 | Con progreso 0 cada carácter no blanco es un glifo de ruido; con progreso 1 es el texto final; los espacios nunca cambian; la longitud se conserva (incluso con acentos, ñ, emoji y RTL). | `scrambleFrame`. | `__tests__/text-scramble.test.tsx` «TS-FRAME»; «TS-BREAK-UNICODE» |
| AC-2 | Los caracteres se fijan en orden de lectura con huecos que se encogen y jitter determinista; al final todos están fijados. | `scrambleSchedule`. | «TS-SCHEDULE» |
| AC-3 | El lector de pantalla oye una sola vez el texto final: frase en `sr-only`, capa visual `aria-hidden`, sin `aria-live`. | Árbol de accesibilidad. | «TS-A11Y»; `ariaSnapshot` en `capturas/despues-decode-records.json` |
| AC-4 | El HTML del servidor ya trae el texto final en el flujo; el ruido va encima (`absolute inset-0`), sin salto de layout. | Marcado SSR y rects. | «TS-NOJS»; CLS en `despues-decode-records.json` |
| AC-5 | Con `prefers-reduced-motion: reduce` el texto final aparece de inmediato, sin rAF, y `onDecoded` se llama una vez. | Atributos y espías. | «TS-REDUCED» |
| AC-6 | Una escritura de `textContent` por tick de 50 ms como máximo, sin lecturas de layout ni `setState` por frame; termina en la duración pedida. | Espías de rAF y `getBoundingClientRect`. | «TS-THROTTLE»; «TS-TOKENS» |
| AC-7 | Entrada única: se reproduce una vez; un texto nuevo después aparece sin ruido; un texto nuevo a mitad detiene el ruido; desmontar a mitad cancela el rAF. | Estado y espías. | «TS-ONCE»; «TS-BREAK-SWAP»; «TS-CANCEL» |
| AC-8 | `trigger="visible"` espera al 25 % en pantalla y observa una sola vez. | IntersectionObserver falso. | «TS-VISIBLE» |
| AC-9 | Texto vacío o > 120 caracteres omite el efecto; la duración se acota a 300–1200 ms; `charset` vacío y `delay` negativo o NaN caen a valores seguros. | Atributos `data-skipped` y tiempos. | «TS-LIMITS»; «TS-BREAK-CHARSET»; «TS-BREAK-DELAY» |
| AC-10 | Solo tokens del tema, sin hex, sin `dark:` de color, sin `transition-all`; `anim_perf_lint` pasa; 390 sin overflow horizontal; WCAG 2.2 AA sin violaciones de axe en reposo. | Validador del registry, lint y capturas. | «TS-TOKENS»; `anim_perf_lint`; `logs/axe-recheck-loading-a8ff.json` |
| AC-11 | La pieza opta a PLP con filled, empty, loading, error (más terminal y long); declara `@retana/motion-preference` y el crédito clean-room. `pnpm registry:build` en verde. | `registry.json` y `scenes.tsx`. | «TS-PLP»; `pnpm registry:build` |

## Uso permitido

Solo en el título o el hero de una página, una vez por visita, cuando el producto tiene un origen explicable en la terminal o el hardware. Nunca en listas, tablas, botones, toasts, navegación ni superficies que se ven muchas veces al día. Máximo dos textos con decode por vista (UI/UX Pro Max «Excessive Motion»).

## Dirección

Por referencia (`direction.mode: visual`). Detalle en `ui/direction/text-scramble/reference-meta.yaml`; mapa de desviaciones en `ui/direction/text-scramble/direction-map.md`; fixture en `ui/direction/fixtures/text-scramble.yaml`.

- `REF-cpl-text-reveal` (visual): `ui/direction/text-scramble/ref-cpl-text-reveal.md`
- `REF-emil-decoding` (code, clean-room): `ui/direction/text-scramble/ref-emil-decoding.md`

## Brief

- Outcome: un título que se «descifra» una vez, accesible, sin salto de layout y con reduced motion que muestra el texto final de inmediato.
- Sources: CPL `bf1682d4`; ui-system 4.x (hub `0218369e`); idea clean-room del post de Emil Kowalski (sin código ni licencia publicados).
- Scope: `registry/ui/text-scramble.tsx`, `registry.json`, `public/r/**`, `lib/generated/preview-map.tsx`, `app/examples/text-scramble/**`, pruebas, `ui-tests/**`, `NOTICE`, `README.md`.
- Stop when: test, lint, typecheck:strict-host, registry:build sin diff, build y anim_perf_lint en verde. PR solo draft, sin abrir desde este agente.

## Non-goals

Sin color ni imagen por carácter (costo de pintura, CORS y riesgo de destello; ver build-log), sin loop, sin dependencia de `motion` en el ítem, sin cambiar `text-reveal` ni `slot-text`.
