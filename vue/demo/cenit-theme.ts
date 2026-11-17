/** Hex de CENIT, solo para esta demo. No viaja en registry/ ni en la hoja de las piezas. */

const light = {
  dark: false,
  colors: {
    background: "#F3EFE6",
    "on-background": "#10201B",
    surface: "#FFFDF8",
    "on-surface": "#10201B",
    primary: "#244BD6",
    "on-primary": "#FFFFFF",
    secondary: "#4F5E57",
    error: "#B3261E",
    "serie-pista": "#EEEAE1",
    "serie-agente": "#2A78D6",
    "serie-humana": "#EB6834",
    "serie-neutra": "#78837D",
    "chart-4": "#236A27",
    "chart-5": "#8F5600",
    barra: "#10201B",
    "on-barra": "#FFFDF8",
    senal: "#FF6A3D",
    "on-senal": "#10201B",
    "retana-secondary": "#E9E3D5",
    "on-retana-secondary": "#10201B",
    "retana-accent": "#E9E3D5",
    "on-retana-accent": "#10201B",
    "sidebar-border": "#263A33",
  },
  variables: {
    "medium-emphasis-opacity": 0.7,
  },
}

const dark = {
  dark: true,
  colors: {
    background: "#0B1411",
    "on-background": "#ECE8DF",
    surface: "#131D19",
    "on-surface": "#ECE8DF",
    primary: "#93ABF7",
    "on-primary": "#10201B",
    secondary: "#A9B6AF",
    error: "#F2B8B5",
    "serie-pista": "#1E2924",
    "serie-agente": "#3987E5",
    "serie-humana": "#D95926",
    "serie-neutra": "#76847D",
    "chart-4": "#81C784",
    "chart-5": "#FFB74D",
    barra: "#18291F",
    "on-barra": "#FFFDF8",
    senal: "#FF6A3D",
    "on-senal": "#10201B",
    "retana-secondary": "#22302A",
    "on-retana-secondary": "#ECE8DF",
    "retana-accent": "#22302A",
    "on-retana-accent": "#ECE8DF",
    "sidebar-border": "#263A33",
  },
  variables: {
    "medium-emphasis-opacity": 0.7,
  },
}

export const cenitThemes = { light, dark }

export const cenitDefaults = {
  VCard: { rounded: "lg" },
  VChip: { size: "small", label: true, variant: "tonal" },
  VAlert: { variant: "tonal" },
}
