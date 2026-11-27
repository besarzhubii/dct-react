import React, { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import { api, getSession, errorMessage } from "../services/client";
const connections = [
  {
    field: "shopify",
    name: "Shopify",
    symbol: "S",
    logo: "shopify",
    hint: "Shopify access token",
  },
  {
    field: "facebook",
    name: "Meta Ads",
    symbol: "∞",
    logo: "meta",
    hint: "Meta access token",
  },
  {
    field: "klavyio",
    name: "Klaviyo",
    symbol: "K",
    logo: "klaviyo",
    hint: "Private API key",
  },
  {
    field: "google",
    name: "Google Ads",
    symbol: "G",
    logo: "google",
    hint: "Google Ads developer token",
  },
];
export default function ProfileForm() {
  const userId = getSession()?.id;
  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    shopify: "",
    facebook: "",
    klavyio: "",
    google: "",
  });
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/user/${userId}`)
      .then(({ data }) => {
        if (active) {
          setForm(data);
          setLoaded(true);
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
  }, [userId, retry]);
  function change(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess("");
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.put(`/user/${userId}`, form);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        }),
      );
      setSuccess("Profile and connections saved.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }
  return (
    <AppShell title="Connections">
      <div className="page-heading">
        <div>
          <div className="heading-overline">
            <span className="tiny-orb" /> Your workspace, connected
          </div>
          <h1>
            Profile & connections<span className="heading-dot">.</span>
          </h1>
          <p>Keep your details and digital channels in one place.</p>
        </div>
      </div>
      {loading ? (
        <p role="status">Loading your profile…</p>
      ) : !loaded ? (
        <div className="glass error-state" role="alert">
          <h2>Could not load your profile</h2>
          <p>{error}</p>
          <button
            className="button primary"
            onClick={() => setRetry((n) => n + 1)}
          >
            Try again
          </button>
        </div>
      ) : (
        <form onSubmit={submit}>
          {error && (
            <div className="form-error" role="alert">
              {error}{" "}
              <button
                type="button"
                className="text-button"
                onClick={() => setRetry((n) => n + 1)}
              >
                Reload profile
              </button>
            </div>
          )}
          {success && (
            <div className="form-success" role="status">
              {success}
            </div>
          )}
          <div className="settings-grid">
            <section className="glass form-panel">
              <div className="panel-heading">
                <div>
                  <h2>Personal details</h2>
                  <p>How you appear in your workspace</p>
                </div>
                <Icon name="users" />
              </div>
              <label className="field">
                Full name
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={change}
                  maxLength={100}
                  autoComplete="name"
                />
              </label>
              <label className="field">
                Email address
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={change}
                  autoComplete="email"
                />
              </label>
              <p className="form-hint">
                Your platform credentials are used to retrieve analytics. Leave
                a connection empty to disconnect it.
              </p>
              <p className="form-hint">
                This development server stores changes in memory. Restarting it
                resets profile changes.
              </p>
            </section>
            <section className="glass form-panel">
              <div className="panel-heading">
                <div>
                  <h2>Platform connections</h2>
                  <p>Credentials for your digital channels</p>
                </div>
                <Icon name="globe" />
              </div>
              {connections.map((c) => (
                <div className="connection-field" key={c.field}>
                  <div className="platform-cell">
                    <span className={`platform-logo logo-${c.logo}`}>
                      {c.symbol}
                    </span>
                    <span>{c.name}</span>
                    <span
                      className={`status-pill ${form[c.field] ? "connected" : "disconnected"}`}
                    >
                      {form[c.field] ? "Configured" : "Not connected"}
                    </span>
                  </div>
                  <label className="field">
                    {c.hint}
                    <input
                      name={c.field}
                      type="password"
                      value={form[c.field] || ""}
                      onChange={change}
                      placeholder={c.hint}
                      autoComplete="off"
                    />
                  </label>
                </div>
              ))}
              <p className="form-hint">
                Shopify and Google Ads currently return sample data. Meta and
                Klaviyo also use sample data when their connection fails.
              </p>
            </section>
          </div>
          <div className="form-actions">
            <button className="button primary" disabled={saving} type="submit">
              <Icon name="check" size={16} />
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </AppShell>
  );
}
