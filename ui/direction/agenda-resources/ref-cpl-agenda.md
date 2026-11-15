# REF-cpl-agenda · referencia visual de `agenda` en CPL

- reference_id: `REF-cpl-agenda`
- screen_id: `agenda`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`pnpm build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/agenda`, arnés `21db9481b331` (`shoot.mjs`), tema capturado, reduced motion.
- valid_for_spec_version: `0.1.1` de `ui/specs/agenda-resources.spec.md`
- status: `current`
- licencia: imágenes propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-gestos-agenda` (MANIFEST.sha256 `6828c0243bd35365eb3f3bf5a5ea4557dbe7cd53b616736e4792ffa754af0ff2`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/agenda/desktop-light-reduced.png` | `c679eee7d9875d00b62fe00c1c871b6621666e8cee755abaa5ec15b773c8c4a7` |
| `before/agenda/desktop-dark-reduced.png` | `6984fde6e575867c7683d27565430e7312a3fec8260c8b5a6c6af328634bc3ab` |
| `before/agenda/390-light-reduced.png` | `fc6374f959c7872cc20961888d4dae659fe6726cf617aefe773d664be55e802c` |
| `before/agenda/390-dark-reduced.png` | `fd91b88b5690ffff82b9313917d393965f37a9e654ea12647c95eaba8d384417` |

Uso: la pieza ya existe. El ciclo cambia el gesto y las escenas, no la composición. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una excepción D2.
