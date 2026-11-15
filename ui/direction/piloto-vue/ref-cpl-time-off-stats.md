# REF-cpl-time-off-stats · referencia visual de `time-off-stats` en CPL

- reference_id: `REF-cpl-time-off-stats`
- screen_id: `time-off-stats`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`next build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/time-off-stats`, arnés `21db9481b331` (`shoot.mjs`), claro y oscuro, reduced motion.
- valid_for_spec_version: `1.0.0` de `ui/specs/piloto-vue.spec.md`
- status: `current`
- licencia: capturas propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-sweep2` (MANIFEST.sha256 `a6ed2081dd628e9e9af5a8337fa8840c4e61d42030ab84e3e62aa759d26de1fb`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/time-off-stats/desktop-light-reduced.png` | `232db0289860a899334535271c621962f83146fcf40247544dcb83bf6d1b6d60` |
| `before/time-off-stats/desktop-dark-reduced.png` | `317435cd7d79f95f9ac66e4e073df9e70771ecf17ba460a1242b4d92efcf9a49` |
| `before/time-off-stats/390-light-reduced.png` | `660cbf5bcb6b7297e0ab1a7424df0c39fc2f0fa959a7b996c4014c27a1108f26` |
| `before/time-off-stats/390-dark-reduced.png` | `b7be164b36e75c3f2b07c9186c0a795afe87a5614b6e95630a12e8de8d21955d` |

Uso: la pieza ya existe en CPL. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad. Las desviaciones están en `ui/direction/piloto-vue/direction-map.md`, cada una con su cita.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una decisión de Eduardo ni una excepción D2.

Revisión de ficha: 1
