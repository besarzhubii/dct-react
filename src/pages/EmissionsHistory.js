import React, { useState } from "react";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import {
  PageHeading,
  AsyncState,
  Notice,
  PlatformSelect,
  MetricStrip,
  EmptyState,
  Dialog,
  RangeFields,
  SourceTable,
} from "../components/WorkspaceUI";
import {
  useWorkspace,
  syncWorkspace,
  liveMetrics,
  snapshotValue,
  defaultRange,
  formatNumber,
  formatDate,
  period,
} from "../services/workspace";
import { errorMessage } from "../services/client";
const rangeKey = (range) => `${range.start_date}|${range.end_date}`;
function captureBucket(snapshot, granularity) {
  const date = new Date(snapshot.capturedAt);
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  if (granularity === "month") return day.slice(0, 7);
  if (granularity === "week") {
    const start = new Date(day + "T12:00:00Z");
    start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
    return start.toISOString().slice(0, 10);
  }
  return day;
}
export default function EmissionsHistory() {
  const [revision, setRevision] = useState(0);
  const [scope, setScope] = useState("all");
  const [windowKey, setWindowKey] = useState("");
  const [granularity, setGranularity] = useState("day");
  const [samples, setSamples] = useState(false);
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(defaultRange);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const {
    data,
    loading,
    error: loadError,
  } = useWorkspace("/history", revision);
  const history = data?.extra || [];
  const windows = [
    ...new Map(
      history.map((snapshot) => [
        rangeKey(snapshot.dateRange),
        snapshot.dateRange,
      ]),
    ).entries(),
  ].reverse();
  const activeWindow =
    windowKey ||
    (data?.summary.latest
      ? rangeKey(data.summary.latest.dateRange)
      : windows[0]?.[0]);
  const records = history.filter(
    (snapshot) => rangeKey(snapshot.dateRange) === activeWindow,
  );
  const buckets = new Map();
  records.forEach((snapshot) =>
    buckets.set(captureBucket(snapshot, granularity), snapshot),
  );
  const points = [...buckets]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, snapshot]) => ({
      label,
      snapshot,
      value: snapshotValue(snapshot, scope, samples),
    }));
  const chosen =
    history.find(
      (snapshot) =>
        snapshot.id === selected &&
        rangeKey(snapshot.dateRange) === activeWindow,
    ) || points.at(-1)?.snapshot;
  const max = Math.max(1, ...points.map((point) => point.value));
  const x = (index) =>
    points.length === 1 ? 400 : 55 + (index / (points.length - 1)) * 690;
  const y = (value) => 220 - (value / max) * 170;
  async function capture(e) {
    e.preventDefault();
    setError("");
    if (draft.start_date > draft.end_date) {
      setError("Start date must be before the end date.");
      return;
    }
    setBusy(true);
    try {
      const snapshot = await syncWorkspace(draft);
      setWindowKey(rangeKey(snapshot.dateRange));
      setSelected(snapshot.id);
      setRevision((n) => n + 1);
      setOpen(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppShell title="Emissions history">
      <PageHeading
        title="Emissions history"
        description="A record of your impact, built from captured data."
      >
        <button
          className="button primary"
          onClick={() => {
            setError("");
            setOpen(true);
          }}
        >
          <Icon name="plus" size={16} />
          Capture snapshot
        </button>
      </PageHeading>
      <AsyncState
        loading={loading}
        error={loadError}
        retry={() => setRevision((n) => n + 1)}
      />
      {!loading && !loadError && (
        <>
          <div className="history-controls">
            <PlatformSelect value={scope} onChange={setScope} />
            <label className="compact-field">
              Reporting period
              <select
                aria-label="Reporting period"
                value={activeWindow || ""}
                onChange={(e) => {
                  setWindowKey(e.target.value);
                  setSelected("");
                }}
              >
                {windows.map(([key, range]) => (
                  <option value={key} key={key}>
                    {period(range)}
                  </option>
                ))}
              </select>
            </label>
            <label className="compact-field">
              Capture grouping
              <select
                aria-label="Capture grouping"
                value={granularity}
                onChange={(e) => setGranularity(e.target.value)}
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={samples}
                onChange={(e) => setSamples(e.target.checked)}
              />
              Include sample data
            </label>
          </div>
          <section className="glass feature-panel history-chart-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  {samples ? "All-source footprint" : "Live-source footprint"}
                </h2>
                <p>Latest saved observation in each capture bucket</p>
              </div>
              <span className="unit-tag">kg CO₂</span>
            </div>
            {!points.some((point) => point.value !== null) ? (
              <EmptyState
                title={
                  points.length
                    ? "No measured data in this view"
                    : "No snapshots for this period"
                }
                description="Missing live data is left blank. Choose another source or explicitly include sample figures."
              />
            ) : (
              <>
                <div className="history-chart">
                  <svg
                    role="img"
                    aria-label="Footprint of saved snapshots by capture date"
                    viewBox="0 0 800 270"
                  >
                    {[0, 0.25, 0.5, 0.75, 1].map((n) => (
                      <g key={n}>
                        <line
                          x1="55"
                          x2="745"
                          y1={y(max * n)}
                          y2={y(max * n)}
                          stroke="#a6bee81c"
                          strokeDasharray="4 5"
                        />
                        <text
                          x="43"
                          y={y(max * n) + 4}
                          fill="#8b98b2"
                          fontSize="11"
                          textAnchor="end"
                        >
                          {formatNumber(max * n)}
                        </text>
                      </g>
                    ))}
                    {points.length > 1 &&
                      points.every((point) => point.value !== null) && (
                        <polyline
                          points={points
                            .map(
                              (point, index) => `${x(index)},${y(point.value)}`,
                            )
                            .join(" ")}
                          fill="none"
                          stroke="#9bb8ff"
                          strokeWidth="3"
                        />
                      )}
                    {points.map((point, index) =>
                      point.value === null ? null : (
                        <g key={point.label}>
                          <circle
                            cx={x(index)}
                            cy={y(point.value)}
                            r="6"
                            fill="#9bb8ff"
                            stroke="#203152"
                            strokeWidth="3"
                          >
                            <title>
                              {point.label}: {formatNumber(point.value)} kg CO2
                            </title>
                          </circle>
                          <text
                            x={x(index)}
                            y="250"
                            fill="#8b98b2"
                            fontSize="11"
                            textAnchor="middle"
                          >
                            {point.label}
                          </text>
                        </g>
                      ),
                    )}
                  </svg>
                </div>
                {points.length === 1 && (
                  <p className="data-notice">
                    <Icon name="info" size={16} />
                    One captured point is available. More observations are
                    needed to show a trend.
                  </p>
                )}
              </>
            )}
            <p className="snapshot-note">
              The horizontal axis is the capture date, not the date emissions
              occurred. Each point describes the selected reporting period.
              Overlapping reports are never added together.
            </p>
          </section>
          <MetricStrip
            items={[
              { label: "Saved observations", value: records.length },
              { label: "Reporting periods", value: windows.length },
              {
                label: "Latest live footprint",
                value: chosen ? (snapshotValue(chosen, scope) ?? "—") : "—",
                unit: "kg CO₂",
                note: "Sample sources excluded",
              },
            ]}
          />
          <section className="glass feature-panel">
            <div className="panel-heading">
              <div>
                <h2>Saved observations</h2>
                <p>Select an observation to inspect its sources.</p>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Captured at</th>
                    <th>Reporting period</th>
                    <th>Live footprint</th>
                    <th>Data coverage</th>
                    <th>Inspect</th>
                  </tr>
                </thead>
                <tbody>
                  {[...records].reverse().map((snapshot) => {
                    const live = liveMetrics(snapshot, scope);
                    return (
                      <tr key={snapshot.id}>
                        <td>{formatDate(snapshot.capturedAt)}</td>
                        <td>{period(snapshot.dateRange)}</td>
                        <td>
                          {live.liveCount
                            ? `${formatNumber(live.footprint)} kg`
                            : "—"}
                        </td>
                        <td>
                          {live.complete
                            ? "Complete live data"
                            : live.liveCount
                              ? "Partial live data"
                              : "No live data"}
                        </td>
                        <td>
                          <button
                            className="text-button"
                            onClick={() => setSelected(snapshot.id)}
                            aria-label={`Inspect snapshot ${snapshot.id}`}
                          >
                            View sources <Icon name="chevron" size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
          {chosen && (
            <section className="glass observation-details">
              <div className="panel-heading">
                <div>
                  <h2>Observation sources</h2>
                  <p>{formatDate(chosen.capturedAt)}</p>
                </div>
              </div>
              <SourceTable snapshot={chosen} links />
            </section>
          )}
        </>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Capture snapshot"
      >
        <form onSubmit={capture}>
          <RangeFields value={draft} onChange={setDraft} />
          <Notice message={error} />
          <p className="form-hint">
            Identical observations captured on the same day are saved once.
            Sample data is always labelled.
          </p>
          <button className="button primary" disabled={busy}>
            {busy ? "Capturing…" : "Capture snapshot"}
          </button>
        </form>
      </Dialog>
    </AppShell>
  );
}
