import { z } from "zod";

import { expect, test } from "./fixtures";

// The AI dialog from the column menu to the board, with the model's answer replaced in the browser: the
// provider is slow and paid, and the API's own tests cover how it is called and how its failures read.

const created = z.object({
  data: z.object({ board: z.object({ id: z.string() }) }),
});

test("drafted tasks reach the board only when the person adds them", async ({
  page,
}) => {
  const response = await page.request.post("http://localhost:3001/boards", {
    headers: { Origin: "http://localhost:3100" },
    data: { title: "AI planning" },
  });
  expect(response.ok()).toBe(true);
  const boardId = created.parse(await response.json()).data.board.id;

  await page.route("**/ai/tasks/generate", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: {
          persisted: false,
          tasks: [
            { title: "Draft the plan", description: "", priority: "high" },
            { title: "Review it", description: "", priority: "medium" },
          ],
        },
      },
    }),
  );

  await page.goto(`/board/${boardId}`);
  const todo = page.getByRole("region", { name: "Todo" });
  await todo.getByRole("button", { name: "Column actions" }).click();
  await page.getByRole("menuitem", { name: /Generate with AI/ }).click();
  await page.getByLabel("Project goal").fill("Plan the launch");
  await page.getByRole("button", { name: "Generate tasks" }).click();

  // the drafts are shown, and nothing is saved yet
  await expect(page.getByText("Draft the plan")).toBeVisible();
  await expect(todo.getByText("Draft the plan")).toHaveCount(0);

  await page.getByRole("button", { name: /Add all to/ }).click();
  await expect(todo.getByText("Draft the plan")).toBeVisible();
  await expect(todo.getByText("Review it")).toBeVisible();
});
