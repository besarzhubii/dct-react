import { useEffect, useState } from "react";
import { api, getSession, errorMessage } from "./client";

export const platforms = [
  {
    key: "shopify",
    name: "Shopify",
    description: "Commerce & storefront",
    symbol: "S",
    color: "#8fd6ac",
  },
  {
    key: "meta",
    name: "Meta Ads",
    description: "Social advertising",
    symbol: "∞",
    color: "#78a7ff",
  },
  {
    key: "klaviyo",
    name: "Klaviyo",
    description: "Email marketing",
    symbol: "K",
    color: "#c1a2ff",
  },
  {
    key: "google",
    name: "Google Ads",
    description: "Search advertising",
    symbol: "G",
    color: "#f0cc85",
  },
];
export const platformName = (key) =>
  platforms.find((platform) => platform.key === key)?.name || "All platforms";
export const formatNumber = (value = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        timeZone: "Europe/Budapest",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not yet";
export const period = (range) =>
  `${range?.start_date || "—"} to ${range?.end_date || "—"}`;
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export function defaultRange() {
  const end = today();
  const start = new Date(`${end}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 30);
  return { start_date: start.toISOString().slice(0, 10), end_date: end };
}
export const workspacePath = (path) => `/workspace/${getSession()?.id}${path}`;
export async function syncWorkspace(range = defaultRange()) {
  return (await api.post(workspacePath("/sync"), range)).data;
}
export function liveMetrics(snapshot, scope = "all") {
  const selected = platforms
    .filter((platform) => scope === "all" || platform.key === scope)
    .map((platform) => snapshot?.platforms[platform.key])
    .filter((platform) => platform?.configured);
  const live = selected.filter(
    (platform) => !platform.isSimulated && !platform.error,
  );
  return {
    footprint: live.reduce(
      (sum, p) => sum + (p.digitalCarbonFootprint || 0),
      0,
    ),
    wastage: live.reduce((sum, p) => sum + (p.digitalCarbonWastage || 0), 0),
    complete: selected.length > 0 && selected.length === live.length,
    liveCount: live.length,
  };
}
export function snapshotValue(snapshot, scope = "all", includeSamples = false) {
  if (!includeSamples) {
    const live = liveMetrics(snapshot, scope);
    return live.liveCount ? live.footprint : null;
  }
  const selected = Object.entries(snapshot.platforms).filter(
    ([key, data]) => (scope === "all" || key === scope) && data.configured,
  );
  return selected.length
    ? selected.reduce(
        (sum, [, data]) => sum + (data.digitalCarbonFootprint || 0),
        0,
      )
    : null;
}
export function useWorkspace(extraPath, revision = 0) {
  const userId = getSession()?.id;
  const resource = JSON.stringify([userId, extraPath, revision]);
  const [result, setResult] = useState({
    resource: null,
    data: null,
    error: "",
    loading: true,
  });
  useEffect(() => {
    let active = true;
    setResult({ resource, data: null, error: "", loading: true });
    (async () => {
      const summary = (await api.get("/workspace/" + userId + "/summary")).data;
      const extra = extraPath
        ? (await api.get("/workspace/" + userId + extraPath)).data
        : null;
      return { summary, extra };
    })()
      .then((data) => {
        if (active) setResult({ resource, data, error: "", loading: false });
      })
      .catch((error) => {
        if (active)
          setResult({
            resource,
            data: null,
            error: errorMessage(error),
            loading: false,
          });
      });
    return () => {
      active = false;
    };
  }, [userId, extraPath, revision, resource]);
  return result.resource === resource
    ? result
    : { data: null, error: "", loading: true };
}
