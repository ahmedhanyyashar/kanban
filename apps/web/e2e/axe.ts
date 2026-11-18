import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

/** WCAG 2.0 A and AA, WCAG 2.1 AA and axe's best practices. */
export const axeTags = ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"];

/**
 * Scans the page and fails on serious or critical violations, naming each one: the rule, what it
 * means and the first two elements. Returns every violation, so a test can look at the minor ones.
 */
export async function checkA11y(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(axeTags)
    .analyze();

  const blocking = violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  if (blocking.length > 0) {
    const report = blocking
      .map(
        (v) =>
          `[${(v.impact ?? "").toUpperCase()}] ${v.id}: ${v.description}\n` +
          v.nodes
            .slice(0, 2)
            .map((n) => `  -> ${n.target.join(" ")}`)
            .join("\n"),
      )
      .join("\n\n");
    throw new Error(`Accessibility violations found:\n\n${report}`);
  }

  return violations;
}
