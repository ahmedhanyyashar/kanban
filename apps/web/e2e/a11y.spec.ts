import { expect, test } from "@playwright/test";

import { checkA11y } from "./axe";

// Automated checks find about a third of the issues: keep the manual review (screen reader, keyboard, zoom).

const pages = [
  { name: "Sign in", path: "/sign-in" },
  { name: "Sign up", path: "/sign-up" },
];

for (const { name, path } of pages) {
  test.describe(name, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
      // scan once the page has drawn its heading, not before
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });

    // both themes: contrast and focus styles differ between them
    for (const colorScheme of ["light", "dark"] as const) {
      test(`has no serious or critical accessibility violations (${colorScheme})`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme });
        await checkA11y(page);
      });
    }

    test("has exactly one level-one heading", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });

    test("has one main landmark", async ({ page }) => {
      await expect(page.getByRole("main")).toHaveCount(1);
    });
  });
}
