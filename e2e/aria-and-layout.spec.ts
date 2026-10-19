import { expect, test } from "@playwright/test";

test("chart exposes title and description for assistive technologies", async ({ page }) => {
  await page.goto("/?mode=vertical");
  await expect(page.locator("[data-kamod-chart-surface] title")).toHaveText("Fixture bar chart");
  const surface = page.locator("[data-kamod-chart-surface]");
  await expect(surface).toHaveAttribute("aria-labelledby", /.+/);
  await expect(surface).toHaveAttribute("aria-describedby", /.+/);
});

test("tooltip stays visible in a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/?mode=vertical");
  const bar = page.locator("[data-kamod-chart-bar]").first();
  const box = await bar.boundingBox();
  if (!box) {
    throw new Error("expected bar box");
  }
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const tooltip = page.locator("[data-kamod-chart-tooltip]");
  await expect(tooltip).toBeVisible();
  const tooltipBox = await tooltip.boundingBox();
  expect(tooltipBox).not.toBeNull();
  if (tooltipBox) {
    expect(tooltipBox.x).toBeGreaterThanOrEqual(0);
    expect(tooltipBox.x + tooltipBox.width).toBeLessThanOrEqual(360);
  }
});

test.describe("touch", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("tap selects a bar", async ({ page }) => {
    await page.goto("/?mode=vertical");
    const bar = page.locator("[data-kamod-chart-bar]").first();
    const box = await bar.boundingBox();
    if (!box) {
      throw new Error("expected bar box");
    }
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator("[data-testid=bar-click-result]")).toHaveText("value:0:42");
  });
});
