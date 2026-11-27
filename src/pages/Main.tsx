import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import {
  fetchAllPlatformsData,
  AggregatedResponse,
} from "../services/platformApi";
import { getSession, errorMessage } from "../services/client";
const platforms = [
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
] as const;
const number = (n: number = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(n);
const iso = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
export default function Main() {
  const location = useLocation();
  const session = getSession();
  const userId =
    location.pathname === "/user-graph"
      ? Number(new URLSearchParams(location.search).get("userId"))
      : session?.id;
  const [data, setData] = useState<AggregatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [query, setQuery] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [range, setRange] = useState({
    start: iso(new Date(Date.now() - 30 * 86400000)),
    end: iso(new Date()),
  });
  const [draft, setDraft] = useState(range);
  const [dateError, setDateError] = useState("");
  const dateDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (dateOpen) dateDialog.current?.showModal();
    else dateDialog.current?.close();
  }, [dateOpen]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    if (!userId) {
      setError("Choose a valid team member to view their data.");
      setLoading(false);
      return;
    }
    fetchAllPlatformsData(userId, range.start, range.end)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) {
          setData(null);
          setError(
            errorMessage(
              err,
              "Could not load your footprint. Check the API connection and try again.",
            ),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, range, refresh]);
  const agg = data?.aggregated;
  const footprint = agg?.totalFootprint || 0;
  const configured = platforms.filter(
    (p) => data?.platforms[p.key]?.configured,
  );
  const simulated = configured.some((p) => data?.platforms[p.key]?.isSimulated);
  const max = Math.max(
    1,
    ...platforms.map(
      (p) => data?.platforms[p.key]?.digitalCarbonFootprint || 0,
    ),
  );
  const score = agg?.digitalCarbonScore || 0;
  const filtered = platforms.filter((p) =>
    `${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  function exportReport() {
    if (!data) return;
    const rows = [
      [
        "Platform",
        "Status",
        "Impressions",
        "Clicks",
        "Footprint (kg CO2)",
        "Wastage (kg CO2)",
        "Score (%)",
        "Start date",
        "End date",
      ],
      ...platforms.map((p) => {
        const m = data.platforms[p.key];
        return [
          p.name,
          !m.configured
            ? "Not connected"
            : m.isSimulated
              ? "Sample data"
              : m.error
                ? "Unavailable"
                : "Live data",
          m.impressions || m.recipients || 0,
          m.clicks || 0,
          m.digitalCarbonFootprint || 0,
          m.digitalCarbonWastage || 0,
          m.digitalCarbonScore || 0,
          range.start,
          range.end,
        ];
      }),
    ];
    const url = URL.createObjectURL(
      new Blob([rows.map((row) => row.join(",")).join("\n")], {
        type: "text/csv;charset=utf-8;",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `carbontrack-${range.start}-${range.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <AppShell
      title={location.pathname === "/user-graph" ? "Team overview" : "Overview"}
    >
      <div className="page-heading">
        <div>
          <div className="heading-overline">
            <span className="tiny-orb" /> Your impact at a glance
          </div>
          <h1>
            {location.pathname === "/user-graph"
              ? `${data?.userName || "Team member"}’s overview`
              : "Carbon overview"}
            <span className="heading-dot">.</span>
          </h1>
          <p>
            A clearer picture of your digital footprint. A better way forward.
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="button secondary"
            onClick={() => {
              setDraft(range);
              setDateError("");
              setDateOpen(true);
            }}
          >
            <Icon name="calendar" size={16} />
            <span>
              {new Date(range.start + "T12:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              –{" "}
              {new Date(range.end + "T12:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <Icon name="down" size={13} />
          </button>
          <button
            className="button primary"
            onClick={exportReport}
            disabled={!data || loading}
          >
            <Icon name="download" size={16} />
            Export report
          </button>
        </div>
      </div>
      <div className="section-toolbar">
        <div className="view-label">
          <span /> Overview
        </div>
        <button
          className="text-button"
          onClick={() => setRefresh((v) => v + 1)}
          disabled={loading}
        >
          <Icon
            name="refresh"
            size={14}
            className={loading ? "spinning" : ""}
          />
          {loading ? "Syncing data…" : "Refresh data"}
        </button>
      </div>
      {error ? (
        <div className="glass error-state" role="alert">
          <Icon name="info" size={32} />
          <h2>We couldn’t load your overview</h2>
          <p>{error}</p>
          <button
            className="button primary"
            onClick={() => setRefresh((v) => v + 1)}
          >
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="dashboard-loading" role="status">
          <div className="skeleton-grid">
            {[1, 2, 3, 4].map((n) => (
              <div className="glass skeleton" key={n} />
            ))}
          </div>
          <div className="glass skeleton skeleton-chart" />
          <span>Gathering your platform data…</span>
        </div>
      ) : (
        data && (
          <>
            <div className="metric-grid">
              {[
                {
                  label: "Total carbon footprint",
                  value: number(footprint),
                  unit: "kg CO₂",
                  icon: "leaf",
                  className: "blue",
                  note: "Across connected platforms",
                },
                {
                  label: "Carbon wastage",
                  value: number(agg?.totalWastage),
                  unit: "kg CO₂",
                  icon: "bolt",
                  className: "purple",
                  note: "From unengaged impressions",
                },
                {
                  label: "Total impressions",
                  value: number(agg?.totalImpressions),
                  unit: "",
                  icon: "globe",
                  className: "teal",
                  note: "Digital interactions measured",
                },
                {
                  label: "Engaged clicks",
                  value: number(agg?.totalClicks),
                  unit: "",
                  icon: "click",
                  className: "amber",
                  note: "Interactions that made a connection",
                },
              ].map((m) => (
                <section
                  className={`glass metric-card ${m.className}`}
                  key={m.label}
                >
                  <div className="metric-top">
                    <span>{m.label}</span>
                    <span className="metric-icon">
                      <Icon name={m.icon} size={18} />
                    </span>
                  </div>
                  <div className="metric-value">
                    {m.value}
                    <span>{m.unit}</span>
                  </div>
                  <div className="metric-note">
                    <span className="metric-marker" />
                    {m.note}
                  </div>
                </section>
              ))}
            </div>
            <div className="chart-grid">
              <section className="glass footprint-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Where your footprint comes from</h2>
                    <p>Carbon emissions by platform</p>
                  </div>
                  <span className="unit-tag">kg CO₂</span>
                </div>
                <div
                  className="bar-chart"
                  role="img"
                  aria-label="Carbon footprint by platform"
                >
                  {platforms.map((p) => {
                    const m = data.platforms[p.key];
                    return (
                      <div className="bar-column" key={p.key}>
                        <span className="bar-value">
                          {number(m.digitalCarbonFootprint || 0)}
                        </span>
                        <div className="bar-track">
                          <div
                            className="chart-bar"
                            style={
                              {
                                height: `${Math.max(0, ((m.digitalCarbonFootprint || 0) / max) * 100)}%`,
                                "--bar-color": p.color,
                              } as React.CSSProperties
                            }
                          />
                        </div>
                        <div className="bar-label">
                          <span style={{ background: p.color }} />
                          {p.name}
                        </div>
                      </div>
                    );
                  })}
                  <div className="chart-gridlines" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <div className="chart-footnote">
                  <Icon name="info" size={14} />
                  {simulated
                    ? "Includes sample data. See each platform’s data source below."
                    : "Emissions are estimated from measured impressions."}
                </div>
              </section>
              <section className="glass score-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Your carbon score</h2>
                    <p>Engagement efficiency</p>
                  </div>
                  <Icon name="leaf" size={19} />
                </div>
                <div
                  className="score-ring"
                  style={
                    { "--score": `${score * 3.6}deg` } as React.CSSProperties
                  }
                >
                  <div>
                    <span>
                      {number(score)}
                      <small>/ 100</small>
                    </span>
                    <p>{footprint ? agg?.rating : "No activity yet"}</p>
                  </div>
                </div>
                <p className="score-description">
                  {footprint
                    ? "The share of your digital impressions that led to an engaged click."
                    : "Connect your platforms to start measuring your digital impact."}
                </p>
                <Link to="/profile" className="score-link">
                  Manage your connections
                  <Icon name="arrow" size={16} />
                </Link>
              </section>
            </div>
            <section className="glass platforms-panel breakdown-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    Platform breakdown{" "}
                    <span className="count-badge">
                      {configured.length} connected
                    </span>
                  </h2>
                  <p>Every channel. One clear view.</p>
                </div>
                <label className="search-field">
                  <Icon name="search" size={16} />
                  <input
                    aria-label="Search platforms"
                    placeholder="Search platforms…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Platform</th>
                      <th>Data source</th>
                      <th>Impressions</th>
                      <th>Footprint</th>
                      <th>Carbon score</th>
                      <th aria-label="Platform settings" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => {
                      const m = data.platforms[p.key];
                      return (
                        <tr key={p.key}>
                          <td>
                            <div className="platform-cell">
                              <span className={`platform-logo logo-${p.key}`}>
                                {p.symbol}
                              </span>
                              <span>
                                <Link to={`/platforms/${p.key}`}>{p.name}</Link>
                                <small>{p.description}</small>
                              </span>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`status-pill ${!m.configured ? "disconnected" : m.isSimulated ? "sample" : m.error ? "unavailable" : "connected"}`}
                            >
                              <i />
                              {!m.configured
                                ? "Not connected"
                                : m.isSimulated
                                  ? "Sample data"
                                  : m.error
                                    ? "Unavailable"
                                    : "Live data"}
                            </span>
                            {m.error && (
                              <small
                                className="connection-error"
                                title={m.error}
                              >
                                Reconnect required
                              </small>
                            )}
                          </td>
                          <td>
                            {m.configured
                              ? number(m.impressions || m.recipients || 0)
                              : "—"}
                          </td>
                          <td className="table-emphasis">
                            {m.configured
                              ? `${number(m.digitalCarbonFootprint || 0)} kg`
                              : "—"}
                          </td>
                          <td>
                            {m.configured ? (
                              <div className="table-score">
                                <span>
                                  {number(m.digitalCarbonScore || 0)}
                                  <small> / 100</small>
                                </span>
                                <div>
                                  <i
                                    style={{
                                      width: `${m.digitalCarbonScore || 0}%`,
                                      background: p.color,
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>
                            <Link
                              to={`/platforms/${p.key}`}
                              className="icon-button"
                              aria-label={`View ${p.name} details`}
                            >
                              <Icon name="chevron" size={16} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                    {!filtered.length && (
                      <tr>
                        <td colSpan={6} className="empty-search">
                          No platforms match “{query}”.{" "}
                          <button
                            className="text-button"
                            onClick={() => setQuery("")}
                          >
                            Clear search
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            <div className="insight-strip">
              <span className="insight-symbol">
                <Icon name="leaf" size={22} />
              </span>
              <div>
                <h3>Clarity is the first step to a lighter footprint.</h3>
                <p>
                  {simulated
                    ? "Some connections use sample data. Review your credentials before using this report for decisions."
                    : configured.length
                      ? "Keep your platform connections up to date for a complete picture of your impact."
                      : "Connect your first platform to see your impact here."}
                </p>
              </div>
              <Link to="/profile">
                View connections
                <Icon name="arrow" size={16} />
              </Link>
            </div>
          </>
        )
      )}
      <dialog
        ref={dateDialog}
        className="glass modal native-dialog"
        aria-labelledby="date-title"
        onCancel={() => setDateOpen(false)}
      >
        <div className="panel-heading">
          <h2 id="date-title">Reporting period</h2>
          <button
            autoFocus
            className="icon-button"
            aria-label="Close date picker"
            onClick={() => setDateOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.start > draft.end) {
              setDateError("Start date must be before the end date.");
              return;
            }
            setRange(draft);
            setDateOpen(false);
          }}
        >
          <label className="field">
            Start date
            <input
              required
              type="date"
              value={draft.start}
              onChange={(e) => setDraft({ ...draft, start: e.target.value })}
            />
          </label>
          <label className="field">
            End date
            <input
              required
              type="date"
              value={draft.end}
              onChange={(e) => setDraft({ ...draft, end: e.target.value })}
            />
          </label>
          {dateError && (
            <p className="form-error" role="alert">
              {dateError}
            </p>
          )}
          <p className="form-hint">
            Sample data is fixed and does not change with the reporting period.
          </p>
          <button className="button primary" type="submit">
            Apply period
          </button>
        </form>
      </dialog>
    </AppShell>
  );
}
