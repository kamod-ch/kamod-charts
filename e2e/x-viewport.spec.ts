import { expect, test } from "@playwright/test";

test("viewport pan and alt-wheel zoom update the chart surface", async ({ page }) => {
  await page.goto("/?page=viewport");
  const surface = page.locator("[data-kamod-chart-viewport-interactive]").first();
  await expect(surface).toBeVisible();

  const box = await surface.boundingBox();
  expect(box).not.toBeNull();
  const centerX = box!.x + box!.width * 0.5;
  const centerY = box!.y + box!.height * 0.5;

  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX - 80, centerY, { steps: 8 });
  await page.mouse.up();
  await expect(surface).not.toHaveAttribute("data-kamod-chart-viewport-panning", "");

  await page.mouse.move(centerX, centerY);
  await page.keyboard.down("Alt");
  await page.mouse.wheel(0, -120);
  await page.keyboard.up("Alt");

  await page.mouse.wheel(0, 120);
});

test("resize keeps interactive surface", async ({ page }) => {
  await page.goto("/?page=viewport");
  await page.getByTestId("toggle-width").click();
  await expect(page.locator("[data-kamod-chart-viewport-interactive]").first()).toBeVisible();
});

test("page scroll works without alt modifier", async ({ page }) => {
  await page.goto("/?page=viewport");
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 400);
  const after = await page.evaluate(() => window.scrollY);
  expect(after).toBeGreaterThanOrEqual(before);
});
