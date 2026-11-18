// @vitest-environment node
import { readFileSync } from "node:fs";

import { rgb, wcagContrast, type Rgb } from "culori";
import { describe, expect, it } from "vitest";

// WCAG 2 contrast of the theme's colour pairs, in both themes. A browser scan cannot cover every
// state (hover, dialogs, dark mode), so the palette itself is checked where it is defined.

const css = readFileSync(
  new URL("../../../packages/ui/src/globals.css", import.meta.url),
  "utf8",
);

function tokens(selector: string): Map<string, string> {
  const block = css.match(new RegExp(`${selector} \\{([^}]*)\\}`))?.[1] ?? "";
  const found = new Map<string, string>();
  for (const [, name, value] of block.matchAll(/--([\w-]+):\s*([^;]+);/g))
    if (name && value) found.set(name, value.trim());
  return found;
}

const light = tokens(":root");
const dark = new Map([...light, ...tokens(String.raw`\.dark`)]);

function colour(theme: Map<string, string>, name: string): Rgb {
  const c = rgb(theme.get(name) ?? "");
  if (!c) throw new Error(`No colour for --${name}`);
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return { mode: "rgb", r: clamp(c.r), g: clamp(c.g), b: clamp(c.b) };
}

/** `fg` on `bg`; `tint` mixes `fg` into `bg` at that opacity first (a `bg-x/10` badge). */
function contrast(
  theme: Map<string, string>,
  fg: string,
  bg: string,
  tint = 0,
): number {
  const top = colour(theme, fg);
  const bottom = colour(theme, bg);
  const mix = (t: number, b: number) => t * tint + b * (1 - tint);
  const surface: Rgb = {
    mode: "rgb",
    r: mix(top.r, bottom.r),
    g: mix(top.g, bottom.g),
    b: mix(top.b, bottom.b),
  };
  return wcagContrast(top, surface);
}

const text = 4.5;
const textPairs: [string, string][] = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["muted-foreground", "background"],
  ["muted-foreground", "muted"],
  ["muted-foreground", "card"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
  ["sidebar-foreground", "sidebar"],
  ["sidebar-accent-foreground", "sidebar-accent"],
  ["primary", "background"],
  ["brand-700", "brand-50"],
  ["brand-700", "background"],
  ["brand-600", "background"],
  ["destructive", "background"],
];

describe.each([
  ["light", light],
  ["dark", dark],
])("%s theme contrast", (_name, theme) => {
  it.each(textPairs)("%s on %s is readable text", (fg, bg) => {
    expect(contrast(theme, fg, bg)).toBeGreaterThanOrEqual(text);
  });

  it.each(["low", "medium", "high", "urgent"])(
    "priority %s reads on its tinted badge",
    (level) => {
      expect(
        contrast(theme, `priority-${level}`, "card", 0.1),
      ).toBeGreaterThanOrEqual(text);
    },
  );

  it("destructive reads on its tinted badge", () => {
    expect(contrast(theme, "destructive", "card", 0.1)).toBeGreaterThanOrEqual(
      text,
    );
  });

  it("the focus ring stands out from the page (3:1 for non-text)", () => {
    expect(contrast(theme, "ring", "background")).toBeGreaterThanOrEqual(3);
  });
});
