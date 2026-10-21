import { expect, test } from "@playwright/test";

test("streaming fixture supports pause and resume", async ({ page }) => {
  await page.goto("/?page=streaming");
  await expect(page.getByTestId("streaming-fixture")).toBeVisible();
  await page.getByTestId("stream-pause").click();
  await expect(page.locator("[data-kamod-chart-surface]").first()).toBeVisible();
  await page.getByTestId("stream-live").click();
});
