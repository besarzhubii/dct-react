import { act, renderHook, waitFor } from "@testing-library/react";
import { useWorkspace, snapshotValue } from "./workspace";
import { api } from "./client";
jest.mock("./client", () => ({
  api: { get: jest.fn() },
  getSession: () => ({ id: 1 }),
  errorMessage: (error) => error.message,
}));
beforeEach(() => api.get.mockReset());
test("missing live figures remain blank while a genuine measured zero stays zero", () => {
  const snapshot = {
    platforms: {
      shopify: {
        configured: true,
        isSimulated: true,
        digitalCarbonFootprint: 50,
      },
      meta: { configured: false },
      klaviyo: { configured: false },
      google: { configured: false },
    },
  };
  expect(snapshotValue(snapshot)).toBeNull();
  expect(snapshotValue(snapshot, "all", true)).toBe(50);
  snapshot.platforms.klaviyo = {
    configured: true,
    isSimulated: false,
    digitalCarbonFootprint: 0,
  };
  expect(snapshotValue(snapshot)).toBe(0);
});
test("switching a report route does not expose stale list data as a report", async () => {
  let resolveDetail;
  api.get.mockImplementation((path) => {
    if (path.endsWith("/summary"))
      return Promise.resolve({ data: { latest: null } });
    if (path.endsWith("/reports"))
      return Promise.resolve({ data: [{ id: "saved" }] });
    return new Promise((resolve) => {
      resolveDetail = resolve;
    });
  });
  const { result, rerender } = renderHook(({ path }) => useWorkspace(path), {
    initialProps: { path: "/reports" },
  });
  await waitFor(() => expect(result.current.loading).toBe(false));
  rerender({ path: "/reports/saved" });
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toBeNull();
  await waitFor(() => expect(resolveDetail).toBeDefined());
  await act(async () => resolveDetail({ data: { id: "saved", snapshot: {} } }));
  await waitFor(() => expect(result.current.data.extra.id).toBe("saved"));
});
test("a slow old response cannot replace the current page data", async () => {
  let resolveOld;
  api.get.mockImplementation((path) => {
    if (path.endsWith("/summary"))
      return Promise.resolve({ data: { latest: null } });
    if (path.endsWith("/history"))
      return new Promise((resolve) => {
        resolveOld = resolve;
      });
    return Promise.resolve({ data: ["new page"] });
  });
  const { result, rerender } = renderHook(({ path }) => useWorkspace(path), {
    initialProps: { path: "/history" },
  });
  await waitFor(() => expect(resolveOld).toBeDefined());
  rerender({ path: "/health" });
  await waitFor(() => expect(result.current.data?.extra).toEqual(["new page"]));
  await act(async () => resolveOld({ data: ["old page"] }));
  expect(result.current.data.extra).toEqual(["new page"]);
});
