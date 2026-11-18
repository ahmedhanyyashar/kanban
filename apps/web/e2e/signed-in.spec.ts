import { test as visitor, type Page } from "@playwright/test";

import { checkA11y } from "./axe";
import { expect, test } from "./fixtures";

// Every page behind the sign-in, in both themes, and on a phone-sized screen. One account for
// all of it: signing up is rate limited, and the pages only read what the account has.

/** The page has drawn its heading and its data has arrived (a loading note is gone). */
async function shown(page: Page) {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
}

const pages = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Settings", path: "/settings" },
];

test("every signed-in page is accessible in both themes and fits a phone", async ({
  page,
}) => {
  for (const { name, path } of pages) {
    await test.step(name, async () => {
      for (const colorScheme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        await shown(page);
        await checkA11y(page);
      }

      await page.setViewportSize({ width: 390, height: 800 });
      await page.goto(path);
      await shown(page);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${name} scrolls sideways`).toBeLessThanOrEqual(0);
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  }
});

visitor("an unknown address says so", async ({ page }) => {
  await page.goto("/no-such-page");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await checkA11y(page);
});
