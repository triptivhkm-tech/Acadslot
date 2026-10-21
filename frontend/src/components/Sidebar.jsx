
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo and website name */}
      <div className="sidebar-logo">
        <img
          src="/logo.png"
          alt="AcadSlot Logo"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <h2>AcadSlot</h2>
      </div>

      {/* Teacher portal heading */}
      <div className="sidebar-heading">
        TEACHER PORTAL
      </div>

      {/* Navigation menu */}
      <nav className="sidebar-nav">
        <NavLink to="/teacher" end>
          Dashboard
        </NavLink>

        <NavLink to="/teacher/requests">
          Doubt Requests
        </NavLink>

        <NavLink to="/teacher/availability">
          Availability
        </NavLink>

        <NavLink to="/teacher/sessions">
          Sessions
        </NavLink>

        <NavLink to="/teacher/services">
          Service Requests
        </NavLink>
      </nav>

      {/* Teacher profile */}
      <div className="sidebar-profile">
        <p>Teacher Account</p>
        <small>Teacher Portal</small>
      </div>
    </aside>
  );
}
