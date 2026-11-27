import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { getSession } from "../services/client";
export function Brand() {
  return (
    <Link to="/dashboard" className="brand">
      <span className="brand-symbol">
        <Icon name="leaf" size={25} />
      </span>
      <span>
        carbon<span className="brand-light">track</span>
        <small>Digital impact, understood.</small>
      </span>
    </Link>
  );
}
export default function AppShell({ children, title = "Overview" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = getSession();
  const navigate = useNavigate();
  const initials = (user?.name || "User")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  const links = [
    { to: "/dashboard", icon: "grid", label: "Overview" },
    { to: "/platforms", icon: "globe", label: "Platform details" },
    { to: "/history", icon: "chart", label: "Emissions history" },
    { to: "/goals", icon: "target", label: "Goals & progress" },
    { to: "/reports", icon: "report", label: "Reports" },
    { to: "/connection-health", icon: "pulse", label: "Connection health" },
    { to: "/profile", icon: "globe", label: "Connections" },
  ];
  if (user?.role === "superadmin")
    links.push({ to: "/users", icon: "users", label: "Team members" });
  return (
    <div className="app-layout">
      {menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        id="workspace-navigation"
        className={`sidebar ${menuOpen ? "is-open" : ""}`}
      >
        <Brand />
        <div className="workspace">
          <span className="workspace-avatar">C</span>
          <div>
            My workspace<small>Carbon analytics</small>
          </div>
          <Icon name="down" size={14} />
        </div>
        <p className="nav-caption">Workspace</p>
        <nav aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon name={link.icon} />
              <span>{link.label}</span>
              {link.to === "/dashboard" && <span className="nav-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="impact-note">
            <span className="impact-icon">
              <Icon name="leaf" />
            </span>
            <h3>
              Small footprint.
              <br />
              Bigger possibilities.
            </h3>
            <p>Understand your digital impact. Make every interaction count.</p>
            <Link to="/goals">
              Track your goals <Icon name="arrow" size={15} />
            </Link>
          </div>
          <Link to="/profile" className="nav-link">
            <Icon name="settings" />
            <span>Account settings</span>
          </Link>
          <button
            className="nav-link"
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            <Icon name="logout" />
            <span>Sign out</span>
          </button>
          <Link className="user-profile" to="/profile">
            <span className="avatar">{initials}</span>
            <span>
              {user?.name}
              <small>
                {user?.role === "superadmin"
                  ? "Workspace admin"
                  : "Workspace member"}
              </small>
            </span>
            <Icon name="chevron" size={15} />
          </Link>
        </div>
      </aside>
      <div className="main-layout">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-expanded={menuOpen}
              aria-controls="workspace-navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Icon name="menu" />
            </button>
            <Icon name="grid" size={17} />
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{title}</strong>
          </div>
          <div className="topbar-right">
            <span className="workspace-status">
              <i /> Workspace active
            </span>
            <Link
              to="/profile"
              className="avatar small-avatar"
              aria-label="Your profile"
            >
              {initials}
            </Link>
          </div>
        </header>
        <main className="page-content" id="main-content">
          {children}
        </main>
        <footer className="app-footer">
          <span>Carbontrack © {new Date().getFullYear()}</span>
          <span>
            Less carbon. More clarity.
            <Icon name="leaf" size={13} />
          </span>
        </footer>
      </div>
    </div>
  );
}
