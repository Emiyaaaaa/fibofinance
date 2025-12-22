export const financeType = [
  "cash",
  "current",
  "metal",
  "gold",
  "silver",
  "low",
  "medium",
  "high",
  "fixed",
  "realEstate",
  "other",
] as const;

export type ColorUtility = "bg" | "stroke" | "fill" | "text";

export const chartColors = {
  blue: {
    bg: "bg-blue-500",
    stroke: "stroke-blue-500",
    fill: "fill-blue-500",
    text: "text-blue-500",
  },
  primary: {
    bg: "bg-primary",
    stroke: "stroke-primary",
    fill: "fill-primary",
    text: "text-primary",
  },
  emerald: {
    bg: "bg-emerald-500",
    stroke: "stroke-emerald-500",
    fill: "fill-emerald-500",
    text: "text-emerald-500",
  },
  violet: {
    bg: "bg-violet-500",
    stroke: "stroke-violet-500",
    fill: "fill-violet-500",
    text: "text-violet-500",
  },
  amber: {
    bg: "bg-amber-500",
    stroke: "stroke-amber-500",
    fill: "fill-amber-500",
    text: "text-amber-500",
  },
  gray: {
    bg: "bg-gray-500",
    stroke: "stroke-gray-500",
    fill: "fill-gray-500",
    text: "text-gray-500",
  },
  cyan: {
    bg: "bg-cyan-500",
    stroke: "stroke-cyan-500",
    fill: "fill-cyan-500",
    text: "text-cyan-500",
  },
  pink: {
    bg: "bg-pink-500",
    stroke: "stroke-pink-500",
    fill: "fill-pink-500",
    text: "text-pink-500",
  },
  lime: {
    bg: "bg-lime-500",
    stroke: "stroke-lime-500",
    fill: "fill-lime-500",
    text: "text-lime-500",
  },
  fuchsia: {
    bg: "bg-fuchsia-500",
    stroke: "stroke-fuchsia-500",
    fill: "fill-fuchsia-500",
    text: "text-fuchsia-500",
  },
  "green-200": {
    bg: "bg-green-200",
    stroke: "stroke-green-200",
    fill: "fill-green-200",
    text: "text-green-200",
  },
  "blue-200": {
    bg: "bg-blue-200",
    stroke: "stroke-blue-200",
    fill: "fill-blue-200",
    text: "text-blue-200",
  },
  "gold-200": {
    bg: "bg-gold-200",
    stroke: "stroke-gold-200",
    fill: "fill-gold-200",
    text: "text-gold-200",
  },
  "stone-100": {
    bg: "bg-stone-100",
    stroke: "stroke-stone-100",
    fill: "fill-stone-100",
    text: "text-stone-100",
  },
  "amber-100": {
    bg: "bg-amber-100",
    stroke: "stroke-amber-100",
    fill: "fill-amber-100",
    text: "text-amber-100",
  },
  "orange-200": {
    bg: "bg-orange-200",
    stroke: "stroke-orange-200",
    fill: "fill-orange-200",
    text: "text-orange-200",
  },
  "red-300": {
    bg: "bg-red-300",
    stroke: "stroke-red-300",
    fill: "fill-red-300",
    text: "text-red-300",
  },
  "purple-200": {
    bg: "bg-purple-200",
    stroke: "stroke-purple-200",
    fill: "fill-purple-200",
    text: "text-purple-200",
  },
  "gray-200": {
    bg: "bg-gray-200",
    stroke: "stroke-gray-200",
    fill: "fill-gray-200",
    text: "text-gray-200",
  },
  white: {
    bg: "bg-white",
    stroke: "stroke-white",
    fill: "fill-white",
    text: "text-white",
  },
} as const satisfies {
  [color: string]: {
    [key in ColorUtility]: string;
  };
};

export const financeTypeColors = {
  cash: "green-200",
  current: "blue-200",
  metal: "gold-200",
  gold: "gold-200",
  silver: "white",
  low: "amber-100",
  medium: "orange-200",
  high: "red-300",
  fixed: "purple-200",
  realEstate: "purple-200",
  other: "gray-200",
} as const satisfies Record<(typeof financeType)[number], string>;

export const financeTypeOrder = [...financeType, ""];
