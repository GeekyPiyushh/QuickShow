import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Film,
  CalendarDays,
  Ticket,
  Users,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import { getMe, login, logout } from "../../lib/api";
import "./admin.css";
export default function Layout() {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    const check = async () => {
      if (!localStorage.getItem("token")) {
        if (live) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      const u = await getMe();
      if (live) {
        setUser(u?.role === "admin" ? u : null);
        setLoading(false);
      }
    };
    check();
    window.addEventListener("auth-change", check);
    return () => {
      live = false;
      window.removeEventListener("auth-change", check);
    };
  }, []);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.target);
    try {
      const res = await login(f.get("email"), f.get("password"));
      if (!res?.success || res.user?.role !== "admin")
        throw new Error(res?.message || "Administrator access required.");
      setUser(res.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <div className="admin-login">Checking your session…</div>;
  if (!user)
    return (
      <div className="admin-shell admin-login">
        <form className="a-card" onSubmit={submit}>
          <div className="admin-brand">
            Quick<span>Show</span>
          </div>
          <h1>Welcome back, admin.</h1>
          <p className="a-muted">Sign in to manage your cinema.</p>
          {error && (
            <p className="a-error" role="alert">
              {error}
            </p>
          )}
          <label className="a-field">
            Email
            <input
              className="a-input"
              name="email"
              type="email"
              autoComplete="username"
              required
            />
          </label>
          <label className="a-field">
            Password
            <input
              className="a-input"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="a-btn primary" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <Link className="a-muted" to="/">
            ← Return to website
          </Link>
        </form>
      </div>
    );
  const nav = [
    ["", "Overview", LayoutDashboard],
    ["movies", "Movies", Film],
    ["list-shows", "Shows", CalendarDays],
    ["list-bookings", "Bookings", Ticket],
    ["customers", "Customers", Users],
  ];
  return (
    <div className="admin-shell">
      <header className="admin-top">
        <div>
          <Link to="/admin" className="admin-brand">
            Quick<span>Show</span>
          </Link>
          <small>CINEMA MANAGEMENT</small>
        </div>
        <div className="a-actions">
          <span className="a-muted">{user.name}</span>
          <Link to="/" className="a-btn">
            View website <ArrowUpRight />
          </Link>
          <button
            className="a-btn"
            aria-label="Sign out"
            onClick={() => {
              logout();
              setUser(null);
            }}
          >
            <LogOut />
          </button>
        </div>
      </header>
      <div className="admin-body">
        <nav className="admin-nav" aria-label="Admin navigation">
          <small>WORKSPACE</small>
          {nav.map(([path, title, Icon]) => (
            <NavLink key={path} end to={"/admin" + (path ? "/" + path : "")}>
              <Icon />
              {title}
            </NavLink>
          ))}
        </nav>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
