import { expect, test } from "@playwright/test";

import { checkA11y, settle } from "./axe";

// Automated checks find about a third of the issues: keep the manual review (screen reader, keyboard, zoom).

const pages = [
  { name: "Landing", path: "/" },
  { name: "Sign in", path: "/sign-in" },
  { name: "Sign up", path: "/sign-up" },
];

for (const { name, path } of pages) {
  test.describe(name, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
      // scan once the page has drawn its heading, not before
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await settle(page);
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

// The scan cannot read every colour the buttons use, so this catches the plain case it can miss: a label
// drawn in the same colour as its own background.
test("no landing button has a label the colour of its background", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await settle(page);
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    const hidden = await page
      .locator('[data-slot="button"]')
      .evaluateAll((buttons) => {
        // a canvas turns any colour notation (rgb, oklch) into the same four numbers
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d");
        const rgba = (colour: string) => {
          context?.clearRect(0, 0, 1, 1);
          if (context) context.fillStyle = colour;
          context?.fillRect(0, 0, 1, 1);
          return context?.getImageData(0, 0, 1, 1).data.join(",");
        };
        return buttons
          .filter((button) => {
            const style = getComputedStyle(button);
            return rgba(style.color) === rgba(style.backgroundColor);
          })
          .map((button) => button.textContent?.trim());
      });
    expect(hidden, `unreadable buttons (${colorScheme})`).toEqual([]);
  }
});

test.describe("Landing keyboard use", () => {
  test("the first tab stop skips to the main content", async ({ page }) => {
    await page.goto("/");
    // the first visit may reload while the dev server optimizes its dependencies: wait for the page itself
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();

    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    // focus is now inside the main content, past the navigation
    await expect(page.locator("main :focus")).toHaveCount(1);
  });
});
