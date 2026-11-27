import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import {
  PageHeading,
  AsyncState,
  Notice,
  PlatformIdentity,
  MetricStrip,
} from "../components/WorkspaceUI";
import { useWorkspace, syncWorkspace, formatDate } from "../services/workspace";
import { errorMessage } from "../services/client";
const labels = {
  live: "Live data",
  sample: "Sample data",
  error: "Needs attention",
  unchecked: "Not checked",
  disconnected: "Not connected",
};
export default function ConnectionHealth() {
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { data, loading, error: loadError } = useWorkspace(null, revision);
  const health = data?.summary.health || [];
  async function sync() {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await syncWorkspace();
      setRevision((n) => n + 1);
      setMessage(
        "Connection check complete. Review each channel’s status below.",
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppShell title="Connection health">
      <PageHeading
        title="Connection health"
        description="Know where your data comes from and what needs attention."
      >
        <button
          className="button primary"
          onClick={sync}
          disabled={busy || loading}
        >
          <Icon name="refresh" size={16} />
          {busy ? "Checking connections…" : "Check connections"}
        </button>
      </PageHeading>
      <Notice message={error} />
      <Notice message={message} kind="success" />
      <AsyncState
        loading={loading}
        error={loadError}
        retry={() => setRevision((n) => n + 1)}
      />
      {!loading && !loadError && (
        <>
          <MetricStrip
            items={[
              {
                label: "Live sources",
                value: health.filter((p) => p.status === "live").length,
              },
              {
                label: "Need attention",
                value: health.filter((p) => p.status === "error").length,
              },
              {
                label: "Sample sources",
                value: health.filter((p) => p.status === "sample").length,
              },
              {
                label: "Not connected",
                value: health.filter((p) => p.status === "disconnected").length,
              },
            ]}
          />
          <div className="health-list">
            {health.map((connection) => (
              <section className="glass health-card" key={connection.key}>
                <div className="health-card-header">
                  <PlatformIdentity platform={connection.key} />
                  <span
                    className={`status-pill ${connection.status === "live" ? "connected" : connection.status === "sample" ? "sample" : connection.status === "error" ? "unavailable" : "disconnected"}`}
                  >
                    <i />
                    {labels[connection.status]}
                  </span>
                </div>
                <p
                  className={`health-message ${connection.status === "error" ? "issue-message" : ""}`}
                >
                  {connection.message}
                </p>
                <dl className="health-times">
                  <div>
                    <dt>Last checked</dt>
                    <dd>{formatDate(connection.checkedAt)}</dd>
                  </div>
                  <div>
                    <dt>Last successful live sync</dt>
                    <dd>{formatDate(connection.lastSuccessfulAt)}</dd>
                  </div>
                </dl>
                <div className="health-actions">
                  <Link
                    className="text-button"
                    to={`/platforms/${connection.key}`}
                  >
                    View platform <Icon name="arrow" size={15} />
                  </Link>
                  <Link className="button secondary" to="/profile">
                    Manage credentials
                  </Link>
                </div>
              </section>
            ))}
          </div>
          <p className="snapshot-note">
            <Icon name="info" size={14} />A configured key does not guarantee a
            live connection. Sample data and failed checks are shown separately.
          </p>
        </>
      )}
    </AppShell>
  );
}
