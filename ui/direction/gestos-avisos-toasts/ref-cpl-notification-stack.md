# REF-cpl-notification-stack · referencia visual de `notification-stack` en CPL

- reference_id: `REF-cpl-notification-stack`
- screen_id: `notification-stack`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`pnpm build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/notification-stack`, arnés `21db9481b331` (`shoot.mjs`), tema capturado, reduced motion.
- valid_for_spec_version: `0.1.1` de `ui/specs/gestos-avisos-toasts.spec.md`
- status: `current`
- licencia: imágenes propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-gestos-agenda` (MANIFEST.sha256 `6828c0243bd35365eb3f3bf5a5ea4557dbe7cd53b616736e4792ffa754af0ff2`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/notification-stack/desktop-light-reduced.png` | `c7191dfc72a286b4cb3179a1ae57e2510ea415c35ad391a9166327bd5943f610` |
| `before/notification-stack/desktop-dark-reduced.png` | `3316d0b2095d38b83273f0e3e7eebee20f9a98b6af644cc4658dd7e3141e89b1` |
| `before/notification-stack/390-light-reduced.png` | `02534228af37aaab32d2ec6fb84cdbfcbbb812e2fc5515627b25f9699447e022` |
| `before/notification-stack/390-dark-reduced.png` | `b6f021c16827cd0f7e1674e5fd8c9ecd94ff1d4548a3ccfe4b99413bec5bf77a` |

Uso: la pieza ya existe. El ciclo cambia el gesto y las escenas, no la composición. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una excepción D2.
