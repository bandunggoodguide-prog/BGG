export const PRODUCT_ICONS: Record<string, string> = {
  package: "📦",
  rice: "🍚",
  sugar: "🧂",
  oil: "🛢️",
  noodle: "🍜",
  drink: "🥤",
  water: "💧",
  snack: "🍪",
  cigarette: "🚬",
  soap: "🧼",
  shampoo: "🧴",
  egg: "🥚",
  vegetable: "🥬",
  fruit: "🍌",
  gas: "🔥",
  candy: "🍬",
  bread: "🍞",
  milk: "🥛",
  coffee: "☕",
  diaper: "👶",
  medicine: "💊",
  stationery: "✏️",
  battery: "🔋",
  chili: "🌶️",
  onion: "🧅",
  flour: "🌾",
  canned: "🥫",
  frozen: "🧊",
  spray: "🧽",
};

export const ICON_OPTIONS = Object.keys(PRODUCT_ICONS);

export function getProductEmoji(icon: string): string {
  return PRODUCT_ICONS[icon] ?? PRODUCT_ICONS.package;
}

export const COLOR_OPTIONS = [
  "slate",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "teal",
  "cyan",
  "blue",
  "indigo",
  "violet",
  "pink",
];

export const COLOR_BG_CLASS: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700",
  red: "bg-red-100 text-red-700",
  orange: "bg-orange-100 text-orange-700",
  amber: "bg-amber-100 text-amber-700",
  yellow: "bg-yellow-100 text-yellow-700",
  lime: "bg-lime-100 text-lime-700",
  green: "bg-green-100 text-green-700",
  teal: "bg-teal-100 text-teal-700",
  cyan: "bg-cyan-100 text-cyan-700",
  blue: "bg-blue-100 text-blue-700",
  indigo: "bg-indigo-100 text-indigo-700",
  violet: "bg-violet-100 text-violet-700",
  pink: "bg-pink-100 text-pink-700",
};

export function getColorClass(color: string): string {
  return COLOR_BG_CLASS[color] ?? COLOR_BG_CLASS.slate;
}
