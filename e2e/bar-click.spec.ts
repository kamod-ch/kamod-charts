import { expect, test } from "@playwright/test";

const clickBarCenter = async (page: import("@playwright/test").Page) => {
  const bar = page.locator("[data-kamod-chart-bar]").first();
  await expect(bar).toBeVisible();
  const box = await bar.boundingBox();
  if (!box) {
    throw new Error("expected bar bounding box");
  }
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
};

test.describe("BarChart pointer clicks", () => {
  test("vertical bars receive clicks with tooltip enabled", async ({ page }) => {
    await page.goto("/?mode=vertical");
    await clickBarCenter(page);
    await expect(page.locator("[data-testid=bar-click-result]")).toHaveText("value:0:42");
  });

  test("horizontal bars receive clicks with tooltip enabled", async ({ page }) => {
    await page.goto("/?mode=horizontal");
    await clickBarCenter(page);
    await expect(page.locator("[data-testid=bar-click-result]")).toHaveText("value:0:42");
  });

  test("tooltip still appears after pointer move with capture layer behind marks", async ({
    page,
  }) => {
    await page.goto("/?mode=vertical");
    const bar = page.locator("[data-kamod-chart-bar]").first();
    const box = await bar.boundingBox();
    if (!box) {
      throw new Error("expected bar bounding box");
    }
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator("[data-kamod-chart-tooltip]")).toBeVisible();
  });
});
