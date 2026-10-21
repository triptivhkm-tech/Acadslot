import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import adminService from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

const TASKS = [
  {
    to: "/admin/faculty",
    title: "Manage Faculty",
    text: "Add faculty accounts and assign departments, subjects and default venues.",
  },
  {
    to: "/admin/students",
    title: "Manage Students",
    text: "View verified college accounts and enable or disable access.",
  },
  {
    to: "/admin/bookings",
    title: "Booking Records",
    text: "Review every booking request and session across the college.",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      setError("");
      setStats(await adminService.getStats());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load system figures. Check that the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  const figures = [
    {
      label: "Faculty members",
      value: stats?.totalTeachers,
      hint: "Registered professors",
    },
    {
      label: "Students",
      value: stats?.totalStudents,
      hint: "Verified college accounts",
    },
    {
      label: "Venues",
      value: stats?.totalVenues,
      hint: "Rooms available for sessions",
    },
    {
      label: "Pending requests",
      value: stats?.totalPendingRequests,
      hint: "Awaiting faculty reply",
    },
    {
      label: "Upcoming sessions",
      value: stats?.totalUpcomingAppointments,
      hint: "Confirmed appointments",
    },
    {
      label: "Completed sessions",
      value: stats?.totalCompletedAppointments,
      hint: "Marked as completed",
    },
  ];

  return (
    <>
      <div className="sl-page-head">
        <h1>Admin Dashboard</h1>
        <p>System overview for AcadSlot.</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchStats} />}

      {loading ? (
        <LoadingSpinner message="Loading dashboard..." />
      ) : (
        <>
          <div className="sl-stats">
            {figures.map((f) => (
              <div className="sl-stat" key={f.label}>
                <span>{f.label}</span>
                <strong>{f.value ?? 0}</strong>
                <small>{f.hint}</small>
              </div>
            ))}
          </div>

          <section className="sl-panel">
            <div className="sl-panel-head">
              <h2>Administration</h2>
            </div>
            <ul className="sl-rowlist">
              {TASKS.map((t) => (
                <li className="link" key={t.to}>
                  <Link to={t.to} className="sl-rowlink">
                    <div>
                      <strong>{t.title}</strong>
                      <span className="sub">{t.text}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  );
}
