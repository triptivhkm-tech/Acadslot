import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Menu, X } from "lucide-react";

// Shared shell for the faculty and admin portals.
// Markup and classes match StudentLayout so all three portals look the same.
export default function PortalLayout({ portalLabel, links, fallbackName }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initial = (user?.name || fallbackName).replace(/^(prof|dr)\.?\s+/i, "").charAt(0).toUpperCase();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="sl-app">
      <header className="sl-topbar">
        <button className="sl-icon-btn" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div className="sl-topbar-title">AcadSlot</div>
        <span style={{ width: 38 }} />
      </header>

      <div className={`sl-backdrop ${open ? "open" : ""}`} onClick={() => setOpen(false)} />

      <aside className={`sl-sidebar ${open ? "open" : ""}`}>
        <div className="sl-brand">
          <img src="/logo.png" alt="" className="sl-brand-logo" />
          AcadSlot
          <button
            className="sl-icon-btn"
            style={{ marginLeft: "auto" }}
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sl-portal-label">{portalLabel}</div>

        <nav className="sl-nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sl-sidebar-foot">
          <div className="sl-whoami">
            <div className="sl-avatar">{initial}</div>
            <div style={{ minWidth: 0 }}>
              <strong>{user?.name || fallbackName}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <button className="sl-logout" onClick={handleLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <main className="sl-main">
        <Outlet />
      </main>
    </div>
  );
}
