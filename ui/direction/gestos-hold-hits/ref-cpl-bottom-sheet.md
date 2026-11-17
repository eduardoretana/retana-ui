# REF-cpl-bottom-sheet · referencia visual de `bottom-sheet` en CPL

- reference_id: `REF-cpl-bottom-sheet`
- screen_id: `bottom-sheet`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`pnpm build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/bottom-sheet`, arnés `21db9481b331` (`shoot.mjs`), tema capturado, reduced motion.
- valid_for_spec_version: `0.1.1` de `ui/specs/gestos-hold-hits.spec.md`
- status: `current`
- licencia: imágenes propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-gestos-agenda` (MANIFEST.sha256 `6828c0243bd35365eb3f3bf5a5ea4557dbe7cd53b616736e4792ffa754af0ff2`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/bottom-sheet/desktop-light-reduced.png` | `2bad278fc77668b58b3a344e9441b0f462a8bcde7d55291fb2f0ee078375226f` |
| `before/bottom-sheet/desktop-dark-reduced.png` | `6cda7d2be8c6395e114e6bc236a739bd8d7adf3c324cbd97328262d33fa1102f` |
| `before/bottom-sheet/390-light-reduced.png` | `572b2de1eee39f342b7a58b925b951edee2474cd7effd8d38ec311a338788896` |
| `before/bottom-sheet/390-dark-reduced.png` | `4b0650d82b96ffa5cc9d78a7c572fb9452d218537c81fd547dfb5fa2bddfc4d6` |

Uso: la pieza ya existe. El ciclo cambia el gesto y las escenas, no la composición. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una excepción D2.
