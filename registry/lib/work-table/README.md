# Tabla de trabajo

Clean-room de una tabla de trabajo con columnas y filas arrastrables. No se copió código, datos ni assets de librerías de pago. La pieza hereda los tokens del anfitrión y no trae tema.

## Instalar

```bash
npx shadcn@latest add @retana/work-table
npx shadcn@latest add @retana/work-table-toolbar
npx shadcn@latest add @retana/work-table-cells
```

Variantes:

```bash
npx shadcn@latest add @retana/work-table-board
npx shadcn@latest add @retana/work-table-tree
npx shadcn@latest add @retana/work-table-queue
npx shadcn@latest add @retana/work-table-support
```

Si el CLI pregunta si debe sobrescribir `button`, `checkbox`, `dropdown-menu`, `input`, `select`, `table`, `tooltip`, `avatar`, `popover`, `skeleton` o `status-pill`, la respuesta es **no**.

Los datos cambian solo por `onReorder`, `onMove`, `onUpdate`, `onAssign` y `onRemove`. No hay SDK de backend en `ui/`.
