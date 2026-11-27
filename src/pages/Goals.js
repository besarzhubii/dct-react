import React, { useState } from "react";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import {
  PageHeading,
  AsyncState,
  Notice,
  Dialog,
  EmptyState,
} from "../components/WorkspaceUI";
import {
  useWorkspace,
  workspacePath,
  syncWorkspace,
  platformName,
  platforms,
  today,
  formatNumber,
  formatDate,
} from "../services/workspace";
import { api, errorMessage } from "../services/client";
const blank = () => ({
  name: "",
  platform: "all",
  month: today().slice(0, 7),
  targetKg: "",
});
export default function Goals() {
  const [revision, setRevision] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const { data, loading, error: loadError } = useWorkspace("/goals", revision);
  const goals = data?.extra || [];
  function add() {
    setEditing(null);
    setForm(blank());
    setFormError("");
    setOpen(true);
  }
  function edit(goal) {
    setEditing(goal.id);
    setForm({
      name: goal.name,
      platform: goal.platform,
      month: goal.month,
      targetKg: String(goal.targetKg),
    });
    setFormError("");
    setOpen(true);
  }
  async function save(e) {
    e.preventDefault();
    setBusy("save");
    setFormError("");
    try {
      const payload = { ...form, targetKg: Number(form.targetKg) };
      if (editing) await api.put(workspacePath(`/goals/${editing}`), payload);
      else await api.post(workspacePath("/goals"), payload);
      setOpen(false);
      setRevision((n) => n + 1);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy("");
    }
  }
  async function capture(goal, baseline = false) {
    setBusy(goal.id);
    setError("");
    try {
      await syncWorkspace(baseline ? goal.baselineRange : goal.range);
      setRevision((n) => n + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy("");
    }
  }
  async function remove() {
    setBusy("delete");
    setError("");
    try {
      await api.delete(workspacePath(`/goals/${deleting.id}`));
      setDeleting(null);
      setRevision((n) => n + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy("");
    }
  }
  return (
    <AppShell title="Goals & progress">
      <PageHeading
        title="Goals & progress"
        description="Set a monthly emissions budget. Track it with live data."
      >
        <button className="button primary" onClick={add}>
          <Icon name="plus" size={16} />
          Create goal
        </button>
      </PageHeading>
      <Notice message={error} />
      <AsyncState
        loading={loading}
        error={loadError}
        retry={() => setRevision((n) => n + 1)}
      />
      {!loading && !loadError && (
        <>
          {!goals.length ? (
            <section className="glass">
              <EmptyState
                title="Give your progress a direction"
                description="Choose a channel, a calendar month, and an emissions target in kg CO₂."
              >
                <button className="button primary" onClick={add}>
                  Create your first goal
                </button>
              </EmptyState>
            </section>
          ) : (
            <div className="goals-grid">
              {goals.map((goal) => {
                const measured = goal.measured;
                const percent = measured
                  ? goal.targetKg === 0
                    ? measured.footprint > 0
                      ? 100
                      : 0
                    : Math.min(100, (measured.footprint / goal.targetKg) * 100)
                  : 0;
                return (
                  <article className="glass goal-card" key={goal.id}>
                    <div className="panel-heading">
                      <span className="goal-month">
                        <Icon name="calendar" size={15} />
                        {goal.month}
                      </span>
                      <span
                        className={`status-pill ${measured?.complete ? "connected" : "sample"}`}
                      >
                        {!measured
                          ? "Awaiting data"
                          : measured.complete
                            ? "Live data"
                            : "Partial data"}
                      </span>
                    </div>
                    <h2>{goal.name}</h2>
                    <p>{platformName(goal.platform)}</p>
                    <div className="goal-value">
                      <strong>
                        {measured?.liveCount
                          ? formatNumber(measured.footprint)
                          : "—"}
                      </strong>
                      <span>/ {formatNumber(goal.targetKg)} kg CO₂</span>
                    </div>
                    <div
                      className="goal-progress"
                      role="progressbar"
                      aria-label={`Budget used for ${goal.name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={percent}
                    >
                      <i
                        style={{
                          width: `${percent}%`,
                          background:
                            measured?.complete &&
                            measured.footprint > goal.targetKg
                              ? "#e5a3aa"
                              : "#8eaeff",
                        }}
                      />
                    </div>
                    <p className="goal-explanation">
                      {!measured
                        ? "Capture this calendar month to begin tracking."
                        : !measured.complete
                          ? "Only live sources are counted. Sample or missing sources prevent a complete assessment."
                          : measured.footprint > goal.targetKg
                            ? `${formatNumber(measured.footprint - goal.targetKg)} kg above your monthly target.`
                            : `${formatNumber(goal.targetKg - measured.footprint)} kg remaining in your monthly budget.`}
                    </p>
                    <dl className="goal-baseline">
                      <div>
                        <dt>Previous month baseline</dt>
                        <dd>
                          {goal.baseline
                            ? `${formatNumber(goal.baseline.footprint)} kg${goal.baseline.complete ? "" : " (partial)"}`
                            : "Not captured"}
                        </dd>
                      </div>
                      <div>
                        <dt>Change from baseline</dt>
                        <dd>
                          {goal.reductionPercent === null
                            ? "Not yet comparable"
                            : `${formatNumber(Math.abs(goal.reductionPercent))}% ${goal.reductionPercent >= 0 ? "lower" : "higher"}`}
                        </dd>
                      </div>
                    </dl>
                    <p className="form-hint">
                      {goal.capturedAt
                        ? `Last captured ${formatDate(goal.capturedAt)}`
                        : "No matching monthly snapshot yet."}
                    </p>
                    <div className="goal-actions">
                      <button
                        className="button secondary"
                        disabled={!!busy || goal.month > today().slice(0, 7)}
                        onClick={() => capture(goal)}
                      >
                        {busy === goal.id ? "Capturing…" : "Sync target month"}
                      </button>
                      <button
                        className="text-button"
                        disabled={!!busy}
                        onClick={() => capture(goal, true)}
                      >
                        Capture baseline
                      </button>
                    </div>
                    <div className="goal-edit-actions">
                      <button
                        className="text-button"
                        onClick={() => edit(goal)}
                      >
                        Edit goal
                      </button>
                      <button
                        className="text-button danger-text"
                        onClick={() => setDeleting(goal)}
                      >
                        Delete goal
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <p className="snapshot-note">
            <Icon name="info" size={14} />
            Goals use calendar-month snapshots and exclude sample figures.
            Month-to-date figures are not compared against a complete previous
            month.
          </p>
        </>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit goal" : "Create goal"}
      >
        <form onSubmit={save}>
          <label className="field">
            Goal name
            <input
              autoFocus
              required
              maxLength={100}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Email emissions budget"
            />
          </label>
          <label className="field">
            Platform
            <select
              aria-label="Platform"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
            >
              <option value="all">All platforms</option>
              {platforms.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Target month
            <input
              type="month"
              required
              min="2000-01"
              max="2099-12"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
            />
          </label>
          <label className="field">
            Monthly target (kg CO₂)
            <input
              required
              type="number"
              min="0"
              max="1000000000"
              step="0.01"
              value={form.targetKg}
              onChange={(e) => setForm({ ...form, targetKg: e.target.value })}
            />
          </label>
          <Notice message={formError} />
          <button className="button primary" disabled={!!busy}>
            {busy === "save" ? "Saving…" : "Save goal"}
          </button>
        </form>
      </Dialog>
      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete goal"
      >
        <p className="panel-copy">
          Delete “{deleting?.name}”? Captured history and saved reports will
          remain available.
        </p>
        <button
          className="button danger-button"
          disabled={!!busy}
          onClick={remove}
        >
          Confirm delete goal
        </button>
      </Dialog>
    </AppShell>
  );
}
