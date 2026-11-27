import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "./AppShell";
import Icon from "./Icon";
import { api, errorMessage } from "../services/client";
export default function AuthForm({ signup = false }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (signup) {
        await api.post("/user/add", values);
        navigate("/login?registered=1");
      } else {
        const { data } = await api.post("/user/login", values);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
          }),
        );
        navigate("/dashboard");
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="auth-page">
      <section className="auth-art">
        <Brand />
        <div className="auth-pitch">
          <h1>
            A lighter footprint.
            <br />A clearer future.
          </h1>
          <p>
            Bring your digital channels together. Understand their impact, one
            interaction at a time.
          </p>
        </div>
        <div className="orbital" />
        <p className="auth-caption">Less carbon. More clarity.</p>
      </section>
      <main className="auth-form-wrap">
        <section className="glass auth-card">
          <span className="auth-icon">
            <Icon name="leaf" size={24} />
          </span>
          <h2>{signup ? "Create your workspace" : "Welcome back"}</h2>
          <p>
            {signup
              ? "Start understanding your digital impact."
              : "Sign in to see your digital impact."}
          </p>
          {!signup &&
            new URLSearchParams(window.location.search).has("registered") && (
              <div className="form-success" role="status">
                Account created. You can now sign in.
              </div>
            )}
          <form onSubmit={submit}>
            {signup && (
              <label className="field">
                Full name
                <input
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  maxLength={100}
                />
              </label>
            )}
            <label className="field">
              Email address
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
              />
            </label>
            <label className="field">
              Password
              <input
                name="password"
                type="password"
                minLength={6}
                required
                autoComplete={signup ? "new-password" : "current-password"}
                placeholder="At least 6 characters"
              />
            </label>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            <button className="button primary" disabled={pending} type="submit">
              {pending ? "Please wait…" : signup ? "Create account" : "Sign in"}
              <Icon name="arrow" size={16} />
            </button>
          </form>
          <div className="auth-switch">
            {signup ? "Already have an account?" : "New to Carbontrack?"}{" "}
            <Link to={signup ? "/login" : "/signup"}>
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
