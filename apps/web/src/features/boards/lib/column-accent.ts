/** Tailwind classes that tint a column; whole class names so Tailwind can see them. */
export type ColumnAccent = { dot: string; surface: string; ring: string };

const rose: ColumnAccent = {
  dot: "bg-rose-500",
  surface: "bg-rose-500/5",
  ring: "ring-rose-500/20",
};

const accents: ColumnAccent[] = [
  rose,
  { dot: "bg-amber-500", surface: "bg-amber-500/5", ring: "ring-amber-500/20" },
  { dot: "bg-sky-500", surface: "bg-sky-500/5", ring: "ring-sky-500/20" },
  {
    dot: "bg-violet-500",
    surface: "bg-violet-500/5",
    ring: "ring-violet-500/20",
  },
  {
    dot: "bg-emerald-500",
    surface: "bg-emerald-500/5",
    ring: "ring-emerald-500/20",
  },
  { dot: "bg-pink-500", surface: "bg-pink-500/5", ring: "ring-pink-500/20" },
];

/** Columns cycle through the accents by position. */
export function columnAccent(index: number): ColumnAccent {
  return accents[index % accents.length] ?? rose;
}
