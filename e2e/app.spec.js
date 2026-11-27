const { test, expect } = require("@playwright/test");
const API = process.env.E2E_API_URL || "http://127.0.0.1:3004";
const admin = {
  id: 1,
  name: "Test User",
  email: "test@test.com",
  role: "superadmin",
};
const errors = new WeakMap();
async function signedIn(page) {
  await page.goto("/login");
  await page.evaluate(
    (user) => localStorage.setItem("user", JSON.stringify(user)),
    admin,
  );
  await page.goto("/dashboard");
  await expect(
    page.getByRole("button", { name: "Export report" }),
  ).toBeEnabled();
}
async function navigate(page, name) {
  const menu = page.getByRole("button", { name: "Open navigation" });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name, exact: true })
    .click();
}
test.beforeEach(async ({ page }, testInfo) => {
  const found = [];
  errors.set(page, found);
  page.on("pageerror", (error) => found.push(error.message));
  page.on("response", (response) => {
    const expected =
      testInfo.title.includes("failure recovery") &&
      (response.url().includes("/platforms/all/") ||
        response.url().includes("/user/"));
    if (response.status() >= 500 && !expected)
      found.push(`${response.status()} ${response.url()}`);
  });
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !/status of (401|404|409|503)/.test(message.text())
    )
      found.push(message.text());
  });
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});

test("sign-up, duplicate account validation, and member permissions", async ({
  page,
}, testInfo) => {
  await page.goto("/signup");
  await page.getByLabel("Full name").fill("New Workspace Member");
  await page.getByLabel("Email address").fill(admin.email);
  await page.getByLabel("Password", { exact: true }).fill("123456");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("already exists");
  const email = `signup-${testInfo.project.name}-${Date.now()}@example.test`;
  await page.getByLabel("Email address").fill(email);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Account created");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Export report" }),
  ).toBeEnabled();
  await expect(page.getByText("No activity yet")).toBeVisible();
  await page.goto("/users");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("link", { name: "Team members", exact: true }),
  ).toHaveCount(0);
});

