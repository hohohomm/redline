import { expect, test } from "@playwright/test";

test.describe("public smoke", () => {
  test("landing renders and has Redline wordmark", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/redline/i);
    // The wordmark text "Redline" appears somewhere in the landing.
    await expect(page.getByText(/Redline/i).first()).toBeVisible();
  });

  test("/demo loads with demo banner", async ({ page }) => {
    await page.goto("/demo");
    await expect(page.getByText(/You'?re exploring a demo/i)).toBeVisible();
    // Sidebar nav
    await expect(page.getByText(/Overview/i).first()).toBeVisible();
  });

  test("/demo/invoices lists invoices", async ({ page }) => {
    await page.goto("/demo/invoices");
    await expect(page.getByRole("heading", { name: /invoices/i })).toBeVisible();
    await expect(page.getByText(/INV-1024/)).toBeVisible();
  });

  test("/demo/invoices/inv-1024 opens invoice detail", async ({ page }) => {
    await page.goto("/demo/invoices/inv-1024");
    await expect(page.getByText(/INV-1024/).first()).toBeVisible();
    await expect(page.getByText(/Acme Corp/).first()).toBeVisible();
  });

  test("/login renders", async ({ page }) => {
    await page.goto("/login");
    // Either an email input or the word Login appears.
    const hasInput = await page.locator("input[type=email]").count();
    expect(hasInput).toBeGreaterThan(0);
  });

  test("/pricing renders", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText(/pricing/i).first()).toBeVisible();
  });

  test("/dashboard redirects unauthenticated to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("/r/testcode sets rl_ref cookie and redirects to /login", async ({ page, context }) => {
    await page.goto("/r/testcode");
    await expect(page).toHaveURL(/\/login/);
    const cookies = await context.cookies();
    const ref = cookies.find((c) => c.name === "rl_ref");
    expect(ref?.value).toBe("testcode");
  });
});
