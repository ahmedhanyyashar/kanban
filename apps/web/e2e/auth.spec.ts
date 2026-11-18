import { test as visitor } from "@playwright/test";

import { expect, test } from "./fixtures";

// Signing up, signing in and out, and where the return address leads, against the real API.

visitor(
  "a new person signs up, lands in the app and signs out again",
  async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Full name").fill("Ada Lovelace");
    await page.getByLabel("Email").fill(`ada-${Date.now()}@example.com`);
    await page.getByLabel("Password").fill("password1234");
    await page.getByRole("button", { name: "Create account" }).click();

    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    // the page being left is remembered, so signing in again returns there
    await expect(page).toHaveURL(/\/sign-in(\?redirect=.*)?$/);
  },
);

visitor("a wrong password is refused, with the reason", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByText("Invalid email or password")).toBeVisible();
  await expect(page).toHaveURL(/\/sign-in$/);
});

visitor(
  "a page that needs a session sends the visitor to sign in, remembering the page",
  async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/sign-in\?redirect=%2Fsettings$/);
  },
);

test("signing in follows a return address on this site and ignores one that leaves it", async ({
  page,
  context,
  account,
}) => {
  const signIn = async (redirect: string) => {
    await context.clearCookies();
    await page.goto(`/sign-in?redirect=${encodeURIComponent(redirect)}`);
    await page.getByLabel("Email").fill(account.email);
    await page.getByLabel("Password").fill(account.password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(
      page.getByRole("button", { name: "Account menu" }),
    ).toBeVisible();
  };

  await signIn("/settings");
  await expect(page).toHaveURL(/\/settings$/);

  await signIn("https://evil.example/steal");
  expect(new URL(page.url()).origin).toBe("http://localhost:3100");
});

test("someone who is signed in has no use for the sign-in page", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await expect(page).not.toHaveURL(/\/sign-in/);
});