test("profile failure recovery keeps an unloaded profile from being saved", async ({
  page,
}) => {
  await signedIn(page);
  await page.route("**/user/1", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Profile unavailable for recovery test" }),
    }),
  );
  await navigate(page, "Connections");
  await expect(page.getByRole("alert")).toContainText("Profile unavailable");
  await expect(page.getByRole("button", { name: "Save changes" })).toHaveCount(
    0,
  );
  await page.unroute("**/user/1");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    admin.name,
  );
});
test("sign-in, incorrect credentials, sign-out, and corrupted session recovery", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email address").fill(admin.email);
  await page.getByLabel("Password", { exact: true }).fill("incorrect");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Email or password is incorrect",
  );
  await page.getByLabel("Password", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Export report" }),
  ).toBeEnabled();
  const menu = page.getByRole("button", { name: "Open navigation" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.evaluate(() => localStorage.setItem("user", "{broken"));
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
});
test("dashboard data, platform search, CSV export, and responsive layout", async ({
  page,
}, testInfo) => {
  await signedIn(page);
  await expect(
    page.getByRole("heading", { name: "Carbon overview." }),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(4);
  await expect(
    page.getByRole("row").filter({ hasText: "Meta Ads" }),
  ).toContainText("Sample data");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  await page.getByLabel("Search platforms").fill("Klaviyo");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("Klaviyo");
  await page.getByLabel("Search platforms").fill("nonexistent");
  await expect(page.locator("tbody")).toContainText("No platforms match");
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(4);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export report" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^carbontrack-.*\.csv$/);
  const stream = await download.createReadStream();
  let csv = "";
  for await (const chunk of stream) csv += chunk.toString();
  expect(csv).toContain("Footprint (kg CO2)");
  expect(csv).toContain("Klaviyo");
  expect(csv).toContain("Sample data");
  await page.screenshot({
    path: `test-results/dashboard-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
test("reporting period validation, application, and keyboard dismissal", async ({
  page,
}) => {
  await signedIn(page);
  await page.locator(".heading-actions .secondary").click();
  const dialog = page.getByRole("dialog", { name: "Reporting period" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Start date").fill("2026-11-05");
  await dialog.getByLabel("End date").fill("2026-11-01");
  await dialog.getByRole("button", { name: "Apply period" }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Start date must be before",
  );
  await dialog.getByLabel("Start date").fill("2026-10-06");
  await dialog.getByLabel("End date").fill("2026-11-04");
  const requestPromise = page.waitForRequest((r) =>
    r.url().includes("/platforms/all/"),
  );
  await dialog.getByRole("button", { name: "Apply period" }).click();
  expect((await requestPromise).postDataJSON()).toEqual({
    start_date: "2026-10-06",
    end_date: "2026-11-04",
  });
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Export report" }),
  ).toBeEnabled();
  await page.locator(".heading-actions .secondary").click();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});
test("profile save, masked credentials, and navigation", async ({
  page,
  request,
}) => {
  await signedIn(page);
  await navigate(page, "Connections");
  const name = page.getByLabel("Full name", { exact: true });
  await expect(name).toHaveValue(admin.name);
  for (const label of [
    "Shopify access token",
    "Meta access token",
    "Private API key",
    "Google Ads developer token",
  ])
    await expect(page.getByLabel(label, { exact: true })).toHaveAttribute(
      "type",
      "password",
    );
  try {
    await name.fill("Test User QA");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toContainText(
      "Profile and connections saved",
    );
    expect(
      await page.evaluate(() => JSON.parse(localStorage.getItem("user")).name),
    ).toBe("Test User QA");
  } finally {
    const response = await request.put(`${API}/user/1`, {
      data: { name: admin.name },
    });
    expect(response.ok()).toBe(true);
  }
});
test("add team member, duplicate validation, and empty member overview", async ({
  page,
}, testInfo) => {
  await signedIn(page);
  await navigate(page, "Team members");
  await page.getByRole("button", { name: "Add member", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Full name").fill("Playwright Member");
  await dialog.getByLabel("Email address").fill(admin.email);
  await dialog.getByLabel("Temporary password").fill("123456");
  await dialog.getByRole("button", { name: "Add member", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("already exists");
  const email = `playwright-${testInfo.project.name}-${Date.now()}@example.test`;
  await dialog.getByLabel("Email address").fill(email);
  await dialog.getByRole("button", { name: "Add member", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByLabel("Search team members").fill(email);
  const row = page.locator("tbody tr").filter({ hasText: email });
  await expect(row).toBeVisible();
  await row.getByRole("link", { name: "View footprint" }).click();
  await expect(
    page.getByRole("heading", { name: "Playwright Member’s overview." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Export report" }),
  ).toBeEnabled();
  await expect(page.locator(".metric-value").first()).toContainText("0");
  await expect(page.getByText("No activity yet")).toBeVisible();
});
test("API failure recovery and missing member error state", async ({
  page,
}) => {
  await page.route("**/platforms/all/*", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Temporary outage for recovery test" }),
    }),
  );
  await page.goto("/login");
  await page.evaluate(
    (user) => localStorage.setItem("user", JSON.stringify(user)),
    admin,
  );
  await page.goto("/dashboard");
  await expect(page.getByRole("alert")).toContainText("Temporary outage");
  await expect(
    page.getByRole("button", { name: "Export report" }),
  ).toBeDisabled();
  await page.unroute("**/platforms/all/*");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Export report" }),
  ).toBeEnabled();
  await page.goto("/user-graph?userId=999999");
  await expect(page.getByRole("alert")).toContainText("User not found");
  await expect(
    page.getByRole("button", { name: "Export report" }),
  ).toBeDisabled();
});
test("all four calculator endpoints work through Playwright requests", async ({
  request,
}) => {
  for (const [platform, field, clickField] of [
    ["shopify", "impressions", "linkClicks"],
    ["klaviyo", "recipients", "clicks"],
    ["meta", "impressions", "clicks"],
    ["google", "impressions", "clicks"],
  ]) {
    const response = await request.post(
      `${API}/platforms/${platform}/calculate`,
      { data: { [field]: 1000, [clickField]: 0 } },
    );
    expect(response.status()).toBe(200);
    const metrics = await response.json();
    expect(metrics.digitalCarbonFootprint).toBe(1.43);
    expect(metrics.digitalCarbonScore).toBe(0);
  }
});
