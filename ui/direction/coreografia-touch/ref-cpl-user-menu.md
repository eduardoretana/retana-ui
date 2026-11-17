# REF-cpl-user-menu · referencia visual de `user-menu` en CPL

- reference_id: `REF-cpl-user-menu`
- screen_id: `user-menu`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`next build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/user-menu`, arnés `21db9481b331` (`shoot.mjs`), claro y oscuro, reduced motion.
- valid_for_spec_version: `1.0.0` de `ui/specs/coreografia-touch.spec.md`
- status: `current`
- licencia: capturas propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-sweep2` (MANIFEST.sha256 `a6ed2081dd628e9e9af5a8337fa8840c4e61d42030ab84e3e62aa759d26de1fb`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/user-menu/desktop-light-reduced.png` | `21266ae7bca451a490952e564cbb8dd58544a74382d0ee9984179b3fe1a0628f` |
| `before/user-menu/desktop-dark-reduced.png` | `927dba2af57a3a8d81ff1b7612af86fcaa9294ca0332f802f8b86d4887e20413` |
| `before/user-menu/390-light-reduced.png` | `c3910654e75f9d76c2d15b98016ac7e4810598f665dd85fab39d64e3fd29b49b` |
| `before/user-menu/390-dark-reduced.png` | `9014a6ba4a37bca54c1d298b53336edffa5567d1547ce1e1bd0da214d770ab12` |

Uso: la pieza ya existe en CPL. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad. Las desviaciones están en `ui/direction/coreografia-touch/direction-map.md`, cada una con su cita.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una decisión de Eduardo ni una excepción D2.

Revisión de ficha: 6
