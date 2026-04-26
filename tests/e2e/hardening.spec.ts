import { expect, test } from "@playwright/test";

test.describe("hardening", () => {
  test("health endpoint returns expected shape", async ({ request }) => {
    const response = await request.get("/api/health");
    // 200 when all probes green, 503 locally when downstream creds are stubs.
    // Shape assertions always hold; env.ok true only when running against a
    // fully-configured deployment (prod or preview with full env).
    expect([200, 503]).toContain(response.status());

    const body = await response.json();
    expect(body).toHaveProperty("ok");
    expect(body).toHaveProperty("checks.env");
    expect(body).toHaveProperty("checks.supabase");
    expect(body).toHaveProperty("checks.stripe");
    expect(body).toHaveProperty("checks.resend");
    expect(body).toHaveProperty("version");
    expect(body).toHaveProperty("timestamp");

    // Full-green assertion only runs against a deployed target. Skipped locally
    // because dev .env.local is expected to contain stub credentials.
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "";
    if (baseURL && !baseURL.includes("localhost")) {
      expect(body.ok).toBe(true);
      expect(body.checks.env.ok).toBe(true);
    }
  });

  test("not-found page renders for undefined route", async ({ page }) => {
    await page.goto("/definitely-not-a-real-route");
    await expect(page.getByText(/Lost thread/i)).toBeVisible();
  });

  test("rate limit triggers on 6th rapid POST to contact", async ({
    request,
  }) => {
    const contactBody = {
      email: "test@example.com",
      message: "Test message",
    };

    const responses = [];
    for (let i = 0; i < 6; i++) {
      const response = await request.post("/api/contact", {
        data: contactBody,
      });
      responses.push(response);
    }

    expect(responses[5].status()).toBe(429);
    const retryAfterHeader = responses[5].headers()["retry-after"];
    expect(retryAfterHeader).toBeDefined();
  });
});
