import { expect, isolated, test } from "./fixtures";

// One person's path through the board, against the real API: what the unit specs cannot show is
// that the screens, the API and the live updates agree.

isolated(
  "a board, a task, a move and a live edit",
  async ({ page, context }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("No boards yet").first()).toBeVisible();

    await page.getByRole("button", { name: "Create a board" }).click();
    await page.getByLabel("Board name").fill("Launch");
    await page.getByRole("button", { name: "Create board" }).click();
    await expect(page).toHaveURL(/\/board\//);

    const todo = page.getByRole("region", { name: "Todo" });
    const doing = page.getByRole("region", { name: "In Progress" });

    await todo.getByRole("button", { name: "Add task", exact: true }).click();
    await page.getByLabel("Title").fill("Ship it");
    await page.getByRole("button", { name: "Create task" }).click();
    await expect(todo.getByText("Ship it")).toBeVisible();

    // a real pointer drag: the board reads pointer movement, not clicks
    // the new card slides in: measure it once it has stopped
    const label = todo.getByText("Ship it");
    let card = await label.boundingBox();
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(100);
      const next = await label.boundingBox();
      const still = next?.x === card?.x && next?.y === card?.y;
      card = next;
      if (still) break;
    }
    const target = await doing.boundingBox();
    if (!card || !target) throw new Error("the board did not lay out");
    await page.mouse.move(card.x + 20, card.y + 10);
    await page.mouse.down();
    // the board follows the pointer frame by frame, so the pointer travels in small, spaced steps
    const to = { x: target.x + target.width / 2, y: target.y + 120 };
    for (let i = 1; i <= 25; i++) {
      await page.mouse.move(
        card.x + 20 + ((to.x - card.x - 20) * i) / 25,
        card.y + 10 + ((to.y - card.y - 10) * i) / 25,
      );
      await page.waitForTimeout(20);
    }
    await page.mouse.up();
    await expect(doing.getByText("Ship it")).toBeVisible();

    await page.reload();
    await expect(doing.getByText("Ship it")).toBeVisible();

    // a second tab of the same person sees an edit made in the first
    const other = await context.newPage();
    await other.goto(page.url());
    await expect(
      other.getByRole("region", { name: "In Progress" }).getByText("Ship it"),
    ).toBeVisible();

    await doing.getByText("Ship it").click();
    await page.getByLabel("Title").fill("Shipped");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(
      other.getByRole("region", { name: "In Progress" }).getByText("Shipped"),
    ).toBeVisible();
  },
);

test("a column that holds tasks cannot be deleted from the menu", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Create a board" }).click();
  await page.getByLabel("Board name").fill("Guarded");
  await page.getByRole("button", { name: "Create board" }).click();

  const todo = page.getByRole("region", { name: "Todo" });
  await todo.getByRole("button", { name: "Add task", exact: true }).click();
  await page.getByLabel("Title").fill("Keep me");
  await page.getByRole("button", { name: "Create task" }).click();
  await expect(todo.getByText("Keep me")).toBeVisible();

  await todo.getByRole("button", { name: "Column actions" }).click();
  await expect(page.getByRole("menuitem", { name: /delete/i })).toBeDisabled();
});

isolated(
  "a session that ends somewhere else sends the person to sign in",
  async ({ page, context, request }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("button", { name: "Create a board" }),
    ).toBeVisible();

    // the session ends where this tab cannot hear of it: another device, or an expiry
    const cookie = (await context.cookies("http://localhost:3001"))
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");
    const ended = await request.post(
      "http://localhost:3001/api/auth/sign-out",
      {
        headers: { Origin: "http://localhost:3100", Cookie: cookie },
        data: {},
      },
    );
    expect(ended.ok()).toBe(true);

    // the next thing the tab asks for is refused, and that is all it takes
    await page.getByRole("button", { name: "Create a board" }).click();
    await page.getByLabel("Board name").fill("Too late");
    await page.getByRole("button", { name: "Create board" }).click();

    await expect(page).toHaveURL(/\/sign-in\?redirect=/);
    await expect(page.getByLabel("Email")).toBeVisible();
  },
);
