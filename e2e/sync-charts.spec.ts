import { expect, test } from "@playwright/test";

test("sync fixture renders paired time-series charts", async ({ page }) => {
  await page.goto("/?page=sync");
  await expect(page.getByRole("img", { name: /Hourly traffic/i })).toBeVisible();
  await expect(page.getByRole("img", { name: /Application clicks/i })).toBeVisible();
  await expect(page.locator("[data-kamod-chart-surface]")).toHaveCount(2);
});
