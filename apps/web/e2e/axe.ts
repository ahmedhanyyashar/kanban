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

/**
 * Scrolls through the page and waits for every finite animation to end, so a scan never reads an element
 * that is still fading in: the scroll starts the reveals, and contrast is computed from what is drawn.
 */
export async function settle(page: Page) {
  // twice: the library that reveals sections starts watching the scroll only after the page has
  // mounted, so a first pass made while it loads can go by unseen
  for (let pass = 0; pass < 2; pass++)
    await page.evaluate(async () => {
      const step = Math.max(window.innerHeight / 2, 200);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      window.scrollTo(0, 0);
    });
  // a reveal driven by script (not by the browser's animation engine) leaves its opacity in the element's
  // style while it runs: wait until those opacities stop changing, for at most five seconds
  await page.evaluate(async () => {
    const sample = () =>
      [...document.querySelectorAll('[style*="opacity"]')]
        .map((element) => getComputedStyle(element).opacity)
        .join(",");
    let last = sample();
    let still = 0;
    for (let i = 0; i < 50 && still < 3; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const now = sample();
      still = now === last ? still + 1 : 0;
      last = now;
    }
  });
  // an animation that loops for ever (a drifting background) never ends and is not waited for
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (animation) =>
          animation.playState !== "running" ||
          !Number.isFinite(animation.effect?.getComputedTiming().iterations),
      ),
  );
}
