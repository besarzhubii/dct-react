import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import { api, getSession, errorMessage } from "../services/client";
export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [query, setQuery] = useState("");
  const [refresh, setRefresh] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const admin = getSession()?.role === "superadmin";
  useEffect(() => {
    if (!admin) return;
    let active = true;
    setLoading(true);
    api
      .get("/user/all-users")
      .then(({ data }) => {
        if (active) {
          setUsers(data);
          setError("");
        }
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [admin, refresh]);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    setSaving(true);
    setFormError("");
    try {
      await api.post("/user/add", values);
      setOpen(false);
      setRefresh((n) => n + 1);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }
  if (!admin) return <Navigate to="/dashboard" replace />;
  const filtered = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <AppShell title="Team members">
      <div className="page-heading">
        <div>
          <div className="heading-overline">
            <span className="tiny-orb" /> Better together
          </div>
          <h1>
            Team members<span className="heading-dot">.</span>
          </h1>
          <p>Manage your team and explore each member’s carbon footprint.</p>
        </div>
        <button
          className="button primary"
          onClick={() => {
            setFormError("");
            setOpen(true);
          }}
        >
          <Icon name="plus" size={16} />
          Add member
        </button>
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}{" "}
          <button
            className="text-button"
            onClick={() => setRefresh((n) => n + 1)}
          >
            Try again
          </button>
        </div>
      )}
      <section className="glass platforms-panel">
        <div className="panel-heading">
          <h2>
            Your team{" "}
            <span className="count-badge">{users.length} members</span>
          </h2>
          <label className="search-field">
            <Icon name="search" size={16} />
            <input
              aria-label="Search team members"
              placeholder="Search members…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Email address</th>
                <th>Carbon overview</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="platform-cell">
                      <span className="avatar">{u.name.slice(0, 1)}</span>
                      {u.name}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <Link
                      className="text-button"
                      to={`/user-graph?userId=${u.id}`}
                    >
                      View footprint <Icon name="arrow" size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={3} className="empty-search">
                    {loading
                      ? "Loading members…"
                      : query
                        ? "No members match your search."
                        : "No team members yet. Add your first member to get started."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <dialog
        aria-labelledby="member-dialog-title"
        ref={dialog}
        className="glass modal native-dialog"
        onCancel={() => setOpen(false)}
      >
        <div className="panel-heading">
          <h2 id="member-dialog-title">Add a team member</h2>
          <button
            className="icon-button"
            aria-label="Close add member"
            onClick={() => setOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        {open && (
          <form onSubmit={add}>
            <label className="field">
              Full name
              <input autoFocus name="name" required maxLength={100} />
            </label>
            <label className="field">
              Email address
              <input type="email" name="email" required />
            </label>
            <label className="field">
              Temporary password
              <input
                type="password"
                name="password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
            <button className="button primary" disabled={saving}>
              {saving ? "Adding…" : "Add member"}
            </button>
          </form>
        )}
      </dialog>
    </AppShell>
  );
}
