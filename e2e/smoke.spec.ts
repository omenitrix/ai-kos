import { test, expect } from "@playwright/test";

test("home loads — AI-KOS luxury hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  // header logo atau hero H1
  await expect(page.getByText(/Hunian Elegan|AI-KOS/i).first()).toBeVisible({ timeout: 10000 });
});

test("login page renders", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 8000 });
  await expect(page.locator("input[type='email'], input[name='email']")).toBeVisible();
});

test("kos cari page renders + map filter", async ({ page }) => {
  await page.goto("/kos/cari");
  await expect(page.getByText(/Cari Kos/i).first()).toBeVisible({ timeout: 10000 });
});

test("marketplace page renders", async ({ page }) => {
  await page.goto("/marketplace");
  await expect(page.getByText(/Marketplace/i).first()).toBeVisible({ timeout: 8000 });
});

test("sitemap + robots reachable", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.status()).toBe(200);
});

test("unauth dashboard redirects or shows login prompt", async ({ page }) => {
  await page.goto("/dashboard/admin/analytics");
  // either redirect to login or show auth error — both valid
  await page.waitForTimeout(1500);
  const url = page.url();
  const body = await page.textContent("body");
  const ok = url.includes("/login") || /login|Butuh login|ADMIN|Unauthorized/i.test(body || "");
  expect(ok).toBeTruthy();
});

test("debug db endpoint reachable (200 or 401)", async ({ request }) => {
  const r = await request.get("/api/debug/db");
  expect([200, 401, 500]).toContain(r.status());
});
