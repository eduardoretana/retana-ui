# REF-cpl-hold-to-confirm · referencia visual de `hold-to-confirm` en CPL

- reference_id: `REF-cpl-hold-to-confirm`
- screen_id: `hold-to-confirm`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`pnpm build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/hold-to-confirm`, arnés `21db9481b331` (`shoot.mjs`), tema capturado, reduced motion.
- valid_for_spec_version: `0.1.1` de `ui/specs/gestos-hold-hits.spec.md`
- status: `current`
- licencia: imágenes propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-gestos-agenda` (MANIFEST.sha256 `6828c0243bd35365eb3f3bf5a5ea4557dbe7cd53b616736e4792ffa754af0ff2`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/hold-to-confirm/desktop-light-reduced.png` | `18661b92be7b20acadbcc37aa871ecb8f402e047ef2fa13c4f4c68e3c81415e2` |
| `before/hold-to-confirm/desktop-dark-reduced.png` | `611999d14ba2dc2f44f2504473d096e20e47bb5827c5a65412a3d919a33191b8` |
| `before/hold-to-confirm/390-light-reduced.png` | `567e550634fa7435819936bda538c041bee31e26c115391bd4a7096758f36c8f` |
| `before/hold-to-confirm/390-dark-reduced.png` | `1309ee2e7899108798e8337d7a9cf7dcaa7aa13fafed90473f19fd08a0bfe57b` |

Uso: la pieza ya existe. El ciclo cambia el gesto y las escenas, no la composición. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una excepción D2.
