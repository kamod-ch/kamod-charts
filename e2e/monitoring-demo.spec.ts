import { expect, test } from "@playwright/test";

test("monitoring demo supports live pause, gap data, zoom reset, and export", async ({ page }) => {
  await page.goto("/?page=monitoring");
  await expect(page.getByTestId("monitoring-fixture")).toBeVisible();
  await expect(page.locator("[data-kamod-sparkline]").first()).toBeVisible();

  await page.getByTestId("monitoring-pause").click();
  await page.getByTestId("monitoring-live").click();

  const cpuSurface = page.locator("[data-kamod-monitoring-cpu] [data-kamod-chart-surface]").first();
  await expect(cpuSurface).toBeVisible();

  const box = await cpuSurface.boundingBox();
  expect(box).not.toBeNull();
  const centerX = box!.x + box!.width * 0.5;
  const centerY = box!.y + box!.height * 0.5;
  await page.mouse.move(centerX, centerY);
  await page.keyboard.down("Alt");
  await page.mouse.wheel(0, -160);
  await page.keyboard.up("Alt");

  await page.getByTestId("monitoring-reset").click();
  await expect(cpuSurface).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("monitoring-export").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("monitoring-cpu.svg");

  await page.getByTestId("monitoring-performance").click();
  await expect(page.getByTestId("monitoring-perf-stats")).toBeVisible();
});
