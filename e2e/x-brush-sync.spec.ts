import { expect, test } from "@playwright/test";

test("brush, trailing button, and synced charts share xDomain", async ({ page }) => {
  await page.goto("/?page=brush");
  const brush = page.locator("[data-kamod-cartesian-x-brush]").first();
  await expect(brush).toBeVisible();

  await page.getByTestId("window-3h").click();
  await expect(page.getByTestId("sync-x-domain-start")).toContainText("T20:00:00.000Z");

  const box = await brush.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.35, box!.y + box!.height / 2, { steps: 6 });
  await page.mouse.up();

  await expect(page.locator("[data-kamod-chart-surface]").nth(1)).toBeVisible();
});
