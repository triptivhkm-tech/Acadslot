import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, User as UserIcon, LogOut, Bell, BookOpen } from "lucide-react";

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const roleName = user?.role === "STUDENT"
    ? "Student"
    : (user?.role === "TEACHER" || user?.role === "PROFESSOR")
    ? "Faculty"
    : user?.role === "ADMIN"
    ? "Admin"
    : "User";

  return (
    <header className="acadslot-navbar">
      <div className="navbar-left">
        {onToggleSidebar && (
          <button
            className="navbar-menu-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
          >
            <Menu size={22} />
          </button>
        )}
        <Link to="/" className="navbar-brand">
          <div className="brand-logo-circle">
            <BookOpen size={18} color="#F2EFE7" />
          </div>
          <span className="brand-title">AcadSlot</span>
        </Link>
      </div>

      <div className="navbar-right">
        {user && (
          <span className="navbar-role-pill">
            {roleName}
          </span>
        )}

        <div className="navbar-user-container">
          <button
            className="navbar-avatar-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="User profile"
          >
            <div className="avatar-circle">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
            </div>
          </button>

          {showProfileMenu && (
            <div className="navbar-dropdown">
              <div className="dropdown-user-info">
                <strong>{user?.name || "User"}</strong>
                <span className="dropdown-email">{user?.email}</span>
                <span className="dropdown-role">{roleName}</span>
              </div>
              <hr className="dropdown-divider" />
              <button className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
