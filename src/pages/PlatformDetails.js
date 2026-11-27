import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import {
  PageHeading,
  AsyncState,
  Notice,
  PlatformSelect,
  PlatformIdentity,
  SourceBadge,
  MetricStrip,
  EmptyState,
  SnapshotNote,
  RangeFields,
} from "../components/WorkspaceUI";
import {
  useWorkspace,
  platforms,
  platformName,
  syncWorkspace,
  defaultRange,
  formatNumber,
  formatDate,
} from "../services/workspace";
import { errorMessage } from "../services/client";
export default function PlatformDetails() {
  const { platform = "klaviyo" } = useParams();
  const navigate = useNavigate();
  const [revision, setRevision] = useState(0);
  const [query, setQuery] = useState("");
  const [range, setRange] = useState(defaultRange);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { data, loading, error: loadError } = useWorkspace(null, revision);
  const valid = platforms.some((p) => p.key === platform);
  const snapshot = data?.summary.latest;
  const metrics = snapshot?.platforms[platform];
  const campaigns = (metrics?.campaigns || []).filter((c) =>
    `${c.name} ${c.id}`.toLowerCase().includes(query.toLowerCase()),
  );
  async function sync(e) {
    e.preventDefault();
    setError("");
    if (range.start_date > range.end_date) {
      setError("Start date must be before the end date.");
      return;
    }
    setBusy(true);
    try {
      await syncWorkspace(range);
      setRevision((n) => n + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppShell title="Platform details">
      <PageHeading
        title="Platform details"
        description="Follow the footprint behind each channel."
      >
        <PlatformSelect
          all={false}
          value={platform}
          onChange={(value) => navigate(`/platforms/${value}`)}
        />
      </PageHeading>
      <AsyncState
        loading={loading}
        error={loadError}
        retry={() => setRevision((n) => n + 1)}
      />
      {!loading &&
        !loadError &&
        (!valid ? (
          <div className="glass">
            <EmptyState
              title="Platform not found"
              description="Choose one of the four supported channels."
            >
              <Link className="button primary" to="/platforms/klaviyo">
                View Klaviyo
              </Link>
            </EmptyState>
          </div>
        ) : (
          snapshot &&
          metrics && (
            <>
              <section className="glass platform-summary">
                <div className="panel-heading">
                  <PlatformIdentity
                    platform={platform}
                    subtitle={`Captured ${formatDate(snapshot.capturedAt)}`}
                  />
                  <SourceBadge data={metrics} />
                </div>
                <MetricStrip
                  items={[
                    {
                      label: "Carbon footprint",
                      value: metrics.digitalCarbonFootprint || 0,
                      unit: "kg CO₂",
                    },
                    {
                      label: "Carbon wastage",
                      value: metrics.digitalCarbonWastage || 0,
                      unit: "kg CO₂",
                    },
                    {
                      label: "Impressions",
                      value: metrics.impressions || metrics.recipients || 0,
                    },
                    {
                      label: "Engagement score",
                      value: metrics.digitalCarbonScore || 0,
                      unit: "/ 100",
                    },
                  ]}
                />
                <SnapshotNote snapshot={snapshot} />
                {metrics.isSimulated && (
                  <div className="data-notice">
                    <Icon name="info" />
                    <span>
                      This platform is showing sample data.{" "}
                      {metrics.error || metrics.note}
                    </span>
                    <Link to="/connection-health">Connection health</Link>
                  </div>
                )}
                {!metrics.configured && (
                  <div className="data-notice">
                    <span>
                      Connect {platformName(platform)} to measure this channel.
                    </span>
                    <Link to="/profile">Configure connection</Link>
                  </div>
                )}
              </section>
              <div className="feature-two-column">
                <section className="glass feature-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Campaign activity</h2>
                      <p>Actual campaign figures supplied by the integration</p>
                    </div>
                  </div>
                  <label className="search-field campaign-search">
                    <Icon name="search" size={16} />
                    <input
                      aria-label="Search campaigns"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search name or campaign ID…"
                    />
                  </label>
                  {metrics.isSimulated || !metrics.campaigns?.length ? (
                    <EmptyState
                      title="No campaign detail available"
                      description={
                        metrics.isSimulated
                          ? "Sample totals are not broken into invented campaigns. Connect a live source to see campaign activity."
                          : "The source has not supplied campaign details for this reporting period."
                      }
                    />
                  ) : (
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Campaign</th>
                            <th>Impressions</th>
                            <th>Footprint</th>
                            <th>Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campaigns.map((c) => (
                            <tr key={c.id}>
                              <td className="campaign-name">
                                {c.name}
                                <small>
                                  {c.name !== c.id ? c.id : "Campaign ID"}
                                </small>
                              </td>
                              <td>{formatNumber(c.impressions)}</td>
                              <td>
                                {formatNumber(c.digitalCarbonFootprint)} kg
                              </td>
                              <td>
                                {formatNumber(c.digitalCarbonScore)} / 100
                              </td>
                            </tr>
                          ))}
                          {!campaigns.length && (
                            <tr>
                              <td colSpan={4}>
                                No campaigns match your search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
                <aside className="glass feature-panel">
                  <h2>Capture a reporting period</h2>
                  <p className="panel-copy">
                    Retrieve fresh channel data and add a snapshot to emissions
                    history.
                  </p>
                  <form onSubmit={sync}>
                    <RangeFields value={range} onChange={setRange} />
                    <Notice message={error} />
                    <button className="button primary" disabled={busy}>
                      <Icon name="refresh" size={15} />
                      {busy ? "Capturing…" : "Capture snapshot"}
                    </button>
                  </form>
                  <div className="panel-divider" />
                  <h3>Read the numbers</h3>
                  <p className="panel-copy">
                    Footprint uses impressions × 1.43 ÷ 1,000. Wastage
                    represents impressions that did not lead to an engaged
                    click. These are modelled estimates.
                  </p>
                  <Link className="text-button" to="/goals">
                    Set a monthly goal <Icon name="arrow" size={15} />
                  </Link>
                </aside>
              </div>
            </>
          )
        ))}
    </AppShell>
  );
}
