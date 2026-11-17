# REF-cpl-toast-stack · referencia visual de `toast-stack` en CPL

- reference_id: `REF-cpl-toast-stack`
- screen_id: `toast-stack`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`pnpm build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/toast-stack`, arnés `21db9481b331` (`shoot.mjs`), tema capturado, reduced motion.
- valid_for_spec_version: `0.1.1` de `ui/specs/gestos-avisos-toasts.spec.md`
- status: `current`
- licencia: imágenes propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-gestos-agenda` (MANIFEST.sha256 `6828c0243bd35365eb3f3bf5a5ea4557dbe7cd53b616736e4792ffa754af0ff2`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/toast-stack/desktop-light-reduced.png` | `0ed0d33393365ab592ed52cd3a13802f399ad5deaab8b27f6e8b04e7bb43ad96` |
| `before/toast-stack/desktop-dark-reduced.png` | `e7c710ad4291790d1af861378968da0f7acbab8029f316ad6d4e419c416473e1` |
| `before/toast-stack/390-light-reduced.png` | `8965a1b72e13bd625e4926feb95c8b7d42a6e418dc794cd13e8c358e0eb20a01` |
| `before/toast-stack/390-dark-reduced.png` | `4efe228ea60c31039844d91399eb29a4a1d5dae272a0ad12f3b9c011e4a0b1e9` |

Uso: la pieza ya existe. El ciclo cambia el gesto y las escenas, no la composición. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una excepción D2.
