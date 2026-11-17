# REF-cpl-slide-to-confirm · referencia visual de `slide-to-confirm` en CPL

- reference_id: `REF-cpl-slide-to-confirm`
- screen_id: `slide-to-confirm`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`pnpm build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/slide-to-confirm`, arnés `21db9481b331` (`shoot.mjs`), tema capturado, reduced motion.
- valid_for_spec_version: `0.1.1` de `ui/specs/gestos-seguimiento.spec.md`
- status: `current`
- licencia: imágenes propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-gestos-agenda` (MANIFEST.sha256 `6828c0243bd35365eb3f3bf5a5ea4557dbe7cd53b616736e4792ffa754af0ff2`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/slide-to-confirm/desktop-light-reduced.png` | `796e6f0cc7b55a0caaa66fac2d764c6413c17ac0af7505fb9591acee9ac6fee3` |
| `before/slide-to-confirm/desktop-dark-reduced.png` | `57e7b1ad75f52538d94fa255cd800913184bd981bcac236874ff6682223b8a2d` |
| `before/slide-to-confirm/390-light-reduced.png` | `d987c1be81aeab57d146777e397e26f5df20200d51e6697e8dc2f4af3870d3fe` |
| `before/slide-to-confirm/390-dark-reduced.png` | `c8c3748a435108eab3b9225931160a3f4f9949151eb6911b93678d58022253a2` |

Uso: la pieza ya existe. El ciclo cambia el gesto y las escenas, no la composición. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una excepción D2.
