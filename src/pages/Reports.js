import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import {
  PageHeading,
  AsyncState,
  Notice,
  Dialog,
  RangeFields,
  EmptyState,
  MetricStrip,
  SourceTable,
} from "../components/WorkspaceUI";
import {
  useWorkspace,
  workspacePath,
  defaultRange,
  formatNumber,
  formatDate,
  period,
  liveMetrics,
} from "../services/workspace";
import { api, errorMessage } from "../services/client";
export default function Reports() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [revision, setRevision] = useState(0);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [range, setRange] = useState(defaultRange);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const {
    data,
    loading,
    error: loadError,
  } = useWorkspace(reportId ? `/reports/${reportId}` : "/reports", revision);
  const report = reportId ? data?.extra : null;
  const reports = !reportId
    ? (data?.extra || []).filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase()),
      )
    : [];
  async function create(e) {
    e.preventDefault();
    setError("");
    if (range.start_date > range.end_date) {
      setError("Start date must be before the end date.");
      return;
    }
    setBusy(true);
    try {
      const { data: created } = await api.post(workspacePath("/reports"), {
        name,
        ...range,
      });
      setOpen(false);
      setName("");
      navigate(`/reports/${created.id}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  async function download(item) {
    setBusy(true);
    setError("");
    try {
      const response = await api.get(
        workspacePath(`/reports/${item.id}/export.csv`),
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `carbontrack-report-${item.id}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        errorMessage(err, "Could not export this report. Please try again."),
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setError("");
    try {
      await api.delete(workspacePath(`/reports/${deleting.id}`));
      setDeleting(null);
      if (reportId) navigate("/reports");
      else setRevision((n) => n + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppShell title="Reports">
      <PageHeading
        title={report ? report.name : "Reports"}
        description={
          report
            ? "A saved record of your figures and their sources."
            : "Keep a shareable record of your digital impact."
        }
      >
        {report ? (
          <>
            <button className="button secondary" onClick={() => window.print()}>
              <Icon name="download" size={15} />
              Print report
            </button>
            <button
              className="button primary"
              disabled={busy}
              onClick={() => download(report)}
            >
              <Icon name="download" size={15} />
              Export CSV
            </button>
          </>
        ) : (
          <button
            className="button primary"
            onClick={() => {
              setError("");
              setOpen(true);
            }}
          >
            <Icon name="plus" size={16} />
            Create report
          </button>
        )}
      </PageHeading>
      {!open && <Notice message={error} />}
      <AsyncState
        loading={loading}
        error={loadError}
        retry={() => setRevision((n) => n + 1)}
      />
      {!loading &&
        !loadError &&
        (report ? (
          <>
            <Link className="text-button report-back" to="/reports">
              Back to reports
            </Link>
            <article className="glass report-document">
              <div className="report-document-header">
                <div>
                  <span className="report-wordmark">carbontrack</span>
                  <h2>{report.name}</h2>
                  <p>{period(report.dateRange)}</p>
                </div>
                <div>
                  <small>Saved report</small>
                  <p>{formatDate(report.createdAt)}</p>
                  <code>{report.id}</code>
                </div>
              </div>
              <MetricStrip
                items={[
                  {
                    label: "Total footprint, all sources",
                    value: report.snapshot.aggregated.totalFootprint,
                    unit: "kg CO₂",
                  },
                  {
                    label: "Live-source footprint",
                    value: liveMetrics(report.snapshot).liveCount
                      ? liveMetrics(report.snapshot).footprint
                      : "—",
                    unit: "kg CO₂",
                  },
                  {
                    label: "Total wastage, all sources",
                    value: report.snapshot.aggregated.totalWastage,
                    unit: "kg CO₂",
                  },
                ]}
              />
              {Object.values(report.snapshot.platforms).some(
                (p) => p.isSimulated,
              ) && (
                <div className="data-notice">
                  <Icon name="info" />
                  <span>
                    This report includes sample figures. Use the source labels
                    below when interpreting the totals.
                  </span>
                </div>
              )}
              <h3 className="report-section-title">Platform sources</h3>
              <SourceTable snapshot={report.snapshot} />
              <section className="report-methodology">
                <h3>Methodology & limitations</h3>
                <dl>
                  <div>
                    <dt>Footprint</dt>
                    <dd>{report.methodology.footprint} kg CO₂</dd>
                  </div>
                  <div>
                    <dt>Wastage</dt>
                    <dd>{report.methodology.wastage} kg CO₂</dd>
                  </div>
                  <div>
                    <dt>Engagement score</dt>
                    <dd>{report.methodology.score}</dd>
                  </div>
                  <div>
                    <dt>Model version</dt>
                    <dd>{report.methodology.version}</dd>
                  </div>
                </dl>
                <p>{report.methodology.note}</p>
                <p>
                  The saved figures and methodology remain fixed when new data
                  is captured.
                </p>
              </section>
            </article>
            <div className="report-footer-actions">
              <button
                className="text-button danger-text"
                onClick={() => setDeleting(report)}
              >
                Delete report
              </button>
            </div>
          </>
        ) : (
          <>
            <section className="glass reports-library">
              <div className="panel-heading">
                <div>
                  <h2>Saved reports</h2>
                  <p>
                    Each report preserves its reporting period and data-source
                    labels.
                  </p>
                </div>
                <label className="search-field">
                  <Icon name="search" size={16} />
                  <input
                    aria-label="Search reports"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search reports…"
                  />
                </label>
              </div>
              {!reports.length ? (
                <EmptyState
                  title={
                    query
                      ? "No reports match your search"
                      : "Your report library starts here"
                  }
                  description={
                    query
                      ? "Try another report name."
                      : "Create a report to save a fixed view of a reporting period."
                  }
                >
                  {!query && (
                    <button
                      className="button secondary"
                      onClick={() => {
                        setError("");
                        setOpen(true);
                      }}
                    >
                      Create your first report
                    </button>
                  )}
                </EmptyState>
              ) : (
                <div className="report-list">
                  {reports.map((item) => (
                    <div className="report-list-item" key={item.id}>
                      <span className="report-list-icon">
                        <Icon name="chart" size={22} />
                      </span>
                      <div>
                        <Link
                          className="report-title"
                          to={`/reports/${item.id}`}
                        >
                          {item.name}
                        </Link>
                        <p>{period(item.dateRange)}</p>
                        <small>Saved {formatDate(item.createdAt)}</small>
                      </div>
                      <div className="report-source-summary">
                        <strong>{formatNumber(item.footprint)} kg CO₂</strong>
                        <span
                          className={`status-pill ${item.includesSamples ? "sample" : "connected"}`}
                        >
                          {item.includesSamples
                            ? "Includes sample data"
                            : item.live.complete
                              ? "Live data"
                              : "No live sources"}
                        </span>
                      </div>
                      <div className="report-row-actions">
                        <Link
                          className="button secondary"
                          to={`/reports/${item.id}`}
                        >
                          View report
                        </Link>
                        <button
                          className="icon-button"
                          disabled={busy}
                          aria-label={`Export ${item.name}`}
                          onClick={() => download(item)}
                        >
                          <Icon name="download" size={16} />
                        </button>
                        <button
                          className="icon-button danger-text"
                          aria-label={`Delete ${item.name}`}
                          onClick={() => setDeleting(item)}
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ))}
      <Dialog open={open} onClose={() => setOpen(false)} title="Create report">
        <form onSubmit={create}>
          <label className="field">
            Report name
            <input
              autoFocus
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Monthly impact review"
            />
          </label>
          <RangeFields value={range} onChange={setRange} />
          <Notice message={error} />
          <p className="form-hint">
            A fresh snapshot is captured and saved with its source labels and
            methodology. Sample figures remain identified in the report and
            export.
          </p>
          <button className="button primary" disabled={busy}>
            {busy ? "Creating report…" : "Create report"}
          </button>
        </form>
      </Dialog>
      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete report"
      >
        <p className="panel-copy">
          Delete “{deleting?.name}”? Captured history and goals will remain
          available.
        </p>
        <button
          className="button danger-button"
          disabled={busy}
          onClick={remove}
        >
          Confirm delete report
        </button>
      </Dialog>
    </AppShell>
  );
}
