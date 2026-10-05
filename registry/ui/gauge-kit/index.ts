"use client"

/** Adapted from Gauge UI (MIT). https://github.com/thordursk/gauge-ui */

export { Gauge, type GaugeFit, type GaugeProps } from "./gauge"
export { GaugeInset, type GaugeInsetProps } from "./inset"
export {
  useGauge,
  type GaugeContextValue,
  type GaugeDomainProps,
} from "./context"
export {
  GaugeTrack,
  GaugeArc,
  GaugeStack,
  GaugeZones,
  type GaugeArcProps,
  type GaugeStackPart,
  type GaugeStackProps,
  type GaugeZonesProps,
} from "./arcs"
export { GaugeControl, type GaugeControlProps } from "./control"
export {
  GaugeTicks,
  GaugeMarks,
  GaugeTickLabels,
  type GaugeTicksProps,
  type GaugeMarksProps,
  type GaugeTickLabelsProps,
} from "./ticks"
export {
  GaugeText,
  GaugeValue,
  type GaugeTextProps,
  type GaugeValueProps,
} from "./text"
export { GaugeDot, type GaugeDotProps } from "./dot"
export {
  GaugeNeedle,
  GaugeHub,
  type GaugeNeedleProps,
  type GaugeHubProps,
} from "./needle"
export {
  angleToValue,
  arcBox,
  arcPath,
  clamp,
  cutValues,
  degreesToRadians,
  polar,
  stepValues,
  valueToAngle,
  valueToTurnedAngle,
} from "./math"
export {
  clockLabel,
  clockTime,
  compassLabel,
  durationLabel,
  fadeColor,
  fontClass,
  weightClass,
  zoneColor,
  zoneCutoffs,
  type FontFamily,
  type FontWeight,
  type NeedleStyle,
  type StrokeCap,
  type TextAnchor,
  type Zone,
} from "./utils"
export {
  DEFAULT_TRANSITION,
  cubicBezier,
  easingFunction,
  resolveTransition,
  springPhysics,
  stepSpring,
  type GaugeEasing,
  type GaugeSpringTransition,
  type GaugeTransition,
  type GaugeTweenTransition,
} from "./transition"
export { useAnimatedValue } from "./use-animated-value"
export { AnimatedGauge, type AnimatedGaugeProps } from "./animated"
export {
  GaugeComposition,
  type GaugeCompositionProps,
} from "./composition"
export {
  gaugeTemplates,
  templateLayers,
  templatePreview,
  type GaugeTemplate,
  type TemplateInset,
} from "@/registry/retana/lib/gauge-kit/templates"
export { gaugeToCode } from "@/registry/retana/lib/gauge-kit/code"
export {
  ControlsStore,
  formatLabel,
  isHexColor,
  isPadValue,
  isTransitionConfig,
  snapToStep,
  stepDecimals,
  type ControlMeta,
  type ControlValue,
  type EasingConfig,
  type FlatValues,
  type PadAxis,
  type PadConfig,
  type PadValue,
  type PanelConfig,
  type SelectOption,
  type TransitionConfig,
} from "@/registry/retana/lib/gauge-kit/controls"
export type { GaugeLayer } from "@/registry/retana/lib/gauge-kit/layers"
export {
  buildSpec,
  css,
  palette,
  playModes,
  stepFor,
  withoutMeta,
  type PanelValues,
  type PlayMode,
} from "@/registry/retana/lib/gauge-kit/panels"
export { storageKeys, writeStored } from "@/registry/retana/lib/gauge-kit/storage"
export { useGaugeControllers } from "@/registry/retana/hooks/use-gauge-controllers"
export { useStoredValue } from "@/registry/retana/hooks/use-stored-value"
