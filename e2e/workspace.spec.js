const { test, expect } = require("@playwright/test");
const API = process.env.E2E_API_URL || "http://127.0.0.1:3004";
const account = {
  id: 1,
  name: "Test User",
  email: "test@test.com",
  role: "superadmin",
};
const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
const defaultRange = () => {
  const end = today();
  const date = new Date(end + "T12:00:00Z");
  date.setUTCDate(date.getUTCDate() - 30);
  return { start_date: date.toISOString().slice(0, 10), end_date: end };
};
const errors = new WeakMap();
async function ready(page, path) {
  await page.goto(path);
  await expect(
    page.getByRole("status").filter({ hasText: "Loading your workspace" }),
  ).toHaveCount(0);
  await expect(page.getByRole("alert")).toHaveCount(0);
}
async function navigate(page, name) {
  const menu = page.getByRole("button", { name: "Open navigation" });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name, exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Loading your workspace" }),
  ).toHaveCount(0);
}
test.beforeEach(async ({ page }, info) => {
  const found = [];
  errors.set(page, found);
  page.on("pageerror", (e) => found.push(e.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !/status of (404|503)/.test(message.text())
    )
      found.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 500 && !info.title.includes("failure recovery"))
      found.push(`${response.status()} ${response.url()}`);
  });
  await page.goto("/login");
  await page.evaluate(
    (user) => localStorage.setItem("user", JSON.stringify(user)),
    account,
  );
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});
test("five workspace pages are reachable through navigation and fit the viewport", async ({
  page,
}, info) => {
  await ready(page, "/connection-health");
  for (const [name, title] of [
    ["Platform details", "Platform details."],
    ["Emissions history", "Emissions history."],
    ["Goals & progress", "Goals & progress."],
    ["Reports", "Reports."],
    ["Connection health", "Connection health."],
  ]) {
    await navigate(page, name);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/${name.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")}-${info.project.name}.png`,
      fullPage: true,
    });
  }
});
test("platform details switch channels and expose honest campaign availability", async ({
  page,
}) => {
  await ready(page, "/platforms/klaviyo");
  await page.getByLabel("Platform", { exact: true }).selectOption("shopify");
  await expect(page).toHaveURL(/\/platforms\/shopify$/);
  await expect(page.locator(".platform-summary")).toContainText("Sample data");
  await expect(
    page.getByRole("heading", { name: "No campaign detail available" }),
  ).toBeVisible();
  await page.getByLabel("Platform", { exact: true }).selectOption("google");
  await expect(page.locator(".platform-summary")).toContainText(
    "Not connected",
  );
  await ready(page, "/platforms/missing");
  await expect(
    page.getByRole("heading", { name: "Platform not found" }),
  ).toBeVisible();
});
test("history captures a real reporting window, filters sources, and groups observations", async ({
  page,
}) => {
  await ready(page, "/history");
  await page
    .getByRole("button", { name: "Capture snapshot", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Capture snapshot" });
  const range = defaultRange();
  await dialog.getByLabel("Start date").fill(range.start_date);
  await dialog.getByLabel("End date").fill(range.end_date);
  await dialog
    .getByRole("button", { name: "Capture snapshot", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page.getByLabel("Include sample data").check();
  await expect(
    page.getByRole("img", {
      name: "Footprint of saved snapshots by capture date",
    }),
  ).toBeVisible();
  await page.getByLabel("Platform", { exact: true }).selectOption("klaviyo");
  await page.getByLabel("Capture grouping").selectOption("week");
  await page.getByLabel("Include sample data").check();
  await expect(
    page.getByRole("heading", { name: "All-source footprint" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Inspect snapshot/ })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Observation sources" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Saved observations", exact: true }),
  ).toBeVisible();
});
test("connection health checks all channels and surfaces provider errors", async ({
  page,
}) => {
  await ready(page, "/connection-health");
  await expect(page.locator(".health-card")).toHaveCount(4);
  const response = page.waitForResponse(
    (r) =>
      r.url().includes("/workspace/1/sync") && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Check connections" }).click();
  expect((await response).status()).toBe(200);
  await expect(
    page.getByRole("status").filter({ hasText: "Connection check complete" }),
  ).toBeVisible();
  const meta = page.locator(".health-card").filter({ hasText: "Meta Ads" });
  await expect(meta).toContainText("Needs attention");
  await expect(meta).toContainText("Application has been deleted");
  await expect(
    meta.getByRole("link", { name: "Manage credentials" }),
  ).toHaveAttribute("href", "/profile");
});
test("monthly goal can be created, synced, edited, reloaded and deleted", async ({
  page,
  request,
}, info) => {
  const name = `E2E goal ${info.project.name} ${Date.now()}`;
  let id;
  try {
    await ready(page, "/goals");
    await page
      .getByRole("button", { name: "Create goal", exact: true })
      .click();
    const dialog = page.getByRole("dialog", { name: "Create goal" });
    await dialog.getByLabel("Goal name").fill(name);
    await dialog
      .getByLabel("Platform", { exact: true })
      .selectOption("klaviyo");
    await dialog.getByLabel("Target month").fill(today().slice(0, 7));
    await dialog.getByLabel("Monthly target (kg CO₂)").fill("25");
    const created = page.waitForResponse(
      (r) =>
        r.url().endsWith("/workspace/1/goals") &&
        r.request().method() === "POST",
    );
    await dialog.getByRole("button", { name: "Save goal" }).click();
    id = (await (await created).json()).id;
    await expect(dialog).not.toBeVisible();
    const card = page
      .locator(".goal-card")
      .filter({ has: page.getByRole("heading", { name, exact: true }) });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Sync target month" }).click();
    await expect(card.getByText(/Last captured/)).toBeVisible();
    await expect(card.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      /\d/,
    );
    await card.getByRole("button", { name: "Edit goal" }).click();
    const edit = page.getByRole("dialog", { name: "Edit goal" });
    await edit.getByLabel("Monthly target (kg CO₂)").fill("30");
    await edit.getByRole("button", { name: "Save goal" }).click();
    await expect(edit).not.toBeVisible();
    await page.reload();
    await expect(card).toContainText("/ 30 kg CO₂");
    await card.getByRole("button", { name: "Delete goal" }).click();
    await page
      .getByRole("dialog", { name: "Delete goal" })
      .getByRole("button", { name: "Confirm delete goal" })
      .click();
    await expect(card).toHaveCount(0);
    id = null;
  } finally {
    if (id) await request.delete(API + "/workspace/1/goals/" + id);
  }
});
test("saved report has immutable figures, CSV export, print layout and deletion", async ({
  page,
  request,
}, info) => {
  const name = `E2E report ${info.project.name} ${Date.now()}`;
  let id;
  try {
    await ready(page, "/reports");
    await page
      .getByRole("button", { name: "Create report", exact: true })
      .click();
    const dialog = page.getByRole("dialog", { name: "Create report" });
    await dialog.getByLabel("Report name").fill(name);
    const range = defaultRange();
    await dialog.getByLabel("Start date").fill(range.start_date);
    await dialog.getByLabel("End date").fill(range.end_date);
    const created = page.waitForResponse(
      (r) =>
        r.url().endsWith("/workspace/1/reports") &&
        r.request().method() === "POST",
    );
    await dialog
      .getByRole("button", { name: "Create report", exact: true })
      .click();
    const original = await (await created).json();
    id = original.id;
    await expect(page).toHaveURL(new RegExp("/reports/" + id + "$"));
    await expect(
      page.getByRole("heading", { name: "Methodology & limitations" }),
    ).toBeVisible();
    const promise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV", exact: true }).click();
    const download = await promise;
    const stream = await download.createReadStream();
    let csv = "";
    for await (const chunk of stream) csv += chunk.toString();
    expect(csv).toContain(name);
    expect(csv).toContain("Sample data");
    expect(csv).toContain("Methodology");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".sidebar")).not.toBeVisible();
    await expect(page.locator(".report-document")).toBeVisible();
    await page.screenshot({
      path: `test-results/report-print-${info.project.name}.png`,
      fullPage: true,
    });
    await page.emulateMedia({ media: null });
    await request.post(API + "/workspace/1/sync", { data: range });
    await page.reload();
    await expect(
      page.getByRole("heading", { name: name + ".", exact: true }),
    ).toBeVisible();
    const saved = await (
      await request.get(API + "/workspace/1/reports/" + id)
    ).json();
    expect(saved.snapshot).toEqual(original.snapshot);
    await page
      .getByRole("button", { name: "Delete report", exact: true })
      .click();
    await page
      .getByRole("dialog", { name: "Delete report" })
      .getByRole("button", { name: "Confirm delete report" })
      .click();
    await expect(page).toHaveURL(/\/reports$/);
    id = null;
  } finally {
    if (id) await request.delete(API + "/workspace/1/reports/" + id);
  }
});
test("workspace failure recovery and missing reports have usable error states", async ({
  page,
}) => {
  await page.route("**/workspace/1/history", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "History temporarily unavailable" }),
    }),
  );
  await page.goto("/history");
  await expect(page.getByRole("alert")).toContainText(
    "History temporarily unavailable",
  );
  await page.unroute("**/workspace/1/history");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Saved observations", exact: true }),
  ).toBeVisible();
  await page.goto("/reports/does-not-exist");
  await expect(page.getByRole("alert")).toContainText("Report not found");
});
