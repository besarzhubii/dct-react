import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import {
  platformName,
  platforms,
  formatNumber,
  period,
} from "../services/workspace";

export function PageHeading({ title, description, children }) {
  return (
    <div className="page-heading feature-heading">
      <div>
        <h1>
          {title}
          <span className="heading-dot">.</span>
        </h1>
        <p>{description}</p>
      </div>
      {children && <div className="heading-actions">{children}</div>}
    </div>
  );
}
export function AsyncState({ loading, error, retry }) {
  if (loading)
    return (
      <div className="glass feature-loading" role="status">
        <Icon name="refresh" className="spinning" />
        <p>Loading your workspace…</p>
      </div>
    );
  if (error)
    return (
      <div className="glass error-state" role="alert">
        <Icon name="info" size={30} />
        <h2>Could not load this page</h2>
        <p>{error}</p>
        <button className="button primary" onClick={retry}>
          Try again
        </button>
      </div>
    );
  return null;
}
export function Notice({ message, kind = "error" }) {
  return message ? (
    <div
      className={`form-${kind}`}
      role={kind === "error" ? "alert" : "status"}
    >
      {message}
    </div>
  ) : null;
}
export function SourceBadge({ data }) {
  const status = !data?.configured
    ? "disconnected"
    : data.isSimulated
      ? "sample"
      : data.error
        ? "unavailable"
        : "connected";
  return (
    <span className={`status-pill ${status}`}>
      <i />
      {!data?.configured
        ? "Not connected"
        : data.isSimulated
          ? "Sample data"
          : data.error
            ? "Unavailable"
            : "Live data"}
    </span>
  );
}
export function PlatformIdentity({ platform, subtitle }) {
  const info = platforms.find((p) => p.key === platform);
  return (
    <span className="platform-cell">
      <span className={`platform-logo logo-${platform}`}>
        {info?.symbol || "C"}
      </span>
      <span>
        {platformName(platform)}
        {subtitle && <small>{subtitle}</small>}
      </span>
    </span>
  );
}
export function PlatformSelect({
  value,
  onChange,
  all = true,
  label = "Platform",
}) {
  return (
    <label className="compact-field">
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {all && <option value="all">All platforms</option>}
        {platforms.map((p) => (
          <option key={p.key} value={p.key}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  );
}
export function RangeFields({ value, onChange }) {
  return (
    <div className="form-grid">
      <label className="field">
        Start date
        <input
          type="date"
          required
          value={value.start_date}
          onChange={(e) => onChange({ ...value, start_date: e.target.value })}
        />
      </label>
      <label className="field">
        End date
        <input
          type="date"
          required
          value={value.end_date}
          onChange={(e) => onChange({ ...value, end_date: e.target.value })}
        />
      </label>
    </div>
  );
}
export function MetricStrip({ items }) {
  return (
    <div className="feature-metrics">
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>
            {typeof item.value === "number"
              ? formatNumber(item.value)
              : item.value}
            <small>{item.unit}</small>
          </strong>
          {item.note && <p>{item.note}</p>}
        </div>
      ))}
    </div>
  );
}
export function SourceTable({ snapshot, links = false }) {
  return (
    <div className="table-scroll">
      <table className="source-table">
        <thead>
          <tr>
            <th>Platform</th>
            <th>Data source</th>
            <th>Impressions</th>
            <th>Footprint</th>
            <th>Wastage</th>
          </tr>
        </thead>
        <tbody>
          {platforms.map((p) => {
            const d = snapshot.platforms[p.key];
            return (
              <tr key={p.key}>
                <td>
                  {links ? (
                    <Link to={`/platforms/${p.key}`}>
                      <PlatformIdentity platform={p.key} />
                    </Link>
                  ) : (
                    <PlatformIdentity platform={p.key} />
                  )}
                </td>
                <td>
                  <SourceBadge data={d} />
                </td>
                <td>
                  {d.configured
                    ? formatNumber(d.impressions || d.recipients || 0)
                    : "—"}
                </td>
                <td>
                  {d.configured
                    ? `${formatNumber(d.digitalCarbonFootprint)} kg`
                    : "—"}
                </td>
                <td>
                  {d.configured
                    ? `${formatNumber(d.digitalCarbonWastage)} kg`
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
export function EmptyState({ title, description, children }) {
  return (
    <div className="feature-empty">
      <Icon name="chart" size={32} />
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Dialog({ open, onClose, title, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="glass modal native-dialog feature-dialog"
      aria-label={title}
      onCancel={onClose}
    >
      <div className="panel-heading">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label={`Close ${title}`}
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      {open && children}
    </dialog>
  );
}
export function SnapshotNote({ snapshot }) {
  return (
    <p className="snapshot-note">
      <Icon name="info" size={14} />
      Reporting period: {period(snapshot.dateRange)}. Data is an estimate under
      the app’s fixed emissions model.
    </p>
  );
}
